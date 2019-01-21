'use strict';

module.exports = ctx => ({
	async getPosts() {
		ctx.service.posts.test();
		return {
			test: 'test'
		};
	}
});