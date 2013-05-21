K.definePlugin('Common.plugin.GoogleMap', function() {
    var me = this;

    me.markers = [];

    me.test = function() {
        return true;
    };

    me.renderMap = function() {
        var me = this;

        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(44.1257288, -33.0110524),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        me.renderer = new google.maps.Map(
            me.el,
            mapOptions);

        google.maps.event.addListener(me.renderer, 'click', function(event) {
            me.addMarker(event.latLng);
        });

        return me;
    };

    me.getRendererType = function() {
        return 'google';
    };

    me.addMarker = function(location) {
        var me = this;

        var marker = new google.maps.Marker({
            position: location,
            map: me.renderer
        });

        me.markers.push(marker);

        return me;
    };

    me.getLocation = function(lat, lon) {
        var me = this;

        return new google.maps.LatLng(lat, lon);
    };

    me.plotData = function(data) {
        var me = this,
            _data = data || me.data || [];

        K.each(_data, function(itm) {
            var location = me.getLocation(itm.lat, itm.lon);
            me.addMarker(location);
        });

        return me;
    };

    me.clear = function() {
        var me = this;

        K.each(me.markers, function(marker) {
            marker.setMap(null);
        });

        me.markers = [];

        return me;
    }
});