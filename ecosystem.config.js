'use strict';
/* eslint-disable */
const path = require('path');

module.exports = {
	apps: [{
		// 记得和package.json中stop保持一致
		name: 'blog-backend',
		script: 'src/index.js',
		cwd: __dirname,
		output: path.resolve(__dirname, 'logs/info.log'),
		error: path.resolve(__dirname, 'logs/error.log'),
		max_memory_restart: '1G',
		// 每次重启时间间隔
		restart_delay: 1000,
		// 在强杀进程之前给3s释放资源
		kill_timeout: 3000,
		merge_logs: true,
		// 在进程启动失败的时候就不要自动重启了, 通常重启还是失败
		autorestart: true,
		// 如果要自动重启的话, 就最多尝试5c次吧
		max_restarts: 5,
		watch: ['./src'],
		watch_delay: 1000,
		instances: 'max',
		exec_mode: 'cluster',
		treekill: true,
		env: {
			NODE_ENV: 'development'
		},
		env_production: {
			NODE_ENV: 'production'
		}
	}]

	// 部署相关的工作交给CI层面做吧, PM2感觉做的有点多
	// deploy: {
	// 	production: {
	// 		user: 'node',
	// 		host: '212.83.163.1',
	// 		ref: 'origin/master',
	// 		repo: 'git@github.com:repo.git',
	// 		path: '/var/www/production',
	// 		'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
	// 	}
	// }
};
