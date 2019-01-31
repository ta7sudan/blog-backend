'use strict';
const { HOME_PAGE, POSTS_TOTAL, POST, ARCHIVES, ARCHIVES_TOTAL } = require('../lib/key-map');

module.exports = {
	async getPreviewPosts(page = 0, limit = 10) {
		const { redis } = this;
		if ((await redis.exists(`${HOME_PAGE}:${page}:${limit}`, POSTS_TOTAL)) === 2) {
			// 这样的话, 是不是有可能被想搞事的人用不同limit把内存搞爆...
			const r1 = redis.get(`${HOME_PAGE}:${page}:${limit}`),
				r2 = redis.get(POSTS_TOTAL);
			const [rst1, rst2] = await Promise.all([r1, r2]);
			const posts = JSON.parse(rst1);
			const total = parseInt(rst2, 10);
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
			redis.del(POSTS_TOTAL, ARCHIVES_TOTAL);
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
	},
	async getPrevAndNextByPid(pid) {
		const { dao } = this, rst = {};
		const group = await dao.posts.getSblingByPid(pid);
		for (let i = 0, len = group.length; i < len; ++i) {
			if (group[i].id === pid) {
				if (group[i-1]) {
					rst.prev = group[i-1];
				}
				if (group[i+1]) {
					rst.next = group[i+1];
				}
				break;
			}
		}
		return rst;
	},
	async delPostByPid(pid) {
		const { dao, redis } = this;
		const rst = await dao.posts.delPostByPid(pid);
		setImmediate(() => {
			redis.del(POSTS_TOTAL, ARCHIVES_TOTAL, `${POST}:${pid}`);
			redis.keys(`${HOME_PAGE}:*`).then(keys => {
				const pipeline = redis.pipeline();
				keys.forEach(k => pipeline.del(k));
				pipeline.exec();
			});
		});
		return rst;
	},
	async getArchivesByPage(page = 0, limit = 5) {
		const { dao, redis } = this, map = {};
		let archives = null, rst = null, total = 0;

		if ((await redis.exists(`${ARCHIVES}:${page}:${limit}`, ARCHIVES_TOTAL)) === 2) {
			const r1 = redis.get(`${ARCHIVES}:${page}:${limit}`),
				r2 = redis.get(ARCHIVES_TOTAL);
			const [rst1, rst2] = await Promise.all([r1, r2]);
			archives = JSON.parse(rst1);
			total = parseInt(rst2, 10);
		} else {
			const p1 = dao.posts.getArchivesByPage(page, limit);
			const p2 = dao.posts.getMonthTotal();
			[rst, total] = await Promise.all([p1, p2]);
			for (const item of rst) {
				if (!map[`${item.year}-${item.month}`]) {
					map[`${item.year}-${item.month}`] = [];
				}
				map[`${item.year}-${item.month}`].push(item);
			}
			archives = Object.keys(map).map(k => ({
				group: k,
				posts: map[k]
			}));
			setImmediate(() => {
				redis.pipeline()
					.multi()
					.set(`${ARCHIVES}:${page}:${limit}`, JSON.stringify(archives), 'EX', 3600)
					.set(ARCHIVES_TOTAL, total, 'EX', 3600)
					.exec()
					.exec();
			});
		}
		return {
			archives,
			total
		};

	}
};