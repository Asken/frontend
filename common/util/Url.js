/**
 * @class Url
 * @namespace Common.util
 * @module Common
 * @extends K.Base
 * @return {Common.util.Url}
 * @description A query string parser class
 */
K.define('Common.util.Url', {
    extend: 'K.Base',

    statics: {
        /**
         * Parts of the location to fill
         * @property key
         * @type Array
         * @default ['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor']
         * @private
         * @static
         */
        key: ['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'],
        /**
         * The name for the object containing the query key value name value pair
         * @property queryKeyName
         * @type String
         * @default queryKey
         * @private
         * @static
         */
        queryKeyName: 'queryKey',
        /**
         * The url query part parser regex
         * @property parser
         * @type RegExp
         * @default /(?:^|&)([^&=]*)=?([^&]*)/g
         * @private
         * @static
         */
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
        /**
         * The strict location parser
         * @parameter strict
         * @type RegExp
         * @default /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
         * @private
         * @static
         */
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        /**
         * The strict location parser
         * @property loose
         * @type RegExp
         * @default /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
         * @private
         * @static
         */
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,

        /**
         * Parse an URI
         * @method parseUri
         * @param {String} url The url to parse
         * @return {Common.util.Url}
         */
        parseUri: function(url) {
            return Common.util.Url({
                url: url
            });
        }
    },

    /**
     * The url to parse
     * @property {String} url The url to parse
     * @type String
     * @default ''
     * @example
     // Parse the url for the current location
     var urlCurrentLocation = K.create('Common.util.Url');

     // Parse the specified url
     var specificUrl = K.create('Common.util.Url', {
        url: 'http://www.example.se'
     });

     // Parse url using the static method
     var staticMethodUrl = K.ensure('Common.util.Url').parseUri('http://www.example.se');

     // Re-parse using another url is either done by setting the url property and re-running parseUri
     specificUrl.url = 'http://www.anotherexample.com';
     specificUrl.parseUri();

     // ... or by sending the new url in, in which case the url property will be set to the new url
     specificUrl.parseUri('http://www.anotherexample.com');

     // The below is not chaning anything and will not refresh the class parameters...
     specificUrl.parseUri();

     // To refresh the class to have parsed the current location
     urlCurrentLocation.parseUri(window.location);
     */
    url: '',

    /**
     * Determine if using strict or loose parser. Strict is following the RFC.
     * @property strictMode
     * @type Boolean
     * default false
     */
    strictMode: false,

    /**
     * Source of the location
     * @property source
     * @type String
     * @default ''
     */
    source: '',

    /**
     * Protocol of the location
     * @property protocol
     * @type String
     * @default ''
     */
    protocol: '',

    /**
     * Authority of the location. This is the username, password, url and port sections of the url
     * @property authority
     * @type String
     * @default ''
     */
    authority: '',

    /**
     * Authority of the location. This is the username and password sections of the url
     * @property userInfo
     * @type String
     * @default ''
     */
    userInfo: '',

    /**
     * Username of the location
     * @property user
     * @type String
     * @default ''
     */
    user: '',

    /**
     * Password of the location
     * @property password
     * @type String
     * @default ''
     */
    password: '',

    /**
     * Host of the location
     * @property host
     * @type String
     * @default ''
     */
    host: '',

    /**
     * Port of the location
     * @property port
     * @type String
     * @default ''
     */
    port: '',

    /**
     * Relative path of the location
     * @property relative
     * @type String
     * @default ''
     */
    relative: '',

    /**
     * Path of the location
     * @property path
     * @type String
     * @default ''
     */
    path: '',

    /**
     * Directory of the location
     * @property directory
     * @type String
     * @default ''
     */
    directory: '',

    /**
     * File name of the location
     * @property file
     * @type String
     * @default ''
     */
    file: '',

    /**
     * Query part of the location
     * @property query
     * @type String
     * @default ''
     */
    query: '',

    /**
     * Anchor of the location
     * @property anchor
     * @type String
     * @default ''
     */
    anchor: '',

    init: function(config) {
        var me = this;

        me.base(config);

        me.parseUri();
    },

    /**
     * Parse the url to the class parameters
     * @method parseUri
     * @param {String|Location} [url] The url to parse
     * @returns {Common.util.Url}
     * @chainable
     */
    parseUri: function (url) {
        var me = this,
            _isEmpty = K.isEmpty

        // Set the url property to window.location if not set
        me.url = _isEmpty(me.url) ? window.location : me.url;

        var _url = _isEmpty(url) ? me.url : url,
            _statics = Common.util.Url,
            _m = _statics[me.strictMode ? 'strict' : 'loose'].exec(_url),
            _i = 14;

        // Set the url property based on the url sent in, property or window.location
        me.url = _url;

        // Set the properties of the class to empty or the found value from the RegEx
        while (_i--) me[_statics.key[_i]] = _m[_i] || '';

        // Set the query name of the query key object
        var _queryKeyName = _statics.queryKeyName;
        me[_queryKeyName] = {};

        // Set the key values
        me[_statics.key[12]].replace(_statics.parser, function ($0, $1, $2) {
            if ($1) me[_queryKeyName][$1] = $2;
        });

        return me;
    }
});