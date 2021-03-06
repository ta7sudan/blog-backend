'use strict';

module.exports = ({ controller }) => ({
	'get /posts/:pid': controller.posts.getPostByPid0,
	'get /prev-next': controller.posts.getPrevAndNextByPid,
	'get /archives/:page': controller.posts.getArchivesByPage,
	'get /tags': controller.posts.getPostsGroupByTag,
	'get /search': controller.posts.searchTitleAndContent
});