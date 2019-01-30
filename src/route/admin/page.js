'use strict';

module.exports = ({ controller }) => ({
	'get /login': controller.admin.login,
	'get /admin': controller.admin.index
});