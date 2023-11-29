imports.gi.versions.Soup = "2.4";

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

/* See https://phabricator.endlessm.com/T20857 for rationale.
/* In practice, this service is accessed as http://localhost:3010/,
 * but let's permit referring to it by loopback IP as well.
 */
const PERMITTED_HOSTS = ['localhost', '127.0.0.1', '::1'];
function isPermittedHost(msg) {
    let host_header = msg.request_headers.get_one('Host');
    /* The Host: header includes the :$PORT suffix. Rather than rolling our own
     * parser (and being careful to handle colons in IPv6 addresses), use one
     * provided by Soup.
     */
    let host_uri = new Soup.URI('http://' + (host_header || ''));
    if (host_uri !== null) {
        let host = host_uri.get_host();
        if (PERMITTED_HOSTS.indexOf(host) !== -1) {
            return true;
        }
    }

    msg.set_status(Soup.Status.FORBIDDEN);
    msg.set_response('text/plain', Soup.MemoryUse.COPY,
        'Forbidden host: ' + (host_header || '(not specified)'));
    return false;
}

let mainloop = new GLib.MainLoop(null, false);

let server = new Soup.Server();
server.add_handler('/', function(server, msg, path, query, client) {
    if (isPermittedHost(msg)) {
        licenseCrawler.getLicenseList(msg);
    }
});
// /package/foo,bar,baz => license for package foo, shared with bar and baz
server.add_handler('/package', function(server, msg, path, query, client) {
    if (isPermittedHost(msg)) {
        const packageNames = path.slice('/package/'.length).split(',');
        licenseCrawler.getLicense(msg, packageNames);
    }
})
serverListen(server);
mainloop.run();
