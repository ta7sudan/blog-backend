'use strict';

module.exports = ctx => ({
	login(req, res) {
		res.view('src/views/login.ejs');
	},
	async index(req, res) {
		if (!(await req.authenticCookie())) {
			res.redirect('/login');
			return;
		}
		res.view('src/views/admin.ejs');
	}
});