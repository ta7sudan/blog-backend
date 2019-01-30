'use strict';
const fs = require('fs');
const path = require('path');
const { BMP24 } = require('gd-bmp');
const crypto = require('crypto');


function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + Math.floor(min);
}

exports.rand = rand;

exports.createCaptcha = function createCaptcha(width = 120, height = 40) {
	const img = new BMP24(width, height), minSide = Math.min(width, height), maxSide = Math.max(width, height), horizontal = width > height;
	img.fillRect(0, 0, width, height, rand(0xcccccc, 0xffffff));

	const strLen = Math.floor(width / 16), charSize = Math.floor(width / strLen), captchaArr = [], dict = 'abdefghijkmnpqrstyABCDEFGHJKLMNPQRSTUVWXYZ0123456789', fonts = [BMP24.font12x24, BMP24.font16x32];
	for (let i = 0; i < strLen; ++i) {
		let ih = Math.floor(height / 2), iw = Math.floor(i * charSize + charSize / 2), ch = dict[rand(0, dict.length - 1)];
		captchaArr.push(ch);
		img.drawChar(ch, iw + rand(-5, 5), ih - rand(0, 16) + rand(-5, 5), fonts[rand(0, 1)], rand(0, 0x999999));
	}

	let circleCount = rand(3, 6);
	while (circleCount--) {
		if (horizontal) {
			img.drawCircle(rand(maxSide*(circleCount-1)/4, maxSide*circleCount/4), rand(-minSide/2, minSide*1.5), rand(minSide/4, minSide*3), rand(0xaaaaaa, 0xcccccc));
		} else {
			img.drawCircle(rand(-minSide/2, minSide*1.5), rand(maxSide*(circleCount-1)/4, maxSide*circleCount/4), rand(minSide/4, minSide*3), rand(0xaaaaaa, 0xcccccc));
		}
	}

	let w = width/2, h = height, color = rand(0, 0xffffff), y1 = rand(-5, 5), w2 = rand(10, 15), h3 = rand(4, 6), bl = rand(1, 5);
	for (let i = -w; i < w; i += 0.1) {
		let y = Math.floor(h / h3 * Math.sin(i / w2) + h/2 + y1);
		let x = Math.floor(i + w);
		for (let j = 0; j < bl; ++j) {
			img.drawPoint(x, y + j, color);
		}
	}

	let slice = 10, ws = width / slice, hs = height / slice;
	for (let i = 1; i < ws; ++i) {
		const cw = i * slice;
		for (let j = 1; j < hs; ++j) {
			const ch = j * slice;
			for (let n = 0; n < 4; ++n) {
				img.drawPoint(cw + rand(-5, 5), ch + rand(-5, 5), rand(0, 0xffffff));
			}
		}
	}

	return {
		img,
		captcha: captchaArr.join('')
	};
};

exports.sha256 = function sha256(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
};


exports._load = function _load(dir, ctx, fn) {
	const filenames = fs.readdirSync(dir, 'utf8');
	return filenames
		.map(file => {
			let subDir = null, namespace = null, module = null;
			if (path.extname(file) === '.js') {
				// 如果文件名是aaa.bbb.js怎么办?
				// 有人要用aaa.bbb来做命名空间也是脑子抽了...
				namespace = file.split('.')[0];
				module = fn(dir, null, file, ctx);
			} else if (fs.statSync(subDir = path.join(dir, file)).isDirectory()) {
				namespace = file;
				module = fn(null, subDir, null, ctx);
			}
			module[Symbol.for('isNamespace')] = true;
			return {
				namespace,
				module
			};
		})
		.reduce((prev, cur) => (prev[cur.namespace] = cur.module, prev), {});
};