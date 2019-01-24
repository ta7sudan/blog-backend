'use strict';

module.exports = {
	async test() {
		this.redis.set('wtf', 'wtf');
		const rst = await this.pg.query('select backup0 as test from users');
		console.log(rst.rows[0]);
	}
};