const Database = require('better-sqlite3');
const logger = require('winston');
const path = require('path');

const sqlite = new Database(path.join(__dirname, '..','ddm.db'));
const initialSql = [
	`
		CREATE TABLE IF NOT EXISTS serie (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			tvdbId INTEGER,
			searchKey TEXT
		)
	`,
	`
		CREATE TABLE IF NOT EXISTS feed (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			episodeId INTEGER,
			title TEXT
		)
	`
];

initialSql.forEach(sql => {
	sqlite.prepare(sql).run();
});

function insertSerie(data) {
	try {
		logger.log('debug', 'Insert serie with name %s, tvdbid: %s, searchKey : %s',
		data.name, data.tvdbId, data.searchKey);
		let stmt = sqlite.prepare('INSERT INTO serie(name, tvdbId, searchKey)' +
			' VALUES (:name, :tvdbId, :searchKey)');
		stmt.run(data);
		return true;
	} catch (error) {
		logger.log('error', 'insertSerie - error', episodeId);
		return false;
	}
}

function getSerieBySearchKey(searchKey){
	logger.log('debug', 'GetSerieBySearchKey searchKey : %s', searchKey);
	return sqlite.prepare('SELECT * from  serie where searchKey = ?').get(searchKey);
}

function getTvdbId(data) {
	let row = getSerieBySearchKey(data.searchKey);
	if (row && row.tvdbId) {
		return row;
	}
	return null;
}

function saveTvdbId(data){
	let row = getSerieBySearchKey(data.searchKey);
	if (row) {
		logger.log('debug', 'Update serie with name %s, tvdbid: %s, searchKey : %s',
		data.name, data.tvdbId, data.searchKey);
		//update
		let stmt = sqlite.prepare('update serie set tvdbId = :tvdbId, name = :name' +
			' WHERE searchKey = :searchKey');
		stmt.run(data);
	} else {
		insertSerie(data);
	}
}

function getFeed(episodeId){
	logger.log('debug', 'getFeed episodeId : %s', episodeId);
	return sqlite.prepare('SELECT * from feed where episodeId = ?').get(episodeId);
}

function insertFeed(feed) {
	try {
		logger.log('debug', 'Insert feed with ', feed.title);
		let stmt = sqlite.prepare('INSERT INTO feed(episodeId, title)' +
			' VALUES (:episodeId, :title)');
		stmt.run(feed);
		return true;
	} catch (error) {
		logger.log('error', 'insertFeed - error', error);
		return false;
	}
}

module.exports = {
	getTvdbId : getTvdbId,
	saveTvdbId : saveTvdbId,
	getSerieBySearchKey : getSerieBySearchKey,
	getFeed : getFeed,
	insertFeed : insertFeed
};
