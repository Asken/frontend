/**
 * @class Url
 * @namespace Common.util
 * @module Common
 * @extends K.Base
 * @return {Workspace.Start}
 * @description The start class for the workspace
 */
K.define('Common.util.Url', {
    extend: 'K.Base',

    statics: {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
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
     *
     */
    url: '',

    source: '',
    protocol: '',
    authority: '',
    userInfo: '',
    user: '',
    password: '',
    host: '',
    port: '',
    relative: '',
    path: '',
    directory: '',
    file: '',
    query: '',
    anchor: '',

    init: function(config) {
        var me = this;

        me.base(config);

        me.parseUri();
    },

    /**
     *
     * @param url
     * @returns {{}}
     */
    parseUri: function (url) {
        var me = this,
            statics = Common.util.Url,
            m = statics[statics.strictMode ? "strict" : "loose"].exec(K.isEmpty(url) ? document.location : url),
            uri = {},
            i = 14;

        while (i--) uri[statics.key[i]] = m[i] || "";

        uri[statics.name] = {};
        uri[statics.key[12]].replace(statics.parser, function ($0, $1, $2) {
            if ($1) uri[statics.name][$1] = $2;
        });

        return uri;
    }
});