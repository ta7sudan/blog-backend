'use strict';

module.exports = ({ sq, log }) => ({
	async getUserProfile() {
		const query = sq
			.return`
			users.name,
			users.desc,
			users.profile`
			.from`users`
			.limit(1);
		try {
			const rst = await query.one();
			return rst;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}
	}
});