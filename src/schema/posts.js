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
					minimum: 1
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
	},
	addPost: {
		body: {
			type: 'object',
			required: ['title'],
			properties: {
				title: {
					type: 'string'
				},
				tags: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				titleMap: {
					type: 'string'
				},
				content: {
					type: 'string'
				}
			}
		}
	},
	getPostByPid: {
		response: {
			200: {
				type: 'object',
				required: ['id', 'title', 'author', 'views', 'createdTime'],
				properties: {
					statusCode: {
						type: 'integer'
					},
					errorMessage: {
						type: 'string'
					},
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
	},
	getPrevAndNextByPid: {
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
					prev: {
						type: 'object',
						required: ['id', 'title'],
						properties: {
							id: {
								type: 'string'
							},
							title: {
								type: 'string'
							}
						}
					},
					next: {
						type: 'object',
						required: ['id', 'title'],
						properties: {
							id: {
								type: 'string'
							},
							title: {
								type: 'string'
							}
						}
					}
				}
			}
		}
	},
	getArchivesByPage: {
		params: {
			type: 'object',
			properties: {
				page: {
					type: 'integer',
					minimum: 1
				}
			}
		},
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
					total: {
						type: 'integer'
					},
					archives: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								group: {
									type: 'string'
								},
								posts: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											year: {
												type: 'integer'
											},
											month: {
												type: 'integer'
											},
											date: {
												type: 'integer'
											},
											id: {
												type: 'string'
											},
											title: {
												type: 'string'
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	getPostsGroupByTag: {
		response: {
			200: {
				type: 'object',
				required: ['tags'],
				properties: {
					statusCode: {
						type: 'integer'
					},
					errorMessage: {
						type: 'string'
					},
					tags: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								tagName: {
									type: 'string'
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
											}
										}
									}
								}
							}
						}
					}

				}
			}
		}
	},
	searchTitleAndContent: {
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
					result: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: {
									type: 'string'
								},
								title: {
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