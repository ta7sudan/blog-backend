'use strict';

module.exports = ({ controller }) => ({
	'get /posts/:pid': controller.posts.getPostByPid
});