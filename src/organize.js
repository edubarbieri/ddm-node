const db = require('./db');
const nameParser = require('./nameParser');
const files = require('./files');
const config = require('../config.json');
const path = require('path');
const TVDB = require('node-tvdb');
const fs = require('fs');
const logger = require('winston');

const tvdb = new TVDB('436CB4A29DEF63C1');

function leftPad(value, size, caracter){
	if (!caracter){
		return value;
	}
	let returnValue = value + '';
	for (; returnValue.length < size;) {
		returnValue = caracter + returnValue;
	}
	return returnValue;
}

function moveFile(fileData) {
	logger.log('info', 'Move file...');
	let finalFile = config.seriesFormat
		.replace(/\{name\}/g, fileData.name)
		.replace(/\{season\}/g, leftPad(fileData.season, 2, '0'))
		.replace(/\{episode\}/g, leftPad(fileData.episode, 2, '0'))
		.replace(/\{title\}/g, fileData.title);
	finalFile = finalFile + fileData.ext;
	let destFile = path.join(config.outputFolder, finalFile);
	if (fs.existsSync(destFile)){
		logger.log('warn', 'Destination file already exist, %s', destFile);
		if (typeof fileData.callback === 'function'){
			fileData.callback(destFile);
		}
		return;
	}
	logger.log('info', 'Moving file, action is: %s, source: %s, destination: %s',
		config.action, fileData.file, destFile);

	files.createFolderIfNotExist(destFile);
	if (!fs.existsSync(destFile)) {
		if (config.action === 'copy') {
			files.copyFile(fileData.file, destFile);
		} else {
			fs.renameSync(fileData.file, destFile);
			if (typeof fileData.callback === 'function'){
				fileData.callback(destFile);
			}
		}
	}
}

function findEpisodeData(fileData) {
	logger.log('info', 'Find epidode data name: %s, season: %s, episode: %s',
		fileData.name, fileData.season, fileData.episode);
	tvdb.getEpisodesBySeriesId(fileData.tvdbId)
		.then(response => {
			//logger.log('debug', response);
			let withData = false;
			response.forEach(function (ep) {
				if (ep.airedSeason === fileData.season &&
					ep.airedEpisodeNumber === fileData.episode) {
					fileData['title'] = ep.episodeName;
					logger.log('info', 'Title for %s S%sE%s is %s',
						fileData.name, fileData.season, fileData.episode, ep.episodeName);
					withData = true;
					moveFile(fileData);
				}
			});
			if (!withData){
				fileData['title'] = '';
				logger.log('info', 'Coul not find title  for episode %s S%sE%s',
						fileData.name, fileData.season, fileData.episode);
				moveFile(fileData);
			}
		}).catch(error => {
			logger.log('error', 'findEpisodeData - error', error);
		});
}

function findSerieTvdb(fileData) {
	logger.log('info', 'Quering TVDB for name: %s', fileData.name);
	tvdb.getSeriesByName(fileData.name)
		.then(response => {
			if (!response[0]){
				logger.log('info', 'Not found serie in TVDB with name: %s', fileData.name);
			}
			let tvdbId = response[0].id;
			let name = response[0].seriesName;
			if (tvdbId) {
				logger.log('info', 'Serie with name %s use tvdbid: %s', name, tvdbId);
				fileData['tvdbId'] = tvdbId;
				fileData['name'] = name;
				db.saveTvdbId(fileData);
				findEpisodeData(fileData);
			}
		}).catch(error => {
			logger.log('error', 'getSeriesByName - error', error);
		});
}


function doIt(callback) {
	logger.log('info', 'Organize doIt begin...');
	let filesToProcess = files.readFiles(config.inputFolder, config.videoFormats);
	logger.log('info', 'Total files: %s', filesToProcess.length);
	filesToProcess.forEach(function (videoPath) {
		logger.log('debug', 'Processing file: %s', videoPath);
		let videoInfo = path.parse(videoPath);
		let fileData = nameParser.parseFileName(videoInfo.name);
		fileData['file'] = videoPath;
		fileData['ext'] = videoInfo.ext;
		fileData['callback'] = callback;
		let serie = db.getSerieBySearchKey(fileData.searchKey);
		if (serie && serie.tvdbId) {
			logger.log('debug', 'Local data found for series: %s', serie.name);
			fileData['name'] = serie.name;
			fileData['tvdbId'] = serie.tvdbId;
			findEpisodeData(fileData);
		} else {
			findSerieTvdb(fileData);
		}
	});
}

module.exports = doIt;
