/**
 * @class Start
 * @namespace Geocoder
 * @module Geocoder
 * @extends K.Base
 * @return {Geocoder.Start}
 * @description The start class for the geocoder
 */
K.define('Geocoder.Start', {
    extend: 'K.Base',

    init: function(config) {
        var me = this;

        me.base(config);

        K.log('Started geocoder application');
    }
});

