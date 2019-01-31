'use strict';
const { sha256 } = require('../lib/util');

module.exports = ({ sq, log }) => ({
	async getPreviewPosts(page = 0, limit = 10) {
		const foo = sq.return`count(posts.id) as total`.from`posts`;
		const query = sq.return`
			foo.total::integer,
			posts.id as kid,
			posts.pid as id,
			users.name as author,
			posts.title, posts.views,
			posts.img,
			posts.parsed,
			posts.created_time,
			posts.modified_time,
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
			// 坑爹, 没找到这个库提供类型转换的API
			posts.forEach(post => {
				post.page = page + 1;
				post.createdTime = post.createdTime.getTime();
				post.modifiedTime && (post.modifiedTime = post.modifiedTime.getTime());
			});
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
	},
	async getPostByPid(pid) {
		const subQuery = sq.return`
			posts.id,
			posts.pid,
			posts.title,
			posts.author,
			posts.views,
			posts.img,
			posts.parsed,
			posts.created_time,
			posts.modified_time,
			posts.content`
			.from`posts`
			.where`posts.pid=${pid}`;
		const query = sq.return`
			foo.pid as id,
			foo.title,
			foo.author,
			foo.views,
			foo.img,
			foo.parsed,
			foo.created_time,
			foo.modified_time,
			foo.content,
			array_agg(tags.tag_name) as tags`
			.from`tags, ${subQuery} as foo`
			.where`tags.pid = foo.id`
			.groupBy('foo.pid',
				'foo.title',
				'foo.author',
				'foo.views',
				'foo.img',
				'foo.parsed',
				'foo.created_time',
				'foo.modified_time',
				'foo.content');
		try {
			const post = await query.one();
			post && (post.createdTime = post.createdTime.getTime());
			post && post.modifiedTime && (post.modifiedTime = post.modifiedTime.getTime());
			return post;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}
	},
	async updateViewCount(pid) {
		const query = sq.from`posts`
			.set`views=views+1`
			.where`posts.pid=${pid}`;
		try {
			await query.one();
			return true;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			return false;
		}
	},
	async getSblingByPid(pid) {
		const foo = sq.return`
		posts.id,
		posts.pid,
		posts.uid,
		posts.title,
		posts.views,
		posts.img,
		posts.parsed,
		posts.created_time,
		posts.modified_time,
		posts.content,
		lag(pid) over(order by id) as prev,
		lead(pid) over(order by id) as next
		`.from`posts`;
		const bar = sq.from`${foo} as foo`
			.where`${pid} in (foo.pid, foo.prev, foo.next)`;
		const query = sq.return`
		users.name as author,
		bar.pid as id,
		bar.title,
		bar.views,
		bar.img,
		bar.parsed,
		bar.created_time,
		bar.modified_time,
		bar.content,
		array_agg(tags.tag_name) as tags
		`
			.from`tags, users, ${bar} as bar`
			.where`tags.pid = bar.id and users.id = bar.uid`
			.groupBy`users.name, bar.id, bar.pid, bar.title, bar.views, bar.img, bar.parsed, bar.created_time, bar.modified_time, bar.content`;
		try {
			const rst = await query.all();
			return rst;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}

	}
});