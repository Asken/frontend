K.define('Common.widget.Map', {
    extend: 'Common.widget.Widget',

    requires: [
        'Common.widget.Widget'
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
     * The points to plot to the map
     * @property data
     * @type Array
     * @default null
     * @since 1.0.0
     */
    data: null,

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
     * @return {Common.widget.Map}
     * @chainable
     * @abstract
     * @since 1.0.0
     */
    renderMap: function() {
        var me = this;

        throw new Error('Common.widget.Map.renderMap is not defined. Either implement using inheritance or define a map plugin where the method is defined');
    },

    /**
     * Get the name of the renderer
     * @method getRendererType
     * @return {String}
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
