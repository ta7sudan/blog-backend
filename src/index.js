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
const path = require('path');
const fs = require('fs');
const logger = require('./lib/logger');
const statusCode = require('./lib/http-status');
// const registerErrorHandler = require('./lib/error-handler');


// const registerErrorHandler = require('./lib/error-handler');

// TODO
// registerErrorHandler('unhandledRejection');
// registerErrorHandler('uncaughtException', {});
// registerErrorHandler('SIGINT');
// registerErrorHandler('SIGTERM');
// registerErrorHandler('SIGQUIT');
// registerErrorHandler('SIGHUP');

const app = new Aloridal({
	http2: JSON.parse(process.env.ENABLE_HTTP2 || 'false'),
	https: process.env.TLS_KEY && process.env.TLS_CERT ? {
		key: fs.readFileSync(path.resolve(__dirname, '..', process.env.TLS_KEY)),
		cert: fs.readFileSync(path.resolve(__dirname, '..', process.env.TLS_CERT))
	} : null,
	maxParamLength: parseInt(process.env.MAX_PARAM_LENGTH, 10) || 60,
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



// Decorators
app.decorateReply('statusCode', statusCode);


app.setNotFoundHandler(async (req, res) => {
	const { NOT_FOUND } = res.statusCode;
	res.code(NOT_FOUND);
	return {
		statusCode: NOT_FOUND,
		errorMessage: 'Not found'
	};
});

app.setErrorHandler(async (err, req, res) => {
	// 不管什么异常, 对外都只返回一个内容, 省得暴露
	// 什么敏感信息, 对内打log
	logger.error(err);
	const { INTERNAL_ERROR } = res.statusCode;
	res.code(INTERNAL_ERROR);
	return {
		statusCode: INTERNAL_ERROR,
		errorMessage: 'Internal error'
	};
});

if (process.env.NODE_ENV !== 'production') {
	app.registerRoute('debug', {
		prefix: `api/${process.env.API_VERSION || 'v1'}`,
		logLevel: 'warn'
	});
}

app.registerRoute(['home'], async ctx => {
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
		console.log(`Server is running on ${address}`);
	});