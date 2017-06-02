const fs = require('fs');
const path = require('path');

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
				(typeof filterFunction !== 'function' || filterFunction())) {
				filelist.push(fullPath);
			}
		}
	};
	return filelist;
};

function copyFile(src, dest) {
	console.log('Copyng file: ' + src + ' To: ' + dest);
	let readStream = fs.createReadStream(src);

	readStream.once('error', (err) => {
		console.log(err);
	});

	readStream.once('end', () => {
		console.log('done copying');
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
