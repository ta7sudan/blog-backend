'use strict';

module.exports = {
	getPreviewPosts: {
		querystring: {
			limit: {
				type: 'integer',
				minimum: 0
			}
		},
		params: {
			type: 'object',
			properties: {
				page: {
					type: 'integer',
					minimum: 0
				}
			}
		},
		response: {
			200: {
				type: 'object',
				required: ['statusCode', 'errorMessage', 'total', 'posts'],
				properties: {
					statusCode: {
						type: 'integer'
					},
					errorMessage: {
						type: 'string'
					},
					total: {
						type: 'integer'
					},
					posts: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: {
									type: 'string'
								},
								title: {
									type: 'string'
								},
								author: {
									type: 'string'
								},
								tags: {
									type: 'array',
									items: {
										type: 'string'
									}
								},
								views: {
									type: 'integer'
								},
								img: {
									type: 'string'
								},
								page: {
									type: 'integer'
								},
								parsed: {
									type: 'boolean'
								},
								createdTime: {
									type: 'integer'
								},
								modifiedTime: {
									type: 'integer'
								},
								content: {
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