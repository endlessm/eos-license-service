var fs = require('fs');

function LicenseCrawler(path) {
    this._location = path;
};

LicenseCrawler.prototype.crawl = function() {
    var hash = {};
    var files = [];
    var basePath = this._location;

    try {
	files = fs.readdirSync(basePath);
    } catch (e) {
	console.log('Unable to enumerate ' + basePath + ' :' + e.toString());
	return hash;
    }

    var directories = [];
    var linksHash = {};
    var info = null;

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
	return hash;
    }

    directories.sort();
    directories.forEach(function(dirName) {
	var copyrightPath = basePath + '/' + dirName + '/copyright';
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
	hash[linkNames] = copyrightContents;
    });

    return hash;
};

exports.getLicenseList = function(req, res) {
    var crawler = new LicenseCrawler('/usr/share/doc');
    var hash = crawler.crawl();

    var htmlMeta =
	'<meta charset="UTF-8">';
    var htmlStyle =
	'<style>\n' +
	'.package-name { font-family: sans-serif; font-size: 16px; font-weight: bold; }\n' +
	'.copyright { font-family: monospace; font-size: initial; font-weight: initial; }\n' +
	'</style>\n';
    var htmlHeader =
	'<html>\n' +
	'<head>\n' + 
	htmlMeta + 
	htmlStyle + 
	'</head>\n' +
	'<body>\n';
    var htmlFooter =
	'</body>\n' +
	'</html>';

    var html = htmlHeader;
    var keys = Object.keys(hash);

    keys.forEach(function(key) {
	var fileString = key;
	var string;

	try {
	    string = hash[key];
	} catch (e) {
	    logError(e, 'Can\'t convert one entry to string for entry ' + fileString);
	    return;
	}

	// http://stackoverflow.com/questions/5007574
	string = string
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/\t/g, '    ')
            .replace(/  /g, '&nbsp; ')
            .replace(/  /g, ' &nbsp;')
            .replace(/\r\n|\n|\r/g, '<br />');

	var oneHtml = '';

	oneHtml += '<p class="package-name">';
	files = fileString.split(',');
	files.forEach(function(file) {
	    oneHtml += file;
	    oneHtml += '<br />';
	});
	oneHtml += '</p>';

	oneHtml += '<p class="copyright">';
	oneHtml += string;
	oneHtml += '</p>';
	oneHtml += '\n'

	html += oneHtml;
    });

    html += htmlFooter;
    res.end(html, null);
};
