const organize = require('./src/organize');
const logo = require('./src/logo');
const logger = require('winston');
//set logLEvel
logger.level = require('../config.json').logLevel;

const start = new Date();

process.on('exit', () => {
	var end = new Date() - start;
	console.info('DDM processing finish, execution time: %dms', end);
});

logo.print();
organize();

