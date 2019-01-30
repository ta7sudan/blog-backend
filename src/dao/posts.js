'use strict';
const { sha256 } = require('../lib/util');

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
			.where`users.id = posts.uid and tags.pid = posts.id`
			.groupBy('posts.id', 'users.name', 'foo.total')
			.orderBy({
				by: 'posts.id',
				sort: 'desc'
			})
			.limit(limit)
			.offset(page * limit);
		try {
			const posts = await query.all();
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
	},
	async addPost(post, user) {
		const trx = await sq.transaction();
		try {
			const insertPost = sq.sql`
			insert into posts(pid, uid, title, author, tags, img, content)
			values (${sha256(post.title)}, ${user.id}, ${post.title}, ${user.name}, ${post.tags}, ${post.img}, ${post.content})
			returning id
			`;
			const { id } = await insertPost.one(trx);
			const all = [];
			if (Array.isArray(post.tags)) {
				for (const tag of post.tags) {
					const insertTag = sq.from`tags(pid, tag_name)`
						.insert`values (${id}, ${tag})`;
					all.push(insertTag.one(trx));
				}
				await Promise.all(all);
			}
			await trx.commit();
		} catch (err) {
			await trx.rollback();
			throw err;
		}
	}
});