#!/usr/bin/env gjs

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const LicenseCrawler = new Lang.Class({
    Name: 'LicenseCrawler',

    _init: function(path) {
	this._location = Gio.File.new_for_path(path);
    },

    crawl: function() {
	let enumerator;
	let hash = new Map();

	try {
	    enumerator = this._location.enumerate_children('standard::*',
							   Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
							   null);
	} catch (e) {
	    logError(e, 'Unable to enumerate ' + this._location.get_path());
	    return hash;
	}

	let directories = [];
	let linksHash = new Map();
	let info = null;

	try {
	    while ((info = enumerator.next_file(null)) != null) {
		let type = info.get_file_type();

		if (type == Gio.FileType.SYMBOLIC_LINK) {
		    let linkTarget = info.get_symlink_target();
		    let linkNames = linksHash.get(linkTarget);
		    if (!linkNames) {
			linkNames = [];
		    }

		    linkNames.push(info.get_name());
		    linksHash.set(linkTarget, linkNames);
		} else if (type == Gio.FileType.DIRECTORY) {
		    directories.push(info);
		}
	    }
	} catch (e) {
	    logError(e, 'Unable to enumerate ' + this._location.get_path());
	    return hash;
	}

	enumerator.close(null);

	directories.sort(Lang.bind(this, function(info1, info2) {
	    let dirName1 = info1.get_name();
	    let dirName2 = info2.get_name();

	    return GLib.utf8_collate(dirName1, dirName2);
	}));

	directories.forEach(Lang.bind(this, function(info) {
	    let dirName = info.get_name();
	    let copyrightPath = GLib.build_filenamev([this._location.get_path(), dirName, 'copyright']);
	    let copyrightFile = Gio.File.new_for_path(copyrightPath);

	    if (!copyrightFile.query_exists(null)) {
		return;
	    }

	    let copyrightContents;
	    try {
		copyrightContents = copyrightFile.load_contents(null)[1];
	    } catch (e) {
		logError(e, 'Unable to read copyright file ' + copyrightPath);
		return;
	    }

	    let linkNames = linksHash.get(dirName);
	    if (!linkNames) {
		linkNames = [];
	    }

	    linkNames.unshift(dirName);
	    hash.set(linkNames, copyrightContents);
	}));

	return hash;
    }
});

let crawler = new LicenseCrawler('/usr/share/doc');
let hash = crawler.crawl();
let hashIter = hash.entries();

let htmlMeta =
    '<meta charset="UTF-8">';
let htmlStyle =
    '<style>\n' +
    '.package-name { font-family: sans-serif; font-size: 16px; font-weight: bold; }\n' +
    '.copyright { font-family: monospace; font-size: initial; font-weight: initial; }\n' +
    '</style>\n';
let htmlHeader =
    '<html>\n' +
    '<head>\n' + 
    htmlMeta + 
    htmlStyle + 
    '</head>\n' +
    '<body>\n';
let htmlFooter =
    '</body>\n' +
    '</html>';

let html = htmlHeader;

while (true) {
    let entry = null;

    try {
	entry = hashIter.next();
    } catch(e) {
	if (!(e instanceof StopIteration)) {
	    logError(e, 'Error while iterating entries');
	}

	break;
    }

    let files = entry[0];
    let string;

    try {
	string = entry[1].toString();
    } catch (e) {
	logError(e, 'Can\'t convert one entry to string for entry ' + files);
	continue;
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

    let oneHtml = '';

    oneHtml += '<p class="package-name">';
    files.forEach(function(file) {
	oneHtml += file;
    });
    oneHtml += '</p">';

    oneHtml += '<p class="copyright">';
    oneHtml += string;
    oneHtml += '</p>';
    oneHtml += '\n'

    html += oneHtml;
}

html += htmlFooter;

let targetFile = Gio.File.new_for_path('./foo.html');
targetFile.replace_contents(html, null, false, 0, null);
