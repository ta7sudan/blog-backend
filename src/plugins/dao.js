'use strict';

const path = require('path');
const fp = require('fastify-plugin');
const { _load } = require('../lib/util');


function loadDao(dir, ctx) {
	return _load(dir, ctx, (_dir, _subDir, _file, _ctx) => {
		if (_dir) {
			return require(path.resolve(_dir, _file))(_ctx);
		} else if (_subDir) {
			return loadDao(_subDir, _ctx);
		}
	});
}

module.exports = fp(async (ctx, { dir }) => {
	const dao = loadDao(dir, ctx);
	ctx.decorate('dao', dao);
});