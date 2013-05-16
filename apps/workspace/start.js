/**
 * @class Start
 * @namespace Workspace
 * @module Workspace
 * @extends K.Base
 * @return {Workspace.Start}
 * @description The start class for the workspace
 */
K.define('Workspace.Start', {
    extend: 'K.Base',

    init: function(config) {
        var me = this;

        me.base(config);

        K.log('Started workspace application');
    }
});
