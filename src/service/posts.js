'use strict';

module.exports = {
	async getPreviewPosts(page = 0, limit = 10) {
		const { redis } = this;
		if ((await redis.exists(`home.page.${page}`, 'posts.total')) === 2) {
			const posts = JSON.parse(await redis.get(`home.page.${page}`));
			const total = parseInt(await redis.get('posts.total'), 10);
			return {
				posts,
				total
			};
		} else {
			const { posts, total } = await this.dao.posts.getPreviewPosts(page, limit);
			setImmediate(() => {
				redis.set(`home.page.${page}`, JSON.stringify(posts));
				redis.set('posts.total', total);
			});
			return {
				posts,
				total
			};
		}
	}
};