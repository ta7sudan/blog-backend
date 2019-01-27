'use strict';

const crypto = require('crypto');

module.exports = ({ sq, log }) => ({
	async getUserCount() {
		const query = sq.return`count(users.id)::integer as count`.from`users`;
		try {
			const rst = await query.one();
			return rst.count;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}
	},
	async addUser({ name, password, profile }) {
		if (typeof name !== 'string' || typeof password !== 'string') {
			throw new TypeError(`Expected name and password to be a string, but received ${name} and ${password}`);
		}
		if (!name.trim() || !password.trim()) {
			throw new Error('name and password is empty');
		}
		const query = sq
			.from`users(name, password, profile)`
			.insert`values (${name}, ${crypto.createHash('sha256').update(password + process.env.USER_SECRET).digest('hex')}, ${profile || ''})`;
		try {
			await query;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}
	}
});