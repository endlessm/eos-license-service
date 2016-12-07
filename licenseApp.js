
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const licenseCrawler = imports.licenseCrawler;

const DEFAULT_PORT = 3010;

function serverListen(server) {
    // If we're being started by systemd, listen on the 3rd fd.
    if (GLib.getenv('LISTEN_FDS') !== null) {
        server.listen_fd(3, 0);
    } else {
        server.listen_local(DEFAULT_PORT, 0);
    }
}

let mainloop = new GLib.MainLoop(null, false);

let server = new Soup.Server();
server.add_handler('/', function(server, msg, path, query, client) {
    licenseCrawler.getLicenseList(msg);
});
serverListen(server);
mainloop.run();
