'use strict';

module.exports = ctx => ({
	'get /posts/:page': ctx.controller.posts.getPosts
});