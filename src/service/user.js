'use strict';

module.exports = {
	async getUserProfile() {
		const { dao } = this;
		const profile = dao.user.getUserProfile();
		return profile;
	}
};
