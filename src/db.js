const Database = require('better-sqlite3');
const logger = require('winston');

const sqlite = new Database('ddm.db');
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
		CREATE TABLE IF NOT EXISTS episode (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			season INTEGER,
			episode INTEGER,
			tvdbId INTEGER,
			dw BOOLEAN DEFAULT true
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
		console.log('Error', error);
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



module.exports = {
	getTvdbId : getTvdbId,
	saveTvdbId : saveTvdbId,
	getSerieBySearchKey : getSerieBySearchKey
};
