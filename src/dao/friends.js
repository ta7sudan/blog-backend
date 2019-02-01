'use strict';
module.exports = ({ sq, log }) => ({
	async getFriendsList() {
		const query = sq
			.return`friends.avatar,
			friends.name,
			friends.desc,
			friends.link`
			.from`friends`;
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