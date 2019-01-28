'use strict';
const uuidv4 = require('uuid/v4');
const GUEST_TOKEN = 'tid';
const { createCaptcha } = require('../lib/util');



module.exports = () => ({
	async captcha(req, res) {
		let uuid = null;
		if (!req.cookies[GUEST_TOKEN]) {
			uuid = uuidv4();
			this.redis.set(uuid, true, 'EX', 3605);
			res.setCookie('tid', uuid, {
				expires: new Date(Date.now() + 3600000),
				httpOnly: true,
				path: '/',
				secure: process.env.NODE_ENV === 'production'
			});
		} else {
			uuid = req.cookies[GUEST_TOKEN];
		}
		const rst = createCaptcha();
		this.redis.set(uuid, rst.captcha, 'EX', 60);
		res.header('Content-Type', 'image/bmp');
		res.send(rst.img.getFileData());
	}
});