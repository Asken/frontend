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
    url = K.create('Common.util.Url').parseUri();
    ok()
    K.log(url);
});