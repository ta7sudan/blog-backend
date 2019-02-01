'use strict';

module.exports = ({ service, schema }) => ({
	getUserProfile: {
		schema: schema.user.getUserProfile,
		async handler(req, res) {
			const profile = await service.user.getUserProfile();
			return {
				statusCode: res.statusCode.OK,
				errorMessage: 'OK',
				...profile
			};
		}
	}
});