'use strict';

async function preHandler(req, res) {
	const userInfo = await req.authenticCookie();
	if (!userInfo) {
		res.code(res.statusCode.ACCESS_FORBIDDEN);
		res.send({
			statusCode: res.statusCode.ACCESS_FORBIDDEN,
			errorMessage: 'Access forbidden'
		});
		return;
	}
	const user = JSON.parse(userInfo);
	this.user = user;
}

module.exports = ({ service, schema }) => ({
	getPreviewPosts: {
		schema: schema.posts.getPreviewPosts,
		async handler(req, res) {
			const { params: { page = 1 }, query: { limit = 10 } } = req;
			const { posts, total } = await service.posts.getPreviewPosts(page - 1, limit);
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				total,
				posts
			};
		}
	},
	addPost: {
		schema: schema.posts.addPost,
		preHandler,
		async handler(req, res) {
			await service.posts.addPost({
				title: req.body.title,
				tags: req.body.tags,
				img: req.body.titleMap,
				content: req.body.content
			}, this.user);
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK'
			};
		}
	},
	// 丑陋...
	getPostByPid0: {
		schema: schema.posts.getPostsByPid,
		async handler(req, res) {
			const pid = req.params.pid;
			const post = await service.posts.getPostByPid(pid);
			if (post) {
				service.posts.updateViewCount(pid);
				return {
					statusCode: res.statusCode.OK,
					errorMessage: 'OK',
					post
				};
			} else {
				res.code(res.statusCode.NOT_FOUND);
				return {
					statusCode: res.statusCode.NOT_FOUND,
					errorMessage: 'Post not found'
				};
			}
		}
	},
	getPostByPid1: {
		schema: schema.posts.getPostsByPid,
		preHandler,
		async handler(req, res) {
			const pid = req.params.pid;
			const post = await service.posts.getPostByPid(pid);
			if (post) {
				return {
					statusCode: res.statusCode.OK,
					errorMessage: 'OK',
					post
				};
			} else {
				res.code(res.statusCode.NOT_FOUND);
				return {
					statusCode: res.statusCode.NOT_FOUND,
					errorMessage: 'Post not found'
				};
			}
		}
	},
	getPrevAndNextByPid: {
		schema: schema.posts.getPrevAndNextByPid,
		async handler(req, res) {
			const pid = req.query.id;
			if (!pid) {
				res.code(res.statusCode.NOT_FOUND);
				return {
					statusCode: res.statusCode.NOT_FOUND,
					errorMessage: 'Not found'
				};
			}
			const rst = await service.posts.getPrevAndNextByPid(pid.trim());
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				...rst
			};
		}
	},
	delPostByPid: {
		preHandler,
		async handler(req, res) {
			const pid = req.params.pid;
			if (!pid) {
				res.code(res.statusCode.NOT_FOUND);
				return {
					statusCode: res.statusCode.NOT_FOUND,
					errorMessage: 'Not found'
				};
			}
			await service.posts.delPostByPid(pid.trim());
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK'
			};
		}
	},
	getArchivesByPage: {
		schema: schema.posts.getArchivesByPage,
		async handler(req, res) {
			const page = req.params.page;
			const rst = await service.posts.getArchivesByPage(page - 1, 5);
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				...rst
			};

		}
	},
	getPostsGroupByTag: {
		schema: schema.posts.getPostsGroupByTag,
		async handler(req, res) {
			const tags = await service.posts.getPostsGroupByTag();
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				tags
			};
		}
	}
});