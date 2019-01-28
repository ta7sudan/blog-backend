'use strict';

module.exports = ctx => ({
	login(req, res) {
		res.view('src/views/login.ejs');
	}
});