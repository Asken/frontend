/**
 * @class Start
 * @namespace Map
 * @module Map
 * @extends K.Base
 * @return {Map.Start}
 * @description The start class for the map
 */
K.define('Map.Start', {
    extend: 'Common.widget.Widget',

    requires: [
        'Common.widget.Widget',
        'Common.plugin.GoogleMap'
    ],

    map: null,

    init: function(config) {
        var me = this;

        me.base(config);

        me.initMap();
    },

    initMap: function() {
        var me = this;

        $('#loader').hide();

        me.map = K.create('Common.widget.Map', {
            style: 'width: 100%; height: 400px',
            autoLoadScripts: false/*),
            plugins: [
                'Common.plugin.GoogleMap'    // default so actually doesn't have to be specified. throws an error if no valid library has been loaded
            ]*/
        }).addTo('#app');

        me.map.plotData([
            { lat: 55.6750, lon: 12.5687 }
        ]);

        me.map.clear();

        K.log('Current map type: ' + me.map.getRendererType());
    }
});

