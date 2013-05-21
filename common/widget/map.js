K.define('Common.widget.Map', {
    extend: 'Common.widget.Widget',

    /**
     * The renderer
     * @property renderer
     * @type Common.mixin.*
     * @default null
     */
    renderer: null,

    /**
     * Load the corresponding script for current renderer from a cdn
     * @property autoLoadScripts
     * @type Boolean
     * @default false
     */
    // TODO: Implement autoLoadScripts...
    autoLoadScripts: false,

    init: function(config) {
        var me = this;

        me.base(config);

        if (!me.test()) {
            // Check for google and load the plugin if it's loaded
            if (typeof window['google'] === 'object' && typeof window['google'].maps === 'object')
                var p = K.core.util.stringToFunction('Common.plugin.GoogleMap').apply(me, arguments);

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
    }
});
