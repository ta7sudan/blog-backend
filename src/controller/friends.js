'use strict';

module.exports = ({ service, schema }) => ({
	getFriendsList: {
		schema: schema.friends.getFriendsList,
		async handler(req, res) {
			const friends = await service.friends.getFriendsList();
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				friends
			};
		}
	}
});