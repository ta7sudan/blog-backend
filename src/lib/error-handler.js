'use strict';

module.exports = function registerHandler(event, { cleaner, logger } = {}) {
	process.on(event, (...args) => {
		if (cleaner) {
			cleaner.cleanup();
		}
		if (logger) {
			logger.log(...args);
		}
		// process.exit(1);
	});
};