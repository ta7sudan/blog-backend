'use strict';

module.exports = ({ controller }) => ({
	'get /about': controller.user.getUserProfile
});