'use strict';
const fs = require('fs');
const path = require('path');


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