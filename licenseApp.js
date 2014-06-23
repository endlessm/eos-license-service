var express = require('express');
var systemd = require('systemd');
var autoquit = require('autoquit');
var http = require('http');

var crawler = require('./licenseCrawler');

var app = express();
var port = 'systemd';
if ('development' == app.get('env')) {
    port = 3010;
}

app.set('port', process.env.PORT || port);
app.get('/', crawler.getLicenseList);

var server = http.createServer(app);
server.autoQuit({ timeOut: 120 });
server.listen(app.get('port'));
server.on('listening', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
