'use strict';
const uuidv4 = require('uuid/v4');

module.exports = ctx => ({
	indexMobile(req, res) {
		if (!req.cookies.JWT) {
			const uuid = uuidv4();
			const jwt = this.jwt.sign({
				tid: uuid
			});
			res.setCookie('JWT', jwt, {
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				httpOnly: false,
				expires: new Date(Date.now() + 3600000)
			});
		}
		res.view('src/views/index-mobile.ejs');
	}
});