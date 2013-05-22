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
        'Common.util.Url',
        'Common.widget.Widget'
    ],

    map: null,

    url: null,

    init: function(config) {
        var me = this;

        me.base(config);

        me.initMap();
    },

    initMap: function() {
        var me = this;

        me.url = K.create('Common.util.Url');
        var dataUrl = me.url.queryKey.dataUrl || '',
            dataRoot = me.url.queryKey.dataRoot || '';

        // test url
        // ?dataUrl=resources/data/map.json&dataRoot=data

        me.map = K.create('Common.widget.Map', {
            style: 'width: 100%; height: 400px',
            zoom: 3,
            dataUrl: dataUrl,
            dataRoot: dataRoot,
            autoLoadScripts: false,
            autoFitBounds: true
        }).addTo('#app');

        me.map2 = K.create('Common.widget.Map', {
            style: 'width: 100%; height: 400px',
            zoom: 4,
            autoLoadScripts: false
        }).addTo('#app');

        me.map2.plotData([
            { lat: 55.6750, lng: 12.5687 }
        ]);

        me.map2.fitBounds();

        //me.map.clear();

        //K.log('Current map type: ' + me.map.getRendererType());
    }
});

