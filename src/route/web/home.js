'use strict';

module.exports = ({ controller }) => ({
	'get /home/posts/:page': controller.posts.getPreviewPosts,
	'get /jwt/exchange': controller.auth.exchangeJWT
});