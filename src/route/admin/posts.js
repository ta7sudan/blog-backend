
'use strict';

module.exports = ({ controller }) => ({
	'post /posts': controller.posts.addPost
});