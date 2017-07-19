
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const licenseCrawler = imports.licenseCrawler;

const DEFAULT_PORT = 3010;

function serverListen(server) {
    // If we're being started by systemd, listen on the 3rd fd.
    if (GLib.getenv('LISTEN_FDS') !== null) {
        server.listen_fd(3, 0);
    } else {
        const port = Number.parseInt(GLib.getenv('LISTEN_PORT'), 10);
        server.listen_local(isNaN(port) ? DEFAULT_PORT : port, 0);
    }
}

let mainloop = new GLib.MainLoop(null, false);

let server = new Soup.Server();
server.add_handler('/', function(server, msg, path, query, client) {
    licenseCrawler.getLicenseList(msg);
});
// /package/foo,bar,baz => license for package foo, shared with bar and baz
server.add_handler('/package', function(server, msg, path, query, client) {
    const packageNames = path.slice('/package/'.length).split(',');
    licenseCrawler.getLicense(msg, packageNames);
})
serverListen(server);
mainloop.run();
