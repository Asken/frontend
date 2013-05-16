QUnit.config.autostart = false;

module('Common');

test('Common.util.Url', function() {
    // Set the loader settings
    K.core.util.Loader.configure({
        caching: false,
        // Working on util so only cache bust that... (just an example for now, batch and closure compilation will be implemented later)
        paths: [{
            prefix: 'Common',
            path: '../'
        }]
    });

    // Load the class
    K.ensure('Common.util.Url');
    ok(!K.isEmpty(Common.util.Url), 'The loader is configured correctly to test the Url class.');

    // Parse current url
    url = K.create('Common.util.Url', {
    });

    ok(url.url === window.location, 'Providing an empty string will use the window.location to parse the location');

    // Parse current url
    url = K.create('Common.util.Url', {
        url: 'http://username:password@www.example.com:8080/path1/path2/index.html?q1=1&q2=2#anchor'
    });

    ok(url.source === 'http://username:password@www.example.com:8080/path1/path2/index.html?q1=1&q2=2#anchor', 'Full url source');
    ok(url.protocol === 'http', 'Protocol is http');
    ok(url.authority === 'username:password@www.example.com:8080', 'Authority is set');
    ok(url.userInfo === 'username:password', 'UserInfo is set');
    ok(url.user === 'username', 'Username is username');
    ok(url.password === 'password', 'Password is password');
    ok(url.host === 'www.example.com', 'Host is www.example.com');
    ok(url.port === '8080', 'Port is set to 8080');
    ok(url.relative === '/path1/path2/index.html?q1=1&q2=2#anchor', 'Relative path is set');
    ok(url.path === '/path1/path2/index.html', 'Path is set');
    ok(url.directory === '/path1/path2/', 'Directory is set');
    ok(url.file === 'index.html', 'File set to index.html');
    ok(url.query === 'q1=1&q2=2', 'The entire query string is set');
    ok(url.anchor === 'anchor', 'Anchor is set to anchor');
    ok(url.queryKey.q1 === '1' && url.queryKey.q2 === '2', 'Query key object parameters is set');

    // Will retain url
    url.parseUri();

    ok(url.url === 'http://username:password@www.example.com:8080/path1/path2/index.html?q1=1&q2=2#anchor', 'Just running parseUri will keep the current url');

    // Will change url
    url.parseUri(window.location);

    ok(url.url === window.location, 'Setting url to window.location again');

    // Setting the url and then re-running the parsing
    url.url = 'http://username:password@www.example.com:8080/path1/path2/index.html?q1=1&q2=2#anchor';
    url.parseUri();

    ok(url.url === 'http://username:password@www.example.com:8080/path1/path2/index.html?q1=1&q2=2#anchor', 'Just running parseUri will keep the current url');
});