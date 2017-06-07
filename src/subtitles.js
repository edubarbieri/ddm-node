const OS = require('opensubtitles-api');
const request = require('request');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const logger = require('winston');
const files = require('./files');
const nameParser = require('./nameParser');

const OpenSubtitles = new OS({
	useragent: config.opensubtitles.useragent,
	username: config.opensubtitles.username,
	password: require('crypto').createHash('md5')
		.update(config.opensubtitles.password).digest('hex'),
	ssl: true
});

function downloadSubtitle(url, dest) {
	logger.info('info', 'Downloading file %s', dest);
	logger.info('debug', 'Url is %s', url);
	request({
		url: url,
		encoding: null
	}, (error, response, data) => {
		if (error) {
			logger.log('error', 'Download error', error);
			return;
		}
		zlib.unzip(data, (error, buffer) => {
			if (error) {
				logger.log('error', 'Unzip error', error);
				return;
			}
			fs.writeFile(dest, buffer, function (err) {
				if (err) {
					logger.log('error', 'Write subtitle error', error);
					return;
				}
				logger.log('info', 'Subtitle successfully download: %s', dest);
			});
		});
	});
}

function searchSubtitle(filePath) {
	const file = path.parse(filePath);
	logger.log('info', 'Search subtitle by hash for: %s', file.name);

	if (fs.existsSync(path.join(file.dir, file.name + '.srt'))){
		logger.log('info', 'Subtitle for file already download: %s', file.name);
	}

	OpenSubtitles.search({
		sublanguageid: config.language,
		path: filePath,
		gzip: true
	}).then(subtitles => {
		if (subtitles.pb) {
			logger.log('debug', 'Subtitle found %s', file.name);
			let sub = subtitles.pb;
			downloadSubtitle(sub.url, path.join(file.dir, file.name + '.srt'));
		} else {
			logger.log('info', 'Not found subtitle by hash for file %s', file.name);
			searchSubtitleByName(filePath);
		}
	}).catch(error =>{
		logger.log('error', 'OpenSubtitles.search', error);
	});
}

function searchSubtitleByName(filePath) {
	const file = path.parse(filePath);
	logger.log('info', 'Search subtitle by name for: %s', file.name);

	let fileData = nameParser.parseFileName(filePath);

	OpenSubtitles.search({
		sublanguageid: config.language,
		season: fileData.season,
		episode: fileData.episode,
		limit: config.limit,
		query: fileData.name,
		gzip: true
	}).then(subtitles => {
		if (subtitles.pb) {
			logger.log('debug', 'Subtitle found %s', file.name);
			if (Array.isArray(subtitles.pb)) {
				subtitles.pb.forEach(function (sub) {
					downloadSubtitle(sub.url,
						path.join(file.dir, file.name + '.srt - ' + sub.filename));
				});
			} else {
				let sub = subtitles.pb;
				downloadSubtitle(sub.url, path.join(file.dir, file.name + '.srt'));
			}
		} else {
			logger.log('info', 'Not found subtitle by name for file %s', file.name);
		}
	}).catch(error =>{
		logger.log('error', 'OpenSubtitles.search', error);
	});
}

function doIt() {
	logger.log('info', 'Subtitles doIt begin...');
	let filesToProcess = files.readFiles(config.outputFolder, config.videoFormats, (fileInfo) => {
		return !fs.existsSync(path.join(fileInfo.dir, fileInfo.name + '.srt'));
	});
	logger.log('info', 'Total files to search subtitle: %s', filesToProcess.length);
	filesToProcess.forEach(filePath => {
		searchSubtitle(filePath);
	});
}

module.exports = {
	doIt : doIt,
	searchSubtitle : searchSubtitle
};
