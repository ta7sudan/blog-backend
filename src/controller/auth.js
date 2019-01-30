'use strict';
const uuidv4 = require('uuid/v4');
const GUEST_TOKEN = 'tid';
const { createCaptcha, sha256 } = require('../lib/util');


// 应该抽离出授权/鉴权的逻辑, 写在这里
// 太乱了, 而且之后每个接口还得都写一遍
// 鉴权, 更合理的操作是用现成的库不要自己
// 造轮子...
module.exports = () => ({
	async authorize(req, res) {
		if (!req.cookies[GUEST_TOKEN]) {
			res.code(res.statusCode.NO_GUEST_TOKEN);
			return {
				statusCode: res.statusCode.NO_GUEST_TOKEN,
				errorMessage: 'Guest token not found, please enable cookie'
			};
		}
		let uuid = req.cookies[GUEST_TOKEN], { captcha, username, password } = req.body;
		if ((await this.redis.get(uuid)) !== captcha) {
			res.code(res.statusCode.CAPTCHA_ERROR);
			return {
				statusCode: res.statusCode.CAPTCHA_ERROR,
				errorMessage: 'Captcha error'
			};
		}
		const rst = await this.dao.users.getUser(username, password);
		if (!rst.length) {
			res.code(res.statusCode.NO_SUCH_USER);
			return {
				statusCode: res.statusCode.NO_SUCH_USER,
				errorMessage: 'Invalid username or password'
			};
		}
		const uid = sha256(rst[0].name + process.env.USER_SECRET);
		res.setCookie('uid', uid, {
			expires: new Date(Date.now() + 3600000),
			httpOnly: true,
			path: '/',
			secure: process.env.NODE_ENV === 'production'
		});
		this.redis.set(uid, true, 'EX', 3605);
		return {
			statusCode: res.statusCode.OK,
			errorMessage: 'ok',
			dest: '/admin'
		};
	},
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
		this.redis.set(uuid, rst.captcha, 'EX', process.env.NODE_ENV === 'production' ? 60 : 3600);
		res.header('Content-Type', 'image/bmp');
		res.send(rst.img.getFileData());
	}
});