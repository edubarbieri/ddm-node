const fs = require('fs');
const path = require('path');
const logger = require('winston');

function readFiles(dir, allowedFormats, filterFunction) {
	let filelist = [];
	let path = require('path');
	let fs = require('fs');
	let files = fs.readdirSync(dir);
	for (let file of files) {
		let fullPath = path.join(dir, file);
		if (fs.statSync(fullPath).isDirectory()) {
			filelist = [...filelist, ...readFiles(fullPath, allowedFormats, filterFunction)];
		} else {
			let fileInfo = path.parse(fullPath);
			// //verifica se o arquivos é um video e se ja não tem legendas
			if (allowedFormats.indexOf(fileInfo.ext) > -1 &&
				(typeof filterFunction !== 'function' || filterFunction(fileInfo))) {
				filelist.push(fullPath);
			}
		}
	};
	return filelist;
};

function copyFile(src, dest, callback) {
	console.log('Copyng file: ' + src + ' To: ' + dest);
	let readStream = fs.createReadStream(src);

	readStream.once('error', (err) => {
		logger.log('error', 'Error copyng file', err);
	});

	readStream.once('end', () => {
		if (typeof callback === 'function'){
			callback();
		}
	});

	readStream.pipe(fs.createWriteStream(dest));
}


function createFolderIfNotExist(destFile) {
	const targetDir = path.parse(destFile).dir;
	const initParent = path.isAbsolute(targetDir) ? '/' : '';
	// Use `path.sep`, to avoid cross-platform issues.
	targetDir.split(path.sep).reduce((parentDir, childDir) => {
		// Resolving an absolute path to the current working directory. To resolve to
		// the current script dir, use `__dirname` for `path.resolve()` as 1st param.
		// Use `path.resolve()`, don't '/' concate, also to avoid cross-platform issues.
		const curDir = path.resolve(parentDir, childDir);
		if (!fs.existsSync(curDir)) {
			fs.mkdirSync(curDir);
		}

		return curDir;
	}, initParent);
}

module.exports = {
	readFiles: readFiles,
	copyFile : copyFile,
	createFolderIfNotExist : createFolderIfNotExist
};
