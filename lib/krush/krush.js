/*
 * Section below is implementing functions available in moderns browsers but not in IE < 9
 * More of these are implemented at
 * http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
 */

/*
 * Array indexOf implementation for IE < 9
 */
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf = function(find, i /*opt*/) {
        if (i === undefined)
            i = 0;
        if (i < 0)
            i+= this.length;
        if (i < 0)
            i= 0;
        for (var n = this.length; i < n; i++)
            if (i in this && this[i] === find)
                return i;
        return -1;
    };
};
/*
 * Trim implementation for IE < 9
 */
if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ''); 
    }
};
/**
 * @module K
 * @class K
 */
var K = function() {
    var initializing = false,
        // TODO: Remove if there is no side-effect of removing the stuff inside
        //fnTest = /xyz/.test(function(){xyz;}) ? /\bbase\b/ : /.*/,
        fnTest = /xyz/.test(function(){}) ? /\bbase\b/ : /.*/,
        toString = Object.prototype.toString,
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
                        'toLocaleString', 'toString', 'constructor'],
        initOverridables = ['debug', 'showScriptConsole'],
        nonAccessorProps = ['extend', 'statics', 'requires', 'abstracts']
        /*,
        ostring = Object.prototype.toString*/;

    this.Class = function(){
        this.config = {};

        this.init = function(config) {
            var me = this,
                c = config || {};

            K.apply(this, c);
        };

        this.afterInit = function(config) {
        }
    };

    /**
     * Create a new Class that inherits from the core class
     * @method extend
     */
    Class.extend = function(className, prop) {
        var me = this,
            base = me.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new me();
        initializing = false;

        // Prototype information
        // Set the class name
        prototype.$className = className;
        // Set the direct parent class name
        prototype.$parentClassName = base.$className;
        // A function to find if a class is inheriting from another class
        prototype.$inheritsFrom = function(classNames) {
            var me = this,
                inheritsFrom = false;

            // If the classNames is not an array... make it so.
            if (K.isString(classNames)) {
                classNames = [classNames];
            }

            // Nothing to check so obviously not inheriting
            if (classNames.length == 0)
                return inheritsFrom;

            // Check all the classes in the list
            K.each(classNames, function(name, i) {
                // Check the class name of the current instance
                if (classNames == me.$className) {
                    inheritsFrom = true;
                    // Stop loop
                    return false;
                }

                // If base is an App class
                if (!K.isEmpty(base.$inheritsFrom))
                    // Check base class class name
                    inheritsFrom = base.$inheritsFrom(classNames);

                // Stop loop if inheriting already
                return !inheritsFrom;
            });

            // Return result
            return inheritsFrom;
        };

        // Copy the properties over onto the new prototype
        for (var name in prop) {

            // Check for special stuff like statics, ...
            // Don't do anything with these
            switch (name) {
                case 'requires':
                case 'statics':
                    continue;
            }

            // Check if overwriting an existing function
            if (K.isFunction(prop[name]) && K.isFunction(base[name]) && fnTest.test(prop[name])) {
                prototype[name] = (function(name, fn){
                    return function() {
                        var tmp = this.base;

                        // Add a new .base() method that is the same method
                        // but on the base class
                        this.base = base[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this.base = tmp;

                        return ret;
                    };
                })(name, prop[name]);
            // Else it's a regular property
            // TODO: Check if the prototype already has the property and log it in dev mode
            }
            else {
                var n = name,
                uName = n.charAt(0).toUpperCase() + n.slice(1);

                // Set the prototype parameter
                prototype[n] = prop[n];

                // Only create accessors for properties
                // TODO: Inheritance issues will arise here if a getter has same name as function. Throwing error
                // currently to prevent strange behaviour. Maybe best solution but needs to be looked at in more detail.
                if (!K.isFunction(prop[n])) {
                    var accessorName = 'get' + uName;
                    if (!K.isEmpty(prototype[accessorName]) && !nonAccessorProps.indexOf(accessorName))
                        throw new Error('Automatic accessor \'' + className + '.get' + uName + '\' is overwriting class method. Change the name of the class property to avoid the collision.');

                    // Create default public get method
                    // DONE: Maybe add to not add get accessor for private (starting with _) properties
                    prototype['get' + uName] = (function(n) {
                        return new Function('return this[\'' + n + '\'];');
                    })(n);
                }
            }
        }

        // Abstract methods should have been implemented at this point or throw an error
        // Get the abstracts of the base class
        // TODO: All subsequent classes is having this checked. Only needs to be on the base class.
        //       Remove inheritance (don't add to prototype).
        var abstracts = base.abstracts;
        if (!K.isEmpty(abstracts) && K.isArray(abstracts)) {
            var missingAbstracts = [],
                errorMessage = 'The following abstract methods of \'' + base.$className + '\' were not implemented in \'' + className + '\': ';
            for (var i=0; i<abstracts.length; i++) {
                var abstractName = abstracts[i];
                if (K.isEmpty(prototype[abstractName])) {
                    missingAbstracts.push(abstractName);
                    errorMessage += abstractName + ',';
                }
            }

            if (missingAbstracts.length > 0) {
                errorMessage = errorMessage.substring(0, errorMessage.length-1);
                throw new Error(errorMessage);
            }
        }

        // The dummy class constructor
        function Class() {
            // Add all mixin methods. Mixins methods and properties are being added to the inheritance chain.
            if (this.mixins) {
                if (!K.core.util.isArray(this.mixins)) {
                    throw new Error('Mixins must be an array of strings');
                }

                // Get the mixin...
                for (var i=0; i<this.mixins.length; i++) {
                    K.core.util.stringToFunction(this.mixins[i]).apply(this, arguments);
                }
            }

            // If there is no constructor, add it as it always needs to. It is the main starting point
            /*if (!this.constructor) {
                K.log('There is no constructor');
                this.constructor = function(config) {
                    var me = this;

                    me.base(config);
                }
            }*/

            // If there is no init method, add it as it always needs to. It is the main starting point
            if (!this.init)
                this.init = function(config) {
                    var me = this;

                    if (K.isEmpty(config))
                        throw new Error('The init method require the config to passed to the base method');

                    me.base(config);
                };

            // All construction is actually done in the init method
            if (!initializing) {

                // Plugins are added to the class runtime. Don't confuse with mixins which are required during define time. It is ensured loading if not already loaded.
                if (arguments.length > 0 && !K.isEmpty(arguments[0]) && !K.isEmpty(arguments[0].plugins)) {
                    var plugins = arguments[0].plugins;

                    if (!K.isArray(plugins))
                        throw new Error('Plugins must be defined as an array (' + this.$className + ')');

                    K.each(plugins, function(itm) {
                        var p = K.core.util.stringToFunction(itm).apply(this, arguments);
                    }, false, this);
                }

                this.init.apply(this, arguments)
            }

            // After all stuff has been done to init the class we call a post init method
            if ( !initializing && this.afterInit )
                this.afterInit.apply(this, arguments);
        }

        // Populate constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be the class
        Class.prototype.constructor = Class;

        // Make class extendable
        Class.extend = arguments.callee;

        return Class;
    };

    // So we can do fun stuff with window to...
    // Crush code should never use this though.
    //Dom.elificate(window);
    /*window.on({
        evt: 'resize',
        handler: function() {
            K.log('Resize...');
        }
    });*/



    return {
        /**
         * Extend a class
         * @method define
         * @param {String} className Name of class
         * @param {Object} conf Define configuration for the class
         * @static
         * @since 1.0.0
         */
        define: function(className, conf) {
            var b = (typeof __batch === 'undefined' ? false : __batch);

            var config = conf || {};

            // Throw an error if the class is obsolete and show the message
            // Putting the check will force to replace bad code... a good thing?
            if (config.obsolete) {
                throw new Error(K.isEmpty(config.obsoleteMessage) ? 'The class \'' + className + '\' is obsolete.' : config.obsoleteMessage);
            }

            // Load all required classes (synchronously)
            if (!b) {
                if (config.requires) {
                    if (!K.core.util.isArray(config.requires)) {
                        throw new Error('requires config must be an array of strings');
                    }
                    else {
                        for (var i=0, len=config.requires.length; i<len; i++) {
                            var rcn = config.requires[i];

                            K.core.ClassManager.ensureClass(rcn);
                        }
                    }
                }
            }

            // Create the namespace (object hierarchy)
            classObj = K.createNameSpace(className);

            // Class must extend from something so if not defined just inherit from the core class
            if (!config.extend)
                config.extend = 'K.core.Class';

            // If batch loading classes don't initialize them yet.
            if (!b) {

                // Make sure the base class had been loaded or fail trying
                K.core.ClassManager.ensureClass(config.extend);

                // Make object of the class to extend
                base = eval(config.extend);

                // Extend the base class and put it in the right place in the class struture
                classObj.ns[classObj.className] = base.extend(className, config);

                // Get class object (not an instance)
                var cls = classObj.ns[classObj.className];

                // Add the statics to the class
                if (config.statics) {
                    for (var sName in config.statics) {
                        // Check if function or property
                        cls[sName] = typeof config.statics[sName] == "function" && fnTest.test(config.statics[sName]) ?
                            // Wrap function in anonymous function to be able to add it to the class as a callable function
                            (function(name, fn) {
                                return fn; //.apply(this, arguments);
                            })(sName, config.statics[sName]) :
                            // Property
                            config.statics[sName];
                    }
                }
            }
            // Batch loading classes in no specific order
            else {
                // Set the class definition on the class so we know how to initialize it later
                classObj.ns[classObj.className] = {
                    deferred: true,
                    config: config
                };

                // Add to the deferred classes collection...
                var dc = K.core.ClassManager.deferredClasses;
                // 1. Check if it is already in there
                if (K.isEmpty(dc[className])) {
                    // Set class dependencies
                    dc[className] = config.requires || [];
                }
            };

            // Add the class to the list of classes loaded
            K.core.ClassManager.classes.push(className);
        },

        /**
         * Create an instance
         * @method create
         * @param {String} className Name of class to create
         * @param {Object} config Instance configuration values
         * @namespace K
         * @static
         * @since 1.0.0
         */
        create: function(className, config) {
            // Try to create an instance from the class name
            var cls = K.core.util.stringToFunction(className, true);
            // Create a function to be able to instantiate the class (function)
            var func = new Function('a', 'b', 'return new a(b)');
            // Call the function
            return func(cls, config);
        },
        /**
         * Create namespace
         * @method createNameSpace
         * @param {String} className Class to create namespace for
         * @return {Object} Namespace definition
         * @namespace K
         * @static
         * @since 1.0.0
         */
        createNameSpace: function(className) {
            // First split the namespace string separating each level of the namespace object.
            var splitNs = className.split('.');

            // Define a string, which will hold the name of the object we are currently working with. Initialize to the first part.
            var builtNs = splitNs[0];
            var i, base = window;

            for (i = 0; i < splitNs.length - 1; i++) {
                if (typeof(base[ splitNs[i] ]) == 'undefined')
                    base[splitNs[i]] = {};
                base = base[splitNs[i]];
            }
            return {
                ns: base,
                className: splitNs[splitNs.length - 1]
            }; // Return the namespace as an object.
        },
        /**
         * Define a mixin
         * @method defineMixin
         * @param {String} name Name of the mixin including namespaces
         * @param {Function} fn Mixin function adding the methods and properties
         * @namespace K
         * @static
         * @since 1.0.0
         */
        defineMixin: function(name, fn) {
            // Get the namespace and the mixin name
            var mixinObj = K.createNameSpace(name);

            // Create the mixin function
            mixinObj.ns[mixinObj.className] = fn;
        },

        /**
         * Define a plugin
         * @method definePlugin
         * @param {String} name Name of the plugin including namespaces
         * @param {Function} fn Plugin function adding the methods and properties
         * @namespace K
         * @static
         * @since 1.0.0
         */
        definePlugin: function(name, fn) {
            // Get the namespace and the mixin name
            var mixinObj = K.createNameSpace(name);

            // Create the mixin function
            mixinObj.ns[mixinObj.className] = fn;
        },

        /**
         * Smallest cross-browser dom ready ever
         * @method ready
         * @param {Function} f The function to call on document ready
         * http://dustindiaz.com/smallest-domready-ever
         * @namespace K
         * @static
         * @since 1.0.0
         */
        ready: function(f){/in/.test(document.readyState)?setTimeout('K.ready('+f+')',9):f()},
        /*
         * namespace K.core
         */
        core: {
            /** Starting the frame work setting variables
             * @method init
             * @param {Object} overrides Config object to override application static variables
             * @static
             * @since 1.0.0
             * @example
        K.ready(function() {
	        // Initialize the framework
            K.core.init({
                debug: true,
                showScriptConsole: true
            });
        });
             */
            init: function(overrides) {
                if (overrides && typeof overrides === 'object') {
                    var overridables = initOverridables;
                    for (var i=0, len=overridables.length; i<len; i++) {
                        if (overrides.hasOwnProperty(overridables[i])) {
                                K.core.Statics[overridables[i]] = overrides[overridables[i]];
                        }
                    }
                }
            },
            /* Static values used by the application. */
            // TODO: Thinking of moving these to another class instead. Shouldn't be part of the inheritance code as it's for generating control ids
            Statics: {
                nextControlId: 0,
                nextConnectionId: 0,
                // TODO: Move to component
                getNextId: function() { return ++K.core.Statics.nextControlId; },
                // TODO: Move to connection
                getNextConnectionId: function() { return ++K.core.Statics.nextConnectionId; },
                // TODO: Figure out what this is to be used for...
                idCounters: {},
                /**
                 * Get a unique id depending on type
                 * @method getUniqueId
                 * @param {String} type Type of counter
                 * @return {Number} Next number for the counter type
                 * @static
                 * @since 1.0.0
                 */
                getUniqueId: function(type) {
                    var c = K.core.Statics.idCounters;
                    // Create a new counter type if there is none for the type
                    if (K.isEmpty(c[type]))
                        c[type] = 0;
                    return ++c[type];
                },
                /**
                 * Set to true to enable logging
                 * @property {Boolean}
                 */
                debug: false,
                /**
                 * Set to true to show the application console (used for mobile devices)
                 * @property {Boolean}
                 */
                showScriptConsole: false
            },
            /**
             * Base class for all classes to inherit from. Do not inherit from this. Use K.Base as base class.
             * @class Class
             * @namespace K.core
             * @module K
             * @return void {Object}
             * @author Kristian Ask
             */
            Class: this.Class,
            /*
             * Dom functions
             * namespace K.Dom
             */
            Dom: {
                /**
                * Add some helper functions to the dom element so we don't have to care about that stuff anymore
                * @method elificate
                * @param {Dom} el Dom element to elificate
                * @return {Dom} The dom element elificated
                */
                // TODO: Actually we don't want to change the dom element but rather have a function that performs operations on dom elements
                elificate: function(el) {
                    var _dom = K.core.Dom;

                    if (typeof el['isEl'] != 'undefined')
                        return el;

                    /**
                     * Flag to mark element as elificated. Should not be changed
                     * @property isEl
                     * @type Boolean
                     */
                    el.isEl = true;

                    /**
                     * Set css on element
                     * @method css
                     * @param {String|Object} style Style to apply to the element
                     * @deprecated Use `K.util.Dom.css` instead
                     * @return {Dom} The dom element
                     */
                    el.css = function(style) {
                        K.log('Elificate.css: This method is deprecated. Use K.util.Dom.css instead');

                        // Style is a string
                        if (K.isString(style)) {
                            // Cross browser check
                            if (!K.isEmpty(this.style['cssText'], true))
                                this.style.cssText = style;
                            else
                                this.setAttribute('cssText', style);
                            return this;
                        }

                        // If the style is an array of styles
                        if (toString.call(style) === '[object Array]') {
                            var l = style.length;
                            if (l == 0)
                                return this;

                            // New style object
                            var newStyle = {};

                            // Create a new style object from the array of styles
                            for (var j=0; j<l; j++) {

                                var s = style[j];

                                // Make sure only objects are used
                                if (typeof s !== 'object')
                                    throw new Error('The items in the style array can only be objects');

                                // Merge the objects. Same config is overwritten by the latter one
                                K.core.util.apply(newStyle, s);
                            }
                            // Set the new style
                            style = newStyle;
                        }

                        // Set the style properties on the object
                        for (var name in style) {
                            this.style[name] = style[name];
                        }

                        return this;
                    };

                    /**
                     * Get element css property
                     * @method getCss
                     * @param {String} css CSS property to get
                     * @return {String} Style property
                     */
                    el.getCss = function(css) {
                        K.log('Elificate.getCss: This method is deprecated. Use K.util.Dom.css instead');
                        var me = this;
                        return me.style[css];
                    };

                    /**
                     * Get the computed style of an object
                     * @method compCss
                     * @param {String} css Style property to get
                     * @return {Object} Computed style
                     */
                    el.compCss = typeof window.getComputedStyle === 'undefined' ? function(css) {
                        K.log('Elificate.compCss: This method is deprecated. Use K.util.Dom.compCss instead');
                        return this.currentStyle[css];
                    } : function(css) {
                        K.log('Elificate.compCss: This method is deprecated. Use K.util.Dom.compCss instead');
                        return window.getComputedStyle(this)[css];
                    }

                    /**
                     * Set properties on the element
                     * @method prop
                     * @param {String|Object} props Properties for the element
                     * @param {String|Object} value Property to set on the element if the props is a {String}
                     * @deprecated Use `K.util.Dom.css` instead
                     * @return {Dom} The dom element
                     */
                    el.prop = function(props, value) {
                        K.log('Elificate.prop: This method is deprecated. Use K.util.Dom.prop instead');
                        // TODO: Fix innerText cross browser thing
                        if (arguments.length === 1 && typeof props === 'object')
                            for (var name in props) {
                                if (name == 'class')
                                    this.className = props[name];
                                // TODO: Reduce size here by using the el.html() function
                                else if (name == 'text' && !K.isEmpty(props[name])) {
                                    if (!K.isEmpty(el.textContent, true))
                                        this['textContent'] = props[name];
                                    else
                                        this['innerText'] = props[name];
                                }
                                else if (name == 'html' && !K.isEmpty(props[name]))
                                    this.html(props[name]);
                                else
                                    this[name] = props[name];
                            }
                        else if (arguments.length > 1)
                            this[props] = value;

                        return this;
                    };

                    /**
                     * Get element property
                     * @method getProp
                     * @param {String} prop Name of propererty to return
                     * @return {Object} The property or undefined if it doesn't exist
                     */
                    el.getProp = function(prop) {
                        K.log('Elificate.getProp: This method is deprecated. Use K.util.Dom.prop instead');
                        return this[prop];
                    };

                    /**
                     * Add a style class to the element
                     * @method addClass
                     * @param {String} className Class name to add to the element
                     * @return {Dom} The element
                     * @chainable
                     */
                    el.addClass = function(className) {
                        K.log('Elificate.addClass: This method is deprecated. Use K.util.Dom.addClass instead');
                        if (!this.hasClass(className))
                            this.className = this.className + ' ' + className;

                        return this;
                    };

                    /**
                     * Remove a style class from the element
                     * @method removeClass
                     * @param {String} className Class name to add to the element
                     * @return {Dom} The element
                     * @chainable
                     */
                    el.removeClass = function(className) {
                        K.log('Elificate.removeClass: This method is deprecated. Use K.util.Dom.removeClass instead');
                        var classes = this.className.split(' '),
                            newClasses = '';
                        K.each(classes, function(cls, i) {
                            if (cls == className)
                                classes.splice(i, 1);
                        }, true);

                        this.className = classes.join(' ');

                        return this;
                    };

                    /**
                     * Check if style is already applied to the class
                     * @method hasClass
                     * @param {String} className Class name to look for
                     * @return {Boolean} True if the class is already applied
                     */
                    el.hasClass = function(className) {
                        K.log('Elificate.hasClass: This method is deprecated. Use K.util.Dom.hasClass instead');
                        return ('' + this.className + ' ').indexOf(' ' + className + ' ') > -1;
                    };

                    /**
                     * Get the outer html of the object
                     * @method outer
                     * @return {String} The outer html of the element
                     */
                    el.outer = function() {
                        K.log('Elificate.outer: This method is deprecated. Use K.util.Dom.outer instead');
                        return this.outerHTML || new XMLSerializer().serializeToString(this);
                    };

                    /**
                     * Get or set the inner html of the object
                     * @method html
                     * @return {String} The inner html of the element if html is defined otherwise the innerHTML of the element
                     */
                    el.html = function(html) {
                        K.log('Elificate.html: This method is deprecated. Use K.util.Dom.html instead');
                        if (!K.isEmpty(html, true)) {
                            this.innerHTML = html;
                            return this;
                        }
                        else
                            return this.innerHTML;
                    };

                    /**
                     * Set the text content element
                     * @method text
                     * @param {String} text Text to set to the content element
                     * @return {Dom} The dom element
                     */
                    el.text = function(text) {
                        K.log('Elificate.text: This method is deprecated. Use K.util.Dom.text instead');
                        if (!K.isEmpty(el.textContent, true))
                            this.textContent = text;
                        else
                            this.innerText = text;

                            return this;
                    };

                    /**
                     * Get element text
                     * @method getText
                     * @return {String} The element text content
                     */
                    el.getText = function() {
                        K.log('Elificate.text: This method is deprecated. Use K.util.Dom.text instead');
                        if (!K.isEmpty(el.textContent, true))
                            return this.textContent;
                        else
                            return this.innerText;
                    };

                    /**
                     * Append element to another
                     * @method appendTo
                     * @param {Dom} parent The parent element to append the element to
                     * @param {Boolean} returnParent Set to true to return the parent element rather than the element added
                     * @return {Dom} The dom element if not returnParent is true, then the parent element instead
                     */
                    el.appendTo = function(parent, returnParent) {
                        K.log('Elificate.appendTo: This method is deprecated. Use K.util.Dom.appendTo instead');
                        parent.appendChild(this);

                        return returnParent ? parent : this;
                    };

                    /**
                     * Get the first child element
                     * @method firstEl
                     * @return {Dom} The first dom element or null if the element does not have any children
                     *
                     *     If the child element is not elificated it will be before returning it
                     */
                    el.firstEl = function() {
                        K.log('Elificate.firstEl: This method is deprecated. Use K.util.Dom.firstChild instead');
                        if (K.isEmpty(this.firstChild))
                            return null;
                        else
                            return _dom.elificate(this.firstChild);
                    };

                    /**
                     * Get the next sibling for the element
                     * @method next
                     * @return {Dom} The next element sibling or null if the element does not have a next sibling
                     *
                     *     If the child element is not elificated it will be before returning it
                     */
                    el.next = function() {
                        K.log('Elificate.next: This method is deprecated. Use K.util.Dom.next instead');
                        var sibling = this.nextSibling;
                        if (K.isEmpty(sibling))
                            return null;
                        else
                            return K.elificate(sibling);
                    };

                    /**
                     * Get the parent of the element
                     * @method parentEl
                     * @return {Dom} The element parent
                     *
                     *  If the parent element is not elificated it will be before returning it
                     */
                    el.parentEl = function() {
                        K.log('Elificate.parentEl: This method is deprecated. Use K.util.Dom.parent instead');
                        var parent = this.parentElement;
                        if (K.isEmpty(parent))
                            return null;
                        else
                            return K.elificate(parent);
                    }
                    /**
                     * Get the previous sibling for the element
                     * @method previous
                     * @return {Dom} The previous element sibling or null if the element does not have a previous sibling
                     *
                     *     If the child element is not elificated it will be before returning it
                     */
                    el.previous = function() {
                        K.log('Elificate.previous: This method is deprecated. Use K.util.Dom.previous instead');
                        var sibling = this.previousSibling;
                        if (K.isEmpty(sibling))
                            return null;
                        else
                            return K.elificate(sibling);
                    };

                    /**
                     * Add child element
                     * @method add
                     * @param {Dom} el The element to add to the parent
                     * @param {Boolean} returnParent Set to true to return the parent element rather than the element added
                     * @return {Dom} The dom element if not returnParent is true, then the parent element instead
                     */
                    el.add = function(el, returnParent) {
                        K.log('Elificate.add: This method is deprecated. Use K.util.Dom.add instead');
                        if (el.nodeType == 11)	// document fragment
                            //this.appendChild(el.cloneNode(true));
                            //this.appendChild(el);
                            for (var i=0, len = el.childNodes.length; i<len; i++) {
                                this.appendChild(el.childNodes[i]);
                            }
                        else
                            this.appendChild(el);

                        return returnParent ? this.parentNode : this;
                    };

                    /**
                     * Append an element before a child in this element
                     * @method prepend
                     * @param {Dom} el Element to append
                     * @param {Dom} before Element to append el before
                     * @return {Dom} The dom element
                     */
                    el.prepend = function(el, before) {
                        K.log('Elificate.prepend: This method is deprecated. Use K.util.Dom.prepend instead');
                        this.insertBefore(el, before);

                        return this;
                    };

                    /**
                     * Add event to the element
                     * @method on
                     * @param {Object} config The event configuration
                     * @return {Dom} The dom element
                     *
                     *    The config object is:
                     *        {String} evt The dom event to listen for on the object
                     *        {Function} handler The function to call on event
                     */
                    el.on = function(config) {
                        var me = this,
                            scope = config.scope || me;

                        if (K.isArray(config))
                            K.each(config, function(itm) {
                                me.addHandler(me, itm.evt, itm.handler, scope);
                            });
                        else
                            this.addHandler(me, config.evt, config.handler, scope);

                        return me;
                    };

                    /**
                     * Clear child elements from element
                     * @method clear
                     * @return {Dom} The dom element
                     */
                    el.clear = function() {
                        while (this.firstChild) {
                            this.removeChild(this.firstChild);
                        };

                        return this;
                    };

                    /**
                     * Add an event handler to the element
                     * @method addHandler
                     * @param {Dom} obj The dom element to add the event handler to
                     * @param {String} evnt The event name to attach the function to
                     * @param {Function} handler The function to call on event
                     */
                    // TODO: Check why scope is here...
                    el.addHandler = function(obj, evnt, handler/*, scope*/) {
                        if (obj.addEventListener) {
                            obj.addEventListener(evnt.replace(/^on/, ''), handler, false);
                        }
                        else {
                            if (obj[evnt]) {
                                var origHandler = obj[evnt];
                                obj[evnt] = function(evt) {
                                    origHandler(evt);
                                    handler(evt);
                                }
                            }
                            else {
                                obj[evnt] = function(evt) {
                                    handler(evt);
                                }
                            }
                        }
                    };

                    /**
                     * Clone dom element
                     * @method clone
                     * @param    {Boolean}    deep    Clone dom deep
                     * @return    {Dom}                Cloned dom element
                     * Only clones properties named 'data-' and no functions for performance reasons
                     */
                    el.clone = function(deep) {
                        var d = deep || false,
                            c = this.cloneNode(d);

                        // Cloning only data properties
                        K.core.Dom.cloneProperties(this, c, d);

                        if (!K.isEl(c))
                            _dom.elificate(c);

                        return c;
                    };

                    /**
                     * Clone object properties
                     * @method cloneProperties
                     * @param    {Dom}    o        Original object
                     * @param    {Dom}    c        Cloned object
                     * @param    {Boolean}    deep    True to deep clone
                     * Only clones properties named 'data-' and no functions for performance reasons
                     */
                    /*cloneProperties = function(o, c, deep) {
                        for (p in o) {
                            if (!K.isEmpty(o[p]) && p.substring(0, 5) == 'data-' && !K.isFunction(p)) {
                                c[p] = o[p];
                            }
                        }

                        if (deep && o.nodeType == 1) {
                            for (var i=0, len = o.childNodes.length; i<len; i++) {
                                var n = o.childNodes[i];
                                if (n.nodeType == 1)
                                    cloneProperties(o.childNodes[i], c.childNodes[i], deep);
                            }
                        }
                    }*/

                    /**
                     * Find dom element
                     * @method find
                     * @param {String|Array} s The exact path to navigate to find the dom element
                     * @param {Function} callback The function to call for each found item. Return false to stop the find.
                     * @return {Array} Array of dom elements found
                     *
                     * This function is only finding at the exact path and does not deviate.
                     */
                    el.find = function(s, callback) {
                        return _dom.find(this, s, callback);
                    }

                    /**
                     * Get the element at index position
                     * @method get
                     * @param	{Number}	index	Position to get
                     * @return	{Dom}			Dom element to get or null if not found
                     */
                    el.get = function(index) {
                        var el = this.childNodes[index];
                        if (!el)
                            return null;
                        else if (!K.isEl(el))
                            _dom.elificate(el);

                        return el;
                    }

                    el.hasScroll = function() {
                        K.log('Elificate.hasScroll: This method is deprecated. Use K.util.Dom.hasScroll instead');
                        // TODO: Check what happens if there is a border...
                        var me = this,
                            scrolls = { v: false, h: false },
                            el = me.firstEl(),
                            dim = me.innerDim();

                        if (K.isEmpty(el))
                            return scrolls;

                        scrolls.v = el.scrollHeight > dim.y;
                        scrolls.h = el.scrollWidth > dim.x;

                        return scrolls;
                    };

                    /**
                     * Get the inner dimension of a dom element
                     * @method innerDim
                     * @return	{Object}		Width and height of the inner dimensions
                     *
                     * The return value is { x: {Number}, y: {Number} }. This will return 0
                     */
                    el.innerDim = function() {
                        var me = this;

                        // TODO: Verify this in IE too... seems to be working
                        // TODO: Check what happens if there is a border...
                        //if (!K.isEmpty(me.innerWidth)))
                            return {
                                x: me.clientWidth,
                                y: me.clientHeight
                            };
                    };

                    /**
                     * Get the scroller dimension of a dom element
                     * @method scrollerDim
                     * @return	{Object}		Width and height of the scroller dimension
                     *
                     * The return value is {}
                     */
                    el.scrollerDim = function() {
                        // TODO: Check what happens if there is a border...
                        var me = this/*,
                        computed = window.getComputedStyle(me, null),
                        borderLeft = computed['border-left-width'],
                        borderRight = computed['border-right-width']*/;

                        return {
                            v: me.offsetWidth - me.clientWidth,
                            h: me.offsetHeight - me.clientHeight
                        };
                        //K.log('Left: ' + borderLeft + '  ' + 'Right: ' + borderRight);
                    };

                    return el;
                },
                /**
                 * Clone object properties
                 * @method cloneProperties
                 * @param    {Dom}    o        Original object
                 * @param    {Dom}    c        Cloned object
                 * @param    {Boolean}    deep    True to deep clone
                 * Only clones properties named 'data-' and no functions for performance reasons
                */
                cloneProperties: function(o, c, deep) {
                   for (p in o) {
                       if (!K.isEmpty(o[p])/*o.hasOwnProperty(p)*/ && p.substring(0, 5) == 'data-' && !K.isFunction(p)) {
                           c[p] = o[p];
                       }
                   }

                   if (deep && o.nodeType == 1) {
                       for (var i=0, len = o.childNodes.length; i<len; i++) {
                           var n = o.childNodes[i];
                           if (n.nodeType == 1)
                               K.core.Dom.cloneProperties(o.childNodes[i], c.childNodes[i], deep);
                       }
                   }
                },
                /**
                 * Create dom element and elificate it
                 * @method create
                 * @param {String} tagName The html element to create
                 * @return {Dom} The dom element created
                 */
                create: function(tagName) {
                    var el = document.createElement(tagName);

                    return K.core.Dom.elificate(el);
                },

                /**
                 * Create dom fragment and elificate it
                 * @method createFrag
                 * @return {Dom} Dom fragment
                 */
                createFrag: function() {
                    var el = document.createDocumentFragment();

                    return K.core.Dom.elificate(el);
                },
                /**
                 * Get the document body element
                 * @method getBody
                 * @return {Dom} The document body element
                 */
                getBody: function() {
                    return document.getElementsByTagName('body')[0];
                },
                /**
                 * Get the document head element
                 * @method getHeader
                 * @return {Dom} The document head element
                 */
                getHeader: function() {
                    return document.getElementsByTagName('head')[0];
                },
                /**
                 * Find elements from dom tree
                 * @method find
                 * @param {Dom} o Dom element to start from
                 * @param {String} s Path to object to find
                 * @param {Function} callback Called if defined when an object is found
                 *
                 *  Callback returns:
                 *  - {Dom} itm The dom item found
                 *  - {Number} i The element position in the Dom elements array
                 *      Note that this number is not a counter for number of items returned
                 * @example
        // A reference to a dom element
        var obj = document.getElementById('mydiv');

        // Find all table cells relative to obj
        var arr = K.dom.find(obj, 'table tbody tr td', function(itm, i) {
            // The callback is called every time an object has been found
        });

        // Find all table cells for the first row
        var arr = K.dom.find(obj, 'table tbody tr:eq(0) td');
                 */
                find: function(o, s, callback) {
                    var isE = K.isEmpty,
                        _dom = K.core.Dom,
                        me = o,
                        arr = [],
                        //path = K.isString(s) ? s.toLowerCase().split(' ') : s,
                        path = K.isString(s) ? s.toLowerCase().split(' ') : s,
                        pathLength = path.length,
                        nextPath = path.slice(1),
                        currentPath = path[0],
                        op = '',
                        opVal = 0,
                        childCount = !K.isEmpty(o.childNodes) ? o.childNodes.length : 0,
                        start = 0,
                        stop = childCount - 1,
                        itm = null;

                    // TODO: Use K.core.util.extracOp here...

                    // Check for an operator
                    if (!isE(currentPath) && currentPath.indexOf(':') !== -1) {
                        var p = currentPath.split(':');
                        currentPath = p[0];
                        // Remove any separator characters
                        op = p[1].replace(/\(.*\)/, '');
                        // Remove andthing but the value
                        opVal = parseInt(p[1].replace(/^.*\(/, '').replace(/\)$/, ''));
                    }

                    // Set start and stop values depending on operator
                    switch (op) {
                        // Equal
                        case 'eq':
                            start = stop = opVal;
                            break;
                        // Greater than
                        case 'gt':
                            start = opVal;
                            break;
                        // Less than
                        case 'lt':
                            stop = opVal;
                            break;
                    }

                    if (childCount > 0) {
                        for (var i=start; i<stop+1; i++) {
                            itm = o.childNodes[i];
                            if (K.isEmpty(itm))
                                continue;

                            // Check if tag is at current path
                            if (!isE(itm.tagName) && itm.tagName.toLowerCase() === currentPath) {
                                // If at end of search it's a find
                                if (pathLength == 1) {
                                    _dom.elificate(itm);
                                    arr.push(itm);
                                    // If there is a callback
                                    if (!isE(callback))
                                        var c = callback(itm, i);
                                }
                                // Loop children
                                else
                                    arr = arr.concat(_dom.find(itm, nextPath, callback));
                            }
                        }
                    }

                    return arr;
                },

                /**
                 * Create dom fragment from string
                 * @method fromString
                 * @return {Dom|Dom[]} A single or array of dom elements depending on the html string
                 */
                fromString: function(html) {
                    var fragDiv = K.core.Dom.create('div'); //Dom.createFrag();
                    fragDiv.html(html);
                    return fragDiv.firstEl();
                },

                /**
                 * Check if the dom element is elificated
                 * @method isEl
                 * @param {Dom} el Element to check
                 * @return {Boolean} True if the element has been elificated
                 */
                isEl: function(el) {
                    return !K.isEmpty(el['isEl']);
                },

                /**
                 * Test if the element is a dom element
                 * @method isDom
                 * @param {Object} o The object to test
                 * @return {Boolean} Returns true if considered a dom element
                 */
                isDom: function(o) {
                    var _isEmpty = K.isEmpty;
                    return (_isEmpty(o) ? false : !_isEmpty(o.tagName && o.nodeName));
                },

                /**
                 * Get the current position of the object
                 * @method findPos
                 * @param {Dom} o Element to get position for
                 * @return {Object} Object with left and top position
                 */
                findPos: function(o) {
                    var curLeft = 0,
                        curTop = 0;

                    if (o.offsetParent) {
                        do {
                            curLeft += o.offsetLeft;
                            curTop += o.offsetTop;
                        } while (o = o.offsetParent);
                    }

                    return { x: curLeft, y: curTop };
                }
            },
            //this.Dom,
            /*
             * namespace ClassManage
             */
            ClassManager: {
                /**
                 * Make sure the class has been loaded
                 * @method ensureClass
                 * @param {String} className The class name to make sure is loaded
                 * @param {Function} fn Callback function
                 *
                 * Note: This is a synchronous operation
                 */
                ensureClass: function(className, fn) {
                    if (!K.core.ClassManager.isDefined(className)) {
                        // Load...
                        K.util.Loader.loadClass({
                            scripts: [className],
                            sync: true,
                            callback: function() {
                                if (fn && K.isFunction(fn))
                                    fn();
                            }
                        });
                    }
                },

                /**
                 * Make sure the class has been loaded
                 * @method ensure
                 * @param {String} className The class name to make sure is loaded
                 * @param {Function} fn The callback when the class file has been loaded
                 * @return {Object} An instance of the loaded class. If the class can not be loaded a 404 error will oocur and the result is undefined.
                 */
                ensure: function(className, fn) {
                    K.core.ClassManager.ensureClass(className, fn);

                    return K.core.util.stringToFunction(className, false);
                },

                /**
                 * Test if the class is defined
                 * @method isDefined
                 * @param {String} className The name of the class to find
                 * @return {Function} The function if defined or false if not defined
                 */
                isDefined: function(className) {
                    var isFunction = false;
                    try {
                        isFunction = K.isFunction(K.core.util.stringToFunction(className));
                    }
                    catch (e) {
                    }
                    return isFunction;
                },
                /**
                 * Classes defined
                 * @property classes
                 * @type Array
                 * @default "[]"
                 */
                classes: [],
                /**
                 * Classes loaded but not initialized yet
                 * @property deferredClasses
                 * @type Object
                 * @default "{}"
                 */
                deferredClasses: {}
            },
            /*
             * namespace json
             */
            json: {
                /**
                 * Function to query a json object using a path
                 * @method query
                 * @param {String} path The path query to the object(s) to find in the json object
                 * @param {Object} obj The json object to navigate using the path
                 * @param {Function} [callback=undefined] Called if defined when an object is found
                 * @param {String} [returnType='object'] Decides what type will be returned. returnType can be 'value', 'object', 'path'. Default is 'object'.
                 * @return {Array} The found elements or empty array if nothing is found
                 * @since 1.0.0
                 * @example
        var data = {
           books: [{
               name: 'Book 1',
               author: 'Kristian Ask'
           }, {
               name: 'Book 2',
               author: 'Bill Gates'
           }, {
               name: 'Book 3',
               author: 'Kristian Ask'
           }, {
               name: 'Book 4',
               author: 'Sven Melander'
           }, {
               name: {
                  author: 'Kristian Ask'
               }
           }]
        };

        // Empty string always return an emtpy array
        var res = K.core.json.query('', data);

        // Get the books array
        // K.query is pointing to K.core.json.query
        res = K.query('books');

        // Get books at index 0, 1 and 3 from the data
        res = K.query('books[0,1,3]', data);

        // Get books at index 0, 1, 2 and 4
        res = K.query('books[0-2,4]', data);

        // Get books with name "Book 2"
        res = K.query('books[name="Book 2"]', data);

        // Get books with mixed name lookups
        res = K.query('books[author="Kristian Ask",name="Book 1"]', data);

        // Get single object
        res = K.query('books[4].name', data);
                 */
                // TODO: If the match is key value pair a callback per item should be implemented to override path query
                query: function(path, obj, callback, returnType) {
                    var _isEmpty = K.isEmpty,
                        _isArray = K.isArray,
                        _parseInt = parseInt,
                        arr = [],
                        rt = returnType || 'object',
                        _query = K.core.json.query;

                    // split the path using .
                    var segments = path.split('.'),
                        current = segments[0],
                        path = current.split('[')[0],
                        //opRegex = /\[(\d+(,\d+)*|[a-zA-Z]+="?[^\]]+"?)\]/gi,
                        opRegex = /\[(\d+)\]|\[(\d+[,-].*)\]|\[([a-zA-Z]+="?.+"?)\]/gi,
                        hasOp = opRegex.exec(current),
                        match = null,
                        matchIndex = 1,
                        next = segments.slice(1),
                        hasNext = !_isEmpty(next);

                    // Test for the existance of an object by opInfo.path
                    var segObject = obj[path],
                        segFound = !_isEmpty(segObject),
                        segObjectIsArray = segFound ? _isArray(segObject) : false;

                    // We now have the object or not... if we do then continue
                    if (!segFound)
                        return [];

                    // Process an array of items
                    function processItems(o) {
                        var _arr = [];
                        for (var i=0; i<o.length; i++) {
                            if (!_isEmpty(callback))
                                callback(o[i]);
                            _arr.push(o[i]);
                        }
                        return _arr;
                    };

                    // Get the data from the matched group
                    if (hasOp) {
                        var i = 0,
                            items = [];
                        while (!match) {
                            match = hasOp[++i];
                            matchIndex = i;
                        }

                        // Specific number
                        if (matchIndex == 1 && segObjectIsArray) {
                            // Get the item...
                            items.push(segObject[_parseInt(match)]);
                        }
                        // Specific items and/or spans or items
                        else if (matchIndex == 2) {
                            var indexes = match.split(',');

                            for (var i=0; i<indexes.length; i++) {
                                var part = indexes[i],
                                    span = part.split('-');
                                if (span.length > 1) {
                                    var start = _parseInt(span[0]),
                                        end = _parseInt(span[1]);
                                    for (var j=start; j<end + 1; j++)
                                        items.push(segObject[j]);
                                }
                                else
                                    items.push(segObject[_parseInt(indexes[i])]);
                            }
                        }
                        else if (matchIndex == 3) {
                            var named = match.split(','),
                                check = [];

                            for (var i=0; i<named.length; i++) {
                                // TODO: Evolve this by adding more operators
                                var pair = named[i].split('='),
                                    key = pair[0],
                                    value = pair[1];
                                // String...
                                if (value.indexOf('"') == 0)
                                    value = value.slice(1, value.length - 1);

                                // TODO: Check if it's needed to use strict comparison
                                check.push({
                                    key: key,
                                    value: value
                                });
                            }

                            // Check the items
                            for (var i=0; i<segObject.length; i++) {
                                var adding = true;
                                // Check the object for all filters
                                for (var j=0; j<check.length; j++) {
                                    var keyVal = segObject[i][check[j].key];
                                    if (_isEmpty(keyVal) || keyVal != check[j].value)
                                        adding = false;
                                }
                                // If still a match, add to the items
                                if (adding)
                                    items.push(segObject[i]);
                            }
                        }

                        if (!hasNext)
                            arr = arr.concat(processItems(items));
                        else
                            for (var i=0; i<items.length; i++)
                                // Process next path
                                arr = arr.concat(_query(next.join('.'), items[i], callback));
                    }
                    // Array and last so the array to return is filled here
                    else if (segObjectIsArray && _isEmpty(next)) {
                        arr = arr.concat(processItems(segObject));
                    }
                    // Array and not last so add array items and process children
                    else if (segObjectIsArray && !_isEmpty(next)) {
                        // Bunch all items up and send them to next level
                        var items = processItems(segObject);
                        for (var i=0; i<items.length; i++)
                            // Process next path
                            arr = arr.concat(_query(next.join('.'), items[i], callback));
                    }
                    // Not array and last so add object to array
                    else if (!segObjectIsArray) {
                        // No more items
                        if (_isEmpty(next))
                            arr = arr.concat(segObject);
                        // More items
                        else
                            arr = arr.concat(_query(next.join('.'), segObject, callback));
                    }
                    // check op on current path
                    // TODO: Implement the 'path' returnType
                    /*if (returnType == 'path')
                        throw new Error('The returnType \'path\' has not been implemented yet.');*/

                    return arr;
                },
                /**
                 * Convert a json value to a string
                 * @method stringify
                 * @param {Object} value JSON object to convert to a string
                 * @param {Function} replacer If a function, transforms values and properties encountered while stringifying; if an array, specifies the set of properties included in objects in the final string.
                 * @param {String} space Causes the json to be pretty formatted
                 */
                stringify: function(value, replacer, space) {
                    return JSON.stringify(value, replacer, space);
                },
                /**
                 * Parse json
                 * @method parse
                 * @param {String} text The string to parse as JSON.
                 * @param {Function} reviver If a function, prescribes how the value originally produced by parsing is transformed, before being returned.
                 * @return {Object} The json parse result
                 */
                parse: function(text, reviver) {
                    return JSON.parse(text, reviver);
                }
            },
            /*
             * namespace url
             */
            url: {
                options: {
                    strictMode: false,
                    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                    q: {
                        name:   "queryKey",
                        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                    },
                    parser: {
                        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                    }
                },
                parseUri: function (url) {
                    var o = K.core.url.options,
                        m = o.parser[o.strictMode ? "strict" : "loose"].exec(K.isEmpty(url) ? document.location : url),
                        uri = {},
                        i = 14;

                    while (i--) uri[o.key[i]] = m[i] || "";

                    uri[o.q.name] = {};
                    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                           if ($1) uri[o.q.name][$1] = $2;
                    });

                    return uri;
                }
            },
            /*
             * namespace util
             *  */
            util: {
                Loader: {
                    /* Base configuration for the loader */
                    _config: {
                        /**
                         * Default path to the framework
                         * @property basePath
                         * @type String
                         * @default 'js/'
                         */
                        basePath: 'js/',
                        /**
                         * [] Paths to namespaces. Specify prefix and path.
                         * @property paths
                         * @type Array
                         * @default []
                         *
                         * @example
                         * K.util.Loader.configure({
                         *  paths: [{ 'prefix': 'Custom', 'path': 'js/custom/' }]
                         * });
                         *
                         * K.util.Loader.configure({
                         *  paths: [{ 'prefix': 'Custom', 'path': 'js/custom/', cacheFn: function() { return currentCustomVersion; }, cacheParam: 'anotherDt' }]
                         * });
                         */
                        paths: [],
                        /**
                         * Default cache buster function for the loader. Set to specialised function if needed based on app need.
                         * @property cacheFn
                         * @type {Number}
                         *
                         * @example
                         *  K.util.Loader.configure({
                         *      cacheFn: function() { return currentVersion; }
                         *  });
                         */
                        cacheFn: function() { return new Date().getTime(); },
                        /**
                         * Cache buster query string parameter
                         * @property cacheParam
                         * @type String
                         * @default "dt"
                         */
                        cacheParam: 'dt',
                        /**
                         * Add cache buster. Set to false to add the cache buster to the call.
                         * @property caching
                         * @type Boolean
                         * @default true
                         */
                        caching: true
                    },
                    /**
                     * Don't really know what this is. Probably something clever...
                     * @property _currentNode
                     * @type Dom
                     * @default null
                     *
                     */
                    // TODO: Figure out what this is
                    _currentNode: null,
                    /**
                     * HTML document head object
                     * @property _head
                     * @type Dom
                     * @default The current head html node
                     * @private
                     */
                    _head: document.getElementsByTagName('head')[0],

                    /**
                     * Initialize or re-configure the loader if settings change. Note that this is a statics so re-onfiguring will change settings 'globally'
                     * @method configure
                     * @param {Object} config The configuration to apply
                     */
                    configure: function(config) {
                        config = config || {};
                        K.util.Loader._config = K.apply(K.util.Loader._config, config);
                    },

                    /**
                     * Load resoures
                     * @method load
                     * @param {Object} config Configuration for the object|objects to load
                     * @return String The base path
                     * config is:
                     *    {String} url                  path to the file to load (used with script if needed)
                     *    {Boolean} sync                set to true to load synchronously. default is false
                     *    {Array|String} scripts        array of scripts (String or Object) or string of single script
                     *        script is:
                     *            {String} url          script url
                     *            {String} type         content type
                     */
                    load: function(config) {
                        var c = config || {},
                            files = c.scripts && K.isArray(c.scripts) ? c.scripts : [],
                            url = c.url || false,
                            sync = c.sync || false,
                            doCallback = config.callback && K.isFunction(config.callback);

                        if (url)
                            files.push(url);

                        K.each(files, function(file, i, all) {
                            var pathHasQs = file.indexOf('?') != -1,
                                token = pathHasQs ? '&' : '?',
                                cacheStr = K.util.Loader._config.caching ? '' : token + K.util.Loader._config.cacheParam + '=' + K.util.Loader._config.cacheFn(),
                                filePath = file + cacheStr;

                            var node = document.createElement('script');

                            node.type = K.util.Loader._checkFileType(filePath);
                            node.charset = 'utf-8';
                            node.async = !sync;

                            if (sync) {
                                var req = K.util.Loader.getXhr();

                                req.open('GET', filePath, false);
                                req.send('');

                                var fileName = /([^/]+)$/.exec(file)[1];

                                // TODO: Add full path like playground3/ before
                                try {
                                    eval(req.responseText + '\r\n\r\n//@ sourceURL= ' + file);
                                }
                                catch (e) {
                                    K.log('Tried to load \'' + file + ' but failed. The error was: ' + e);
                                }

                                req = null;

                                if (doCallback)
                                    config.callback();
                            }
                            else {
                                // k-15
                                // TODO: Fix for opera...
                                if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) /*&& !isOpera*/) {
                                    useInteractive = true;

                                    // for async
                                    node.attachEvent('onreadystatechange', function() {
                                        if (doCallback)
                                            config.callback();
                                    });
                                }
                                else {
                                    // for async
                                    node.addEventListener('load', function() {
                                        if (doCallback)
                                            config.callback();
                                    }, false);
                                    node.addEventListener('error', function() {
                                        K.log('error');
                                    }, false);
                                }

                                node.src = filePath;
                            }


                            var _currentNode = node;
                            K.util.Loader._head.appendChild(node);
                            _currentNode = null;
                        });

                        return K.util.Loader._config.basePath;
                    },
                    /**
                     * Load class or classes
                     * @method loadClass
                     * @param {Object} config Configuration for the object|objects to load
                     * @return Object The class function
                     * config is:
                     *    {String} url                  path to the file to load (used with script if needed)
                     *    {Array|String} scripts        array of scripts (String or Object) or string of single script
                     *        script is:
                     *            {String} url          script url
                     *            {String} type         content type
                     */
                    loadClass: function(config) {
                        var c = config || {},
                            files = c.scripts && K.isArray(c.scripts) ? c.scripts : [],
                            url = c.url || false,
                            sync = c.sync || false,
                            loader = K.util.Loader;

                        if (url) {
                            files.push(url);
                        }

                        K.each(files, function(itm, idx, all) {
                            files[idx] = loader.getPath(itm);
                        });

                        return loader.load({
                            scripts: files,
                            sync: true
                        });
                    },
                    /**
                     * Get XMLHttpRequest in a cross-browser way
                     * @method getXhr
                     * @return {XMLHttpRequest} Request object
                     */
                    getXhr: function() {
                        var http;
                        try {
                            return new XMLHttpRequest;
                        }
                        catch(e) {
                            var msxml = [
                              'MSXML2.XMLHTTP.3.0',
                              'MSXML2.XMLHTTP',
                              'Microsoft.XMLHTTP'
                            ];
                            for (var i=0, len = msxml.length; i < len; ++i) {
                                try {
                                  return new ActiveXObject(msxml[i]);
                                  break;
                                }
                                catch(e) {
                                    return false;
                                }
                            }
                        }
                    },
                    /** Check the file type
                     * @method _checkFileTypes
                     * @param {String} src Path to the filename
                     * @return {String} Content type of the file to request
                     * @private
                     */
                    _checkFileType: function(src) {
                        var _src = src.split('?')[0],
                            idx = _src.lastIndexOf('.'),
                            type = 'text/plain';

                        if (idx == -1)
                            return type;

                        switch (_src.substring(idx)) {
                            case '.js':
                                type = 'text/javascript';
                                break;
                            case '.css':
                                type = 'text/css';
                                break;
                            default:
                                type = 'text/plain';
                                break;
                        }

                        return type;
                    },
                    /**
                     * Get the file path of the class. It uses the path config of the loader to figure out where the classes are.
                     * @method getPath
                     * @param {String} className Name of class to get path for
                     * @return String The path based on a class name
                     */
                    getPath: function(className) {
                        var path = K.util.Loader._config.basePath;

                        // Loop paths to override base path
                        K.each(K.util.Loader._config.paths, function(p) {
                            if (K.isString(p.prefix) && className.indexOf(p.prefix) === 0 && !K.isEmpty(p.path, true))
                                path = p.path;
                            else if (typeof p.prefix === "object" && p.prefix.test(className) && !K.isEmpty(p.path, true))
                                path = p.path;
                        });

                        // k-13
                        // TODO: Removing the prefix from the class name which should not be part of the path
                        // TODO: Add path configs for different stuff
                        var arr = className.split('.');
                        className = arr.join('/').toLowerCase();

                        var retVal = path.replace(/\/\.\//g, '/') + className/*.replace(/\./g, "/")*/ + '.js';
                        //K.log('Path: ' + retVal);
                        return retVal;
                    }
                },
                /**
                 * Empty function
                 * @method emptyFn
                 * @return Function A function that does nothing
                 */
                emptyFn: function() {},
                /** Test if value is empty, null, undefined or empty string
                 * @method isEmpty
                 * @param {Object} value Value to test
                 * @param {Boolean} allowEmptyString True to return false for an empty string
                 * @return Boolean True if empty
                 */
                isEmpty: function(value, allowEmptyString) {
                    return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (K.core.util.isArray(value) && value.length === 0);
                },
                /**
                 * Apply one json object on the other
                 * @method apply
                 * @param {Object} o Object to apply to
                 * @param {Object} c Object to apply from
                 * @param {Object} [def] Object default
                 * @return Object The object that the configs where applied to
                 */
                apply: function(o, c, def) {
                    if (def) {
                      K.core.util.apply(o, def);
                    }

                    if (o && c && typeof c === 'object') {
                        var i, j, k;

                        for (i in c) {
                            o[i] = c[i];
                        }

                        if (enumerables) {
                            for (j = enumerables.length; j--;) {
                                k = enumerables[j];
                                if (c.hasOwnProperty(k)) {
                                    o[k] = c[k];
                                }
                            }
                        }
                    }

                    return o;
                },
                /**
                 * Merge two objects
                 * @method merge
                 * @param {Object} source The original object
                 * @param {Object|String} key Object to merge with or key for value to merge to source
                 * @param {Object} value Value for the object to merge
                 * @return {Object} The object after the merge
                 */
                merge: function(source, key, value) {
                    if (typeof key === 'string') {
                        if (value && value.constructor === Object) {
                            if (source[key] && source[key].constructor === Object) {
                                K.core.util.merge(source[key], value);
                            }
                            else {
                                source[key] = K.core.util.clone(value);
                            }
                        }
                        else {
                            source[key] = value;
                        }

                        return source;
                    }

                    var i = 1,
                        ln = arguments.length,
                        object, property;

                    for (; i < ln; i++) {
                        object = arguments[i];

                        for (property in object) {
                            if (object.hasOwnProperty(property)) {
                                K.core.util.merge(source, property, object[property]);
                            }
                        }
                    }

                    return source;
                },
                /**
                 * Clone an object
                 * @method clone
                 * @param {Object} item Item to clone
                 * @return {Object} Cloned object
                 * @return Object the cloned item
                 */
                // TODO: Re-factor and use existing functions
                clone: function(item) {
                    // Nothing to do...
                    if (item === null || item === undefined) {
                        return item;
                    }

                    // Clone dom node
                    if (item.nodeType && item.cloneNode) {
                        return item.cloneNode(true);
                    }

                    var type = toString.call(item);

                    // Date
                    if (type === '[object Date]') {
                        return new Date(item.getTime());
                    }

                    var i, j, k, clone, key;

                    // Array
                    if (type === '[object Array]') {
                        i = item.length;

                        clone = [];

                        while (i--) {
                            clone[i] = K.core.util.clone(item[i]);
                        }
                    }
                    // Object
                    else if (type === '[object Object]' && item.constructor === Object) {
                        clone = {};

                        for (key in item) {
                            clone[key] = K.core.util.clone(item[key]);
                        }

                        if (enumerables) {
                            for (j = enumerables.length; j--;) {
                                k = enumerables[j];
                                clone[k] = item[k];
                            }
                        }
                    }

                    return clone || item;
                },
                /**
                 * Get value from object or type. Useful for configs being both native objects and configs
                 * @method lookFor
                 * @param {Object} obj Object where to find the property
                 * @param {String} prop Property to find if config object
                 * @param {Function} typeFn Function to determine the type of the value to find
                 * @param {Function} callback Function called if defined after checking
                 * @return Object Value found
                 *
                 *    Callback function is called if defined with the following parameters:
                 *        {Object} value Value of the object
                 *        {Boolean} success True if the param was found in the obj
                 */
                lookFor: function(obj, prop, typeFn, callback) {
                    var isE = K.isEmpty,
                        cb = callback,
                        hasCb = !isE(callback);

                    // No object or value at all but will allow empty string
                    if (isE(obj, true)) {
                        if (hasCb)
                            cb(null, false);
                        return false;
                    }

                    // If obj, has prop and is type sought
                    else if (K.isObject(obj) && obj.hasOwnProperty(prop) && typeFn(obj[prop])) {
                        if (hasCb)
                            cb(obj[prop], true);
                        return true;
                    }

                    // If obj is type defined by typeFn
                    else if (typeFn(obj)) {
                        if (hasCb)
                            cb(obj, true);
                        return true;
                    }

                    return null;
                },

                /**
                 * Extract operator information from the path. By supplying the object that the operator is to be
                 * used on it is possible for the function to automatically try to figure out the number of items
                 * if the the path is pointing to an array.
                 *
                 * The function can currently determine length of path items for arrays and dom elements
                 * @method extractOpInfo
                 * @param path
                 * @param obj
                 * @return {{path: string, hasOp: boolean, op: string, value: number, start: number, stop: number, len: number}}
                 */
                extractOpInfo: function(path, obj) {
                    var isEmpty = K.isEmpty,
                        _path = isEmpty(path) ? '' : path,
                        _hasOp = false,
                        _type = 'numeric',
                        _op = '',
                        _value = 0,
                        _start = 0,
                        _stop = 0,
                        _len = 0;

                    // Check for an operator
                    if (!isEmpty(_path) && _path.indexOf(':') !== -1) {
                        var p = _path.split(':');
                        _path = p[0];
                        _op = p[1].replace(/\(.*\)/, '');
                        _value = p[1].replace(/^.*\(/, '').replace(/\)$/, '');
                        _value = isNaN(_value) ? _value : parseInt(_value);
                        _hasOp = true;
                    }

                    // Try to figure out if we can get a length from here. Should work for json and html element
                    if (!isEmpty(obj) && !isEmpty(obj[_path])) {
                        var o = obj[_path];
                        if (K.isDom(o))
                            _len = o.childNodes.length;
                        else if (K.isArray(o))
                            _len = o.length;
                        _stop = _len - 1;
                    }

                    // If the operator is a string start and stop will be min and max respectively
                    // Matching object property by name can be a costly operation... in IE :)
                    if (!K.isString(_value)) {
                        // Set start and stop values
                        switch (_op) {
                            // Equal
                            case 'eq':
                                _start = _stop = _value;
                                break;
                            // Greater than
                            case 'gt':
                                _start = _value;
                                break;
                            // Less than
                            case 'lt':
                                _stop = _value;
                                break;
                        };
                    }
                    else
                        _type = 'string';

                    return {
                        path: _path,
                        hasOp: _hasOp,
                        op: _op,
                        type: _type,
                        value: _value,
                        start: _start,
                        stop: _stop,
                        len: _len
                    };
                },
                /** Get a nested object by path
                 * @method getNested
                 * @param {Object} obj Nested data
                 * @param {String} path Path to the object
                 * @return Object Object found
                 */
                getNested: function(obj, path) {
                    path.replace(/[^\.]+/g, function (p) {
                    obj = obj[p];
                    });
                    return obj;
                },
                /**
                 * Get dom element
                 * @method getDom
                 * @param {String} id Id of element
                 * @param {Boolean} elificate Set to true to add the helper functions to the dom element
                 * @return {dom} The dom element
                 */
                getDom: function(id, elificate) {
                    var el = id;
                    if (K.isDom(id))
                        el = id;
                    else
                        el = K.isString(id) ? document.getElementById(id) : id;
                    if (elificate)
                        return K.elificate(el);
                    else
                        return el;
                },
                /**
                 * Test to see if object is a K class
                 * @method isClass
                 * @param {Object} v The object to test
                 * @return {boolean} True if the object is a K class
                 */
                isClass: function(v) {
                    return !K.core.util.isEmpty(v['$className']);
                },
                /**
                 * Test to see if object is string
                 * @method isString
                 * @param {Object} v Value to test
                 * @return {Boolean} True if value is a string
                 */
                isString: function(v) {
                    return toString.call(v) === 'string' || toString.call(v) === '[object String]';
                },
                /**
                 * Test to see if the object is a number
                 * @method isNumber
                 * @param {Object} v Value to test
                 * @return {Boolean} True if the value is a number
                 */
                isNumber: function(v) {
                    return !isNaN(parseFloat(v)) && isFinite(v);
                },
                /**
                 * Test to see if object is array
                 * @method isArray
                 * @param {Object} value Value to test
                 * @return {Boolean} True if value is an array
                 */
                isArray: ('isArray' in Array) ? Array.isArray : function(v) {
                    return toString.call(v) === '[object Array]'
                },
                /**
                 * Test to see if object is node list or array
                 * @method isNodeList
                 * @param {Array|NodeList} v Array of NodeList to test
                 * @return Boolean True if v is type of NodeList otherwise false
                 */
                isNodeList: function(v) {
                    // return arr instanceof NodeList // works in all browsers except IE so...
                    // Duck Typing
                    return typeof NodeList === 'undefined' ? false : (v instanceof NodeList || (typeof v.length == 'number' && typeof v.item == 'function'
                            && typeof v.nextNode == 'function' && typeof v.reset == 'function'));
                },
                /**
                 * Test to see if the object really is an object object (funny... :) )
                 * @method isObject
                 * @param {Object} value Value to test
                 * @return {Boolean} True if value is an object
                 */
                isObject: function(value) {
                    return toString.call(value) === '[object Object]';
                },
                /**
                 * Test to see if object is function
                 * @method isFunction
                 * @param {Object} value Value to test
                 * @return {Boolean} True if value is a function
                 */
                isFunction: function(value) {
                        return toString.call(value) === '[object Function]';
                },
                /**
                 * Convert string to object
                 * @method stringToFunction
                 * @param {String} str String to convert to object
                 * @param {Boolean} load Set to true to try to load the class using the loader
                 * @return {Object} The object found
                 * @throws {Error} Throws if no object was found
                 */
                stringToFunction: function(str, load) {

                    load = K.isEmpty(load) ? false : load;

                    var arr = null;
                    try {
                        arr = str.split(".");
                    }
                    catch (e) {
                        K.log('Tried to make a function out of ' + str + ' but failed. The error message was: ' + e);
                        return;
                    }

                    var fn = (window || this),
                        ns = '',
                        loaded = false;

                    K.createNameSpace(str);

                    for (var i = 0, len = arr.length; i < len; i++) {
                        fn = fn[arr[i]];
                        ns += (ns == '' ? '' : '.') + arr[i];

                        // Check if the function is empty (not found)
                        var fnIsEmpty = K.core.util.isEmpty(fn);

                        // Namespace does not exist
                        if (fnIsEmpty && i < arr.length - 1 && !load)
                            throw new Error('Tried to generate \'' + str + '\'. Namespace \'' + ns + '\' does not exist. Check namespace casing.');
                        // Parsing the class finished but there is no class so try to load it
                        else if (fnIsEmpty && load && i == arr.length - 1) {

                            // Load the required class
                            K.util.Loader.loadClass({
                                scripts: [str],
                                sync: true,
                                callback: function() {
                                    K.log('Loaded template...');
                                }
                            });

                            // Try again since the class _should_ be loaded now
                            return K.core.util.stringToFunction(str, false);
                        }
                        // Can't find the function
                        else if (fnIsEmpty && !load)
                            throw new Error('Tried to generate \'' + str + '\'. Check casing.');
                    }

                    //if (typeof fn !== 'function') {
                    if (!K.isFunction(fn)) {
                        throw new Error('Object found is not a function');
                    }
                    return fn;
                },
                /**
                 * For each in the array
                 * @method each
                 * @param {Array|Object} arr Array or object to iterate. If object reverse is not available
                 * @param {Function} fn Function to call for each iteration. Return false to stop the iteration
                 * @param {Boolean} reverse Set to tru to iterate in reverse order
                 * @param {Object} scope The scope to run the callback function in
                 * @return {Object} The item for the current iteration
                 * @example
                    // Unscoped in forward order
                    var array = ['item 1', 'item 2', 'item 3'];

                    K.each(array, function(itm, index, fullArray) {
                        // This is the scope in which the function is run in
                    });

                    K.each(array, function(itm, index, fullArray) {
                        // This is the scope parameter [i]object[/i]
                    }, true, object);

                 *    If the iteration is aborted by returning false in the function the iteration will stop and
                 *    the current item is returned. If no function is defined or the array is empty null is returned.
                 */
                each: function(arr, fn, reverse, scope) {
                    if (!fn)
                        return null;

                    var itm = null,
                        util = K.core.util;

                    if (util.isArray(arr) || util.isNodeList(arr)) {
                        if (!reverse)
                            for (var i=0, len=arr.length; i<len; i++) {
                                itm = arr[i];
                                if (fn.call(scope||itm, itm, i, arr) === false)
                                    break;
                            }
                        else {
                            var i = arr.length;
                            while (i--) {
                                itm = arr[i];
                                if (fn.call(scope||itm, itm, i, arr) === false)
                                    break;
                            }
                        }
                    }
                    else if (util.isObject(arr)) {
                        for (var name in arr) {
                            itm = arr[name];
                            if (fn.call(scope||itm, itm, name, arr) === false)
                                break;
                        }
                    }

                    return itm;
                },
                /**
                 * Returns a dependencies list
                 * @method topoSort
                 * @param {Object} deps Dependencies list to sort
                 * @param {Object} root Define a root for the dependency walk
                 * @return {Array} Elements in order of dependency
                 *
                 * @example
                   var var data = {
                     "a": ["b", "d"],
                     "d": ["c", "e"]
                   };

                   var list = K.core.util.topoSort(data);
                 */
                topoSort: function (deps, root){
                    var nodes={};
                    var nodeCount=0;
                    var ready=[];
                    var output=[];

                    // build the graph
                    function add(element) {

                        nodeCount++;

                        // Create the object and it's dependency stubs
                        nodes[element] = {
                            needs:[],
                            neededBy:[],
                            name: element
                        };

                        // If there is already an element added with this name
                        if (deps[element]) {
                            // Loop all the dependencies in the list
                            K.each(deps[element], function(dep) {
                                // Add if not already added
                                if (!nodes[dep])
                                    add(dep);

                                // Add the dependency information to the graph object
                                nodes[element].needs.push(nodes[dep]);
                                nodes[dep].neededBy.push(nodes[element]);
                            });
                        }

                        // No more elements needed to traverse
                        if (!nodes[element].needs.length)
                            ready.push(nodes[element]);
                    }

                    // If there is a root
                    if (root) {
                      add(root)
                    }
                    // No root
                    else {
                       for (element in deps) {
                         if (!nodes[element])
                            add(element);
                      }
                    }

                    // Sort the graph
                    while (ready.length){
                        var dep = ready.pop();

                        output.push(dep.name);

                        K.each(dep.neededBy, function(element) {
                            element.needs = element.needs.filter(function(x){
                                return x != dep
                            });

                            if (!element.needs.length)
                                ready.push(element);
                        })
                    }

                    // Error-check
                    if (output.length != nodeCount){
                      throw "circular dependency detected"
                    }

                    return output;
                }
            },
            /* namespace */
            Trace: {
                /**
                 * Log message to the console
                 * @method log
                 * @param {String} message Message to log
                 */
                log: function(message) {
                    if ('console' in window && 'log' in console)
                        console.log(message);
                    // the line below you might want to comment out, so it dies silent
                    // but nice for seeing when the console is available or not.
                    //else alert(s);
                }
            },
            Mixins: {
                Eventing: {
                    /**
                     * This built-in mixin will make an object observable
                     * @method eventTarget
                     * @param {Object} config Listener configuration
                     * @return {Class} The class object
                     * @chainable
                     */
                    eventTarget: function(config) {
                        var me = this,
                            // If you want to use config for a mixin
                            cfg = config || {},
                            listeners = cfg.listeners || {},
                            // Set scope
                            scope = listeners.scope || me;

                        // The class listeners
                        me._listeners = {};

                        // Constructor
                        me.constructor = K.core.Event;

                        /**
                         * Listen to an event
                         * @method on
                         * @param {String} type Type of event
                         * @param {Function} listener Listener function to add to chain
                         * @return {Class} The class object
                         */
                        me.on = function(type, listener) {
                            if (typeof this._listeners[type] == 'undefined'){
                                this._listeners[type] = [];
                            }

                            this._listeners[type].push(listener);

                            return me;
                        };

                        // Listen to config-defined events at creation time
                        for (var name in listeners) {
                            me.on(name, listeners[name]);
                        }

                        /**
                         * Fire an event
                         * @method fire
                         * @param {String} event Name of the event to fire
                         * @param {Args} args Any number of arguments to pass to the listener function
                         * @return {Class} The class object
                         */
                        me.fire = function(event) {
                            // Looks funny, I know but it's to be able to use array functions on a nodelist which arguments array is
                            var args = Array.prototype.slice.call(arguments, 0);

                            if (args.length == 0) {
                                throw new Error('Expecting at least one paramater.');
                            }
                            else if (!K.core.util.isString(event)) {
                                throw new Error('First argument should be the event name to fire as a string.');
                            }

                            // All listeners for a class event is stored in an array of functions to call
                            // when the event is fired.
                            if (me._listeners[event] instanceof Array) {
                                var listeners = me._listeners[event];

                                // Remove the event name from the arguments to pass to the event
                                args.splice(0, 1);

                                // Call all the listeners
                                for (var i=0, len=listeners.length; i < len; i++) {
                                    listeners[i].apply(scope, args);
                                }
                            }

                            return me;
                        };

                        /**
                         * Remove the event listener
                         * @method removeListner
                         * @param {String} type Name of the event to remove
                         * @param {Function} listener Listener to remove
                         * @return {Class} The class object
                         */
                        me.removeListener = function(type, listener) {
                            var me = this;

                            // Only try if the listeners is an array or else someone has changed it
                            if (me._listeners[type] instanceof Array) {

                                // Get the listeners for the event
                                var listeners = me._listeners[type];

                                // Remove all the listeners
                                for (var i=0, len=listeners.length; i < len; i++) {
                                    if (listeners[i] === listener) {
                                        // TODO: Check if it is enough to do a splice or I need to actually delete the pointer or leak in IE
                                        listeners.splice(i, 1);
                                        break;
                                    }
                                }
                            }

                            return me;
                        };

                        // Return the mixin object
                        return me;
                    }
                }
            }
        }/*,
        // Just an early test class... maybe time to remove this now?
        Classes: {
            Test: function() {

                // add behaviours
                // this can do events
                K.core.Event.eventTarget.call(this);

                this.test = function() {
                    this.fire('event');
                }
            }
        }*/
    };
} ();

// Convenience methods
K._init = function() {
    var _json = K.core.json;
    var _util = K.core.util;
    var _dom = K.core.Dom;
    var _cm = K.core.ClassManager;
    
    K.ensure = _cm.ensure;

    K.query = _json.query;
    K.stringify = _json.stringify;
    K.parse = _json.parse;
    
    K.getBody = K.core.Dom.getBody;
    K.createEl = _dom.create;
    K.isDom = _dom.isDom;
    K.elificate = _dom.elificate;
    K.isEl = _dom.isEl;
    K.el = _dom.el;

    K.stringToFunction = _util.stringToFunction;
    K.getDom = _util.getDom;
    K.apply = _util.apply;
    K.merge = _util.merge;
    K.each = _util.each;
    K.isFunction = _util.isFunction;
    K.isArray = _util.isArray;
    K.isString = _util.isString;

    /** Convenience method for K.core.util.isEmpty. Test if value is empty, null, undefined or empty string
     * @class K
     * @method isEmpty
     * @param {Object} value Value to test
     * @param {Boolean} allowEmptyString True to return false for an empty string
     * @return Boolean True if empty
     */
    K.isEmpty = _util.isEmpty;
    K.isObject = _util.isObject;
    K.isClass = _util.isClass;
    K.lookFor = _util.lookFor;
    K.getNested = _util.getNested;
    K.log = K.core.Trace.log;
    
    /* Re-pointing old stuff to new locations */
    // TODO: Find all uses of K.util.Loader and kill them by fire
    K.util = {};
    K.util.Loader = K.core.util.Loader;
}();

/**
 * @class Base
 * @namespace K
 * @module K
 * @extends K.Core.Class
 * @return {Object} A new instance of the object
 * @description This is the base class that all crush classes should derive from.
 * @since 1.0.0
 */
K.define('K.Base', {
	extend: 'K.core.Class'
});

/**
 * @class State
 * @namespace K.core
 * @module K
 * @extends K.base
 * @return {Object} A new instance of the object
 * @description This is the one and only state class that should be used for url hash changes
 * @since 1.0.0
 */
// TODO: Add static methods for state persistence
K.define('K.core.State', {
    extend: 'K.Base',
    
    mixins: [
        'K.core.Mixins.Eventing.eventTarget'
    ],
    
    statics: {
        getCurrentHash: function() { return window.location.hash; },
        setCurrentHash: function(hash) { window.location.hash = hash; },
        _storedHash: window.location.hash,
        getStoredHash: function() { return K.core.State._storedHash; },
        setStoredHash: function(hash) { K.core.State._storedHash = hash; },
        _stateObject: null,
        setStateObject: function(stateObject) { K.core.State._stateObject = stateObject; },
        getStateObject: function() { return K.core.State._stateObject; },
        /**
         * The global hash changed notification object
         * @property Global
         * @type K.core.State
         * @default "An instance of K.core.State"
         */
        // TODO: Check this one out... it's being set here to return the state object
        // but during instatiation below it's set to the state object created...
        // Should I set state.Global below?
        // Just changed it to not set as it's set later
        Global: null, //function() { return K.core.State.getStateObject() },

        types: {
            'url': function() {
                // TODO: Add implementation for url state
            },
            'cookie': function() {
                // TODO: Add implementation for cookie state
            }
            // User can add state type with own implementation...
        },

        /**
         * Decompile hash string
         * @method _decompile
         * @param {String} hash The hash string to decompile
         * @return {Obj} A JSON object representing the hash string
         * @private
         */
        _decompile: function(hash) {
            var me = this,
                // Hash can according to RFC only have one #
                hash = hash.replace(/^#+/, ''),
                types = hash.split('|'),
                hashObject = {};

            K.each(types, function(itm, i) {
                if (itm.indexOf(':') != -1) {
                    var conf = itm.split(':'),
                        type = conf[0],
                        data = conf[1],
                        valuePair = data.split('&');

                    hashObject[type] = {};
                    K.each(valuePair, function(pair, i) {
                        var pairData = pair.split('=');

                        hashObject[type][pairData[0]] = pairData[1];
                    });
                }
            });

            return hashObject;
        },

        /**
         * Compile hash string
         * @method _compile
         * @param {Obj} types Hash object to compile to a string
         * @return {String} A string representing the current hash
         * @private
         */
        _compile: function(types) {
            var me = this,
                hash = '';

            for (var t in types) {
                var values = '';

                hash += t + ':';

                for (var v in types[t]) {
                    values += v + '=' + types[t][v] + '&';
                }

                if (values)
                    values = values.slice(0, -1);

                hash += values + '|';
            }

            if (hash)
                hash = hash.slice(0, -1);

            return hash;
        },

        /**
         * Add to or update state value
         * @method add
         * @param {String} type Type of state. Can be any string defining a set of state
         * @param {String} key Unique key for the state value
         * @param {String} value The value of the state
         * @return {Object} The current state as a JSON object
         */
        add: function(type, key, value) {
            var me = this,
                state = K.core.State,
                currentHash = state.getCurrentHash(),
                hashObject = state._decompile(currentHash),
                _type = type.toUpperCase(),
                _key = key.toUpperCase();

            if (K.isEmpty(hashObject[_type]))
                hashObject[_type] = {};

            hashObject[_type][_key] = value;

            hash = state._compile(hashObject);

            state.setCurrentHash(hash);

            return hashObject;
        },

        /**
         * Remove from state
         * @method remove
         * @param {String} type Type of state to remove from
         * @param {String} key Unique key for the state value to remove
         * @return {Object} The current state as a JSON object
         */
        remove: function(type, key) {
            var me = this,
                isEmpty = K.isEmpty,
                state = K.core.State,
                currentHash = state.getCurrentHash(),
                hashObject = state._decompile(currentHash),
                _type = type.toUpperCase(),
                _key = key.toUpperCase();

            // Is the state type there?
            if (!isEmpty(hashObject) && !isEmpty(hashObject[_type])) {
                if (!isEmpty(hashObject[_type][_key]))
                    delete hashObject[_type][_key];
            }

            // Get me the state as a string
            hash = state._compile(hashObject);

            // Set state hash
            state.setCurrentHash(hash);

            return hashObject;
        },

        /**
         * Clear state
         * @method clear
         * @param {String} type Type of state to clear
         * @return {Object} The current state as a JSON object
         */
        clear: function(type) {
            var me = this,
                isEmpty = K.isEmpty,
                state = K.core.State,
                setCurrentHash = state.setCurrentHash;

            if (isEmpty(type))
                setCurrentHash('');
            else {
                var currentHash = state.getCurrentHash(),
                    hashObject = state._decompile(currentHash),
                    _type = type.toUpperCase();
                if (!isEmpty(hashObject) && !isEmpty(hashObject[_type]))
                    delete hashObject[_type];

                hash = state._compile(hashObject);

                setCurrentHash(hash);
            }
        }
    },

    /**
     * Hash changed event
     * @event change
     * @param {String} hash The current hash
     */

    /**
     * Init method for the state class
     * @method init
     * @param config
     */
    init: function(config) {
        var me = this,
            state = K.core.State,
            location = window.location,
            compile = state._compile;
        
        if ('onhashchange' in window) {
            window.onhashchange = function() {
                var currentHash = location.hash,
                storedHash = state.getStoredHash();
                
                // TODO: newState, oldState, currentHash should be returned
                me.fire('change', currentHash, compile(currentHash));
            }
        }
        else {
            var currentHash = location.hash,
                storedHash = state.getStoredHash();
            
            window.setInterval(function() {
                // TODO: Make this check all
                if (currentHash != storedHash) {
                    state.setStoredHash(currentHash);
                    
                    // TODO: newState, oldState, currentHash should be returned
                    me.fire('change', currentHash, compile(currentHash));
                }
            }, 100);
        }
        
        me.base(config);
    },
    
    /**
     * Use this to add the handler
     * @method hashChanged
     * @param {Function} fn The function to call on hashChange
     *
     * @example
        K.ensure('K.core.State').Global.hashChanged(function(currentHash) {
            // The page hash has changed
        });
     */
    hashChanged: function(fn) {
        var me = this;
        
        me.on('change', fn);
    }
});

K.ready(function() {
    // Initialize the static state object
    var state = K.ensure('K.core.State'),
        stateObj = K.create('K.core.State');
    state.setStateObject(stateObj);
    
    // TODO: I wonder if I should set this. The line above should be enough
    // since state.Global is returing getStateObject and it's set on the row
    // above
    state.Global = stateObj;
});
