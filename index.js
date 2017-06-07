const organize = require('./src/organize');
const logo = require('./src/logo');
const logger = require('winston');
const subtitles = require('./src/subtitles');
//set logLEvel
logger.level = require('./config.json').logLevel;

const start = new Date();

//end execution handler
process.on('exit', () => {
	var end = new Date() - start;
	console.info('DDM processing finish, execution time: %dms', end);
});

logo.print();
organize(newFile => {
	logger.log('info', 'Organize return file is %s, now searching subtitle', newFile);
	subtitles.searchSubtitle(newFile);
});

