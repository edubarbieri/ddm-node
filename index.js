const organize = require('./src/organize');
const logo = require('./src/logo');
const logger = require('winston');
const subtitles = require('./src/subtitles');
const feed = require('./src/feed');
//set logLEvel
logger.level = require('./config.json').logLevel;

const start = new Date();

//end execution handler
process.on('exit', () => {
	var end = new Date() - start;
	console.info('DDM processing finish, execution time: %dms', end);
});

logo.print();

function doOrganize(){
	organize(newFile => {
		logger.log('info', 'Organize return file is %s, now searching subtitle', newFile);
		subtitles.searchSubtitle(newFile);
	});

}

let arg = process.argv.slice(2)[0] || '';
arg = arg.trim();
if (arg === 'feed') {
	logger.log('info', 'Running only feed');
	feed();
} else if (arg === 'organize') {
	logger.log('info', 'Running only organize');
	doOrganize();
} else if (arg === 'subtitle') {
	logger.log('info', 'Running only subtitle');
	subtitles.doIt();
} else {
	logger.log('info', 'Running all');
	feed();
	doOrganize();
	subtitles.doIt();
}
