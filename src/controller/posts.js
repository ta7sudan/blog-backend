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
	}
});