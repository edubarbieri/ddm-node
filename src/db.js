const Database = require('better-sqlite3');

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
	return sqlite.prepare('SELECT * from  serie where searchKey = ?').get(searchKey);
}

function getTvdbId(data) {
	let row = getSerieBySearchKey(data.searchKey);
	if (row && row.tvdbId) {
		return row.tvdbId;
	}
	return null;
}

function saveTvdbId(data){
	let row = getSerieBySearchKey(data.searchKey);
	if (row) {
		//update
		let stmt = sqlite.prepare('update serie set tvdbId = :tvdbId' +
			' WHERE searchKey = :searchKey');
		stmt.run(data);
	} else {
		insertSerie(data);
	}
}



module.exports = {
	getTvdbId : getTvdbId,
	saveTvdbId : saveTvdbId
};
