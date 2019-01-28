'use strict';

module.exports = ({ controller }) => ({
	'get /captcha': controller.auth.captcha
});