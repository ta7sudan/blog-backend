
'use strict';

module.exports = ({ controller }) => ({
	'post /posts': controller.posts.addPost,
	// 本来是一个接口就OK, 但是因为后台和前台在一个项目下,
	// 授权不同, 又得拆一个出来, 为了和前台同一个API区分,
	// 这里特地写了post而不是posts
	'get /post/:pid': controller.posts.getPostByPid1,
	'delete /posts/:pid': controller.posts.delPostByPid
});