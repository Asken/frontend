K.define('Common.widget.Widget', {
    extend: 'K.Base',

    mixins: [
        'K.core.Mixins.Eventing.eventTarget'
    ],

    el: null,

    style: '',

    isAdded: false,

    isRendered: false,

    init: function(config) {
        var me = this;

        if (typeof jQuery === 'undefined')
            throw new Error('jquery is needed for this class (' + me.$className + ') to load');

        me.base(config);

        me.el = K.createEl('div');
    },

    afterInit: function(config) {
        var me = this;

        me.base(config);
    },

    addTo: function(element) {
        var me = this;

        if (!me.isRendered)
            me.render();

        me.beforeAdd();

        $(me.el).appendTo(element);

        me.isAdded = true;

        $(me.el).attr('style', me.style);

        me.afterAdd();

        return me;
    },

    render: function() {
        var me = this;

        me.beforeRender();

        me.isRendered = true;

        me.afterRender();
    },

    beforeRender: function() {
        var me = this;

        me.fire('beforerender');
    },

    afterRender: function() {
        var me = this;

        me.fire('afterrender');
    },

    add: function() {
        var me = this;

        me.beforeAdd();

        me.afterAdd();
    },

    beforeAdd: function() {
        var me = this;

        me.fire('beforeadd');
    },

    afterAdd: function() {
        var me = this;

        me.fire('afteradd');
    }
});
