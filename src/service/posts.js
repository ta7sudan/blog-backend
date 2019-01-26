'use strict';
const { HOME_PAGE, POSTS_TOTAL } = require('../lib/key-map');

module.exports = {
	async getPreviewPosts(page = 0, limit = 10) {
		const { redis } = this;
		if ((await redis.exists(`${HOME_PAGE}${page}.${limit}`, POSTS_TOTAL)) === 2) {
			// 这样的话, 是不是有可能被想搞事的人用不同limit把内存搞爆...
			const posts = JSON.parse(await redis.get(`${HOME_PAGE}${page}.${limit}`));
			const total = parseInt(await redis.get(POSTS_TOTAL), 10);
			return {
				posts,
				total
			};
		} else {
			const { posts, total } = await this.dao.posts.getPreviewPosts(page, limit);
			setImmediate(() => {
				redis.pipeline()
					.multi()
					.set(`${HOME_PAGE}${page}.${limit}`, JSON.stringify(posts), 'EX', 3600)
					.set(POSTS_TOTAL, total, 'EX', 3600)
					.exec()
					.exec();
			});
			return {
				posts,
				total
			};
		}
	}
};