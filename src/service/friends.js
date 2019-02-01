'use strict';

module.exports = {
	async getFriendsList() {
		const { dao } =  this;
		const friends = await dao.friends.getFriendsList();
		return friends;
	}
};