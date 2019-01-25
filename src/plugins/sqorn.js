'use strict';
const fp = require('fastify-plugin');
const sqorn = require('@sqorn/pg');
const pg = require('pg');

module.exports = fp(async ctx => {
	const sq = sqorn({
		pool: ctx.pg.pool,
		pg
	});
	ctx.decorate('sq', sq, ['pg']);
});