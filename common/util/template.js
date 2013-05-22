/**
 * @class Template
 * @namespace K.util
 * @description Create a template
 * @extends K.Base
 * @module Common.util
 * @author Kristian Ask
 */
K.define('Common.util.Template', {
    extend: 'K.Base',

    /**
     * Template string
     * @property tpl
     * @type String
     * @default null
     */
    tpl: null,
    /**
     * Json data if not provided on run methods
     * @property data
     * @type Object
     * @default null
     */
    data: null,
    /**
     * Compiled template function
     * @property compiledFn
     * @type Function
     * @default null
     */
    compiledFn: null,
    /**
     * Scope for the template to run in
     * @property scope
     * @type Object
     * @default null
     */
    scope: null,

    init: function(config) {
        var me = this;

        me.base(config);

        if (K.isEmpty(me.tpl))
            throw 'Template must not be null';

        // Get rid of any starting empty strings or the result
        // will be an text element
        me.tpl = me.tpl.trim();

        // Compile the function to pure js
        me.compiledFn = me._createTemplateFn();
    },

    /**
     * Create the template function
     * @method _createTemplateFn
     * @return {Function} Returns the compiled function for the template
     * @private
     */
    _createTemplateFn: function() {
        var me = this;

        var fn = "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            me.tpl.replace(/[\r\t\n]/g, " ")
                .replace(/'(?=[^%]*%>)/g,"\t")
                .split("'").join("\\'")
                .split("\t").join("'")
                .replace(/<#=(.+?)#>/g, "',$1,'")
                .split("<#").join("');")
                .split("#>").join("p.push('")
            + "');}return p.join('');";

        try {
            return new Function("obj", fn);
        }
        catch (e) {
            throw 'Exception. Check your template code for errors. When creating the template function for \'' + fn + '\' the template render error message was: \'' + e.message + '\'.';
        }
    },

    /**
     * Run the template with data
     * @method run
     * @param {Object} data Json data to apply to the template
     * @param {Object} scope Override of the scope
     * @return {String} Result of the data applied to the template
     */
    run: function(data, scope) {
        var me = this,
            s = K.isEmpty(scope) ? me : scope;

        // Scope sent in?
        if (!K.isEmpty(scope))
            s = scope;
        // just use the template scope or the class as the scope
        else
            s = me.scope || me;

        return me.compiledFn.call(s, data || {})
    },

    /**
     * Run the template and make it into a dom object
     * @method renderDom
     * @param {Object} data Data to apply to the template
     * @param {Object} scope The scope to run the template in
     * @return {Dom} Result of the template after applying the data
     *
     *  Note:
     *  There is no check that the template is rendering a dom object
     */
    runDom: function(data, scope) {
        var me = this;

        return K.core.Dom.fromString(me.run(data, scope));
    }
});
