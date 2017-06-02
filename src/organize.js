const db = require('./db');
const nameParser = require('./nameParser');
const files = require('./files');
const config = require('../config.json');
const path = require('path');
const TVDB = require('node-tvdb');
const fs = require('fs');
const logger = require('winston');

const tvdb = new TVDB('436CB4A29DEF63C1');

function moveFile(fileData) {
	console.log('Moving file: ', fileData);
	let finalFile = config.seriesFormat
		.replace(/\{name\}/g, fileData.name)
		.replace(/\{season\}/g, fileData.season)
		.replace(/\{episode\}/g, fileData.episode)
		.replace(/\{title\}/g, fileData.title);
	finalFile = finalFile + fileData.ext;
	console.log(finalFile);
	let destFile = path.join(config.outputFolder, finalFile);
	console.log(destFile);
	createFolderIfNotExist(destFile);
	if (!fs.existsSync(destFile)) {
		if (config.action === 'copy') {
			files.copyFile(fileData.file, destFile);
		} else {
			fs.renameSync(fileData.file, destFile);
		}
	}
}

function findEpisodeData(fileData) {
	tvdb.getEpisodesBySeriesId(fileData.tvdbId)
		.then(response => {
			//console.log(response)
			response.forEach(function (ep) {
				if (ep.airedSeason === fileData.season &&
					ep.airedEpisodeNumber === fileData.episode) {
					fileData['title'] = ep.episodeName;
					console.log(ep);
					moveFile(fileData);
				}
			}, this);
		})
		.catch(error => {
			console.log(error);
		});
}

function findTvdbId(fileData) {
	tvdb.getSeriesByName(fileData.name)
		.then(response => {
			let tvdbId = response[0].id;
			if (tvdbId) {
				fileData['tvdbId'] = tvdbId;
				db.saveTvdbId(fileData);
				findEpisodeData(fileData);
			}
		})
		.catch(error => {
			console.log(error);
		});
}


function doIt() {
	logger.log('info', 'Organize doIt begin...');
	let filesToProcess = files.readFiles(config.inputFolder, config.videoFormats);
	logger.log('info', 'Total files: %s', filesToProcess.length);
	filesToProcess.forEach(function (videoPath) {
		let videoInfo = path.parse(videoPath);
		let fileData = nameParser.parseFileName(videoInfo.name);
		fileData['file'] = videoPath;
		fileData['ext'] = videoInfo.ext;
		let tvdbId = db.getTvdbId(fileData);
		if (tvdbId) {
			fileData['tvdbId'] = tvdbId;
			findEpisodeData(fileData);
		} else {
			findTvdbId(fileData);
		}
		console.log(fileData);
	});
}

module.exports = doIt;
