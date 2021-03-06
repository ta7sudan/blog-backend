'use strict';

const envMap = {
	production: '.env',
	test: '.env.test',
	development: '.env.development'
};

require('dotenv-safe').config({
	allowEmptyValues: true,
	path: envMap[process.env.NODE_ENV] || envMap.development,
	example: '.env.example'
});

const Aloridal = require('./Aloridal');
const helmet = require('fastify-helmet');
const cors = require('fastify-cors');
const jwt = require('fastify-jwt');
const cookie = require('fastify-cookie');
const redis = require('fastify-redis');
const postgre = require('fastify-postgres');
const sqorn = require('./plugins/sqorn');
const dao = require('./plugins/dao');
const auth = require('./plugins/auth');
const addRoot = require('./plugins/root');
const rateLimit = require('fastify-rate-limit');
const pointToView = require('point-of-view');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const compress = require('fastify-compress');
const favicon = require('fastify-favicon');
const logger = require('./lib/logger');
const statusCode = require('./lib/http-status');
const registerErrorHandler = require('./lib/error-handler');




const app = new Aloridal({
	http2: JSON.parse(process.env.ENABLE_HTTP2 || 'false'),
	https: process.env.TLS_KEY && process.env.TLS_CERT ? {
		key: fs.readFileSync(path.resolve(__dirname, '..', process.env.TLS_KEY)),
		cert: fs.readFileSync(path.resolve(__dirname, '..', process.env.TLS_CERT))
	} : null,
	maxParamLength: parseInt(process.env.MAX_PARAM_LENGTH, 10) || 80,
	bodyLimit: parseInt(process.env.BODY_LIMIT, 10) || 1048576,
	// 日志分割交割PM2或其他进程管理吧, 这里默认就好
	// logger可能不仅仅在Fastify作用域中用到, 还是手动给一个吧
	logger
});

// Plugins
app.register(helmet, {
	// xssFilter: {
	// 	reportUri: ''
	// },
	hidePoweredBy: {
		setTo: 'PHP/7.1.12'
	},
	frameguard: {
		action: 'deny'
	},
	hsts: {
		maxAge: 2592000, // 一个月
		includeSubdomains: true
	}
});

app.register(jwt, {
	secret: process.env.JWT_SECRET || 'todo',
	sign: {
		expiresIn: process.env.JWT_EXPIRES || '1h',
		issuer: process.env.JWT_ISSUER || 'todo'
	},
	verify: {
		maxAge: process.env.JWT_EXPIRES || '1h',
		issuer: process.env.JWT_ISSUER || 'todo'
	}
});

app.register(cookie);

app.register(redis, {
	// port可以string
	port: process.env.REDIS_PORT || 6379,
	host: process.env.REDIS_HOST || 'localhost',
	family: 4,
	password: process.env.REDIS_PASS
}).after(err => {
	if (err) {
		logger.error(err);
	} else {
		logger.info('Redis is connected.');
	}
});

app.register(postgre, {
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	database: process.env.PGDATABASE,
	host: process.env.PGHOST || 'localhost',
	port: parseInt(process.env.PGPORT, 10),
	/* eslint-disable-next-line */
	statement_timeout: parseInt(process.env.PGSTATTIMEOUT, 10),
	connectionTimeoutMillis: parseInt(process.env.PGCONNTIMEOUT, 10),
	max: parseInt(process.env.PGPOOLSIZE, 10) || 10
}).after(err => {
	if (err) {
		logger.error(err);
	} else {
		logger.info('Postgre is connected.');
	}
});

// 这个必须在pg插件之后, 依赖于pg插件
app.register(sqorn);

app.register(dao, {
	dir: path.resolve(__dirname, './dao')
});

app.register(addRoot);

// if (process.env.NODE_ENV !== 'production') {
app.register(require('fastify-static'), {
	logLevel: 'warn',
	root: path.resolve(__dirname, '../public'),
	maxAge: '30 days'
});
// }

// 下面这些个插件等配好nginx都改掉
app.register(pointToView, {
	engine: {
		ejs
	}
});

app.register(favicon, {
	path: 'public'
});

app.register(compress, {
	brotli: require('iltorb')
});


// Decorators
app.decorateReply('statusCode', statusCode);


app.setNotFoundHandler(async function (req, res) {
	// 暂时没有nginx(运维苦手..)所以先从node层面做history api
	// 的fallback吧
	if (!req.cookies.JWT) {
		const uuid = uuidv4();
		const jwt = this.jwt.sign({
			tid: uuid
		});
		res.setCookie('JWT', jwt, {
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			httpOnly: false,
			expires: new Date(Date.now() + 3600000)
		});
	}
	res.view('src/views/index-mobile.ejs');
	// const { NOT_FOUND } = res.statusCode;
	// res.code(NOT_FOUND);
	// return {
	// 	statusCode: NOT_FOUND,
	// 	errorMessage: 'Not found'
	// };
});

app.setErrorHandler(async (err, req, res) => {
	if (err.name === 'UnauthorizedError') {
		res.code(res.statusCode.TOKEN_EXPIRED);
		return {
			statusCode: res.statusCode.TOKEN_EXPIRED,
			errorMessage: 'Token expired'
		};
	} else {
		// 不管什么异常, 对外都只返回一个内容, 省得暴露
		// 什么敏感信息, 对内打log
		logger.error(err);
		const { INTERNAL_ERROR } = res.statusCode;
		res.code(INTERNAL_ERROR);
		return {
			statusCode: INTERNAL_ERROR,
			errorMessage: 'Internal error'
		};
	}
});

if (process.env.NODE_ENV !== 'production') {
	app.registerRoute('debug', {
		prefix: `api/${process.env.API_VERSION || 'v1'}`,
		logLevel: 'warn'
	});
}

app.registerRoute('admin.auth', async ctx => {
	ctx.register(rateLimit, {
		max: process.env.NODE_ENV === 'production' ? 15 : 10000,
		timeWindow: 1800000,
		cache: 1000,
		redis: ctx.redis
	});
	ctx.register(auth, {
		key: 'uid',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		httpOnly: true,
		expires: 3600,
		redis: ctx.redis
	});
}, {
	prefix: `api/${process.env.API_VERSION || 'v1'}`,
	logLevel: 'warn'
});

app.registerRoute('admin.posts', async ctx => {
	ctx.register(rateLimit, {
		max: process.env.NODE_ENV === 'production' ? 50 : 10000,
		timeWindow: 1800000,
		cache: 1000,
		redis: ctx.redis
	});
	ctx.register(auth, {
		key: 'uid',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		httpOnly: true,
		expires: 3600,
		redis: ctx.redis
	});
}, {
	prefix: `api/${process.env.API_VERSION || 'v1'}`,
	logLevel: 'warn'
});

app.registerRoute('admin.page', async ctx => {
	ctx.register(auth, {
		key: 'uid',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		httpOnly: true,
		expires: 3600,
		redis: ctx.redis
	});
	// ctx.register(pointToView, {
	// 	engine: {
	// 		ejs
	// 	}
	// });
}, {
	logLevel: 'warn'
});

app.registerRoute('web.page', async ctx => {
	// ctx.register(pointToView, {
	// 	engine: {
	// 		ejs
	// 	}
	// });
}, {
	logLevel: 'warn'
});

app.registerRoute(['web.home', 'web.posts', 'web.friends', 'web.user'], async ctx => {
	ctx.register(rateLimit, {
		max: 100,
		timeWindow: 60000,
		cache: 1000,
		redis: ctx.redis
	});
	ctx.register(cors, {
		// 这里是硬编码了origin的值而不是根据请求动态响应,
		// 讲道理这种情况是不应该返回Vary:Origin的, 而这个
		// 插件默认会返回Vary:Origin, 总感觉这里会有坑...
		// 如果遇到跨域导致的坑, 务必回来把这个插件换掉...
		origin: process.env.CORS_ORIGIN,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
		allowedHeaders: ['Authorization', 'Content-Type'],
		credentials: true,
		maxAge: 7200
	});

	ctx.addHook('onRequest', async (req, res) => {
		try {
			await req.jwtVerify();
		} catch (err) {
			res.send(err);
		}
	});
}, {
	prefix: `api/${process.env.API_VERSION || 'v1'}`,
	logLevel: 'warn'
});

app.listen(
	parseInt(process.env.APP_PORT, 10) || 3000,
	process.env.APP_HOST || '127.0.0.1',
	parseInt(process.env.APP_BACKLOG, 10) || 511,
	(err, address) => {
		if (err) {
			app.log.error(err);
			// 这里return就好, 会自己退出的, 而如果
			// 手动process.exit(1), 会导致pino文件还未
			// 关闭就退出了
			return;
		}
		logger.info(`Server is running on ${address}`);
		// for PM2
		if (process.send) {
			process.send('ready');
		}
	});

const errHandler = {
	cleaner: {
		cleanup() {
			app.close();
		}
	},
	logger: {
		log(...args) {
			logger.info(args);
		}
	}
};

registerErrorHandler('unhandledRejection', errHandler);
registerErrorHandler('uncaughtException', errHandler);
registerErrorHandler('SIGINT', errHandler);
registerErrorHandler('SIGTERM', errHandler);
registerErrorHandler('SIGQUIT', errHandler);
registerErrorHandler('SIGHUP', errHandler);