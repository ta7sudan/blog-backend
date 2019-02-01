'use strict';

module.exports = ({ controller }) => ({
	'get /friends': controller.friends.getFriendsList
});