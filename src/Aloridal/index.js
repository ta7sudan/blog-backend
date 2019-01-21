'use strict';
const Fastify = require('fastify');
const fs = require('fs');
const path = require('path');

const PROJECT_SRC = path.dirname(require.main.filename);
const SERVICE_DIR = path.resolve(PROJECT_SRC, 'service');
const SCHEMA_DIR = path.resolve(PROJECT_SRC, 'schema');
const CONTROLLER_DIR = path.resolve(PROJECT_SRC, 'controller');
const ROUTE_DIR = path.resolve(PROJECT_SRC, 'route');
const toString = Object.prototype.toString.call.bind(Object.prototype.toString);
const isFn = fn => typeof fn === 'function';

function _load(dir, ctx, fn) {
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
}

function loadService(dir, ctx) {
	return _load(dir, ctx, (_dir, _subDir, _file, _ctx) => {
		if (_dir) {
			const module = require(path.resolve(_dir, _file));
			// 导出不是对象, value不是函数直接crash
			// bind是为了让service可以取得其他service
			// 缺点是this不是app.service.xxx而是app可能让人
			// 产生误解
			Object.keys(module).forEach(k => module[k] = module[k].bind(_ctx));
			return module;
		} else if (_subDir) {
			return loadService(_subDir, _ctx);
		}
	});
}

function loadSchema(dir) {
	return _load(dir, null, (_dir, _subDir, _file, _ctx) => {
		if (_dir) {
			return require(path.resolve(_dir, _file));
		} else if (_subDir) {
			return loadSchema(_subDir);
		}
	});
}

function parseModule(mod, ctx) {
	// 这里不想像service那样改变handler的this, 虽然this作为参数隐式传递
	// 会让代码看起来舒服些, 但是考虑handler的this和fastify联系紧密, 还
	// 是不去修改比较好, 那ctx还是显式传进去好了
	const realMod = mod(ctx);
	Object.keys(realMod).forEach(k => {
		if (toString(realMod[k]) === '[object Object]') {
			// 暂时还没想好要做点什么
			return;
		} else if (isFn(realMod[k])) {
			realMod[k] = {
				handler: realMod[k]
			};
		}
	});
	return realMod;
}

function loadController(dir, ctx) {
	return _load(dir, ctx, (_dir, _subDir, _file, _ctx) => {
		if (_dir) {
			return parseModule(require(path.resolve(_dir, _file)), _ctx);
		} else if (_subDir) {
			return loadController(_subDir, _ctx);
		}
	});
}

function loadRoute(dir, ctx) {
	return _load(dir, ctx, (_dir, _subDir, _file, _ctx) => {
		if (_dir) {
			return require(path.resolve(_dir, _file))(_ctx);
		} else if (_subDir) {
			return loadRoute(_subDir, _ctx);
		}
	});
}

function getNamespace(root, path) {
	if (!path) {
		return root;
	}
	if (typeof path === 'string') {
		path = path.split('.');
	}
	if (!root[path[0]]) {
		throw new Error(`No such namespace ${path[0]}`);
	} else if (root[path[0]][Symbol.for('isNamespace')] && path.length > 1) {
		return getNamespace(root[path[0]], path.slice(1));
	} else if (path.length === 1) {
		return root[path[0]];
	} else {
		return root;
	}
}

function _registerRoute(namespace, ctx) {
	Object.keys(namespace).forEach(k => {
		if (namespace[k][Symbol.for('isNamespace')]) {
			_registerRoute(namespace[k], ctx);
		} else {
			const routeOptions = namespace[k],
				parts = k.trim().split(/\s+/),
				method = parts[0],
				path = parts[1];
			ctx[method](path, routeOptions);
		}
	});
}

function registerRoute(...args) {
	let namespace = null, fn = null, options = null;
	for (const item of args) {
		switch (typeof item) {
			case 'string':
				namespace = getNamespace(this.routeMap, item);
				break;
			case 'function':
				fn = item;
				break;
			// 不管null
			case 'object':
				options = item;
				break;
			default:
				break;
		}
	}
	if (!namespace) {
		namespace = getNamespace(this.routeMap);
	}

	this.register(async function (ctx, opts, next) {
		if (isFn(fn)) {
			const rst = fn(ctx, opts, next);
			if (isFn(rst.then)) {
				await rst;
			}
			// throw new Error(`registerRoute expected a function, but received ${fn}`);
		}
		_registerRoute(namespace, ctx);
	}, options);
}

module.exports = class Aloridal extends Fastify {
	constructor(options) {
		super(options);
		const service = loadService(SERVICE_DIR, this);
		const schema = loadSchema(SCHEMA_DIR);
		// 因为其实Fastify的实例不是Fastify的实例...
		// 导致这里不能通过简单的this绑定属性来完成,
		// 否则在单独的scope中还是无法取得这些属性,
		// 更为严重的问题是, 让我想通过class扩展变得
		// 非常坑爹, 因为在class中定义的属性/方法经过
		// super以后, this的绑定变了...这就是JS的继承
		// 的傻屌之处了...所以还是要用decorate, 只
		// 是对外看起来像是完美地继承了(其实并没有
		this.decorate('service', service);
		this.decorate('schema', schema);

		// 加载controller的时候需要用到this上的service和schame, so
		// 放decorate之后
		const controller = loadController(CONTROLLER_DIR, this);
		this.decorate('controller', controller);
		const routeMap = loadRoute(ROUTE_DIR, this);
		this.decorate('routeMap', routeMap);
		this.decorate('registerRoute', registerRoute);
	}
	// 这里定义方法是没有卵用的,
	// 别问, 问就是这个class是残疾的

};