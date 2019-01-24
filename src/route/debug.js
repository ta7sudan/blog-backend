'use strict';

module.exports = ctx => ({
	'get /debug/token': ctx.controller.debug.token
});
