'use strict';

module.exports = ({ controller }) => ({
	'get /index': controller.web.indexMobile
});