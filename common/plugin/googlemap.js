K.definePlugin('Common.plugin.GoogleMap', function() {
    var me = this;

    me.test = function() {
        return true;
    };

    me.renderMap = function() {
        var me = this;

        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(-34.397, 150.644),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

    me.renderer = new google.maps.Map(
            me.el,
            mapOptions);

        return me;
    };

    me.getRendererType = function() {
        return 'google';
    };
});
