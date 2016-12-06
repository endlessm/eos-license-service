var fs = require('fs');

const CRAWL_LOCATION = '/usr/share/doc';

function LicenseCrawler(path) {
    this._location = path;
};

function prepareHtml(fileNames, copyright) {
    // http://stackoverflow.com/questions/5007574
    var sanitizedCopyright = copyright
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/\t/g, '    ')
	.replace(/  /g, '&nbsp; ')
	.replace(/  /g, ' &nbsp;')
	.replace(/\r\n|\n|\r/g, '<br />');

    var html = '<h3 class="package-name">';
    var files = [];

    files = fileNames.toString().split(',');
    files.forEach(function(file) {
	html += file;
	html += '<br />';
    });
    html += '</h3>';

    html += '<p class="copyright">';
    html += sanitizedCopyright;
    html += '</p>';
    html += '\n'

    return html;
}

LicenseCrawler.prototype.listDirectories = function() {
    var directories = [];
    var files = [];
    var linksHash = {};
    var basePath = this._location;

    try {
	files = fs.readdirSync(basePath);
    } catch (e) {
	console.log('Unable to enumerate ' + basePath + ' :' + e.toString());
	return [directories, linksHash];
    }

    try {
	files.forEach(function(file) {
	    var fullPath = basePath + '/' + file;
	    var stat = fs.lstatSync(fullPath);
	    if (stat.isSymbolicLink()) {
		var linkTarget = fs.readlinkSync(fullPath);
		var linkNames = linksHash[linkTarget];
		if (!linkNames) {
		    linkNames = [];
		}

		linkNames.push(file);
		linksHash[linkTarget] = linkNames;
	    } else if (stat.isDirectory()) {
		directories.push(file);
	    }
	});
    } catch (e) {
	console.log('Unable to enumerate ' + basePath + ' :' + e.toString());
	return [directories, linksHash];
    }

    return [directories, linksHash];
};

exports.getLicenseList = function(req, res) {
    var htmlMeta =
	'<meta charset="UTF-8">';
    var htmlStyle =
	'<style>\n' +
	'body{margin:50px;min-width:630px;font-family: sans-serif;}\n' +
	'h2{border-top:5px solid #4a4a4a;padding-top:20px;font-size:28px;line-height:34px;margin-top:70px;}\n' +
	'h3{border-top:solid 1px #d8d8d8;padding-top:20px;font-size:22px;line-height:26px;clear:both;margin-top:50px;}\n' +
	'p{font-size:18px;line-height:28px;}\n' +
	'.copyright { font-family: monospace; font-size: initial; font-weight: initial; }\n' +
	'</style>\n';
    var htmlHeader =
	'<html>\n' +
	'<head>\n' + 
	htmlMeta + 
	htmlStyle + 
	'</head>\n' +
	'<body>\n' +
	'<h2>Open Source Software</h2>\n';
	// Happy preamble of legal compliance goes here...
    var htmlFooter =
	'</body>\n' +
	'</html>';

    // send the HTML header
    res.write(htmlHeader);

    // now start crawling
    var crawler = new LicenseCrawler(CRAWL_LOCATION);

    var dirList = crawler.listDirectories();
    var directories = dirList[0];
    var linksHash = dirList[1];

    directories.sort();
    directories.forEach(function(dirName) {
	var copyrightPath = CRAWL_LOCATION + '/' + dirName + '/copyright';
	if (!fs.existsSync(copyrightPath)) {
	    return;
	}

	var copyrightContents;
	try {
	    copyrightContents = fs.readFileSync(copyrightPath, { encoding: 'utf8' });
	} catch (e) {
	    console.log('Unable to read copyright file ' + copyrightPath + ' :' + e.toString());
	    return;
	}

	var linkNames = linksHash[dirName];
	if (!linkNames) {
	    linkNames = [];
	}

	linkNames.unshift(dirName);

	// send HTML for this directory
	var html = prepareHtml(linkNames, copyrightContents);
	res.write(html);
    });

    // send the HTML footer and end request
    res.end(htmlFooter, null);
};
