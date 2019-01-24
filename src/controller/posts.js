'use strict';

module.exports = ctx => ({
	async getPosts() {
		await ctx.service.posts.test();
		return {
			test: 'test'
		};
	}
});