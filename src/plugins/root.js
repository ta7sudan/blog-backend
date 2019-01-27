'use strict';

module.exports = async ({ dao, log }) => {
	// 逻辑是这么个逻辑, 多进程的时候这里两个
	// 操作讲道理会有读后写的可能性吧...
	// 在应用启动的时候创建一个管理员真的好吗...
	// 要么还是考虑搞个CLI或者别的接口来创建ROOT
	const hasUser = await dao.users.getUserCount();
	if (!hasUser) {
		await dao.users.addUser({
			name: process.env.ROOT_NAME,
			password: process.env.ROOT_PASSWORD
		});
		log.info('Root has been created.');
	}
};