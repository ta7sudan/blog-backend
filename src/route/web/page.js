'use strict';

module.exports = ({ controller }) => ({
	'get /': controller.web.indexMobile
});