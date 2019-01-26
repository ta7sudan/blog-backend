'use strict';

module.exports = ({ sq, log }) => ({
	async getPreviewPosts(page = 0, limit = 10) {
		const foo = sq.return`count(posts.id) as total`.from`posts`;
		const query = sq.return`
			foo.total::integer,
			posts.id,
			posts.pid,
			users.name as author,
			posts.title, posts.views,
			posts.img,
			posts.parsed,
			posts.created_time as createdTime,
			posts.modified_time as modifiedTime,
			posts.content,
			array_agg(tags.tag_name) as tags`
			.from`posts, users, tags, ${foo} as foo`
			.where`users.id = posts.uid and tags.pid = users.id`
			.groupBy('posts.id', 'users.name', 'foo.total')
			.orderBy({
				by: 'posts.id',
				sort: 'desc'
			})
			.limit(limit)
			.offset(page * limit);
		try {
			const posts = await query.all();
			log.info(query.query);
			return {
				posts,
				total: posts[0] ? posts[0].total : 0
			};
		} catch (err) {
			// 暂时先吞掉异常给个log吧, 感觉不太好就是...
			log.error(err);
			log.error(query.query);
			return {
				posts: [],
				total: 0
			};
		}
	}
});