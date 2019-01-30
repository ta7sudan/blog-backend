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
		async handler(req, res) {
			const userInfo = await req.authenticCookie();
			if (!userInfo) {
				res.code(res.statusCode.ACCESS_FORBIDDEN);
				return {
					statusCode: res.statusCode.ACCESS_FORBIDDEN,
					errorMessage: 'Access forbidden',
				};
			}
			const user = JSON.parse(userInfo);
			await service.posts.addPost({
				title: req.body.title,
				tags: req.body.tags,
				img: req.body.titleMap,
				content: req.body.content
			}, user);
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				content: 'hello world'
			};
		}
	}
});