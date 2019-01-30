'use strict';
const fp = require('fastify-plugin');

module.exports = fp(async (ctx, { key, secure, path, httpOnly, expires, redis }) => {
	function authorize(token, info) {
		this.setCookie(key, token, {
			expires: new Date(Date.now() + expires * 1000),
			httpOnly,
			path,
			secure
		});
		redis.set(token, info || true, 'EX', expires + 5);
	}
	async function authentic(token) {
		const rst = await redis.get(token);
		return rst;
	}

	async function authenticCookie() {
		if (!this.cookies[key]) {
			return false;
		}
		return authentic(this.cookies[key]);
	}

	ctx.decorate('authentic', authentic);
	ctx.decorateRequest('authenticCookie', authenticCookie, ['cookies']);
	ctx.decorateReply('authorize', authorize, ['setCookie']);

});