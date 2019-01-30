'use strict';
const { sha256 } = require('../lib/util');


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
	async getUser(name = null, password = null) {
		const query = sq.return`users.id, users.name, users.password, users.profile`
			.from`users`
			.where`name=${name} and password=${sha256(password + process.env.USER_SECRET)}`;
		try {
			const rst = await query.all();
			return rst;
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
			.insert`values (${name}, ${sha256(password + process.env.USER_SECRET)}, ${profile || ''})`;
		try {
			await query;
		} catch (err) {
			log.error(err);
			log.error(query.query);
			throw err;
		}
	}
});