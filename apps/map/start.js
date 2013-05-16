/**
 * @class Start
 * @namespace Map
 * @module Map
 * @extends K.Base
 * @return {Map.Start}
 * @description The start class for the map
 */
K.define('Map.Start', {
    extend: 'K.Base',

    init: function(config) {
        var me = this;

        me.base(config);

        K.log('Started map application');
    }
});

