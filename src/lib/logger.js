'use strict';
const pino = require('pino');
const path = require('path');

module.exports = pino({
	name: process.env.APP_NAME
	// level: 'warn'
	// 先不做分割吧, 看看大小
}, pino.destination(path.resolve(__dirname, '../..', process.env.LOG_FILE)));