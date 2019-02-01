'use strict';

module.exports = {
	getUserProfile: {
		response: {
			200: {
				properties: {
					statusCode: {
						type: 'integer'
					},
					errorMessage: {
						type: 'string'
					},
					name: {
						type: 'string'
					},
					desc: {
						type: 'string'
					},
					profile: {
						type: 'string'
					}
				}
			}
		}
	}
};