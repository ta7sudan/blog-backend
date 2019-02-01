'use strict';

module.exports = {
	getFriendsList: {
		response: {
			200: {
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer'
					},
					errorMessage: {
						type: 'string'
					},
					friends: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								avatar: {
									type: 'string'
								},
								name: {
									type: 'string'
								},
								desc: {
									type: 'string'
								},
								link: {
									type: 'string'
								}
							}
						}
					}
				}
			}
		}
	}
};