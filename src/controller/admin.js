'use strict';

module.exports = ctx => ({
	async login(req, res) {
		if (await req.authenticCookie()) {
			res.redirect('/admin');
			return;
		}
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