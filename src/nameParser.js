const regExp = new RegExp(/[sS](\d{2})[eE](\d{2})/);

function parseFileName(fileName) {
	//troca os pontos por space
	name = fileName.replace(/\./g, ' ');
	let episodeIndex = name.search(regExp);
	let parsedValue = {
		name : name.substring(0, episodeIndex).trim(),
	};
	parsedValue['searchKey'] = parsedValue.name.split(' ').join('_').toLowerCase();
	let epMatch = name.match(regExp);
	if (epMatch.length >= 3) {
		parsedValue['season'] = parseInt(epMatch[1]);
		parsedValue['episode'] = parseInt(epMatch[2]);
	}
	return parsedValue;
};

module.exports = {
	parseFileName : parseFileName
};
