
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;

const CRAWL_LOCATION = '/usr/share/doc';

function prepareHtml(fileNames, copyright) {
    var sanitizedCopyright = GLib.markup_escape_text(copyright, -1);

    var html = '<h3 class="package-name">';
    var files = [];

    html += fileNames.join('<br />');
    html += '</h3>';

    html += '<p class="copyright">';
    html += sanitizedCopyright;
    html += '</p>';
    html += '\n';

    return html;
}

function listPackages() {
    let dir = Gio.File.new_for_path(CRAWL_LOCATION);
    let fileEnum = dir.enumerate_children('standard::name,standard::type,standard::symlink-target',
                                          Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    let packages = {};

    let info;
    while ((info = fileEnum.next_file(null))) {
        let dirname = info.get_name();

        let packageName;
        if (info.get_file_type() === Gio.FileType.SYMBOLIC_LINK) {
            packageName = info.get_symlink_target();
        } else {
            packageName = dirname;
        }

        if (!packages[packageName])
            packages[packageName] = [];
        packages[packageName].push(dirname);
    }

    return packages;
}

const htmlMeta =
    '<meta charset="UTF-8">';
const htmlStyle =
    '<style>\n' +
    'body{margin:50px;min-width:630px;font-family: sans-serif;}\n' +
    'h2{border-top:5px solid #4a4a4a;padding-top:20px;font-size:28px;line-height:34px;margin-top:70px;}\n' +
    'h3{border-top:solid 1px #d8d8d8;padding-top:20px;font-size:22px;line-height:26px;clear:both;margin-top:50px;}\n' +
    'p{font-size:18px;line-height:28px;}\n' +
    'a{color: inherit;}\n' +
    '.copyright { font-family: monospace; font-size: initial; font-weight: initial; -moz-tab-size: 4; tab-size: 4; white-space: pre-wrap; }\n' +
    '</style>\n';
const htmlHeader =
    '<html>\n' +
    '<head>\n' +
    htmlMeta +
    htmlStyle +
    '</head>\n' +
    '<body>\n' +
    '<h2><a href="/">Open Source Software</a></h2>\n';
    // Happy preamble of legal compliance goes here...
const htmlFooter =
    '</body>\n' +
    '</html>';

function getLicenseList(msg) {
    // send the HTML header
    msg.status_code = 200;
    msg.response_headers.set_encoding(Soup.Encoding.CHUNKED);
    msg.response_headers.set_content_type('text/html', { charset: 'UTF-8' });
    msg.response_body.append(htmlHeader);

    const packages = listPackages();
    const packageNames = Object.keys(packages);

    packageNames.sort();
    packageNames.forEach(function(packageName) {
        const copyrightPath = GLib.build_filenamev([CRAWL_LOCATION, packageName, 'copyright']);
        const copyrightFile = Gio.File.new_for_path(copyrightPath);
        if (!copyrightFile.query_exists(null)) {
            return;
        }

        const dirNames = packages[packageName];
        msg.response_body.append('<li class="package-name">');
        msg.response_body.append('<a href="/package/' + dirNames.join(',') + '">');
        msg.response_body.append(dirNames.join(', '));
        msg.response_body.append('</a></li>\n');
    });

    // send the HTML footer and end request
    msg.response_body.append(htmlFooter);
    msg.response_body.complete();
};

function getLicense(msg, packageNames) {
    const packageName = packageNames[0];
    const copyrightPath = GLib.build_filenamev([CRAWL_LOCATION, packageName, 'copyright']);
    var statusCode = 200;
    var html = '';

    try {
        const [success, copyrightContents] = GLib.file_get_contents(copyrightPath);

        try {
            html = prepareHtml(packageNames, copyrightContents.toString());
        } catch (e) {
            html = 'Unable to convert contents of ' + copyrightPath + ' to string';
            logError(e, html);
            statusCode = 500;
        }
    } catch (e if e.matches(GLib.FileError, GLib.FileError.NOENT)) {
        statusCode = 400;
        html = 'Not found: ' + copyrightPath;
    } catch (e) {
        html = 'Unable to read copyright file: ' + copyrightPath;
        logError(e, html);
        statusCode = 500;
    }

    // send the HTML header
    msg.status_code = statusCode;
    msg.response_headers.set_encoding(Soup.Encoding.CHUNKED);
    msg.response_headers.set_content_type('text/html', { charset: 'UTF-8' });
    msg.response_body.append(htmlHeader);
    msg.response_body.append(html);
    msg.response_body.append(htmlFooter);
    msg.response_body.complete();
}
