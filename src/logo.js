const Reset = '\x1b[0m';
const FgRed = '\x1b[31m';
const FgGreen = '\x1b[32m';
const FgBlue = '\x1b[34m';

function print(){
	const pak = require('../package.json');
	console.log(
`${FgBlue}-----------------------------------${Reset}
${FgRed}8888888b.  8888888b.  888b     d888
888  "Y88b 888  "Y88b 8888b   d8888
888    888 888    888 88888b.d88888
888    888 888    888 888Y88888P888
888    888 888    888 888 Y888P 888
888    888 888    888 888  Y8P  888
888  .d88P 888  .d88P 888   "   888
8888888P"  8888888P"  888       888${Reset}
${FgBlue}-----------------------------------${Reset}
${FgBlue}|${Reset} ${pak.description} - ${FgGreen}v${pak.version}${Reset}  ${FgBlue}|${Reset}
${FgBlue}-----------------------------------${Reset}
	`);

}

module.exports = {
	print : print
};
