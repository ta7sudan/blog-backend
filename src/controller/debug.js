'use strict';

module.exports = () => ({
	async token() {
		const token = this.jwt.sign({
			debug: 'debug'
		});
		return {
			token
		};
	}
});