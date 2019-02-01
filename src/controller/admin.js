'use strict';

module.exports = ctx => ({
	login(req, res) {
		req.authenticCookie().then(rst => {
			if (rst) {
				res.redirect('/admin');
			} else {
				res.view('src/views/login.ejs');
			}
		});
	},
	index(req, res) {
		req.authenticCookie().then(rst => {
			if (!rst) {
				res.redirect('/login');
			} else {
				res.view('src/views/admin.ejs');
			}
		});
	}
});