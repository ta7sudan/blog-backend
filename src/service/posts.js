'use strict';
const { HOME_PAGE, POSTS_TOTAL, POST } = require('../lib/key-map');

module.exports = {
	async getPreviewPosts(page = 0, limit = 10) {
		const { redis } = this;
		if ((await redis.exists(`${HOME_PAGE}:${page}:${limit}`, POSTS_TOTAL)) === 2) {
			// 这样的话, 是不是有可能被想搞事的人用不同limit把内存搞爆...
			const posts = JSON.parse(await redis.get(`${HOME_PAGE}:${page}:${limit}`));
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
					.set(`${HOME_PAGE}:${page}:${limit}`, JSON.stringify(posts), 'EX', 3600)
					.set(POSTS_TOTAL, total, 'EX', 3600)
					.exec()
					.exec();
			});
			return {
				posts,
				total
			};
		}
	},
	async addPost(post, user) {
		const { dao, redis } = this;
		await dao.posts.addPost(post, user);
		setImmediate(() => {
			redis.del(POSTS_TOTAL);
			redis.keys(`${HOME_PAGE}:*`).then(keys => {
				const pipeline = redis.pipeline();
				keys.forEach(k => pipeline.del(k));
				pipeline.exec();
			});
		});
	},
	async getPostByPid(pid) {
		const { dao, redis } = this;
		let post = null;
		if ((await redis.exists(`${POST}:${pid}`)) === 1) {
			post = JSON.parse(await redis.get(`${POST}:${pid}`));
		} else {
			post = await dao.posts.getPostByPid(pid);
			if (post) {
				redis.set(`${POST}:${post.id}`, JSON.stringify(post), 'EX', 3600);
			}
		}
		return post;
	},
	async updateViewCount(pid) {
		const { dao } = this;
		await dao.posts.updateViewCount(pid);
	}
};