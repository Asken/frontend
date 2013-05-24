K.define('Common.widget.Map', {
    extend: 'Common.widget.Widget',

    requires: [
        'Common.widget.Widget',
        'Common.util.Template'
    ],

    /**
     * Map clicked event
     * @event mapclicked
     * @since 1.0.0
     */

    /**
     * The renderer
     * @property renderer
     * @type Common.mixin.*
     * @default null
     * @since 1.0.0
     */
    renderer: null,

    /**
     * Zoom for the map
     * @method zoom
     * @type Number
     * @default 3
     * @since 1.0.0
     */
    zoom: 3,

    /**
     * The points to plot to the map
     * @property data
     * @type Array
     * @default null
     * @since 1.0.0
     */
    data: null,

    /**
     * An url to use to load points data from
     * @property dataUrl
     * @type String
     * @default ''
     * @since 1.0.0
     */
    dataUrl: '',

    /**
     * The path to the array of markers to add
     * @property dataRoot
     * @type String
     * @default ''
     * @since 1.0.0
     */
    dataRoot: '',

    /**
     * If set to true the map will be made sure to fit the points within the map view
     * @property autoFitBounds
     * @type Boolean
     * @default false
     * @since 1.0.0
     */
    autoFitBounds: false,

    /**
     * The markers currently added to the map
     * @property markers
     * @type Array
     * @default null
     * @since 1.0.0
     */
    markers: null,

    /**
     * Load the corresponding script for current renderer from a cdn
     * @property autoLoadScripts
     * @type Boolean
     * @default false
     * @since 1.0.0
     */
    // TODO: Implement autoLoadScripts...
    autoLoadScripts: false,

    init: function(config) {
        var me = this;

        me.base(config);

        if (!me.test()) {
            // Check for google and load the plugin if it's loaded
            if (typeof window['google'] === 'object' && typeof window['google'].maps === 'object') {
                K.ensure('Common.plugin.GoogleMap');
                var p = K.core.util.stringToFunction('Common.plugin.GoogleMap').apply(me, arguments);
            }

            // TODO: Determine if we should check for others too...

            // Check for bing
            // else 'Microsoft.Map'

            // Check for openstreetmaps
            // else 'OpenLayer...'
        }
    },

    afterAdd: function() {
        var me = this;

        me.base();

        if (me.test()) {
            me.renderMap();

            if (!K.isEmpty(me.dataUrl)) {
                // Oh... cheating. Create a new class to handle connections. It's very simple...
                var xhr = K.util.Loader.getXhr();

                xhr.open('GET', me.dataUrl, true);

                xhr.onreadystatechange = function(obj) {
                    // Don't forget the scope is the xhr object in here...
                    var readyState = this.readyState,
                        status = this.status;

                    if (readyState === 4) {
                        if (status === 200) {
                            me.data = K.parse(xhr.responseText);
                            if (!K.isEmpty(me.dataRoot)) {
                                me.data = K.query(me.dataRoot, me.data);
                                me.plotData();

                                if (me.autoFitBounds)
                                    me.fitBounds();
                            }
                        }
                        else
                            throw new Error('Failure: ' + status);
                    }
                }

                xhr.send(null);
            }
        }
    },

    /* abstract method definitions that needs to be covered by a plugin or inheritance */

    /**
     * Test if there is a plugin loaded
     * @method test
     * @return {boolean}
     * @since 1.0.0
     */
    test: function() {
        return false;
    },

    /**
     * Render map
     * @method renderMap
     * @return {Common.widget.Map} The map instance
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    renderMap: function() {
        throw new Error('Common.widget.Map.renderMap is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Fit the map around the markers added to the map
     * @method fitBounds
     * @return {Common.widget.Map} The map instance
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    fitBounds: function() {
        throw new Error('Common.widget.Map.fitBounds is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Get the name of the renderer
     * @method getRendererType
     * @return {String} The name of the renderer
     * @abstract
     * @since 1.0.0
     */
    getRendererType: function() {
        throw new Error('Common.widget.Map.getRendererType is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Clear the map from markers
     * @method clear
     * @return {Common.widget.Map}
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    clear: function() {
        throw new Error('Common.widget.Map.clearMap is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Plot an array of points
     * @method plotData
     * @param {Array} data Array of lon and lat
     * @return {Common.widget.Map}
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    plotData: function(data) {
        throw new Error('Common.widget.Map.plotData is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Add marker to the map
     * @method addMarker
     * @param {Object} location Location of the marker to place
     * @return {Common.widget.Map}
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    addMarker: function(location) {
        throw new Error('Common.widget.Map.addMarker is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Get correct location type specific to the current renderer
     * @param {Number} lat Latitude for the location
     * @param {Number} lon Longitude for the location
     * @return {Location}
     * @abstract
     * @since 1.0.0
     */
    getLocation: function(lat, lon) {
        throw new Error('Common.widget.Map.getLocation is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    }
});
