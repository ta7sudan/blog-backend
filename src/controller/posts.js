'use strict';

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
		async preHandler(req, res) {
			const userInfo = await req.authenticCookie();
			if (!userInfo) {
				res.code(res.statusCode.ACCESS_FORBIDDEN);
				res.send({
					statusCode: res.statusCode.ACCESS_FORBIDDEN,
					errorMessage: 'Access forbidden',
				});
				return;
			}
			const user = JSON.parse(userInfo);
			this.user = user;
		},
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
	getPostByPid: {
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
	}
});