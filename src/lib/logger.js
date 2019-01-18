'use strict';
const pino = require('pino');

module.exports = pino({
	name: process.env.APP_NAME
});