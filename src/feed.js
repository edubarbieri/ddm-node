const logger = require('winston');
const db = require('./db');
const Transmission = require('transmission');
const parseString = require('xml2js').parseString;
const http = require('http');
const config = require('../config.json');

const transmission = new Transmission(config.transmission);

function readFeed(callback) {
	logger.log('info', 'reading feed');
	http.get(config.feedUrl, function (res) {
		let xml = '';

		res.on('data', function (chunk) {
			xml += chunk;
		});
		res.on('error', function (error) {
			logger.log('error', 'readFeed - error', error);
			callback(error);
		});
		res.on('timeout', function (error) {
			logger.log('error', 'timeout - error', error);
			callback(error);
		});
		res.on('end', function () {
			parseString(xml, function (err, result) {
				logger.log('info', 'parsing feed data...');
				let feedData = [];
				let items = result.rss.channel[0].item;
				items.forEach(function (item) {
					feedData.push({
						title: item.title[0],
						showId: item['tv:show_id'][0],
						showName: item['tv:show_name'][0],
						episodeId: item['tv:episode_id'][0],
						link: item.link[0]
					});
				});
				callback(null, feedData);
			});
		});
	});
}
function processFeed(error, feedData) {
	logger.log('info', 'process feed...');
	if (error) {
		logger.log('error', 'process feed - error', error);
		return;
	}

	feedData.forEach(function (item) {
		if (!db.getFeed(item.episodeId)) {
			addFeed(item);
		} else {
			logger.log('debug', 'feed already added %s', item.title);
		}
	});

}

function addFeed(item) {
	logger.log('info', 'adding feed %s', item.title);
	transmission.addUrl(item.link, (error, result) => {
		if (error) {
			logger.log('error', 'add feed error', error);
			return;
		}
		logger.log('debug', 'add feed done, response: ', result);
		db.insertFeed(item);
	});
}

function doIt() {
	logger.log('info', 'Feed doIt begin...');
	readFeed(processFeed);
}

module.exports = doIt;
