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

const Fastify = require('fastify');
const helmet = require('fastify-helmet');
const path = require('path');
const logger = require('./lib/logger');
const statusCode = require('./lib/http-status');


// const registerErrorHandler = require('./lib/error-handler');

// TODO
// registerErrorHandler('unhandledRejection');
// registerErrorHandler('uncaughtException');
// registerErrorHandler('SIGINT');
// registerErrorHandler('SIGTERM');
// registerErrorHandler('SIGQUIT');
// registerErrorHandler('SIGHUP');

const app = Fastify({
	http2: JSON.parse(process.env.ENABLE_HTTP2 || 'false'),
	https: process.env.TLS_KEY && process.env.TLS_CERT ? {
		key: path.resolve(__dirname, '..', process.env.TLS_KEY),
		cert: path.resolve(__dirname, '..', process.env.TLS_CERT)
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

app.listen(
	parseInt(process.env.APP_PORT, 10) || 3000,
	process.env.APP_HOST || '127.0.0.1',
	parseInt(process.env.APP_BACKLOG, 10) || 511,
	(err, address) => {
		if (err) {
			app.log.error(err);
			process.exit(1);
		}
		app.log.info(`Server is running on ${address}`);
	});