K.definePlugin('Common.plugin.GoogleMap', function() {
    var me = this;

    me.markers = [];
    me.bounds = new google.maps.LatLngBounds();
    /*me.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(61, -164),
        new google.maps.LatLng(-40, 168)
    );*/

    me.test = function() {
        return true;
    };

    me.renderMap = function() {
        var me = this;

        var mapOptions = {
            zoom: me.zoom,
            center: new google.maps.LatLng(44.1257288, -33.0110524),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        me.renderer = new google.maps.Map(
            me.el,
            mapOptions);

        google.maps.event.addListener(me.renderer, 'click', function(event) {
            K.log(event.latLng);
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
        me.bounds.extend(location);

        return me;
    };

    me.fitBounds = function() {
        var me = this;

        me.renderer.fitBounds(me.bounds);
    };

    me.getLocation = function(lat, lng) {
        var me = this;

        return new google.maps.LatLng(lat, lng);
    };

    me.plotData = function(data) {
        var me = this,
            _data = data || me.data || [];

        K.each(_data, function(itm) {
            var location = me.getLocation(itm.lat, itm.lng);
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
        me.bounds = new google.maps.LatLngBounds();

        return me;
    }
});
