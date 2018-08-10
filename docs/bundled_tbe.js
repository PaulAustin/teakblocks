(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});
},{"select":9}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});
},{"./clipboard-action":1,"good-listener":6,"tiny-emitter":11}],3:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],4:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":3}],5:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],6:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":5,"delegate":4}],7:[function(require,module,exports){
/**
 * interact.js v1.2.8
 *
 * Copyright (c) 2012-2015 Taye Adeyemi <dev@taye.me>
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact.js/master/LICENSE
 */
(function (realWindow) {
    'use strict';

    // return early if there's no window to work with (eg. Node.js)
    if (!realWindow) { return; }

    var // get wrapped window if using Shadow DOM polyfill
        window = (function () {
            // create a TextNode
            var el = realWindow.document.createTextNode('');

            // check if it's wrapped by a polyfill
            if (el.ownerDocument !== realWindow.document
                && typeof realWindow.wrap === 'function'
                && realWindow.wrap(el) === el) {
                // return wrapped window
                return realWindow.wrap(realWindow);
            }

            // no Shadow DOM polyfil or native implementation
            return realWindow;
        }()),

        document           = window.document,
        DocumentFragment   = window.DocumentFragment   || blank,
        SVGElement         = window.SVGElement         || blank,
        SVGSVGElement      = window.SVGSVGElement      || blank,
        SVGElementInstance = window.SVGElementInstance || blank,
        HTMLElement        = window.HTMLElement        || window.Element,

        PointerEvent = (window.PointerEvent || window.MSPointerEvent),
        pEventTypes,

        hypot = Math.hypot || function (x, y) { return Math.sqrt(x * x + y * y); },

        tmpXY = {},     // reduce object creation in getXY()

        documents       = [],   // all documents being listened to

        interactables   = [],   // all set interactables
        interactions    = [],   // all interactions

        dynamicDrop     = false,

        // {
        //      type: {
        //          selectors: ['selector', ...],
        //          contexts : [document, ...],
        //          listeners: [[listener, useCapture], ...]
        //      }
        //  }
        delegatedEvents = {},

        defaultOptions = {
            base: {
                accept        : null,
                actionChecker : null,
                styleCursor   : true,
                preventDefault: 'auto',
                origin        : { x: 0, y: 0 },
                deltaSource   : 'page',
                allowFrom     : null,
                ignoreFrom    : null,
                _context      : document,
                dropChecker   : null
            },

            drag: {
                enabled: false,
                manualStart: true,
                max: Infinity,
                maxPerElement: 1,

                snap: null,
                restrict: null,
                inertia: null,
                autoScroll: null,

                axis: 'xy'
            },

            drop: {
                enabled: false,
                accept: null,
                overlap: 'pointer'
            },

            resize: {
                enabled: false,
                manualStart: false,
                max: Infinity,
                maxPerElement: 1,

                snap: null,
                restrict: null,
                inertia: null,
                autoScroll: null,

                square: false,
                preserveAspectRatio: false,
                axis: 'xy',

                // use default margin
                margin: NaN,

                // object with props left, right, top, bottom which are
                // true/false values to resize when the pointer is over that edge,
                // CSS selectors to match the handles for each direction
                // or the Elements for each handle
                edges: null,

                // a value of 'none' will limit the resize rect to a minimum of 0x0
                // 'negate' will alow the rect to have negative width/height
                // 'reposition' will keep the width/height positive by swapping
                // the top and bottom edges and/or swapping the left and right edges
                invert: 'none'
            },

            gesture: {
                manualStart: false,
                enabled: false,
                max: Infinity,
                maxPerElement: 1,

                restrict: null
            },

            perAction: {
                manualStart: false,
                max: Infinity,
                maxPerElement: 1,

                snap: {
                    enabled     : false,
                    endOnly     : false,
                    range       : Infinity,
                    targets     : null,
                    offsets     : null,

                    relativePoints: null
                },

                restrict: {
                    enabled: false,
                    endOnly: false
                },

                autoScroll: {
                    enabled     : false,
                    container   : null,     // the item that is scrolled (Window or HTMLElement)
                    margin      : 60,
                    speed       : 300       // the scroll speed in pixels per second
                },

                inertia: {
                    enabled          : false,
                    resistance       : 10,    // the lambda in exponential decay
                    minSpeed         : 100,   // target speed must be above this for inertia to start
                    endSpeed         : 10,    // the speed at which inertia is slow enough to stop
                    allowResume      : true,  // allow resuming an action in inertia phase
                    zeroResumeDelta  : true,  // if an action is resumed after launch, set dx/dy to 0
                    smoothEndDuration: 300    // animate to snap/restrict endOnly if there's no inertia
                }
            },

            _holdDuration: 600
        },

        // Things related to autoScroll
        autoScroll = {
            interaction: null,
            i: null,    // the handle returned by window.setInterval
            x: 0, y: 0, // Direction each pulse is to scroll in

            // scroll the window by the values in scroll.x/y
            scroll: function () {
                var options = autoScroll.interaction.target.options[autoScroll.interaction.prepared.name].autoScroll,
                    container = options.container || getWindow(autoScroll.interaction.element),
                    now = new Date().getTime(),
                    // change in time in seconds
                    dtx = (now - autoScroll.prevTimeX) / 1000,
                    dty = (now - autoScroll.prevTimeY) / 1000,
                    vx, vy, sx, sy;

                // displacement
                if (options.velocity) {
                  vx = options.velocity.x;
                  vy = options.velocity.y;
                }
                else {
                  vx = vy = options.speed
                }
 
                sx = vx * dtx;
                sy = vy * dty;

                if (sx >= 1 || sy >= 1) {
                    if (isWindow(container)) {
                        container.scrollBy(autoScroll.x * sx, autoScroll.y * sy);
                    }
                    else if (container) {
                        container.scrollLeft += autoScroll.x * sx;
                        container.scrollTop  += autoScroll.y * sy;
                    }

                    if (sx >=1) autoScroll.prevTimeX = now;
                    if (sy >= 1) autoScroll.prevTimeY = now;
                }

                if (autoScroll.isScrolling) {
                    cancelFrame(autoScroll.i);
                    autoScroll.i = reqFrame(autoScroll.scroll);
                }
            },

            isScrolling: false,
            prevTimeX: 0,
            prevTimeY: 0,

            start: function (interaction) {
                autoScroll.isScrolling = true;
                cancelFrame(autoScroll.i);

                autoScroll.interaction = interaction;
                autoScroll.prevTimeX = new Date().getTime();
                autoScroll.prevTimeY = new Date().getTime();
                autoScroll.i = reqFrame(autoScroll.scroll);
            },

            stop: function () {
                autoScroll.isScrolling = false;
                cancelFrame(autoScroll.i);
            }
        },

        // Does the browser support touch input?
        supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),

        // Does the browser support PointerEvents
        // Avoid PointerEvent bugs introduced in Chrome 55
        supportsPointerEvent = PointerEvent && !/Chrome/.test(navigator.userAgent),

        // Less Precision with touch input
        margin = supportsTouch || supportsPointerEvent? 20: 10,

        pointerMoveTolerance = 1,

        // for ignoring browser's simulated mouse events
        prevTouchTime = 0,

        // Allow this many interactions to happen simultaneously
        maxInteractions = Infinity,

        // Check if is IE9 or older
        actionCursors = (document.all && !window.atob) ? {
            drag    : 'move',
            resizex : 'e-resize',
            resizey : 's-resize',
            resizexy: 'se-resize',

            resizetop        : 'n-resize',
            resizeleft       : 'w-resize',
            resizebottom     : 's-resize',
            resizeright      : 'e-resize',
            resizetopleft    : 'se-resize',
            resizebottomright: 'se-resize',
            resizetopright   : 'ne-resize',
            resizebottomleft : 'ne-resize',

            gesture : ''
        } : {
            drag    : 'move',
            resizex : 'ew-resize',
            resizey : 'ns-resize',
            resizexy: 'nwse-resize',

            resizetop        : 'ns-resize',
            resizeleft       : 'ew-resize',
            resizebottom     : 'ns-resize',
            resizeright      : 'ew-resize',
            resizetopleft    : 'nwse-resize',
            resizebottomright: 'nwse-resize',
            resizetopright   : 'nesw-resize',
            resizebottomleft : 'nesw-resize',

            gesture : ''
        },

        actionIsEnabled = {
            drag   : true,
            resize : true,
            gesture: true
        },

        // because Webkit and Opera still use 'mousewheel' event type
        wheelEvent = 'onmousewheel' in document? 'mousewheel': 'wheel',

        eventTypes = [
            'dragstart',
            'dragmove',
            'draginertiastart',
            'dragend',
            'dragenter',
            'dragleave',
            'dropactivate',
            'dropdeactivate',
            'dropmove',
            'drop',
            'resizestart',
            'resizemove',
            'resizeinertiastart',
            'resizeend',
            'gesturestart',
            'gesturemove',
            'gestureinertiastart',
            'gestureend',

            'down',
            'move',
            'up',
            'cancel',
            'tap',
            'doubletap',
            'hold'
        ],

        globalEvents = {},

        // Opera Mobile must be handled differently
        isOperaMobile = navigator.appName == 'Opera' &&
            supportsTouch &&
            navigator.userAgent.match('Presto'),

        // scrolling doesn't change the result of getClientRects on iOS 7
        isIOS7 = (/iP(hone|od|ad)/.test(navigator.platform)
                         && /OS 7[^\d]/.test(navigator.appVersion)),

        // prefix matchesSelector
        prefixedMatchesSelector = 'matches' in Element.prototype?
                'matches': 'webkitMatchesSelector' in Element.prototype?
                    'webkitMatchesSelector': 'mozMatchesSelector' in Element.prototype?
                        'mozMatchesSelector': 'oMatchesSelector' in Element.prototype?
                            'oMatchesSelector': 'msMatchesSelector',

        // will be polyfill function if browser is IE8
        ie8MatchesSelector,

        // native requestAnimationFrame or polyfill
        reqFrame = realWindow.requestAnimationFrame,
        cancelFrame = realWindow.cancelAnimationFrame,

        // Events wrapper
        events = (function () {
            var useAttachEvent = ('attachEvent' in window) && !('addEventListener' in window),
                addEvent       = useAttachEvent?  'attachEvent': 'addEventListener',
                removeEvent    = useAttachEvent?  'detachEvent': 'removeEventListener',
                on             = useAttachEvent? 'on': '',

                elements          = [],
                targets           = [],
                attachedListeners = [];

            function add (element, type, listener, useCapture) {
                var elementIndex = indexOf(elements, element),
                    target = targets[elementIndex];

                if (!target) {
                    target = {
                        events: {},
                        typeCount: 0
                    };

                    elementIndex = elements.push(element) - 1;
                    targets.push(target);

                    attachedListeners.push((useAttachEvent ? {
                            supplied: [],
                            wrapped : [],
                            useCount: []
                        } : null));
                }

                if (!target.events[type]) {
                    target.events[type] = [];
                    target.typeCount++;
                }

                if (!contains(target.events[type], listener)) {
                    var ret;

                    if (useAttachEvent) {
                        var listeners = attachedListeners[elementIndex],
                            listenerIndex = indexOf(listeners.supplied, listener);

                        var wrapped = listeners.wrapped[listenerIndex] || function (event) {
                            if (!event.immediatePropagationStopped) {
                                event.target = event.srcElement;
                                event.currentTarget = element;

                                event.preventDefault = event.preventDefault || preventDef;
                                event.stopPropagation = event.stopPropagation || stopProp;
                                event.stopImmediatePropagation = event.stopImmediatePropagation || stopImmProp;

                                if (/mouse|click/.test(event.type)) {
                                    event.pageX = event.clientX + getWindow(element).document.documentElement.scrollLeft;
                                    event.pageY = event.clientY + getWindow(element).document.documentElement.scrollTop;
                                }

                                listener(event);
                            }
                        };

                        ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

                        if (listenerIndex === -1) {
                            listeners.supplied.push(listener);
                            listeners.wrapped.push(wrapped);
                            listeners.useCount.push(1);
                        }
                        else {
                            listeners.useCount[listenerIndex]++;
                        }
                    }
                    else {
                        ret = element[addEvent](type, listener, useCapture || false);
                    }
                    target.events[type].push(listener);

                    return ret;
                }
            }

            function remove (element, type, listener, useCapture) {
                var i,
                    elementIndex = indexOf(elements, element),
                    target = targets[elementIndex],
                    listeners,
                    listenerIndex,
                    wrapped = listener;

                if (!target || !target.events) {
                    return;
                }

                if (useAttachEvent) {
                    listeners = attachedListeners[elementIndex];
                    listenerIndex = indexOf(listeners.supplied, listener);
                    wrapped = listeners.wrapped[listenerIndex];
                }

                if (type === 'all') {
                    for (type in target.events) {
                        if (target.events.hasOwnProperty(type)) {
                            remove(element, type, 'all');
                        }
                    }
                    return;
                }

                if (target.events[type]) {
                    var len = target.events[type].length;

                    if (listener === 'all') {
                        for (i = 0; i < len; i++) {
                            remove(element, type, target.events[type][i], Boolean(useCapture));
                        }
                        return;
                    } else {
                        for (i = 0; i < len; i++) {
                            if (target.events[type][i] === listener) {
                                element[removeEvent](on + type, wrapped, useCapture || false);
                                target.events[type].splice(i, 1);

                                if (useAttachEvent && listeners) {
                                    listeners.useCount[listenerIndex]--;
                                    if (listeners.useCount[listenerIndex] === 0) {
                                        listeners.supplied.splice(listenerIndex, 1);
                                        listeners.wrapped.splice(listenerIndex, 1);
                                        listeners.useCount.splice(listenerIndex, 1);
                                    }
                                }

                                break;
                            }
                        }
                    }

                    if (target.events[type] && target.events[type].length === 0) {
                        target.events[type] = null;
                        target.typeCount--;
                    }
                }

                if (!target.typeCount) {
                    targets.splice(elementIndex, 1);
                    elements.splice(elementIndex, 1);
                    attachedListeners.splice(elementIndex, 1);
                }
            }

            function preventDef () {
                this.returnValue = false;
            }

            function stopProp () {
                this.cancelBubble = true;
            }

            function stopImmProp () {
                this.cancelBubble = true;
                this.immediatePropagationStopped = true;
            }

            return {
                add: add,
                remove: remove,
                useAttachEvent: useAttachEvent,

                _elements: elements,
                _targets: targets,
                _attachedListeners: attachedListeners
            };
        }());

    function blank () {}

    function isElement (o) {
        if (!o || (typeof o !== 'object')) { return false; }

        var _window = getWindow(o) || window;

        return (/object|function/.test(typeof _window.Element)
            ? o instanceof _window.Element //DOM2
            : o.nodeType === 1 && typeof o.nodeName === "string");
    }
    function isWindow (thing) { return thing === window || !!(thing && thing.Window) && (thing instanceof thing.Window); }
    function isDocFrag (thing) { return !!thing && thing instanceof DocumentFragment; }
    function isArray (thing) {
        return isObject(thing)
                && (typeof thing.length !== undefined)
                && isFunction(thing.splice);
    }
    function isObject   (thing) { return !!thing && (typeof thing === 'object'); }
    function isFunction (thing) { return typeof thing === 'function'; }
    function isNumber   (thing) { return typeof thing === 'number'  ; }
    function isBool     (thing) { return typeof thing === 'boolean' ; }
    function isString   (thing) { return typeof thing === 'string'  ; }

    function trySelector (value) {
        if (!isString(value)) { return false; }

        // an exception will be raised if it is invalid
        document.querySelector(value);
        return true;
    }

    function extend (dest, source) {
        for (var prop in source) {
            dest[prop] = source[prop];
        }
        return dest;
    }

    var prefixedPropREs = {
      webkit: /(Movement[XY]|Radius[XY]|RotationAngle|Force)$/
    };

    function pointerExtend (dest, source) {
        for (var prop in source) {
          var deprecated = false;

          // skip deprecated prefixed properties
          for (var vendor in prefixedPropREs) {
            if (prop.indexOf(vendor) === 0 && prefixedPropREs[vendor].test(prop)) {
              deprecated = true;
              break;
            }
          }

          if (!deprecated) {
            dest[prop] = source[prop];
          }
        }
        return dest;
    }

    function copyCoords (dest, src) {
        dest.page = dest.page || {};
        dest.page.x = src.page.x;
        dest.page.y = src.page.y;

        dest.client = dest.client || {};
        dest.client.x = src.client.x;
        dest.client.y = src.client.y;

        dest.timeStamp = src.timeStamp;
    }

    function setEventXY (targetObj, pointers, interaction) {
        var pointer = (pointers.length > 1
                       ? pointerAverage(pointers)
                       : pointers[0]);

        getPageXY(pointer, tmpXY, interaction);
        targetObj.page.x = tmpXY.x;
        targetObj.page.y = tmpXY.y;

        getClientXY(pointer, tmpXY, interaction);
        targetObj.client.x = tmpXY.x;
        targetObj.client.y = tmpXY.y;

        targetObj.timeStamp = new Date().getTime();
    }

    function setEventDeltas (targetObj, prev, cur) {
        targetObj.page.x     = cur.page.x      - prev.page.x;
        targetObj.page.y     = cur.page.y      - prev.page.y;
        targetObj.client.x   = cur.client.x    - prev.client.x;
        targetObj.client.y   = cur.client.y    - prev.client.y;
        targetObj.timeStamp = new Date().getTime() - prev.timeStamp;

        // set pointer velocity
        var dt = Math.max(targetObj.timeStamp / 1000, 0.001);
        targetObj.page.speed   = hypot(targetObj.page.x, targetObj.page.y) / dt;
        targetObj.page.vx      = targetObj.page.x / dt;
        targetObj.page.vy      = targetObj.page.y / dt;

        targetObj.client.speed = hypot(targetObj.client.x, targetObj.page.y) / dt;
        targetObj.client.vx    = targetObj.client.x / dt;
        targetObj.client.vy    = targetObj.client.y / dt;
    }

    function isNativePointer (pointer) {
        return (pointer instanceof window.Event
            || (supportsTouch && window.Touch && pointer instanceof window.Touch));
    }

    // Get specified X/Y coords for mouse or event.touches[0]
    function getXY (type, pointer, xy) {
        xy = xy || {};
        type = type || 'page';

        xy.x = pointer[type + 'X'];
        xy.y = pointer[type + 'Y'];

        return xy;
    }

    function getPageXY (pointer, page) {
        page = page || {};

        // Opera Mobile handles the viewport and scrolling oddly
        if (isOperaMobile && isNativePointer(pointer)) {
            getXY('screen', pointer, page);

            page.x += window.scrollX;
            page.y += window.scrollY;
        }
        else {
            getXY('page', pointer, page);
        }

        return page;
    }

    function getClientXY (pointer, client) {
        client = client || {};

        if (isOperaMobile && isNativePointer(pointer)) {
            // Opera Mobile handles the viewport and scrolling oddly
            getXY('screen', pointer, client);
        }
        else {
          getXY('client', pointer, client);
        }

        return client;
    }

    function getScrollXY (win) {
        win = win || window;
        return {
            x: win.scrollX || win.document.documentElement.scrollLeft,
            y: win.scrollY || win.document.documentElement.scrollTop
        };
    }

    function getPointerId (pointer) {
        return isNumber(pointer.pointerId)? pointer.pointerId : pointer.identifier;
    }

    function getActualElement (element) {
        return (element instanceof SVGElementInstance
            ? element.correspondingUseElement
            : element);
    }

    function getWindow (node) {
        if (isWindow(node)) {
            return node;
        }

        var rootNode = (node.ownerDocument || node);

        return rootNode.defaultView || rootNode.parentWindow || window;
    }

    function getElementClientRect (element) {
        var clientRect = (element instanceof SVGElement
                            ? element.getBoundingClientRect()
                            : element.getClientRects()[0]);

        return clientRect && {
            left  : clientRect.left,
            right : clientRect.right,
            top   : clientRect.top,
            bottom: clientRect.bottom,
            width : clientRect.width || clientRect.right - clientRect.left,
            height: clientRect.height || clientRect.bottom - clientRect.top
        };
    }

    function getElementRect (element) {
        var clientRect = getElementClientRect(element);

        if (!isIOS7 && clientRect) {
            var scroll = getScrollXY(getWindow(element));

            clientRect.left   += scroll.x;
            clientRect.right  += scroll.x;
            clientRect.top    += scroll.y;
            clientRect.bottom += scroll.y;
        }

        return clientRect;
    }

    function getTouchPair (event) {
        var touches = [];

        // array of touches is supplied
        if (isArray(event)) {
            touches[0] = event[0];
            touches[1] = event[1];
        }
        // an event
        else {
            if (event.type === 'touchend') {
                if (event.touches.length === 1) {
                    touches[0] = event.touches[0];
                    touches[1] = event.changedTouches[0];
                }
                else if (event.touches.length === 0) {
                    touches[0] = event.changedTouches[0];
                    touches[1] = event.changedTouches[1];
                }
            }
            else {
                touches[0] = event.touches[0];
                touches[1] = event.touches[1];
            }
        }

        return touches;
    }

    function pointerAverage (pointers) {
        var average = {
            pageX  : 0,
            pageY  : 0,
            clientX: 0,
            clientY: 0,
            screenX: 0,
            screenY: 0
        };
        var prop;

        for (var i = 0; i < pointers.length; i++) {
            for (prop in average) {
                average[prop] += pointers[i][prop];
            }
        }
        for (prop in average) {
            average[prop] /= pointers.length;
        }

        return average;
    }

    function touchBBox (event) {
        if (!event.length && !(event.touches && event.touches.length > 1)) {
            return;
        }

        var touches = getTouchPair(event),
            minX = Math.min(touches[0].pageX, touches[1].pageX),
            minY = Math.min(touches[0].pageY, touches[1].pageY),
            maxX = Math.max(touches[0].pageX, touches[1].pageX),
            maxY = Math.max(touches[0].pageY, touches[1].pageY);

        return {
            x: minX,
            y: minY,
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    function touchDistance (event, deltaSource) {
        deltaSource = deltaSource || defaultOptions.deltaSource;

        var sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event);


        var dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY];

        return hypot(dx, dy);
    }

    function touchAngle (event, prevAngle, deltaSource) {
        deltaSource = deltaSource || defaultOptions.deltaSource;

        var sourceX = deltaSource + 'X',
            sourceY = deltaSource + 'Y',
            touches = getTouchPair(event),
            dx = touches[0][sourceX] - touches[1][sourceX],
            dy = touches[0][sourceY] - touches[1][sourceY],
            angle = 180 * Math.atan(dy / dx) / Math.PI;

        if (isNumber(prevAngle)) {
            var dr = angle - prevAngle,
                drClamped = dr % 360;

            if (drClamped > 315) {
                angle -= 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped > 135) {
                angle -= 180 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -315) {
                angle += 360 + (angle / 360)|0 * 360;
            }
            else if (drClamped < -135) {
                angle += 180 + (angle / 360)|0 * 360;
            }
        }

        return  angle;
    }

    function getOriginXY (interactable, element) {
        var origin = interactable
                ? interactable.options.origin
                : defaultOptions.origin;

        if (origin === 'parent') {
            origin = parentElement(element);
        }
        else if (origin === 'self') {
            origin = interactable.getRect(element);
        }
        else if (trySelector(origin)) {
            origin = closest(element, origin) || { x: 0, y: 0 };
        }

        if (isFunction(origin)) {
            origin = origin(interactable && element);
        }

        if (isElement(origin))  {
            origin = getElementRect(origin);
        }

        origin.x = ('x' in origin)? origin.x : origin.left;
        origin.y = ('y' in origin)? origin.y : origin.top;

        return origin;
    }

    // http://stackoverflow.com/a/5634528/2280888
    function _getQBezierValue(t, p1, p2, p3) {
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    }

    function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
        return {
            x:  _getQBezierValue(position, startX, cpX, endX),
            y:  _getQBezierValue(position, startY, cpY, endY)
        };
    }

    // http://gizma.com/easing/
    function easeOutQuad (t, b, c, d) {
        t /= d;
        return -c * t*(t-2) + b;
    }

    function nodeContains (parent, child) {
        while (child) {
            if (child === parent) {
                return true;
            }

            child = child.parentNode;
        }

        return false;
    }

    function closest (child, selector) {
        var parent = parentElement(child);

        while (isElement(parent)) {
            if (matchesSelector(parent, selector)) { return parent; }

            parent = parentElement(parent);
        }

        return null;
    }

    function parentElement (node) {
        var parent = node.parentNode;

        if (isDocFrag(parent)) {
            // skip past #shado-root fragments
            while ((parent = parent.host) && isDocFrag(parent)) {}

            return parent;
        }

        return parent;
    }

    function inContext (interactable, element) {
        return interactable._context === element.ownerDocument
                || nodeContains(interactable._context, element);
    }

    function testIgnore (interactable, interactableElement, element) {
        var ignoreFrom = interactable.options.ignoreFrom;

        if (!ignoreFrom || !isElement(element)) { return false; }

        if (isString(ignoreFrom)) {
            return matchesUpTo(element, ignoreFrom, interactableElement);
        }
        else if (isElement(ignoreFrom)) {
            return nodeContains(ignoreFrom, element);
        }

        return false;
    }

    function testAllow (interactable, interactableElement, element) {
        var allowFrom = interactable.options.allowFrom;

        if (!allowFrom) { return true; }

        if (!isElement(element)) { return false; }

        if (isString(allowFrom)) {
            return matchesUpTo(element, allowFrom, interactableElement);
        }
        else if (isElement(allowFrom)) {
            return nodeContains(allowFrom, element);
        }

        return false;
    }

    function checkAxis (axis, interactable) {
        if (!interactable) { return false; }

        var thisAxis = interactable.options.drag.axis;

        return (axis === 'xy' || thisAxis === 'xy' || thisAxis === axis);
    }

    function checkSnap (interactable, action) {
        var options = interactable.options;

        if (/^resize/.test(action)) {
            action = 'resize';
        }

        return options[action].snap && options[action].snap.enabled;
    }

    function checkRestrict (interactable, action) {
        var options = interactable.options;

        if (/^resize/.test(action)) {
            action = 'resize';
        }

        return  options[action].restrict && options[action].restrict.enabled;
    }

    function checkAutoScroll (interactable, action) {
        var options = interactable.options;

        if (/^resize/.test(action)) {
            action = 'resize';
        }

        return  options[action].autoScroll && options[action].autoScroll.enabled;
    }

    function withinInteractionLimit (interactable, element, action) {
        var options = interactable.options,
            maxActions = options[action.name].max,
            maxPerElement = options[action.name].maxPerElement,
            activeInteractions = 0,
            targetCount = 0,
            targetElementCount = 0;

        for (var i = 0, len = interactions.length; i < len; i++) {
            var interaction = interactions[i],
                otherAction = interaction.prepared.name,
                active = interaction.interacting();

            if (!active) { continue; }

            activeInteractions++;

            if (activeInteractions >= maxInteractions) {
                return false;
            }

            if (interaction.target !== interactable) { continue; }

            targetCount += (otherAction === action.name)|0;

            if (targetCount >= maxActions) {
                return false;
            }

            if (interaction.element === element) {
                targetElementCount++;

                if (otherAction !== action.name || targetElementCount >= maxPerElement) {
                    return false;
                }
            }
        }

        return maxInteractions > 0;
    }

    // Test for the element that's "above" all other qualifiers
    function indexOfDeepestElement (elements) {
        var dropzone,
            deepestZone = elements[0],
            index = deepestZone? 0: -1,
            parent,
            deepestZoneParents = [],
            dropzoneParents = [],
            child,
            i,
            n;

        for (i = 1; i < elements.length; i++) {
            dropzone = elements[i];

            // an element might belong to multiple selector dropzones
            if (!dropzone || dropzone === deepestZone) {
                continue;
            }

            if (!deepestZone) {
                deepestZone = dropzone;
                index = i;
                continue;
            }

            // check if the deepest or current are document.documentElement or document.rootElement
            // - if the current dropzone is, do nothing and continue
            if (dropzone.parentNode === dropzone.ownerDocument) {
                continue;
            }
            // - if deepest is, update with the current dropzone and continue to next
            else if (deepestZone.parentNode === dropzone.ownerDocument) {
                deepestZone = dropzone;
                index = i;
                continue;
            }

            if (!deepestZoneParents.length) {
                parent = deepestZone;
                while (parent.parentNode && parent.parentNode !== parent.ownerDocument) {
                    deepestZoneParents.unshift(parent);
                    parent = parent.parentNode;
                }
            }

            // if this element is an svg element and the current deepest is
            // an HTMLElement
            if (deepestZone instanceof HTMLElement
                && dropzone instanceof SVGElement
                && !(dropzone instanceof SVGSVGElement)) {

                if (dropzone === deepestZone.parentNode) {
                    continue;
                }

                parent = dropzone.ownerSVGElement;
            }
            else {
                parent = dropzone;
            }

            dropzoneParents = [];

            while (parent.parentNode !== parent.ownerDocument) {
                dropzoneParents.unshift(parent);
                parent = parent.parentNode;
            }

            n = 0;

            // get (position of last common ancestor) + 1
            while (dropzoneParents[n] && dropzoneParents[n] === deepestZoneParents[n]) {
                n++;
            }

            var parents = [
                dropzoneParents[n - 1],
                dropzoneParents[n],
                deepestZoneParents[n]
            ];

            child = parents[0].lastChild;

            while (child) {
                if (child === parents[1]) {
                    deepestZone = dropzone;
                    index = i;
                    deepestZoneParents = [];

                    break;
                }
                else if (child === parents[2]) {
                    break;
                }

                child = child.previousSibling;
            }
        }

        return index;
    }

    function Interaction () {
        this.target          = null; // current interactable being interacted with
        this.element         = null; // the target element of the interactable
        this.dropTarget      = null; // the dropzone a drag target might be dropped into
        this.dropElement     = null; // the element at the time of checking
        this.prevDropTarget  = null; // the dropzone that was recently dragged away from
        this.prevDropElement = null; // the element at the time of checking

        this.prepared        = {     // action that's ready to be fired on next move event
            name : null,
            axis : null,
            edges: null
        };

        this.matches         = [];   // all selectors that are matched by target element
        this.matchElements   = [];   // corresponding elements

        this.inertiaStatus = {
            active       : false,
            smoothEnd    : false,
            ending       : false,

            startEvent: null,
            upCoords: {},

            xe: 0, ye: 0,
            sx: 0, sy: 0,

            t0: 0,
            vx0: 0, vys: 0,
            duration: 0,

            resumeDx: 0,
            resumeDy: 0,

            lambda_v0: 0,
            one_ve_v0: 0,
            i  : null
        };

        if (isFunction(Function.prototype.bind)) {
            this.boundInertiaFrame = this.inertiaFrame.bind(this);
            this.boundSmoothEndFrame = this.smoothEndFrame.bind(this);
        }
        else {
            var that = this;

            this.boundInertiaFrame = function () { return that.inertiaFrame(); };
            this.boundSmoothEndFrame = function () { return that.smoothEndFrame(); };
        }

        this.activeDrops = {
            dropzones: [],      // the dropzones that are mentioned below
            elements : [],      // elements of dropzones that accept the target draggable
            rects    : []       // the rects of the elements mentioned above
        };

        // keep track of added pointers
        this.pointers    = [];
        this.pointerIds  = [];
        this.downTargets = [];
        this.downTimes   = [];
        this.holdTimers  = [];

        // Previous native pointer move event coordinates
        this.prevCoords = {
            page     : { x: 0, y: 0 },
            client   : { x: 0, y: 0 },
            timeStamp: 0
        };
        // current native pointer move event coordinates
        this.curCoords = {
            page     : { x: 0, y: 0 },
            client   : { x: 0, y: 0 },
            timeStamp: 0
        };

        // Starting InteractEvent pointer coordinates
        this.startCoords = {
            page     : { x: 0, y: 0 },
            client   : { x: 0, y: 0 },
            timeStamp: 0
        };

        // Change in coordinates and time of the pointer
        this.pointerDelta = {
            page     : { x: 0, y: 0, vx: 0, vy: 0, speed: 0 },
            client   : { x: 0, y: 0, vx: 0, vy: 0, speed: 0 },
            timeStamp: 0
        };

        this.downEvent   = null;    // pointerdown/mousedown/touchstart event
        this.downPointer = {};

        this._eventTarget    = null;
        this._curEventTarget = null;

        this.prevEvent = null;      // previous action event
        this.tapTime   = 0;         // time of the most recent tap event
        this.prevTap   = null;

        this.startOffset    = { left: 0, right: 0, top: 0, bottom: 0 };
        this.restrictOffset = { left: 0, right: 0, top: 0, bottom: 0 };
        this.snapOffsets    = [];

        this.gesture = {
            start: { x: 0, y: 0 },

            startDistance: 0,   // distance between two touches of touchStart
            prevDistance : 0,
            distance     : 0,

            scale: 1,           // gesture.distance / gesture.startDistance

            startAngle: 0,      // angle of line joining two touches
            prevAngle : 0       // angle of the previous gesture event
        };

        this.snapStatus = {
            x       : 0, y       : 0,
            dx      : 0, dy      : 0,
            realX   : 0, realY   : 0,
            snappedX: 0, snappedY: 0,
            targets : [],
            locked  : false,
            changed : false
        };

        this.restrictStatus = {
            dx         : 0, dy         : 0,
            restrictedX: 0, restrictedY: 0,
            snap       : null,
            restricted : false,
            changed    : false
        };

        this.restrictStatus.snap = this.snapStatus;

        this.pointerIsDown   = false;
        this.pointerWasMoved = false;
        this.gesturing       = false;
        this.dragging        = false;
        this.resizing        = false;
        this.resizeAxes      = 'xy';

        this.mouse = false;

        interactions.push(this);
    }

    Interaction.prototype = {
        getPageXY  : function (pointer, xy) { return   getPageXY(pointer, xy, this); },
        getClientXY: function (pointer, xy) { return getClientXY(pointer, xy, this); },
        setEventXY : function (target, ptr) { return  setEventXY(target, ptr, this); },

        pointerOver: function (pointer, event, eventTarget) {
            if (this.prepared.name || !this.mouse) { return; }

            var curMatches = [],
                curMatchElements = [],
                prevTargetElement = this.element;

            this.addPointer(pointer);

            if (this.target
                && (testIgnore(this.target, this.element, eventTarget)
                    || !testAllow(this.target, this.element, eventTarget))) {
                // if the eventTarget should be ignored or shouldn't be allowed
                // clear the previous target
                this.target = null;
                this.element = null;
                this.matches = [];
                this.matchElements = [];
            }

            var elementInteractable = interactables.get(eventTarget),
                elementAction = (elementInteractable
                                 && !testIgnore(elementInteractable, eventTarget, eventTarget)
                                 && testAllow(elementInteractable, eventTarget, eventTarget)
                                 && validateAction(
                                     elementInteractable.getAction(pointer, event, this, eventTarget),
                                     elementInteractable));

            if (elementAction && !withinInteractionLimit(elementInteractable, eventTarget, elementAction)) {
                 elementAction = null;
            }

            function pushCurMatches (interactable, selector) {
                if (interactable
                    && inContext(interactable, eventTarget)
                    && !testIgnore(interactable, eventTarget, eventTarget)
                    && testAllow(interactable, eventTarget, eventTarget)
                    && matchesSelector(eventTarget, selector)) {

                    curMatches.push(interactable);
                    curMatchElements.push(eventTarget);
                }
            }

            if (elementAction) {
                this.target = elementInteractable;
                this.element = eventTarget;
                this.matches = [];
                this.matchElements = [];
            }
            else {
                interactables.forEachSelector(pushCurMatches);

                if (this.validateSelector(pointer, event, curMatches, curMatchElements)) {
                    this.matches = curMatches;
                    this.matchElements = curMatchElements;

                    this.pointerHover(pointer, event, this.matches, this.matchElements);
                    events.add(eventTarget,
                                        supportsPointerEvent? pEventTypes.move : 'mousemove',
                                        listeners.pointerHover);
                }
                else if (this.target) {
                    if (nodeContains(prevTargetElement, eventTarget)) {
                        this.pointerHover(pointer, event, this.matches, this.matchElements);
                        events.add(this.element,
                                            supportsPointerEvent? pEventTypes.move : 'mousemove',
                                            listeners.pointerHover);
                    }
                    else {
                        this.target = null;
                        this.element = null;
                        this.matches = [];
                        this.matchElements = [];
                    }
                }
            }
        },

        // Check what action would be performed on pointerMove target if a mouse
        // button were pressed and change the cursor accordingly
        pointerHover: function (pointer, event, eventTarget, curEventTarget, matches, matchElements) {
            var target = this.target;

            if (!this.prepared.name && this.mouse) {

                var action;

                // update pointer coords for defaultActionChecker to use
                this.setEventXY(this.curCoords, [pointer]);

                if (matches) {
                    action = this.validateSelector(pointer, event, matches, matchElements);
                }
                else if (target) {
                    action = validateAction(target.getAction(this.pointers[0], event, this, this.element), this.target);
                }

                if (target && target.options.styleCursor) {
                    if (action) {
                        target._doc.documentElement.style.cursor = getActionCursor(action);
                    }
                    else {
                        target._doc.documentElement.style.cursor = '';
                    }
                }
            }
            else if (this.prepared.name) {
                this.checkAndPreventDefault(event, target, this.element);
            }
        },

        pointerOut: function (pointer, event, eventTarget) {
            if (this.prepared.name) { return; }

            // Remove temporary event listeners for selector Interactables
            if (!interactables.get(eventTarget)) {
                events.remove(eventTarget,
                                       supportsPointerEvent? pEventTypes.move : 'mousemove',
                                       listeners.pointerHover);
            }

            if (this.target && this.target.options.styleCursor && !this.interacting()) {
                this.target._doc.documentElement.style.cursor = '';
            }
        },

        selectorDown: function (pointer, event, eventTarget, curEventTarget) {
            var that = this,
                // copy event to be used in timeout for IE8
                eventCopy = events.useAttachEvent? extend({}, event) : event,
                element = eventTarget,
                pointerIndex = this.addPointer(pointer),
                action;

            this.holdTimers[pointerIndex] = setTimeout(function () {
                that.pointerHold(events.useAttachEvent? eventCopy : pointer, eventCopy, eventTarget, curEventTarget);
            }, defaultOptions._holdDuration);

            this.pointerIsDown = true;

            // Check if the down event hits the current inertia target
            if (this.inertiaStatus.active && this.target.selector) {
                // climb up the DOM tree from the event target
                while (isElement(element)) {

                    // if this element is the current inertia target element
                    if (element === this.element
                        // and the prospective action is the same as the ongoing one
                        && validateAction(this.target.getAction(pointer, event, this, this.element), this.target).name === this.prepared.name) {

                        // stop inertia so that the next move will be a normal one
                        cancelFrame(this.inertiaStatus.i);
                        this.inertiaStatus.active = false;

                        this.collectEventTargets(pointer, event, eventTarget, 'down');
                        return;
                    }
                    element = parentElement(element);
                }
            }

            // do nothing if interacting
            if (this.interacting()) {
                this.collectEventTargets(pointer, event, eventTarget, 'down');
                return;
            }

            function pushMatches (interactable, selector, context) {
                var elements = ie8MatchesSelector
                    ? context.querySelectorAll(selector)
                    : undefined;

                if (inContext(interactable, element)
                    && !testIgnore(interactable, element, eventTarget)
                    && testAllow(interactable, element, eventTarget)
                    && matchesSelector(element, selector, elements)) {

                    that.matches.push(interactable);
                    that.matchElements.push(element);
                }
            }

            // update pointer coords for defaultActionChecker to use
            this.setEventXY(this.curCoords, [pointer]);
            this.downEvent = event;

            while (isElement(element) && !action) {
                this.matches = [];
                this.matchElements = [];

                interactables.forEachSelector(pushMatches);

                action = this.validateSelector(pointer, event, this.matches, this.matchElements);
                element = parentElement(element);
            }

            if (action) {
                this.prepared.name  = action.name;
                this.prepared.axis  = action.axis;
                this.prepared.edges = action.edges;

                this.collectEventTargets(pointer, event, eventTarget, 'down');

                return this.pointerDown(pointer, event, eventTarget, curEventTarget, action);
            }
            else {
                // do these now since pointerDown isn't being called from here
                this.downTimes[pointerIndex] = new Date().getTime();
                this.downTargets[pointerIndex] = eventTarget;
                pointerExtend(this.downPointer, pointer);

                copyCoords(this.prevCoords, this.curCoords);
                this.pointerWasMoved = false;
            }

            this.collectEventTargets(pointer, event, eventTarget, 'down');
        },

        // Determine action to be performed on next pointerMove and add appropriate
        // style and event Listeners
        pointerDown: function (pointer, event, eventTarget, curEventTarget, forceAction) {
            if (!forceAction && !this.inertiaStatus.active && this.pointerWasMoved && this.prepared.name) {
                this.checkAndPreventDefault(event, this.target, this.element);

                return;
            }

            this.pointerIsDown = true;
            this.downEvent = event;

            var pointerIndex = this.addPointer(pointer),
                action;

            // If it is the second touch of a multi-touch gesture, keep the
            // target the same and get a new action if a target was set by the
            // first touch
            if (this.pointerIds.length > 1 && this.target._element === this.element) {
                var newAction = validateAction(forceAction || this.target.getAction(pointer, event, this, this.element), this.target);

                if (withinInteractionLimit(this.target, this.element, newAction)) {
                    action = newAction;
                }

                this.prepared.name = null;
            }
            // Otherwise, set the target if there is no action prepared
            else if (!this.prepared.name) {
                var interactable = interactables.get(curEventTarget);

                if (interactable
                    && !testIgnore(interactable, curEventTarget, eventTarget)
                    && testAllow(interactable, curEventTarget, eventTarget)
                    && (action = validateAction(forceAction || interactable.getAction(pointer, event, this, curEventTarget), interactable, eventTarget))
                    && withinInteractionLimit(interactable, curEventTarget, action)) {
                    this.target = interactable;
                    this.element = curEventTarget;
                }
            }

            var target = this.target,
                options = target && target.options;

            if (target && (forceAction || !this.prepared.name)) {
                action = action || validateAction(forceAction || target.getAction(pointer, event, this, curEventTarget), target, this.element);

                this.setEventXY(this.startCoords, this.pointers);

                if (!action) { return; }

                if (options.styleCursor) {
                    target._doc.documentElement.style.cursor = getActionCursor(action);
                }

                this.resizeAxes = action.name === 'resize'? action.axis : null;

                if (action === 'gesture' && this.pointerIds.length < 2) {
                    action = null;
                }

                this.prepared.name  = action.name;
                this.prepared.axis  = action.axis;
                this.prepared.edges = action.edges;

                this.snapStatus.snappedX = this.snapStatus.snappedY =
                    this.restrictStatus.restrictedX = this.restrictStatus.restrictedY = NaN;

                this.downTimes[pointerIndex] = new Date().getTime();
                this.downTargets[pointerIndex] = eventTarget;
                pointerExtend(this.downPointer, pointer);

                copyCoords(this.prevCoords, this.startCoords);
                this.pointerWasMoved = false;

                this.checkAndPreventDefault(event, target, this.element);
            }
            // if inertia is active try to resume action
            else if (this.inertiaStatus.active
                && curEventTarget === this.element
                && validateAction(target.getAction(pointer, event, this, this.element), target).name === this.prepared.name) {

                cancelFrame(this.inertiaStatus.i);
                this.inertiaStatus.active = false;

                this.checkAndPreventDefault(event, target, this.element);
            }
        },

        setModifications: function (coords, preEnd) {
            var target         = this.target,
                shouldMove     = true,
                shouldSnap     = checkSnap(target, this.prepared.name)     && (!target.options[this.prepared.name].snap.endOnly     || preEnd),
                shouldRestrict = checkRestrict(target, this.prepared.name) && (!target.options[this.prepared.name].restrict.endOnly || preEnd);

            if (shouldSnap    ) { this.setSnapping   (coords); } else { this.snapStatus    .locked     = false; }
            if (shouldRestrict) { this.setRestriction(coords); } else { this.restrictStatus.restricted = false; }

            if (shouldSnap && this.snapStatus.locked && !this.snapStatus.changed) {
                shouldMove = shouldRestrict && this.restrictStatus.restricted && this.restrictStatus.changed;
            }
            else if (shouldRestrict && this.restrictStatus.restricted && !this.restrictStatus.changed) {
                shouldMove = false;
            }

            return shouldMove;
        },

        setStartOffsets: function (action, interactable, element) {
            var rect = interactable.getRect(element),
                origin = getOriginXY(interactable, element),
                snap = interactable.options[this.prepared.name].snap,
                restrict = interactable.options[this.prepared.name].restrict,
                width, height;

            if (rect) {
                this.startOffset.left = this.startCoords.page.x - rect.left;
                this.startOffset.top  = this.startCoords.page.y - rect.top;

                this.startOffset.right  = rect.right  - this.startCoords.page.x;
                this.startOffset.bottom = rect.bottom - this.startCoords.page.y;

                if ('width' in rect) { width = rect.width; }
                else { width = rect.right - rect.left; }
                if ('height' in rect) { height = rect.height; }
                else { height = rect.bottom - rect.top; }
            }
            else {
                this.startOffset.left = this.startOffset.top = this.startOffset.right = this.startOffset.bottom = 0;
            }

            this.snapOffsets.splice(0);

            var snapOffset = snap && snap.offset === 'startCoords'
                                ? {
                                    x: this.startCoords.page.x - origin.x,
                                    y: this.startCoords.page.y - origin.y
                                }
                                : snap && snap.offset || { x: 0, y: 0 };

            if (rect && snap && snap.relativePoints && snap.relativePoints.length) {
                for (var i = 0; i < snap.relativePoints.length; i++) {
                    this.snapOffsets.push({
                        x: this.startOffset.left - (width  * snap.relativePoints[i].x) + snapOffset.x,
                        y: this.startOffset.top  - (height * snap.relativePoints[i].y) + snapOffset.y
                    });
                }
            }
            else {
                this.snapOffsets.push(snapOffset);
            }

            if (rect && restrict.elementRect) {
                this.restrictOffset.left = this.startOffset.left - (width  * restrict.elementRect.left);
                this.restrictOffset.top  = this.startOffset.top  - (height * restrict.elementRect.top);

                this.restrictOffset.right  = this.startOffset.right  - (width  * (1 - restrict.elementRect.right));
                this.restrictOffset.bottom = this.startOffset.bottom - (height * (1 - restrict.elementRect.bottom));
            }
            else {
                this.restrictOffset.left = this.restrictOffset.top = this.restrictOffset.right = this.restrictOffset.bottom = 0;
            }
        },

        /*\
         * Interaction.start
         [ method ]
         *
         * Start an action with the given Interactable and Element as tartgets. The
         * action must be enabled for the target Interactable and an appropriate number
         * of pointers must be held down – 1 for drag/resize, 2 for gesture.
         *
         * Use it with `interactable.<action>able({ manualStart: false })` to always
         * [start actions manually](https://github.com/taye/interact.js/issues/114)
         *
         - action       (object)  The action to be performed - drag, resize, etc.
         - interactable (Interactable) The Interactable to target
         - element      (Element) The DOM Element to target
         = (object) interact
         **
         | interact(target)
         |   .draggable({
         |     // disable the default drag start by down->move
         |     manualStart: true
         |   })
         |   // start dragging after the user holds the pointer down
         |   .on('hold', function (event) {
         |     var interaction = event.interaction;
         |
         |     if (!interaction.interacting()) {
         |       interaction.start({ name: 'drag' },
         |                         event.interactable,
         |                         event.currentTarget);
         |     }
         | });
        \*/
        start: function (action, interactable, element) {
            if (this.interacting()
                || !this.pointerIsDown
                || this.pointerIds.length < (action.name === 'gesture'? 2 : 1)) {
                return;
            }

            // if this interaction had been removed after stopping
            // add it back
            if (indexOf(interactions, this) === -1) {
                interactions.push(this);
            }

            // set the startCoords if there was no prepared action
            if (!this.prepared.name) {
                this.setEventXY(this.startCoords, this.pointers);
            }

            this.prepared.name  = action.name;
            this.prepared.axis  = action.axis;
            this.prepared.edges = action.edges;
            this.target         = interactable;
            this.element        = element;

            this.setStartOffsets(action.name, interactable, element);
            this.setModifications(this.startCoords.page);

            this.prevEvent = this[this.prepared.name + 'Start'](this.downEvent);
        },

        pointerMove: function (pointer, event, eventTarget, curEventTarget, preEnd) {
            if (this.inertiaStatus.active) {
                var pageUp   = this.inertiaStatus.upCoords.page;
                var clientUp = this.inertiaStatus.upCoords.client;

                var inertiaPosition = {
                    pageX  : pageUp.x   + this.inertiaStatus.sx,
                    pageY  : pageUp.y   + this.inertiaStatus.sy,
                    clientX: clientUp.x + this.inertiaStatus.sx,
                    clientY: clientUp.y + this.inertiaStatus.sy
                };

                this.setEventXY(this.curCoords, [inertiaPosition]);
            }
            else {
                this.recordPointer(pointer);
                this.setEventXY(this.curCoords, this.pointers);
            }

            var duplicateMove = (this.curCoords.page.x === this.prevCoords.page.x
                                 && this.curCoords.page.y === this.prevCoords.page.y
                                 && this.curCoords.client.x === this.prevCoords.client.x
                                 && this.curCoords.client.y === this.prevCoords.client.y);

            var dx, dy,
                pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

            // register movement greater than pointerMoveTolerance
            if (this.pointerIsDown && !this.pointerWasMoved) {
                dx = this.curCoords.client.x - this.startCoords.client.x;
                dy = this.curCoords.client.y - this.startCoords.client.y;

                this.pointerWasMoved = hypot(dx, dy) > pointerMoveTolerance;
            }

            if (!duplicateMove && (!this.pointerIsDown || this.pointerWasMoved)) {
                if (this.pointerIsDown) {
                    clearTimeout(this.holdTimers[pointerIndex]);
                }

                this.collectEventTargets(pointer, event, eventTarget, 'move');
            }

            if (!this.pointerIsDown) { return; }

            if (duplicateMove && this.pointerWasMoved && !preEnd) {
                this.checkAndPreventDefault(event, this.target, this.element);
                return;
            }

            // set pointer coordinate, time changes and speeds
            setEventDeltas(this.pointerDelta, this.prevCoords, this.curCoords);

            if (!this.prepared.name) { return; }

            if (this.pointerWasMoved
                // ignore movement while inertia is active
                && (!this.inertiaStatus.active || (pointer instanceof InteractEvent && /inertiastart/.test(pointer.type)))) {

                // if just starting an action, calculate the pointer speed now
                if (!this.interacting()) {
                    setEventDeltas(this.pointerDelta, this.prevCoords, this.curCoords);

                    // check if a drag is in the correct axis
                    if (this.prepared.name === 'drag') {
                        var absX = Math.abs(dx),
                            absY = Math.abs(dy),
                            targetAxis = this.target.options.drag.axis,
                            axis = (absX > absY ? 'x' : absX < absY ? 'y' : 'xy');

                        // if the movement isn't in the axis of the interactable
                        if (axis !== 'xy' && targetAxis !== 'xy' && targetAxis !== axis) {
                            // cancel the prepared action
                            this.prepared.name = null;

                            // then try to get a drag from another ineractable

                            var element = eventTarget;

                            // check element interactables
                            while (isElement(element)) {
                                var elementInteractable = interactables.get(element);

                                if (elementInteractable
                                    && elementInteractable !== this.target
                                    && !elementInteractable.options.drag.manualStart
                                    && elementInteractable.getAction(this.downPointer, this.downEvent, this, element).name === 'drag'
                                    && checkAxis(axis, elementInteractable)) {

                                    this.prepared.name = 'drag';
                                    this.target = elementInteractable;
                                    this.element = element;
                                    break;
                                }

                                element = parentElement(element);
                            }

                            // if there's no drag from element interactables,
                            // check the selector interactables
                            if (!this.prepared.name) {
                                var thisInteraction = this;

                                var getDraggable = function (interactable, selector, context) {
                                    var elements = ie8MatchesSelector
                                        ? context.querySelectorAll(selector)
                                        : undefined;

                                    if (interactable === thisInteraction.target) { return; }

                                    if (inContext(interactable, eventTarget)
                                        && !interactable.options.drag.manualStart
                                        && !testIgnore(interactable, element, eventTarget)
                                        && testAllow(interactable, element, eventTarget)
                                        && matchesSelector(element, selector, elements)
                                        && interactable.getAction(thisInteraction.downPointer, thisInteraction.downEvent, thisInteraction, element).name === 'drag'
                                        && checkAxis(axis, interactable)
                                        && withinInteractionLimit(interactable, element, 'drag')) {

                                        return interactable;
                                    }
                                };

                                element = eventTarget;

                                while (isElement(element)) {
                                    var selectorInteractable = interactables.forEachSelector(getDraggable);

                                    if (selectorInteractable) {
                                        this.prepared.name = 'drag';
                                        this.target = selectorInteractable;
                                        this.element = element;
                                        break;
                                    }

                                    element = parentElement(element);
                                }
                            }
                        }
                    }
                }

                var starting = !!this.prepared.name && !this.interacting();

                if (starting
                    && (this.target.options[this.prepared.name].manualStart
                        || !withinInteractionLimit(this.target, this.element, this.prepared))) {
                    this.stop(event);
                    return;
                }

                if (this.prepared.name && this.target) {
                    if (starting) {
                        this.start(this.prepared, this.target, this.element);
                    }

                    var shouldMove = this.setModifications(this.curCoords.page, preEnd);

                    // move if snapping or restriction doesn't prevent it
                    if (shouldMove || starting) {
                        this.prevEvent = this[this.prepared.name + 'Move'](event);
                    }

                    this.checkAndPreventDefault(event, this.target, this.element);
                }
            }

            copyCoords(this.prevCoords, this.curCoords);

            if (this.dragging || this.resizing) {
                this.autoScrollMove(pointer);
            }
        },

        dragStart: function (event) {
            var dragEvent = new InteractEvent(this, event, 'drag', 'start', this.element);

            this.dragging = true;
            this.target.fire(dragEvent);

            // reset active dropzones
            this.activeDrops.dropzones = [];
            this.activeDrops.elements  = [];
            this.activeDrops.rects     = [];

            if (!this.dynamicDrop) {
                this.setActiveDrops(this.element);
            }

            var dropEvents = this.getDropEvents(event, dragEvent);

            if (dropEvents.activate) {
                this.fireActiveDrops(dropEvents.activate);
            }

            return dragEvent;
        },

        dragMove: function (event) {
            var target = this.target,
                dragEvent  = new InteractEvent(this, event, 'drag', 'move', this.element),
                draggableElement = this.element,
                drop = this.getDrop(dragEvent, event, draggableElement);

            this.dropTarget = drop.dropzone;
            this.dropElement = drop.element;

            var dropEvents = this.getDropEvents(event, dragEvent);

            target.fire(dragEvent);

            if (dropEvents.leave) { this.prevDropTarget.fire(dropEvents.leave); }
            if (dropEvents.enter) {     this.dropTarget.fire(dropEvents.enter); }
            if (dropEvents.move ) {     this.dropTarget.fire(dropEvents.move ); }

            this.prevDropTarget  = this.dropTarget;
            this.prevDropElement = this.dropElement;

            return dragEvent;
        },

        resizeStart: function (event) {
            var resizeEvent = new InteractEvent(this, event, 'resize', 'start', this.element);

            if (this.prepared.edges) {
                var startRect = this.target.getRect(this.element);

                /*
                 * When using the `resizable.square` or `resizable.preserveAspectRatio` options, resizing from one edge
                 * will affect another. E.g. with `resizable.square`, resizing to make the right edge larger will make
                 * the bottom edge larger by the same amount. We call these 'linked' edges. Any linked edges will depend
                 * on the active edges and the edge being interacted with.
                 */
                if (this.target.options.resize.square || this.target.options.resize.preserveAspectRatio) {
                    var linkedEdges = extend({}, this.prepared.edges);

                    linkedEdges.top    = linkedEdges.top    || (linkedEdges.left   && !linkedEdges.bottom);
                    linkedEdges.left   = linkedEdges.left   || (linkedEdges.top    && !linkedEdges.right );
                    linkedEdges.bottom = linkedEdges.bottom || (linkedEdges.right  && !linkedEdges.top   );
                    linkedEdges.right  = linkedEdges.right  || (linkedEdges.bottom && !linkedEdges.left  );

                    this.prepared._linkedEdges = linkedEdges;
                }
                else {
                    this.prepared._linkedEdges = null;
                }

                // if using `resizable.preserveAspectRatio` option, record aspect ratio at the start of the resize
                if (this.target.options.resize.preserveAspectRatio) {
                    this.resizeStartAspectRatio = startRect.width / startRect.height;
                }

                this.resizeRects = {
                    start     : startRect,
                    current   : extend({}, startRect),
                    restricted: extend({}, startRect),
                    previous  : extend({}, startRect),
                    delta     : {
                        left: 0, right : 0, width : 0,
                        top : 0, bottom: 0, height: 0
                    }
                };

                resizeEvent.rect = this.resizeRects.restricted;
                resizeEvent.deltaRect = this.resizeRects.delta;
            }

            this.target.fire(resizeEvent);

            this.resizing = true;

            return resizeEvent;
        },

        resizeMove: function (event) {
            var resizeEvent = new InteractEvent(this, event, 'resize', 'move', this.element);

            var edges = this.prepared.edges,
                invert = this.target.options.resize.invert,
                invertible = invert === 'reposition' || invert === 'negate';

            if (edges) {
                var dx = resizeEvent.dx,
                    dy = resizeEvent.dy,

                    start      = this.resizeRects.start,
                    current    = this.resizeRects.current,
                    restricted = this.resizeRects.restricted,
                    delta      = this.resizeRects.delta,
                    previous   = extend(this.resizeRects.previous, restricted),

                    originalEdges = edges;

                // `resize.preserveAspectRatio` takes precedence over `resize.square`
                if (this.target.options.resize.preserveAspectRatio) {
                    var resizeStartAspectRatio = this.resizeStartAspectRatio;

                    edges = this.prepared._linkedEdges;

                    if ((originalEdges.left && originalEdges.bottom)
                        || (originalEdges.right && originalEdges.top)) {
                        dy = -dx / resizeStartAspectRatio;
                    }
                    else if (originalEdges.left || originalEdges.right) { dy = dx / resizeStartAspectRatio; }
                    else if (originalEdges.top || originalEdges.bottom) { dx = dy * resizeStartAspectRatio; }
                }
                else if (this.target.options.resize.square) {
                    edges = this.prepared._linkedEdges;

                    if ((originalEdges.left && originalEdges.bottom)
                        || (originalEdges.right && originalEdges.top)) {
                        dy = -dx;
                    }
                    else if (originalEdges.left || originalEdges.right) { dy = dx; }
                    else if (originalEdges.top || originalEdges.bottom) { dx = dy; }
                }

                // update the 'current' rect without modifications
                if (edges.top   ) { current.top    += dy; }
                if (edges.bottom) { current.bottom += dy; }
                if (edges.left  ) { current.left   += dx; }
                if (edges.right ) { current.right  += dx; }

                if (invertible) {
                    // if invertible, copy the current rect
                    extend(restricted, current);

                    if (invert === 'reposition') {
                        // swap edge values if necessary to keep width/height positive
                        var swap;

                        if (restricted.top > restricted.bottom) {
                            swap = restricted.top;

                            restricted.top = restricted.bottom;
                            restricted.bottom = swap;
                        }
                        if (restricted.left > restricted.right) {
                            swap = restricted.left;

                            restricted.left = restricted.right;
                            restricted.right = swap;
                        }
                    }
                }
                else {
                    // if not invertible, restrict to minimum of 0x0 rect
                    restricted.top    = Math.min(current.top, start.bottom);
                    restricted.bottom = Math.max(current.bottom, start.top);
                    restricted.left   = Math.min(current.left, start.right);
                    restricted.right  = Math.max(current.right, start.left);
                }

                restricted.width  = restricted.right  - restricted.left;
                restricted.height = restricted.bottom - restricted.top ;

                for (var edge in restricted) {
                    delta[edge] = restricted[edge] - previous[edge];
                }

                resizeEvent.edges = this.prepared.edges;
                resizeEvent.rect = restricted;
                resizeEvent.deltaRect = delta;
            }

            this.target.fire(resizeEvent);

            return resizeEvent;
        },

        gestureStart: function (event) {
            var gestureEvent = new InteractEvent(this, event, 'gesture', 'start', this.element);

            gestureEvent.ds = 0;

            this.gesture.startDistance = this.gesture.prevDistance = gestureEvent.distance;
            this.gesture.startAngle = this.gesture.prevAngle = gestureEvent.angle;
            this.gesture.scale = 1;

            this.gesturing = true;

            this.target.fire(gestureEvent);

            return gestureEvent;
        },

        gestureMove: function (event) {
            if (!this.pointerIds.length) {
                return this.prevEvent;
            }

            var gestureEvent;

            gestureEvent = new InteractEvent(this, event, 'gesture', 'move', this.element);
            gestureEvent.ds = gestureEvent.scale - this.gesture.scale;

            this.target.fire(gestureEvent);

            this.gesture.prevAngle = gestureEvent.angle;
            this.gesture.prevDistance = gestureEvent.distance;

            if (gestureEvent.scale !== Infinity &&
                gestureEvent.scale !== null &&
                gestureEvent.scale !== undefined  &&
                !isNaN(gestureEvent.scale)) {

                this.gesture.scale = gestureEvent.scale;
            }

            return gestureEvent;
        },

        pointerHold: function (pointer, event, eventTarget) {
            this.collectEventTargets(pointer, event, eventTarget, 'hold');
        },

        pointerUp: function (pointer, event, eventTarget, curEventTarget) {
            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

            clearTimeout(this.holdTimers[pointerIndex]);

            this.collectEventTargets(pointer, event, eventTarget, 'up' );
            this.collectEventTargets(pointer, event, eventTarget, 'tap');

            this.pointerEnd(pointer, event, eventTarget, curEventTarget);

            this.removePointer(pointer);
        },

        pointerCancel: function (pointer, event, eventTarget, curEventTarget) {
            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

            clearTimeout(this.holdTimers[pointerIndex]);

            this.collectEventTargets(pointer, event, eventTarget, 'cancel');
            this.pointerEnd(pointer, event, eventTarget, curEventTarget);

            this.removePointer(pointer);
        },

        // http://www.quirksmode.org/dom/events/click.html
        // >Events leading to dblclick
        //
        // IE8 doesn't fire down event before dblclick.
        // This workaround tries to fire a tap and doubletap after dblclick
        ie8Dblclick: function (pointer, event, eventTarget) {
            if (this.prevTap
                && event.clientX === this.prevTap.clientX
                && event.clientY === this.prevTap.clientY
                && eventTarget   === this.prevTap.target) {

                this.downTargets[0] = eventTarget;
                this.downTimes[0] = new Date().getTime();
                this.collectEventTargets(pointer, event, eventTarget, 'tap');
            }
        },

        // End interact move events and stop auto-scroll unless inertia is enabled
        pointerEnd: function (pointer, event, eventTarget, curEventTarget) {
            var endEvent,
                target = this.target,
                options = target && target.options,
                inertiaOptions = options && this.prepared.name && options[this.prepared.name].inertia,
                inertiaStatus = this.inertiaStatus;

            if (this.interacting()) {

                if (inertiaStatus.active && !inertiaStatus.ending) { return; }

                var pointerSpeed,
                    now = new Date().getTime(),
                    inertiaPossible = false,
                    inertia = false,
                    smoothEnd = false,
                    endSnap = checkSnap(target, this.prepared.name) && options[this.prepared.name].snap.endOnly,
                    endRestrict = checkRestrict(target, this.prepared.name) && options[this.prepared.name].restrict.endOnly,
                    dx = 0,
                    dy = 0,
                    startEvent;

                if (this.dragging) {
                    if      (options.drag.axis === 'x' ) { pointerSpeed = Math.abs(this.pointerDelta.client.vx); }
                    else if (options.drag.axis === 'y' ) { pointerSpeed = Math.abs(this.pointerDelta.client.vy); }
                    else   /*options.drag.axis === 'xy'*/{ pointerSpeed = this.pointerDelta.client.speed; }
                }
                else {
                    pointerSpeed = this.pointerDelta.client.speed;
                }

                // check if inertia should be started
                inertiaPossible = (inertiaOptions && inertiaOptions.enabled
                                   && this.prepared.name !== 'gesture'
                                   && event !== inertiaStatus.startEvent);

                inertia = (inertiaPossible
                           && (now - this.curCoords.timeStamp) < 50
                           && pointerSpeed > inertiaOptions.minSpeed
                           && pointerSpeed > inertiaOptions.endSpeed);

                if (inertiaPossible && !inertia && (endSnap || endRestrict)) {

                    var snapRestrict = {};

                    snapRestrict.snap = snapRestrict.restrict = snapRestrict;

                    if (endSnap) {
                        this.setSnapping(this.curCoords.page, snapRestrict);
                        if (snapRestrict.locked) {
                            dx += snapRestrict.dx;
                            dy += snapRestrict.dy;
                        }
                    }

                    if (endRestrict) {
                        this.setRestriction(this.curCoords.page, snapRestrict);
                        if (snapRestrict.restricted) {
                            dx += snapRestrict.dx;
                            dy += snapRestrict.dy;
                        }
                    }

                    if (dx || dy) {
                        smoothEnd = true;
                    }
                }

                if (inertia || smoothEnd) {
                    copyCoords(inertiaStatus.upCoords, this.curCoords);

                    this.pointers[0] = inertiaStatus.startEvent = startEvent =
                        new InteractEvent(this, event, this.prepared.name, 'inertiastart', this.element);

                    inertiaStatus.t0 = now;

                    target.fire(inertiaStatus.startEvent);

                    if (inertia) {
                        inertiaStatus.vx0 = this.pointerDelta.client.vx;
                        inertiaStatus.vy0 = this.pointerDelta.client.vy;
                        inertiaStatus.v0 = pointerSpeed;

                        this.calcInertia(inertiaStatus);

                        var page = extend({}, this.curCoords.page),
                            origin = getOriginXY(target, this.element),
                            statusObject;

                        page.x = page.x + inertiaStatus.xe - origin.x;
                        page.y = page.y + inertiaStatus.ye - origin.y;

                        statusObject = {
                            useStatusXY: true,
                            x: page.x,
                            y: page.y,
                            dx: 0,
                            dy: 0,
                            snap: null
                        };

                        statusObject.snap = statusObject;

                        dx = dy = 0;

                        if (endSnap) {
                            var snap = this.setSnapping(this.curCoords.page, statusObject);

                            if (snap.locked) {
                                dx += snap.dx;
                                dy += snap.dy;
                            }
                        }

                        if (endRestrict) {
                            var restrict = this.setRestriction(this.curCoords.page, statusObject);

                            if (restrict.restricted) {
                                dx += restrict.dx;
                                dy += restrict.dy;
                            }
                        }

                        inertiaStatus.modifiedXe += dx;
                        inertiaStatus.modifiedYe += dy;

                        inertiaStatus.i = reqFrame(this.boundInertiaFrame);
                    }
                    else {
                        inertiaStatus.smoothEnd = true;
                        inertiaStatus.xe = dx;
                        inertiaStatus.ye = dy;

                        inertiaStatus.sx = inertiaStatus.sy = 0;

                        inertiaStatus.i = reqFrame(this.boundSmoothEndFrame);
                    }

                    inertiaStatus.active = true;
                    return;
                }

                if (endSnap || endRestrict) {
                    // fire a move event at the snapped coordinates
                    this.pointerMove(pointer, event, eventTarget, curEventTarget, true);
                }
            }

            if (this.dragging) {
                endEvent = new InteractEvent(this, event, 'drag', 'end', this.element);

                var draggableElement = this.element,
                    drop = this.getDrop(endEvent, event, draggableElement);

                this.dropTarget = drop.dropzone;
                this.dropElement = drop.element;

                var dropEvents = this.getDropEvents(event, endEvent);

                if (dropEvents.leave) { this.prevDropTarget.fire(dropEvents.leave); }
                if (dropEvents.enter) {     this.dropTarget.fire(dropEvents.enter); }
                if (dropEvents.drop ) {     this.dropTarget.fire(dropEvents.drop ); }
                if (dropEvents.deactivate) {
                    this.fireActiveDrops(dropEvents.deactivate);
                }

                target.fire(endEvent);
            }
            else if (this.resizing) {
                endEvent = new InteractEvent(this, event, 'resize', 'end', this.element);
                target.fire(endEvent);
            }
            else if (this.gesturing) {
                endEvent = new InteractEvent(this, event, 'gesture', 'end', this.element);
                target.fire(endEvent);
            }

            this.stop(event);
        },

        collectDrops: function (element) {
            var drops = [],
                elements = [],
                i;

            element = element || this.element;

            // collect all dropzones and their elements which qualify for a drop
            for (i = 0; i < interactables.length; i++) {
                if (!interactables[i].options.drop.enabled) { continue; }

                var current = interactables[i],
                    accept = current.options.drop.accept;

                // test the draggable element against the dropzone's accept setting
                if ((isElement(accept) && accept !== element)
                    || (isString(accept)
                        && !matchesSelector(element, accept))) {

                    continue;
                }

                // query for new elements if necessary
                var dropElements = current.selector? current._context.querySelectorAll(current.selector) : [current._element];

                for (var j = 0, len = dropElements.length; j < len; j++) {
                    var currentElement = dropElements[j];

                    if (currentElement === element) {
                        continue;
                    }

                    drops.push(current);
                    elements.push(currentElement);
                }
            }

            return {
                dropzones: drops,
                elements: elements
            };
        },

        fireActiveDrops: function (event) {
            var i,
                current,
                currentElement,
                prevElement;

            // loop through all active dropzones and trigger event
            for (i = 0; i < this.activeDrops.dropzones.length; i++) {
                current = this.activeDrops.dropzones[i];
                currentElement = this.activeDrops.elements [i];

                // prevent trigger of duplicate events on same element
                if (currentElement !== prevElement) {
                    // set current element as event target
                    event.target = currentElement;
                    current.fire(event);
                }
                prevElement = currentElement;
            }
        },

        // Collect a new set of possible drops and save them in activeDrops.
        // setActiveDrops should always be called when a drag has just started or a
        // drag event happens while dynamicDrop is true
        setActiveDrops: function (dragElement) {
            // get dropzones and their elements that could receive the draggable
            var possibleDrops = this.collectDrops(dragElement, true);

            this.activeDrops.dropzones = possibleDrops.dropzones;
            this.activeDrops.elements  = possibleDrops.elements;
            this.activeDrops.rects     = [];

            for (var i = 0; i < this.activeDrops.dropzones.length; i++) {
                this.activeDrops.rects[i] = this.activeDrops.dropzones[i].getRect(this.activeDrops.elements[i]);
            }
        },

        getDrop: function (dragEvent, event, dragElement) {
            var validDrops = [];

            if (dynamicDrop) {
                this.setActiveDrops(dragElement);
            }

            // collect all dropzones and their elements which qualify for a drop
            for (var j = 0; j < this.activeDrops.dropzones.length; j++) {
                var current        = this.activeDrops.dropzones[j],
                    currentElement = this.activeDrops.elements [j],
                    rect           = this.activeDrops.rects    [j];

                validDrops.push(current.dropCheck(dragEvent, event, this.target, dragElement, currentElement, rect)
                                ? currentElement
                                : null);
            }

            // get the most appropriate dropzone based on DOM depth and order
            var dropIndex = indexOfDeepestElement(validDrops),
                dropzone  = this.activeDrops.dropzones[dropIndex] || null,
                element   = this.activeDrops.elements [dropIndex] || null;

            return {
                dropzone: dropzone,
                element: element
            };
        },

        getDropEvents: function (pointerEvent, dragEvent) {
            var dropEvents = {
                enter     : null,
                leave     : null,
                activate  : null,
                deactivate: null,
                move      : null,
                drop      : null
            };

            if (this.dropElement !== this.prevDropElement) {
                // if there was a prevDropTarget, create a dragleave event
                if (this.prevDropTarget) {
                    dropEvents.leave = {
                        target       : this.prevDropElement,
                        dropzone     : this.prevDropTarget,
                        relatedTarget: dragEvent.target,
                        draggable    : dragEvent.interactable,
                        dragEvent    : dragEvent,
                        interaction  : this,
                        timeStamp    : dragEvent.timeStamp,
                        type         : 'dragleave'
                    };

                    dragEvent.dragLeave = this.prevDropElement;
                    dragEvent.prevDropzone = this.prevDropTarget;
                }
                // if the dropTarget is not null, create a dragenter event
                if (this.dropTarget) {
                    dropEvents.enter = {
                        target       : this.dropElement,
                        dropzone     : this.dropTarget,
                        relatedTarget: dragEvent.target,
                        draggable    : dragEvent.interactable,
                        dragEvent    : dragEvent,
                        interaction  : this,
                        timeStamp    : dragEvent.timeStamp,
                        type         : 'dragenter'
                    };

                    dragEvent.dragEnter = this.dropElement;
                    dragEvent.dropzone = this.dropTarget;
                }
            }

            if (dragEvent.type === 'dragend' && this.dropTarget) {
                dropEvents.drop = {
                    target       : this.dropElement,
                    dropzone     : this.dropTarget,
                    relatedTarget: dragEvent.target,
                    draggable    : dragEvent.interactable,
                    dragEvent    : dragEvent,
                    interaction  : this,
                    timeStamp    : dragEvent.timeStamp,
                    type         : 'drop'
                };

                dragEvent.dropzone = this.dropTarget;
            }
            if (dragEvent.type === 'dragstart') {
                dropEvents.activate = {
                    target       : null,
                    dropzone     : null,
                    relatedTarget: dragEvent.target,
                    draggable    : dragEvent.interactable,
                    dragEvent    : dragEvent,
                    interaction  : this,
                    timeStamp    : dragEvent.timeStamp,
                    type         : 'dropactivate'
                };
            }
            if (dragEvent.type === 'dragend') {
                dropEvents.deactivate = {
                    target       : null,
                    dropzone     : null,
                    relatedTarget: dragEvent.target,
                    draggable    : dragEvent.interactable,
                    dragEvent    : dragEvent,
                    interaction  : this,
                    timeStamp    : dragEvent.timeStamp,
                    type         : 'dropdeactivate'
                };
            }
            if (dragEvent.type === 'dragmove' && this.dropTarget) {
                dropEvents.move = {
                    target       : this.dropElement,
                    dropzone     : this.dropTarget,
                    relatedTarget: dragEvent.target,
                    draggable    : dragEvent.interactable,
                    dragEvent    : dragEvent,
                    interaction  : this,
                    dragmove     : dragEvent,
                    timeStamp    : dragEvent.timeStamp,
                    type         : 'dropmove'
                };
                dragEvent.dropzone = this.dropTarget;
            }

            return dropEvents;
        },

        currentAction: function () {
            return (this.dragging && 'drag') || (this.resizing && 'resize') || (this.gesturing && 'gesture') || null;
        },

        interacting: function () {
            return this.dragging || this.resizing || this.gesturing;
        },

        clearTargets: function () {
            this.target = this.element = null;

            this.dropTarget = this.dropElement = this.prevDropTarget = this.prevDropElement = null;
        },

        stop: function (event) {
            if (this.interacting()) {
                autoScroll.stop();
                this.matches = [];
                this.matchElements = [];

                var target = this.target;

                if (target.options.styleCursor) {
                    target._doc.documentElement.style.cursor = '';
                }

                // prevent Default only if were previously interacting
                if (event && isFunction(event.preventDefault)) {
                    this.checkAndPreventDefault(event, target, this.element);
                }

                if (this.dragging) {
                    this.activeDrops.dropzones = this.activeDrops.elements = this.activeDrops.rects = null;
                }
            }

            this.clearTargets();

            this.pointerIsDown = this.snapStatus.locked = this.dragging = this.resizing = this.gesturing = false;
            this.prepared.name = this.prevEvent = null;
            this.inertiaStatus.resumeDx = this.inertiaStatus.resumeDy = 0;

            // remove pointers if their ID isn't in this.pointerIds
            for (var i = 0; i < this.pointers.length; i++) {
                if (indexOf(this.pointerIds, getPointerId(this.pointers[i])) === -1) {
                    this.pointers.splice(i, 1);
                }
            }
        },

        inertiaFrame: function () {
            var inertiaStatus = this.inertiaStatus,
                options = this.target.options[this.prepared.name].inertia,
                lambda = options.resistance,
                t = new Date().getTime() / 1000 - inertiaStatus.t0;

            if (t < inertiaStatus.te) {

                var progress =  1 - (Math.exp(-lambda * t) - inertiaStatus.lambda_v0) / inertiaStatus.one_ve_v0;

                if (inertiaStatus.modifiedXe === inertiaStatus.xe && inertiaStatus.modifiedYe === inertiaStatus.ye) {
                    inertiaStatus.sx = inertiaStatus.xe * progress;
                    inertiaStatus.sy = inertiaStatus.ye * progress;
                }
                else {
                    var quadPoint = getQuadraticCurvePoint(
                            0, 0,
                            inertiaStatus.xe, inertiaStatus.ye,
                            inertiaStatus.modifiedXe, inertiaStatus.modifiedYe,
                            progress);

                    inertiaStatus.sx = quadPoint.x;
                    inertiaStatus.sy = quadPoint.y;
                }

                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);

                inertiaStatus.i = reqFrame(this.boundInertiaFrame);
            }
            else {
                inertiaStatus.ending = true;

                inertiaStatus.sx = inertiaStatus.modifiedXe;
                inertiaStatus.sy = inertiaStatus.modifiedYe;

                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);
                this.pointerEnd(inertiaStatus.startEvent, inertiaStatus.startEvent);

                inertiaStatus.active = inertiaStatus.ending = false;
            }
        },

        smoothEndFrame: function () {
            var inertiaStatus = this.inertiaStatus,
                t = new Date().getTime() - inertiaStatus.t0,
                duration = this.target.options[this.prepared.name].inertia.smoothEndDuration;

            if (t < duration) {
                inertiaStatus.sx = easeOutQuad(t, 0, inertiaStatus.xe, duration);
                inertiaStatus.sy = easeOutQuad(t, 0, inertiaStatus.ye, duration);

                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);

                inertiaStatus.i = reqFrame(this.boundSmoothEndFrame);
            }
            else {
                inertiaStatus.ending = true;

                inertiaStatus.sx = inertiaStatus.xe;
                inertiaStatus.sy = inertiaStatus.ye;

                this.pointerMove(inertiaStatus.startEvent, inertiaStatus.startEvent);
                this.pointerEnd(inertiaStatus.startEvent, inertiaStatus.startEvent);

                inertiaStatus.smoothEnd =
                  inertiaStatus.active = inertiaStatus.ending = false;
            }
        },

        addPointer: function (pointer) {
            var id = getPointerId(pointer),
                index = this.mouse? 0 : indexOf(this.pointerIds, id);

            if (index === -1) {
                index = this.pointerIds.length;
            }

            this.pointerIds[index] = id;
            this.pointers[index] = pointer;

            return index;
        },

        removePointer: function (pointer) {
            var id = getPointerId(pointer),
                index = this.mouse? 0 : indexOf(this.pointerIds, id);

            if (index === -1) { return; }

            this.pointers   .splice(index, 1);
            this.pointerIds .splice(index, 1);
            this.downTargets.splice(index, 1);
            this.downTimes  .splice(index, 1);
            this.holdTimers .splice(index, 1);
        },

        recordPointer: function (pointer) {
            var index = this.mouse? 0: indexOf(this.pointerIds, getPointerId(pointer));

            if (index === -1) { return; }

            this.pointers[index] = pointer;
        },

        collectEventTargets: function (pointer, event, eventTarget, eventType) {
            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer));

            // do not fire a tap event if the pointer was moved before being lifted
            if (eventType === 'tap' && (this.pointerWasMoved
                // or if the pointerup target is different to the pointerdown target
                || !(this.downTargets[pointerIndex] && this.downTargets[pointerIndex] === eventTarget))) {
                return;
            }

            var targets = [],
                elements = [],
                element = eventTarget;

            function collectSelectors (interactable, selector, context) {
                var els = ie8MatchesSelector
                        ? context.querySelectorAll(selector)
                        : undefined;

                if (interactable._iEvents[eventType]
                    && isElement(element)
                    && inContext(interactable, element)
                    && !testIgnore(interactable, element, eventTarget)
                    && testAllow(interactable, element, eventTarget)
                    && matchesSelector(element, selector, els)) {

                    targets.push(interactable);
                    elements.push(element);
                }
            }

            while (element) {
                if (interact.isSet(element) && interact(element)._iEvents[eventType]) {
                    targets.push(interact(element));
                    elements.push(element);
                }

                interactables.forEachSelector(collectSelectors);

                element = parentElement(element);
            }

            // create the tap event even if there are no listeners so that
            // doubletap can still be created and fired
            if (targets.length || eventType === 'tap') {
                this.firePointers(pointer, event, eventTarget, targets, elements, eventType);
            }
        },

        firePointers: function (pointer, event, eventTarget, targets, elements, eventType) {
            var pointerIndex = this.mouse? 0 : indexOf(this.pointerIds, getPointerId(pointer)),
                pointerEvent = {},
                i,
                // for tap events
                interval, createNewDoubleTap;

            // if it's a doubletap then the event properties would have been
            // copied from the tap event and provided as the pointer argument
            if (eventType === 'doubletap') {
                pointerEvent = pointer;
            }
            else {
                pointerExtend(pointerEvent, event);
                if (event !== pointer) {
                    pointerExtend(pointerEvent, pointer);
                }

                pointerEvent.preventDefault           = preventOriginalDefault;
                pointerEvent.stopPropagation          = InteractEvent.prototype.stopPropagation;
                pointerEvent.stopImmediatePropagation = InteractEvent.prototype.stopImmediatePropagation;
                pointerEvent.interaction              = this;

                pointerEvent.timeStamp       = new Date().getTime();
                pointerEvent.originalEvent   = event;
                pointerEvent.originalPointer = pointer;
                pointerEvent.type            = eventType;
                pointerEvent.pointerId       = getPointerId(pointer);
                pointerEvent.pointerType     = this.mouse? 'mouse' : !supportsPointerEvent? 'touch'
                                                    : isString(pointer.pointerType)
                                                        ? pointer.pointerType
                                                        : [,,'touch', 'pen', 'mouse'][pointer.pointerType];
            }

            if (eventType === 'tap') {
                pointerEvent.dt = pointerEvent.timeStamp - this.downTimes[pointerIndex];

                interval = pointerEvent.timeStamp - this.tapTime;
                createNewDoubleTap = !!(this.prevTap && this.prevTap.type !== 'doubletap'
                       && this.prevTap.target === pointerEvent.target
                       && interval < 500);

                pointerEvent.double = createNewDoubleTap;

                this.tapTime = pointerEvent.timeStamp;
            }

            for (i = 0; i < targets.length; i++) {
                pointerEvent.currentTarget = elements[i];
                pointerEvent.interactable = targets[i];
                targets[i].fire(pointerEvent);

                if (pointerEvent.immediatePropagationStopped
                    ||(pointerEvent.propagationStopped && elements[i + 1] !== pointerEvent.currentTarget)) {
                    break;
                }
            }

            if (createNewDoubleTap) {
                var doubleTap = {};

                extend(doubleTap, pointerEvent);

                doubleTap.dt   = interval;
                doubleTap.type = 'doubletap';

                this.collectEventTargets(doubleTap, event, eventTarget, 'doubletap');

                this.prevTap = doubleTap;
            }
            else if (eventType === 'tap') {
                this.prevTap = pointerEvent;
            }
        },

        validateSelector: function (pointer, event, matches, matchElements) {
            for (var i = 0, len = matches.length; i < len; i++) {
                var match = matches[i],
                    matchElement = matchElements[i],
                    action = validateAction(match.getAction(pointer, event, this, matchElement), match);

                if (action && withinInteractionLimit(match, matchElement, action)) {
                    this.target = match;
                    this.element = matchElement;

                    return action;
                }
            }
        },

        setSnapping: function (pageCoords, status) {
            var snap = this.target.options[this.prepared.name].snap,
                targets = [],
                target,
                page,
                i;

            status = status || this.snapStatus;

            if (status.useStatusXY) {
                page = { x: status.x, y: status.y };
            }
            else {
                var origin = getOriginXY(this.target, this.element);

                page = extend({}, pageCoords);

                page.x -= origin.x;
                page.y -= origin.y;
            }

            status.realX = page.x;
            status.realY = page.y;

            page.x = page.x - this.inertiaStatus.resumeDx;
            page.y = page.y - this.inertiaStatus.resumeDy;

            var len = snap.targets? snap.targets.length : 0;

            for (var relIndex = 0; relIndex < this.snapOffsets.length; relIndex++) {
                var relative = {
                    x: page.x - this.snapOffsets[relIndex].x,
                    y: page.y - this.snapOffsets[relIndex].y
                };

                for (i = 0; i < len; i++) {
                    if (isFunction(snap.targets[i])) {
                        target = snap.targets[i](relative.x, relative.y, this);
                    }
                    else {
                        target = snap.targets[i];
                    }

                    if (!target) { continue; }

                    targets.push({
                        x: isNumber(target.x) ? (target.x + this.snapOffsets[relIndex].x) : relative.x,
                        y: isNumber(target.y) ? (target.y + this.snapOffsets[relIndex].y) : relative.y,

                        range: isNumber(target.range)? target.range: snap.range
                    });
                }
            }

            var closest = {
                    target: null,
                    inRange: false,
                    distance: 0,
                    range: 0,
                    dx: 0,
                    dy: 0
                };

            for (i = 0, len = targets.length; i < len; i++) {
                target = targets[i];

                var range = target.range,
                    dx = target.x - page.x,
                    dy = target.y - page.y,
                    distance = hypot(dx, dy),
                    inRange = distance <= range;

                // Infinite targets count as being out of range
                // compared to non infinite ones that are in range
                if (range === Infinity && closest.inRange && closest.range !== Infinity) {
                    inRange = false;
                }

                if (!closest.target || (inRange
                    // is the closest target in range?
                    ? (closest.inRange && range !== Infinity
                        // the pointer is relatively deeper in this target
                        ? distance / range < closest.distance / closest.range
                        // this target has Infinite range and the closest doesn't
                        : (range === Infinity && closest.range !== Infinity)
                            // OR this target is closer that the previous closest
                            || distance < closest.distance)
                    // The other is not in range and the pointer is closer to this target
                    : (!closest.inRange && distance < closest.distance))) {

                    if (range === Infinity) {
                        inRange = true;
                    }

                    closest.target = target;
                    closest.distance = distance;
                    closest.range = range;
                    closest.inRange = inRange;
                    closest.dx = dx;
                    closest.dy = dy;

                    status.range = range;
                }
            }

            var snapChanged;

            if (closest.target) {
                snapChanged = (status.snappedX !== closest.target.x || status.snappedY !== closest.target.y);

                status.snappedX = closest.target.x;
                status.snappedY = closest.target.y;
            }
            else {
                snapChanged = true;

                status.snappedX = NaN;
                status.snappedY = NaN;
            }

            status.dx = closest.dx;
            status.dy = closest.dy;

            status.changed = (snapChanged || (closest.inRange && !status.locked));
            status.locked = closest.inRange;

            return status;
        },

        setRestriction: function (pageCoords, status) {
            var target = this.target,
                restrict = target && target.options[this.prepared.name].restrict,
                restriction = restrict && restrict.restriction,
                page;

            if (!restriction) {
                return status;
            }

            status = status || this.restrictStatus;

            page = status.useStatusXY
                    ? page = { x: status.x, y: status.y }
                    : page = extend({}, pageCoords);

            if (status.snap && status.snap.locked) {
                page.x += status.snap.dx || 0;
                page.y += status.snap.dy || 0;
            }

            page.x -= this.inertiaStatus.resumeDx;
            page.y -= this.inertiaStatus.resumeDy;

            status.dx = 0;
            status.dy = 0;
            status.restricted = false;

            var rect, restrictedX, restrictedY;

            if (isString(restriction)) {
                if (restriction === 'parent') {
                    restriction = parentElement(this.element);
                }
                else if (restriction === 'self') {
                    restriction = target.getRect(this.element);
                }
                else {
                    restriction = closest(this.element, restriction);
                }

                if (!restriction) { return status; }
            }

            if (isFunction(restriction)) {
                restriction = restriction(page.x, page.y, this.element);
            }

            if (isElement(restriction)) {
                restriction = getElementRect(restriction);
            }

            rect = restriction;

            if (!restriction) {
                restrictedX = page.x;
                restrictedY = page.y;
            }
            // object is assumed to have
            // x, y, width, height or
            // left, top, right, bottom
            else if ('x' in restriction && 'y' in restriction) {
                restrictedX = Math.max(Math.min(rect.x + rect.width  - this.restrictOffset.right , page.x), rect.x + this.restrictOffset.left);
                restrictedY = Math.max(Math.min(rect.y + rect.height - this.restrictOffset.bottom, page.y), rect.y + this.restrictOffset.top );
            }
            else {
                restrictedX = Math.max(Math.min(rect.right  - this.restrictOffset.right , page.x), rect.left + this.restrictOffset.left);
                restrictedY = Math.max(Math.min(rect.bottom - this.restrictOffset.bottom, page.y), rect.top  + this.restrictOffset.top );
            }

            status.dx = restrictedX - page.x;
            status.dy = restrictedY - page.y;

            status.changed = status.restrictedX !== restrictedX || status.restrictedY !== restrictedY;
            status.restricted = !!(status.dx || status.dy);

            status.restrictedX = restrictedX;
            status.restrictedY = restrictedY;

            return status;
        },

        checkAndPreventDefault: function (event, interactable, element) {
            if (!(interactable = interactable || this.target)) { return; }

            var options = interactable.options,
                prevent = options.preventDefault;

            if (prevent === 'auto' && element && !/^(input|select|textarea)$/i.test(event.target.nodeName)) {
                // do not preventDefault on pointerdown if the prepared action is a drag
                // and dragging can only start from a certain direction - this allows
                // a touch to pan the viewport if a drag isn't in the right direction
                if (/down|start/i.test(event.type)
                    && this.prepared.name === 'drag' && options.drag.axis !== 'xy') {

                    return;
                }

                // with manualStart, only preventDefault while interacting
                if (options[this.prepared.name] && options[this.prepared.name].manualStart
                    && !this.interacting()) {
                    return;
                }

                event.preventDefault();
                return;
            }

            if (prevent === 'always') {
                event.preventDefault();
                return;
            }
        },

        calcInertia: function (status) {
            var inertiaOptions = this.target.options[this.prepared.name].inertia,
                lambda = inertiaOptions.resistance,
                inertiaDur = -Math.log(inertiaOptions.endSpeed / status.v0) / lambda;

            status.x0 = this.prevEvent.pageX;
            status.y0 = this.prevEvent.pageY;
            status.t0 = status.startEvent.timeStamp / 1000;
            status.sx = status.sy = 0;

            status.modifiedXe = status.xe = (status.vx0 - inertiaDur) / lambda;
            status.modifiedYe = status.ye = (status.vy0 - inertiaDur) / lambda;
            status.te = inertiaDur;

            status.lambda_v0 = lambda / status.v0;
            status.one_ve_v0 = 1 - inertiaOptions.endSpeed / status.v0;
        },

        autoScrollMove: function (pointer) {
            if (!(this.interacting()
                && checkAutoScroll(this.target, this.prepared.name))) {
                return;
            }

            if (this.inertiaStatus.active) {
                autoScroll.x = autoScroll.y = 0;
                return;
            }

            var top,
                right,
                bottom,
                left,
                options = this.target.options[this.prepared.name].autoScroll,
                container = options.container || getWindow(this.element);

            if (isWindow(container)) {
                left   = pointer.clientX < autoScroll.margin;
                top    = pointer.clientY < autoScroll.margin;
                right  = pointer.clientX > container.innerWidth  - autoScroll.margin;
                bottom = pointer.clientY > container.innerHeight - autoScroll.margin;
            }
            else {
                var rect = getElementClientRect(container);

                left   = pointer.clientX < rect.left   + autoScroll.margin;
                top    = pointer.clientY < rect.top    + autoScroll.margin;
                right  = pointer.clientX > rect.right  - autoScroll.margin;
                bottom = pointer.clientY > rect.bottom - autoScroll.margin;
            }

            autoScroll.x = (right ? 1: left? -1: 0);
            autoScroll.y = (bottom? 1:  top? -1: 0);

            if (!autoScroll.isScrolling) {
                // set the autoScroll properties to those of the target
                autoScroll.margin = options.margin;
                autoScroll.speed  = options.speed;

                autoScroll.start(this);
            }
        },

        _updateEventTargets: function (target, currentTarget) {
            this._eventTarget    = target;
            this._curEventTarget = currentTarget;
        }

    };

    function getInteractionFromPointer (pointer, eventType, eventTarget) {
        var i = 0, len = interactions.length,
            mouseEvent = (/mouse/i.test(pointer.pointerType || eventType)
                          // MSPointerEvent.MSPOINTER_TYPE_MOUSE
                          || pointer.pointerType === 4),
            interaction;

        var id = getPointerId(pointer);

        // try to resume inertia with a new pointer
        if (/down|start/i.test(eventType)) {
            for (i = 0; i < len; i++) {
                interaction = interactions[i];

                var element = eventTarget;

                if (interaction.inertiaStatus.active && interaction.target.options[interaction.prepared.name].inertia.allowResume
                    && (interaction.mouse === mouseEvent)) {
                    while (element) {
                        // if the element is the interaction element
                        if (element === interaction.element) {
                            return interaction;
                        }
                        element = parentElement(element);
                    }
                }
            }
        }

        // if it's a mouse interaction
        if (mouseEvent || !(supportsTouch || supportsPointerEvent)) {

            // find a mouse interaction that's not in inertia phase
            for (i = 0; i < len; i++) {
                if (interactions[i].mouse && !interactions[i].inertiaStatus.active) {
                    return interactions[i];
                }
            }

            // find any interaction specifically for mouse.
            // if the eventType is a mousedown, and inertia is active
            // ignore the interaction
            for (i = 0; i < len; i++) {
                if (interactions[i].mouse && !(/down/.test(eventType) && interactions[i].inertiaStatus.active)) {
                    return interaction;
                }
            }

            // create a new interaction for mouse
            interaction = new Interaction();
            interaction.mouse = true;

            return interaction;
        }

        // get interaction that has this pointer
        for (i = 0; i < len; i++) {
            if (contains(interactions[i].pointerIds, id)) {
                return interactions[i];
            }
        }

        // at this stage, a pointerUp should not return an interaction
        if (/up|end|out/i.test(eventType)) {
            return null;
        }

        // get first idle interaction
        for (i = 0; i < len; i++) {
            interaction = interactions[i];

            if ((!interaction.prepared.name || (interaction.target.options.gesture.enabled))
                && !interaction.interacting()
                && !(!mouseEvent && interaction.mouse)) {

                return interaction;
            }
        }

        return new Interaction();
    }

    function doOnInteractions (method) {
        return (function (event) {
            var interaction,
                eventTarget = getActualElement(event.path
                                               ? event.path[0]
                                               : event.target),
                curEventTarget = getActualElement(event.currentTarget),
                i;

            if (supportsTouch && /touch/.test(event.type)) {
                prevTouchTime = new Date().getTime();

                for (i = 0; i < event.changedTouches.length; i++) {
                    var pointer = event.changedTouches[i];

                    interaction = getInteractionFromPointer(pointer, event.type, eventTarget);

                    if (!interaction) { continue; }

                    interaction._updateEventTargets(eventTarget, curEventTarget);

                    interaction[method](pointer, event, eventTarget, curEventTarget);
                }
            }
            else {
                if (!supportsPointerEvent && /mouse/.test(event.type)) {
                    // ignore mouse events while touch interactions are active
                    for (i = 0; i < interactions.length; i++) {
                        if (!interactions[i].mouse && interactions[i].pointerIsDown) {
                            return;
                        }
                    }

                    // try to ignore mouse events that are simulated by the browser
                    // after a touch event
                    if (new Date().getTime() - prevTouchTime < 500) {
                        return;
                    }
                }

                interaction = getInteractionFromPointer(event, event.type, eventTarget);

                if (!interaction) { return; }

                interaction._updateEventTargets(eventTarget, curEventTarget);

                interaction[method](event, event, eventTarget, curEventTarget);
            }
        });
    }

    function InteractEvent (interaction, event, action, phase, element, related) {
        var client,
            page,
            target      = interaction.target,
            snapStatus  = interaction.snapStatus,
            restrictStatus  = interaction.restrictStatus,
            pointers    = interaction.pointers,
            deltaSource = (target && target.options || defaultOptions).deltaSource,
            sourceX     = deltaSource + 'X',
            sourceY     = deltaSource + 'Y',
            options     = target? target.options: defaultOptions,
            origin      = getOriginXY(target, element),
            starting    = phase === 'start',
            ending      = phase === 'end',
            coords      = starting? interaction.startCoords : interaction.curCoords;

        element = element || interaction.element;

        page   = extend({}, coords.page);
        client = extend({}, coords.client);

        page.x -= origin.x;
        page.y -= origin.y;

        client.x -= origin.x;
        client.y -= origin.y;

        var relativePoints = options[action].snap && options[action].snap.relativePoints ;

        if (checkSnap(target, action) && !(starting && relativePoints && relativePoints.length)) {
            this.snap = {
                range  : snapStatus.range,
                locked : snapStatus.locked,
                x      : snapStatus.snappedX,
                y      : snapStatus.snappedY,
                realX  : snapStatus.realX,
                realY  : snapStatus.realY,
                dx     : snapStatus.dx,
                dy     : snapStatus.dy
            };

            if (snapStatus.locked) {
                page.x += snapStatus.dx;
                page.y += snapStatus.dy;
                client.x += snapStatus.dx;
                client.y += snapStatus.dy;
            }
        }

        if (checkRestrict(target, action) && !(starting && options[action].restrict.elementRect) && restrictStatus.restricted) {
            page.x += restrictStatus.dx;
            page.y += restrictStatus.dy;
            client.x += restrictStatus.dx;
            client.y += restrictStatus.dy;

            this.restrict = {
                dx: restrictStatus.dx,
                dy: restrictStatus.dy
            };
        }

        this.pageX     = page.x;
        this.pageY     = page.y;
        this.clientX   = client.x;
        this.clientY   = client.y;

        this.x0        = interaction.startCoords.page.x - origin.x;
        this.y0        = interaction.startCoords.page.y - origin.y;
        this.clientX0  = interaction.startCoords.client.x - origin.x;
        this.clientY0  = interaction.startCoords.client.y - origin.y;
        this.ctrlKey   = event.ctrlKey;
        this.altKey    = event.altKey;
        this.shiftKey  = event.shiftKey;
        this.metaKey   = event.metaKey;
        this.button    = event.button;
        this.buttons   = event.buttons;
        this.target    = element;
        this.t0        = interaction.downTimes[0];
        this.type      = action + (phase || '');

        this.interaction = interaction;
        this.interactable = target;

        var inertiaStatus = interaction.inertiaStatus;

        if (inertiaStatus.active) {
            this.detail = 'inertia';
        }

        if (related) {
            this.relatedTarget = related;
        }

        // end event dx, dy is difference between start and end points
        if (ending) {
            if (deltaSource === 'client') {
                this.dx = client.x - interaction.startCoords.client.x;
                this.dy = client.y - interaction.startCoords.client.y;
            }
            else {
                this.dx = page.x - interaction.startCoords.page.x;
                this.dy = page.y - interaction.startCoords.page.y;
            }
        }
        else if (starting) {
            this.dx = 0;
            this.dy = 0;
        }
        // copy properties from previousmove if starting inertia
        else if (phase === 'inertiastart') {
            this.dx = interaction.prevEvent.dx;
            this.dy = interaction.prevEvent.dy;
        }
        else {
            if (deltaSource === 'client') {
                this.dx = client.x - interaction.prevEvent.clientX;
                this.dy = client.y - interaction.prevEvent.clientY;
            }
            else {
                this.dx = page.x - interaction.prevEvent.pageX;
                this.dy = page.y - interaction.prevEvent.pageY;
            }
        }
        if (interaction.prevEvent && interaction.prevEvent.detail === 'inertia'
            && !inertiaStatus.active
            && options[action].inertia && options[action].inertia.zeroResumeDelta) {

            inertiaStatus.resumeDx += this.dx;
            inertiaStatus.resumeDy += this.dy;

            this.dx = this.dy = 0;
        }

        if (action === 'resize' && interaction.resizeAxes) {
            if (options.resize.square) {
                if (interaction.resizeAxes === 'y') {
                    this.dx = this.dy;
                }
                else {
                    this.dy = this.dx;
                }
                this.axes = 'xy';
            }
            else {
                this.axes = interaction.resizeAxes;

                if (interaction.resizeAxes === 'x') {
                    this.dy = 0;
                }
                else if (interaction.resizeAxes === 'y') {
                    this.dx = 0;
                }
            }
        }
        else if (action === 'gesture') {
            this.touches = [pointers[0], pointers[1]];

            if (starting) {
                this.distance = touchDistance(pointers, deltaSource);
                this.box      = touchBBox(pointers);
                this.scale    = 1;
                this.ds       = 0;
                this.angle    = touchAngle(pointers, undefined, deltaSource);
                this.da       = 0;
            }
            else if (ending || event instanceof InteractEvent) {
                this.distance = interaction.prevEvent.distance;
                this.box      = interaction.prevEvent.box;
                this.scale    = interaction.prevEvent.scale;
                this.ds       = this.scale - 1;
                this.angle    = interaction.prevEvent.angle;
                this.da       = this.angle - interaction.gesture.startAngle;
            }
            else {
                this.distance = touchDistance(pointers, deltaSource);
                this.box      = touchBBox(pointers);
                this.scale    = this.distance / interaction.gesture.startDistance;
                this.angle    = touchAngle(pointers, interaction.gesture.prevAngle, deltaSource);

                this.ds = this.scale - interaction.gesture.prevScale;
                this.da = this.angle - interaction.gesture.prevAngle;
            }
        }

        if (starting) {
            this.timeStamp = interaction.downTimes[0];
            this.dt        = 0;
            this.duration  = 0;
            this.speed     = 0;
            this.velocityX = 0;
            this.velocityY = 0;
        }
        else if (phase === 'inertiastart') {
            this.timeStamp = interaction.prevEvent.timeStamp;
            this.dt        = interaction.prevEvent.dt;
            this.duration  = interaction.prevEvent.duration;
            this.speed     = interaction.prevEvent.speed;
            this.velocityX = interaction.prevEvent.velocityX;
            this.velocityY = interaction.prevEvent.velocityY;
        }
        else {
            this.timeStamp = new Date().getTime();
            this.dt        = this.timeStamp - interaction.prevEvent.timeStamp;
            this.duration  = this.timeStamp - interaction.downTimes[0];

            if (event instanceof InteractEvent) {
                var dx = this[sourceX] - interaction.prevEvent[sourceX],
                    dy = this[sourceY] - interaction.prevEvent[sourceY],
                    dt = this.dt / 1000;

                this.speed = hypot(dx, dy) / dt;
                this.velocityX = dx / dt;
                this.velocityY = dy / dt;
            }
            // if normal move or end event, use previous user event coords
            else {
                // speed and velocity in pixels per second
                this.speed = interaction.pointerDelta[deltaSource].speed;
                this.velocityX = interaction.pointerDelta[deltaSource].vx;
                this.velocityY = interaction.pointerDelta[deltaSource].vy;
            }
        }

        if ((ending || phase === 'inertiastart')
            && interaction.prevEvent.speed > 600 && this.timeStamp - interaction.prevEvent.timeStamp < 150) {

            var angle = 180 * Math.atan2(interaction.prevEvent.velocityY, interaction.prevEvent.velocityX) / Math.PI,
                overlap = 22.5;

            if (angle < 0) {
                angle += 360;
            }

            var left = 135 - overlap <= angle && angle < 225 + overlap,
                up   = 225 - overlap <= angle && angle < 315 + overlap,

                right = !left && (315 - overlap <= angle || angle <  45 + overlap),
                down  = !up   &&   45 - overlap <= angle && angle < 135 + overlap;

            this.swipe = {
                up   : up,
                down : down,
                left : left,
                right: right,
                angle: angle,
                speed: interaction.prevEvent.speed,
                velocity: {
                    x: interaction.prevEvent.velocityX,
                    y: interaction.prevEvent.velocityY
                }
            };
        }
    }

    InteractEvent.prototype = {
        preventDefault: blank,
        stopImmediatePropagation: function () {
            this.immediatePropagationStopped = this.propagationStopped = true;
        },
        stopPropagation: function () {
            this.propagationStopped = true;
        }
    };

    function preventOriginalDefault () {
        this.originalEvent.preventDefault();
    }

    function getActionCursor (action) {
        var cursor = '';

        if (action.name === 'drag') {
            cursor =  actionCursors.drag;
        }
        if (action.name === 'resize') {
            if (action.axis) {
                cursor =  actionCursors[action.name + action.axis];
            }
            else if (action.edges) {
                var cursorKey = 'resize',
                    edgeNames = ['top', 'bottom', 'left', 'right'];

                for (var i = 0; i < 4; i++) {
                    if (action.edges[edgeNames[i]]) {
                        cursorKey += edgeNames[i];
                    }
                }

                cursor = actionCursors[cursorKey];
            }
        }

        return cursor;
    }

    function checkResizeEdge (name, value, page, element, interactableElement, rect, margin) {
        // false, '', undefined, null
        if (!value) { return false; }

        // true value, use pointer coords and element rect
        if (value === true) {
            // if dimensions are negative, "switch" edges
            var width = isNumber(rect.width)? rect.width : rect.right - rect.left,
                height = isNumber(rect.height)? rect.height : rect.bottom - rect.top;

            if (width < 0) {
                if      (name === 'left' ) { name = 'right'; }
                else if (name === 'right') { name = 'left' ; }
            }
            if (height < 0) {
                if      (name === 'top'   ) { name = 'bottom'; }
                else if (name === 'bottom') { name = 'top'   ; }
            }

            if (name === 'left'  ) { return page.x < ((width  >= 0? rect.left: rect.right ) + margin); }
            if (name === 'top'   ) { return page.y < ((height >= 0? rect.top : rect.bottom) + margin); }

            if (name === 'right' ) { return page.x > ((width  >= 0? rect.right : rect.left) - margin); }
            if (name === 'bottom') { return page.y > ((height >= 0? rect.bottom: rect.top ) - margin); }
        }

        // the remaining checks require an element
        if (!isElement(element)) { return false; }

        return isElement(value)
                    // the value is an element to use as a resize handle
                    ? value === element
                    // otherwise check if element matches value as selector
                    : matchesUpTo(element, value, interactableElement);
    }

    function defaultActionChecker (pointer, interaction, element) {
        var rect = this.getRect(element),
            shouldResize = false,
            action = null,
            resizeAxes = null,
            resizeEdges,
            page = extend({}, interaction.curCoords.page),
            options = this.options;

        if (!rect) { return null; }

        if (actionIsEnabled.resize && options.resize.enabled) {
            var resizeOptions = options.resize;

            resizeEdges = {
                left: false, right: false, top: false, bottom: false
            };

            // if using resize.edges
            if (isObject(resizeOptions.edges)) {
                for (var edge in resizeEdges) {
                    resizeEdges[edge] = checkResizeEdge(edge,
                                                        resizeOptions.edges[edge],
                                                        page,
                                                        interaction._eventTarget,
                                                        element,
                                                        rect,
                                                        resizeOptions.margin || margin);
                }

                resizeEdges.left = resizeEdges.left && !resizeEdges.right;
                resizeEdges.top  = resizeEdges.top  && !resizeEdges.bottom;

                shouldResize = resizeEdges.left || resizeEdges.right || resizeEdges.top || resizeEdges.bottom;
            }
            else {
                var right  = options.resize.axis !== 'y' && page.x > (rect.right  - margin),
                    bottom = options.resize.axis !== 'x' && page.y > (rect.bottom - margin);

                shouldResize = right || bottom;
                resizeAxes = (right? 'x' : '') + (bottom? 'y' : '');
            }
        }

        action = shouldResize
            ? 'resize'
            : actionIsEnabled.drag && options.drag.enabled
                ? 'drag'
                : null;

        if (actionIsEnabled.gesture
            && interaction.pointerIds.length >=2
            && !(interaction.dragging || interaction.resizing)) {
            action = 'gesture';
        }

        if (action) {
            return {
                name: action,
                axis: resizeAxes,
                edges: resizeEdges
            };
        }

        return null;
    }

    // Check if action is enabled globally and the current target supports it
    // If so, return the validated action. Otherwise, return null
    function validateAction (action, interactable) {
        if (!isObject(action)) { return null; }

        var actionName = action.name,
            options = interactable.options;

        if ((  (actionName  === 'resize'   && options.resize.enabled )
            || (actionName      === 'drag'     && options.drag.enabled  )
            || (actionName      === 'gesture'  && options.gesture.enabled))
            && actionIsEnabled[actionName]) {

            if (actionName === 'resize' || actionName === 'resizeyx') {
                actionName = 'resizexy';
            }

            return action;
        }
        return null;
    }

    var listeners = {},
        interactionListeners = [
            'dragStart', 'dragMove', 'resizeStart', 'resizeMove', 'gestureStart', 'gestureMove',
            'pointerOver', 'pointerOut', 'pointerHover', 'selectorDown',
            'pointerDown', 'pointerMove', 'pointerUp', 'pointerCancel', 'pointerEnd',
            'addPointer', 'removePointer', 'recordPointer', 'autoScrollMove'
        ];

    for (var i = 0, len = interactionListeners.length; i < len; i++) {
        var name = interactionListeners[i];

        listeners[name] = doOnInteractions(name);
    }

    // bound to the interactable context when a DOM event
    // listener is added to a selector interactable
    function delegateListener (event, useCapture) {
        var fakeEvent = {},
            delegated = delegatedEvents[event.type],
            eventTarget = getActualElement(event.path
                                           ? event.path[0]
                                           : event.target),
            element = eventTarget;

        useCapture = useCapture? true: false;

        // duplicate the event so that currentTarget can be changed
        for (var prop in event) {
            fakeEvent[prop] = event[prop];
        }

        fakeEvent.originalEvent = event;
        fakeEvent.preventDefault = preventOriginalDefault;

        // climb up document tree looking for selector matches
        while (isElement(element)) {
            for (var i = 0; i < delegated.selectors.length; i++) {
                var selector = delegated.selectors[i],
                    context = delegated.contexts[i];

                if (matchesSelector(element, selector)
                    && nodeContains(context, eventTarget)
                    && nodeContains(context, element)) {

                    var listeners = delegated.listeners[i];

                    fakeEvent.currentTarget = element;

                    for (var j = 0; j < listeners.length; j++) {
                        if (listeners[j][1] === useCapture) {
                            listeners[j][0](fakeEvent);
                        }
                    }
                }
            }

            element = parentElement(element);
        }
    }

    function delegateUseCapture (event) {
        return delegateListener.call(this, event, true);
    }

    interactables.indexOfElement = function indexOfElement (element, context) {
        context = context || document;

        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if ((interactable.selector === element
                && (interactable._context === context))
                || (!interactable.selector && interactable._element === element)) {

                return i;
            }
        }
        return -1;
    };

    interactables.get = function interactableGet (element, options) {
        return this[this.indexOfElement(element, options && options.context)];
    };

    interactables.forEachSelector = function (callback) {
        for (var i = 0; i < this.length; i++) {
            var interactable = this[i];

            if (!interactable.selector) {
                continue;
            }

            var ret = callback(interactable, interactable.selector, interactable._context, i, this);

            if (ret !== undefined) {
                return ret;
            }
        }
    };

    /*\
     * interact
     [ method ]
     *
     * The methods of this variable can be used to set elements as
     * interactables and also to change various default settings.
     *
     * Calling it as a function and passing an element or a valid CSS selector
     * string returns an Interactable object which has various methods to
     * configure it.
     *
     - element (Element | string) The HTML or SVG Element to interact with or CSS selector
     = (object) An @Interactable
     *
     > Usage
     | interact(document.getElementById('draggable')).draggable(true);
     |
     | var rectables = interact('rect');
     | rectables
     |     .gesturable(true)
     |     .on('gesturemove', function (event) {
     |         // something cool...
     |     })
     |     .autoScroll(true);
    \*/
    function interact (element, options) {
        return interactables.get(element, options) || new Interactable(element, options);
    }

    /*\
     * Interactable
     [ property ]
     **
     * Object type returned by @interact
    \*/
    function Interactable (element, options) {
        this._element = element;
        this._iEvents = this._iEvents || {};

        var _window;

        if (trySelector(element)) {
            this.selector = element;

            var context = options && options.context;

            _window = context? getWindow(context) : window;

            if (context && (_window.Node
                    ? context instanceof _window.Node
                    : (isElement(context) || context === _window.document))) {

                this._context = context;
            }
        }
        else {
            _window = getWindow(element);

            if (isElement(element, _window)) {

                if (supportsPointerEvent) {
                    events.add(this._element, pEventTypes.down, listeners.pointerDown );
                    events.add(this._element, pEventTypes.move, listeners.pointerHover);
                }
                else {
                    events.add(this._element, 'mousedown' , listeners.pointerDown );
                    events.add(this._element, 'mousemove' , listeners.pointerHover);
                    events.add(this._element, 'touchstart', listeners.pointerDown );
                    events.add(this._element, 'touchmove' , listeners.pointerHover);
                }
            }
        }

        this._doc = _window.document;

        if (!contains(documents, this._doc)) {
            listenToDocument(this._doc);
        }

        interactables.push(this);

        this.set(options);
    }

    Interactable.prototype = {
        setOnEvents: function (action, phases) {
            if (action === 'drop') {
                if (isFunction(phases.ondrop)          ) { this.ondrop           = phases.ondrop          ; }
                if (isFunction(phases.ondropactivate)  ) { this.ondropactivate   = phases.ondropactivate  ; }
                if (isFunction(phases.ondropdeactivate)) { this.ondropdeactivate = phases.ondropdeactivate; }
                if (isFunction(phases.ondragenter)     ) { this.ondragenter      = phases.ondragenter     ; }
                if (isFunction(phases.ondragleave)     ) { this.ondragleave      = phases.ondragleave     ; }
                if (isFunction(phases.ondropmove)      ) { this.ondropmove       = phases.ondropmove      ; }
            }
            else {
                action = 'on' + action;

                if (isFunction(phases.onstart)       ) { this[action + 'start'         ] = phases.onstart         ; }
                if (isFunction(phases.onmove)        ) { this[action + 'move'          ] = phases.onmove          ; }
                if (isFunction(phases.onend)         ) { this[action + 'end'           ] = phases.onend           ; }
                if (isFunction(phases.oninertiastart)) { this[action + 'inertiastart'  ] = phases.oninertiastart  ; }
            }

            return this;
        },

        /*\
         * Interactable.draggable
         [ method ]
         *
         * Gets or sets whether drag actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of drag events
         | var isDraggable = interact('ul li').draggable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on drag events (object makes the Interactable draggable)
         = (object) This Interactable
         | interact(element).draggable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     // the axis in which the first movement must be
         |     // for the drag sequence to start
         |     // 'xy' by default - any direction
         |     axis: 'x' || 'y' || 'xy',
         |
         |     // max number of drags that can happen concurrently
         |     // with elements of this Interactable. Infinity by default
         |     max: Infinity,
         |
         |     // max number of drags that can target the same element+Interactable
         |     // 1 by default
         |     maxPerElement: 2
         | });
        \*/
        draggable: function (options) {
            if (isObject(options)) {
                this.options.drag.enabled = options.enabled === false? false: true;
                this.setPerAction('drag', options);
                this.setOnEvents('drag', options);

                if (/^x$|^y$|^xy$/.test(options.axis)) {
                    this.options.drag.axis = options.axis;
                }
                else if (options.axis === null) {
                    delete this.options.drag.axis;
                }

                return this;
            }

            if (isBool(options)) {
                this.options.drag.enabled = options;

                return this;
            }

            return this.options.drag;
        },

        setPerAction: function (action, options) {
            // for all the default per-action options
            for (var option in options) {
                // if this option exists for this action
                if (option in defaultOptions[action]) {
                    // if the option in the options arg is an object value
                    if (isObject(options[option])) {
                        // duplicate the object
                        this.options[action][option] = extend(this.options[action][option] || {}, options[option]);

                        if (isObject(defaultOptions.perAction[option]) && 'enabled' in defaultOptions.perAction[option]) {
                            this.options[action][option].enabled = options[option].enabled === false? false : true;
                        }
                    }
                    else if (isBool(options[option]) && isObject(defaultOptions.perAction[option])) {
                        this.options[action][option].enabled = options[option];
                    }
                    else if (options[option] !== undefined) {
                        // or if it's not undefined, do a plain assignment
                        this.options[action][option] = options[option];
                    }
                }
            }
        },

        /*\
         * Interactable.dropzone
         [ method ]
         *
         * Returns or sets whether elements can be dropped onto this
         * Interactable to trigger drop events
         *
         * Dropzones can receive the following events:
         *  - `dropactivate` and `dropdeactivate` when an acceptable drag starts and ends
         *  - `dragenter` and `dragleave` when a draggable enters and leaves the dropzone
         *  - `dragmove` when a draggable that has entered the dropzone is moved
         *  - `drop` when a draggable is dropped into this dropzone
         *
         *  Use the `accept` option to allow only elements that match the given CSS selector or element.
         *
         *  Use the `overlap` option to set how drops are checked for. The allowed values are:
         *   - `'pointer'`, the pointer must be over the dropzone (default)
         *   - `'center'`, the draggable element's center must be over the dropzone
         *   - a number from 0-1 which is the `(intersection area) / (draggable area)`.
         *       e.g. `0.5` for drop to happen when half of the area of the
         *       draggable is over the dropzone
         *
         - options (boolean | object | null) #optional The new value to be set.
         | interact('.drop').dropzone({
         |   accept: '.can-drop' || document.getElementById('single-drop'),
         |   overlap: 'pointer' || 'center' || zeroToOne
         | }
         = (boolean | object) The current setting or this Interactable
        \*/
        dropzone: function (options) {
            if (isObject(options)) {
                this.options.drop.enabled = options.enabled === false? false: true;
                this.setOnEvents('drop', options);

                if (/^(pointer|center)$/.test(options.overlap)) {
                    this.options.drop.overlap = options.overlap;
                }
                else if (isNumber(options.overlap)) {
                    this.options.drop.overlap = Math.max(Math.min(1, options.overlap), 0);
                }
                if ('accept' in options) {
                  this.options.drop.accept = options.accept;
                }
                if ('checker' in options) {
                  this.options.drop.checker = options.checker;
                }

                return this;
            }

            if (isBool(options)) {
                this.options.drop.enabled = options;

                return this;
            }

            return this.options.drop;
        },

        dropCheck: function (dragEvent, event, draggable, draggableElement, dropElement, rect) {
            var dropped = false;

            // if the dropzone has no rect (eg. display: none)
            // call the custom dropChecker or just return false
            if (!(rect = rect || this.getRect(dropElement))) {
                return (this.options.drop.checker
                    ? this.options.drop.checker(dragEvent, event, dropped, this, dropElement, draggable, draggableElement)
                    : false);
            }

            var dropOverlap = this.options.drop.overlap;

            if (dropOverlap === 'pointer') {
                var page = getPageXY(dragEvent),
                    origin = getOriginXY(draggable, draggableElement),
                    horizontal,
                    vertical;

                page.x += origin.x;
                page.y += origin.y;

                horizontal = (page.x > rect.left) && (page.x < rect.right);
                vertical   = (page.y > rect.top ) && (page.y < rect.bottom);

                dropped = horizontal && vertical;
            }

            var dragRect = draggable.getRect(draggableElement);

            if (dropOverlap === 'center') {
                var cx = dragRect.left + dragRect.width  / 2,
                    cy = dragRect.top  + dragRect.height / 2;

                dropped = cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
            }

            if (isNumber(dropOverlap)) {
                var overlapArea  = (Math.max(0, Math.min(rect.right , dragRect.right ) - Math.max(rect.left, dragRect.left))
                                  * Math.max(0, Math.min(rect.bottom, dragRect.bottom) - Math.max(rect.top , dragRect.top ))),
                    overlapRatio = overlapArea / (dragRect.width * dragRect.height);

                dropped = overlapRatio >= dropOverlap;
            }

            if (this.options.drop.checker) {
                dropped = this.options.drop.checker(dragEvent, event, dropped, this, dropElement, draggable, draggableElement);
            }

            return dropped;
        },

        /*\
         * Interactable.dropChecker
         [ method ]
         *
         * DEPRECATED. Use interactable.dropzone({ checker: function... }) instead.
         *
         * Gets or sets the function used to check if a dragged element is
         * over this Interactable.
         *
         - checker (function) #optional The function that will be called when checking for a drop
         = (Function | Interactable) The checker function or this Interactable
         *
         * The checker function takes the following arguments:
         *
         - dragEvent (InteractEvent) The related dragmove or dragend event
         - event (TouchEvent | PointerEvent | MouseEvent) The user move/up/end Event related to the dragEvent
         - dropped (boolean) The value from the default drop checker
         - dropzone (Interactable) The dropzone interactable
         - dropElement (Element) The dropzone element
         - draggable (Interactable) The Interactable being dragged
         - draggableElement (Element) The actual element that's being dragged
         *
         > Usage:
         | interact(target)
         | .dropChecker(function(dragEvent,         // related dragmove or dragend event
         |                       event,             // TouchEvent/PointerEvent/MouseEvent
         |                       dropped,           // bool result of the default checker
         |                       dropzone,          // dropzone Interactable
         |                       dropElement,       // dropzone elemnt
         |                       draggable,         // draggable Interactable
         |                       draggableElement) {// draggable element
         |
         |   return dropped && event.target.hasAttribute('allow-drop');
         | }
        \*/
        dropChecker: function (checker) {
            if (isFunction(checker)) {
                this.options.drop.checker = checker;

                return this;
            }
            if (checker === null) {
                delete this.options.getRect;

                return this;
            }

            return this.options.drop.checker;
        },

        /*\
         * Interactable.accept
         [ method ]
         *
         * Deprecated. add an `accept` property to the options object passed to
         * @Interactable.dropzone instead.
         *
         * Gets or sets the Element or CSS selector match that this
         * Interactable accepts if it is a dropzone.
         *
         - newValue (Element | string | null) #optional
         * If it is an Element, then only that element can be dropped into this dropzone.
         * If it is a string, the element being dragged must match it as a selector.
         * If it is null, the accept options is cleared - it accepts any element.
         *
         = (string | Element | null | Interactable) The current accept option if given `undefined` or this Interactable
        \*/
        accept: function (newValue) {
            if (isElement(newValue)) {
                this.options.drop.accept = newValue;

                return this;
            }

            // test if it is a valid CSS selector
            if (trySelector(newValue)) {
                this.options.drop.accept = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.drop.accept;

                return this;
            }

            return this.options.drop.accept;
        },

        /*\
         * Interactable.resizable
         [ method ]
         *
         * Gets or sets whether resize actions can be performed on the
         * Interactable
         *
         = (boolean) Indicates if this can be the target of resize elements
         | var isResizeable = interact('input[type=text]').resizable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on resize events (object makes the Interactable resizable)
         = (object) This Interactable
         | interact(element).resizable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     edges: {
         |       top   : true,       // Use pointer coords to check for resize.
         |       left  : false,      // Disable resizing from left edge.
         |       bottom: '.resize-s',// Resize if pointer target matches selector
         |       right : handleEl    // Resize if pointer target is the given Element
         |     },
         |
         |     // Width and height can be adjusted independently. When `true`, width and
         |     // height are adjusted at a 1:1 ratio.
         |     square: false,
         |
         |     // Width and height can be adjusted independently. When `true`, width and
         |     // height maintain the aspect ratio they had when resizing started.
         |     preserveAspectRatio: false,
         |
         |     // a value of 'none' will limit the resize rect to a minimum of 0x0
         |     // 'negate' will allow the rect to have negative width/height
         |     // 'reposition' will keep the width/height positive by swapping
         |     // the top and bottom edges and/or swapping the left and right edges
         |     invert: 'none' || 'negate' || 'reposition'
         |
         |     // limit multiple resizes.
         |     // See the explanation in the @Interactable.draggable example
         |     max: Infinity,
         |     maxPerElement: 1,
         | });
        \*/
        resizable: function (options) {
            if (isObject(options)) {
                this.options.resize.enabled = options.enabled === false? false: true;
                this.setPerAction('resize', options);
                this.setOnEvents('resize', options);

                if (/^x$|^y$|^xy$/.test(options.axis)) {
                    this.options.resize.axis = options.axis;
                }
                else if (options.axis === null) {
                    this.options.resize.axis = defaultOptions.resize.axis;
                }

                if (isBool(options.preserveAspectRatio)) {
                    this.options.resize.preserveAspectRatio = options.preserveAspectRatio;
                }
                else if (isBool(options.square)) {
                    this.options.resize.square = options.square;
                }

                return this;
            }
            if (isBool(options)) {
                this.options.resize.enabled = options;

                return this;
            }
            return this.options.resize;
        },

        /*\
         * Interactable.squareResize
         [ method ]
         *
         * Deprecated. Add a `square: true || false` property to @Interactable.resizable instead
         *
         * Gets or sets whether resizing is forced 1:1 aspect
         *
         = (boolean) Current setting
         *
         * or
         *
         - newValue (boolean) #optional
         = (object) this Interactable
        \*/
        squareResize: function (newValue) {
            if (isBool(newValue)) {
                this.options.resize.square = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.resize.square;

                return this;
            }

            return this.options.resize.square;
        },

        /*\
         * Interactable.gesturable
         [ method ]
         *
         * Gets or sets whether multitouch gestures can be performed on the
         * Interactable's element
         *
         = (boolean) Indicates if this can be the target of gesture events
         | var isGestureable = interact(element).gesturable();
         * or
         - options (boolean | object) #optional true/false or An object with event listeners to be fired on gesture events (makes the Interactable gesturable)
         = (object) this Interactable
         | interact(element).gesturable({
         |     onstart: function (event) {},
         |     onmove : function (event) {},
         |     onend  : function (event) {},
         |
         |     // limit multiple gestures.
         |     // See the explanation in @Interactable.draggable example
         |     max: Infinity,
         |     maxPerElement: 1,
         | });
        \*/
        gesturable: function (options) {
            if (isObject(options)) {
                this.options.gesture.enabled = options.enabled === false? false: true;
                this.setPerAction('gesture', options);
                this.setOnEvents('gesture', options);

                return this;
            }

            if (isBool(options)) {
                this.options.gesture.enabled = options;

                return this;
            }

            return this.options.gesture;
        },

        /*\
         * Interactable.autoScroll
         [ method ]
         **
         * Deprecated. Add an `autoscroll` property to the options object
         * passed to @Interactable.draggable or @Interactable.resizable instead.
         *
         * Returns or sets whether dragging and resizing near the edges of the
         * window/container trigger autoScroll for this Interactable
         *
         = (object) Object with autoScroll properties
         *
         * or
         *
         - options (object | boolean) #optional
         * options can be:
         * - an object with margin, distance and interval properties,
         * - true or false to enable or disable autoScroll or
         = (Interactable) this Interactable
        \*/
        autoScroll: function (options) {
            if (isObject(options)) {
                options = extend({ actions: ['drag', 'resize']}, options);
            }
            else if (isBool(options)) {
                options = { actions: ['drag', 'resize'], enabled: options };
            }

            return this.setOptions('autoScroll', options);
        },

        /*\
         * Interactable.snap
         [ method ]
         **
         * Deprecated. Add a `snap` property to the options object passed
         * to @Interactable.draggable or @Interactable.resizable instead.
         *
         * Returns or sets if and how action coordinates are snapped. By
         * default, snapping is relative to the pointer coordinates. You can
         * change this by setting the
         * [`elementOrigin`](https://github.com/taye/interact.js/pull/72).
         **
         = (boolean | object) `false` if snap is disabled; object with snap properties if snap is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | interact(document.querySelector('#thing')).snap({
         |     targets: [
         |         // snap to this specific point
         |         {
         |             x: 100,
         |             y: 100,
         |             range: 25
         |         },
         |         // give this function the x and y page coords and snap to the object returned
         |         function (x, y) {
         |             return {
         |                 x: x,
         |                 y: (75 + 50 * Math.sin(x * 0.04)),
         |                 range: 40
         |             };
         |         },
         |         // create a function that snaps to a grid
         |         interact.createSnapGrid({
         |             x: 50,
         |             y: 50,
         |             range: 10,              // optional
         |             offset: { x: 5, y: 10 } // optional
         |         })
         |     ],
         |     // do not snap during normal movement.
         |     // Instead, trigger only one snapped move event
         |     // immediately before the end event.
         |     endOnly: true,
         |
         |     relativePoints: [
         |         { x: 0, y: 0 },  // snap relative to the top left of the element
         |         { x: 1, y: 1 },  // and also to the bottom right
         |     ],  
         |
         |     // offset the snap target coordinates
         |     // can be an object with x/y or 'startCoords'
         |     offset: { x: 50, y: 50 }
         |   }
         | });
        \*/
        snap: function (options) {
            var ret = this.setOptions('snap', options);

            if (ret === this) { return this; }

            return ret.drag;
        },

        setOptions: function (option, options) {
            var actions = options && isArray(options.actions)
                    ? options.actions
                    : ['drag'];

            var i;

            if (isObject(options) || isBool(options)) {
                for (i = 0; i < actions.length; i++) {
                    var action = /resize/.test(actions[i])? 'resize' : actions[i];

                    if (!isObject(this.options[action])) { continue; }

                    var thisOption = this.options[action][option];

                    if (isObject(options)) {
                        extend(thisOption, options);
                        thisOption.enabled = options.enabled === false? false: true;

                        if (option === 'snap') {
                            if (thisOption.mode === 'grid') {
                                thisOption.targets = [
                                    interact.createSnapGrid(extend({
                                        offset: thisOption.gridOffset || { x: 0, y: 0 }
                                    }, thisOption.grid || {}))
                                ];
                            }
                            else if (thisOption.mode === 'anchor') {
                                thisOption.targets = thisOption.anchors;
                            }
                            else if (thisOption.mode === 'path') {
                                thisOption.targets = thisOption.paths;
                            }

                            if ('elementOrigin' in options) {
                                thisOption.relativePoints = [options.elementOrigin];
                            }
                        }
                    }
                    else if (isBool(options)) {
                        thisOption.enabled = options;
                    }
                }

                return this;
            }

            var ret = {},
                allActions = ['drag', 'resize', 'gesture'];

            for (i = 0; i < allActions.length; i++) {
                if (option in defaultOptions[allActions[i]]) {
                    ret[allActions[i]] = this.options[allActions[i]][option];
                }
            }

            return ret;
        },


        /*\
         * Interactable.inertia
         [ method ]
         **
         * Deprecated. Add an `inertia` property to the options object passed
         * to @Interactable.draggable or @Interactable.resizable instead.
         *
         * Returns or sets if and how events continue to run after the pointer is released
         **
         = (boolean | object) `false` if inertia is disabled; `object` with inertia properties if inertia is enabled
         **
         * or
         **
         - options (object | boolean | null) #optional
         = (Interactable) this Interactable
         > Usage
         | // enable and use default settings
         | interact(element).inertia(true);
         |
         | // enable and use custom settings
         | interact(element).inertia({
         |     // value greater than 0
         |     // high values slow the object down more quickly
         |     resistance     : 16,
         |
         |     // the minimum launch speed (pixels per second) that results in inertia start
         |     minSpeed       : 200,
         |
         |     // inertia will stop when the object slows down to this speed
         |     endSpeed       : 20,
         |
         |     // boolean; should actions be resumed when the pointer goes down during inertia
         |     allowResume    : true,
         |
         |     // boolean; should the jump when resuming from inertia be ignored in event.dx/dy
         |     zeroResumeDelta: false,
         |
         |     // if snap/restrict are set to be endOnly and inertia is enabled, releasing
         |     // the pointer without triggering inertia will animate from the release
         |     // point to the snaped/restricted point in the given amount of time (ms)
         |     smoothEndDuration: 300,
         |
         |     // an array of action types that can have inertia (no gesture)
         |     actions        : ['drag', 'resize']
         | });
         |
         | // reset custom settings and use all defaults
         | interact(element).inertia(null);
        \*/
        inertia: function (options) {
            var ret = this.setOptions('inertia', options);

            if (ret === this) { return this; }

            return ret.drag;
        },

        getAction: function (pointer, event, interaction, element) {
            var action = this.defaultActionChecker(pointer, interaction, element);

            if (this.options.actionChecker) {
                return this.options.actionChecker(pointer, event, action, this, element, interaction);
            }

            return action;
        },

        defaultActionChecker: defaultActionChecker,

        /*\
         * Interactable.actionChecker
         [ method ]
         *
         * Gets or sets the function used to check action to be performed on
         * pointerDown
         *
         - checker (function | null) #optional A function which takes a pointer event, defaultAction string, interactable, element and interaction as parameters and returns an object with name property 'drag' 'resize' or 'gesture' and optionally an `edges` object with boolean 'top', 'left', 'bottom' and right props.
         = (Function | Interactable) The checker function or this Interactable
         *
         | interact('.resize-drag')
         |   .resizable(true)
         |   .draggable(true)
         |   .actionChecker(function (pointer, event, action, interactable, element, interaction) {
         |
         |   if (interact.matchesSelector(event.target, '.drag-handle') {
         |     // force drag with handle target
         |     action.name = drag;
         |   }
         |   else {
         |     // resize from the top and right edges
         |     action.name  = 'resize';
         |     action.edges = { top: true, right: true };
         |   }
         |
         |   return action;
         | });
        \*/
        actionChecker: function (checker) {
            if (isFunction(checker)) {
                this.options.actionChecker = checker;

                return this;
            }

            if (checker === null) {
                delete this.options.actionChecker;

                return this;
            }

            return this.options.actionChecker;
        },

        /*\
         * Interactable.getRect
         [ method ]
         *
         * The default function to get an Interactables bounding rect. Can be
         * overridden using @Interactable.rectChecker.
         *
         - element (Element) #optional The element to measure.
         = (object) The object's bounding rectangle.
         o {
         o     top   : 0,
         o     left  : 0,
         o     bottom: 0,
         o     right : 0,
         o     width : 0,
         o     height: 0
         o }
        \*/
        getRect: function rectCheck (element) {
            element = element || this._element;

            if (this.selector && !(isElement(element))) {
                element = this._context.querySelector(this.selector);
            }

            return getElementRect(element);
        },

        /*\
         * Interactable.rectChecker
         [ method ]
         *
         * Returns or sets the function used to calculate the interactable's
         * element's rectangle
         *
         - checker (function) #optional A function which returns this Interactable's bounding rectangle. See @Interactable.getRect
         = (function | object) The checker function or this Interactable
        \*/
        rectChecker: function (checker) {
            if (isFunction(checker)) {
                this.getRect = checker;

                return this;
            }

            if (checker === null) {
                delete this.options.getRect;

                return this;
            }

            return this.getRect;
        },

        /*\
         * Interactable.styleCursor
         [ method ]
         *
         * Returns or sets whether the action that would be performed when the
         * mouse on the element are checked on `mousemove` so that the cursor
         * may be styled appropriately
         *
         - newValue (boolean) #optional
         = (boolean | Interactable) The current setting or this Interactable
        \*/
        styleCursor: function (newValue) {
            if (isBool(newValue)) {
                this.options.styleCursor = newValue;

                return this;
            }

            if (newValue === null) {
                delete this.options.styleCursor;

                return this;
            }

            return this.options.styleCursor;
        },

        /*\
         * Interactable.preventDefault
         [ method ]
         *
         * Returns or sets whether to prevent the browser's default behaviour
         * in response to pointer events. Can be set to:
         *  - `'always'` to always prevent
         *  - `'never'` to never prevent
         *  - `'auto'` to let interact.js try to determine what would be best
         *
         - newValue (string) #optional `true`, `false` or `'auto'`
         = (string | Interactable) The current setting or this Interactable
        \*/
        preventDefault: function (newValue) {
            if (/^(always|never|auto)$/.test(newValue)) {
                this.options.preventDefault = newValue;
                return this;
            }

            if (isBool(newValue)) {
                this.options.preventDefault = newValue? 'always' : 'never';
                return this;
            }

            return this.options.preventDefault;
        },

        /*\
         * Interactable.origin
         [ method ]
         *
         * Gets or sets the origin of the Interactable's element.  The x and y
         * of the origin will be subtracted from action event coordinates.
         *
         - origin (object | string) #optional An object eg. { x: 0, y: 0 } or string 'parent', 'self' or any CSS selector
         * OR
         - origin (Element) #optional An HTML or SVG Element whose rect will be used
         **
         = (object) The current origin or this Interactable
        \*/
        origin: function (newValue) {
            if (trySelector(newValue)) {
                this.options.origin = newValue;
                return this;
            }
            else if (isObject(newValue)) {
                this.options.origin = newValue;
                return this;
            }

            return this.options.origin;
        },

        /*\
         * Interactable.deltaSource
         [ method ]
         *
         * Returns or sets the mouse coordinate types used to calculate the
         * movement of the pointer.
         *
         - newValue (string) #optional Use 'client' if you will be scrolling while interacting; Use 'page' if you want autoScroll to work
         = (string | object) The current deltaSource or this Interactable
        \*/
        deltaSource: function (newValue) {
            if (newValue === 'page' || newValue === 'client') {
                this.options.deltaSource = newValue;

                return this;
            }

            return this.options.deltaSource;
        },

        /*\
         * Interactable.restrict
         [ method ]
         **
         * Deprecated. Add a `restrict` property to the options object passed to
         * @Interactable.draggable, @Interactable.resizable or @Interactable.gesturable instead.
         *
         * Returns or sets the rectangles within which actions on this
         * interactable (after snap calculations) are restricted. By default,
         * restricting is relative to the pointer coordinates. You can change
         * this by setting the
         * [`elementRect`](https://github.com/taye/interact.js/pull/72).
         **
         - options (object) #optional an object with keys drag, resize, and/or gesture whose values are rects, Elements, CSS selectors, or 'parent' or 'self'
         = (object) The current restrictions object or this Interactable
         **
         | interact(element).restrict({
         |     // the rect will be `interact.getElementRect(element.parentNode)`
         |     drag: element.parentNode,
         |
         |     // x and y are relative to the the interactable's origin
         |     resize: { x: 100, y: 100, width: 200, height: 200 }
         | })
         |
         | interact('.draggable').restrict({
         |     // the rect will be the selected element's parent
         |     drag: 'parent',
         |
         |     // do not restrict during normal movement.
         |     // Instead, trigger only one restricted move event
         |     // immediately before the end event.
         |     endOnly: true,
         |
         |     // https://github.com/taye/interact.js/pull/72#issue-41813493
         |     elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
         | });
        \*/
        restrict: function (options) {
            if (!isObject(options)) {
                return this.setOptions('restrict', options);
            }

            var actions = ['drag', 'resize', 'gesture'],
                ret;

            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];

                if (action in options) {
                    var perAction = extend({
                            actions: [action],
                            restriction: options[action]
                        }, options);

                    ret = this.setOptions('restrict', perAction);
                }
            }

            return ret;
        },

        /*\
         * Interactable.context
         [ method ]
         *
         * Gets the selector context Node of the Interactable. The default is `window.document`.
         *
         = (Node) The context Node of this Interactable
         **
        \*/
        context: function () {
            return this._context;
        },

        _context: document,

        /*\
         * Interactable.ignoreFrom
         [ method ]
         *
         * If the target of the `mousedown`, `pointerdown` or `touchstart`
         * event or any of it's parents match the given CSS selector or
         * Element, no drag/resize/gesture is started.
         *
         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to not ignore any elements
         = (string | Element | object) The current ignoreFrom value or this Interactable
         **
         | interact(element, { ignoreFrom: document.getElementById('no-action') });
         | // or
         | interact(element).ignoreFrom('input, textarea, a');
        \*/
        ignoreFrom: function (newValue) {
            if (trySelector(newValue)) {            // CSS selector to match event.target
                this.options.ignoreFrom = newValue;
                return this;
            }

            if (isElement(newValue)) {              // specific element
                this.options.ignoreFrom = newValue;
                return this;
            }

            return this.options.ignoreFrom;
        },

        /*\
         * Interactable.allowFrom
         [ method ]
         *
         * A drag/resize/gesture is started only If the target of the
         * `mousedown`, `pointerdown` or `touchstart` event or any of it's
         * parents match the given CSS selector or Element.
         *
         - newValue (string | Element | null) #optional a CSS selector string, an Element or `null` to allow from any element
         = (string | Element | object) The current allowFrom value or this Interactable
         **
         | interact(element, { allowFrom: document.getElementById('drag-handle') });
         | // or
         | interact(element).allowFrom('.handle');
        \*/
        allowFrom: function (newValue) {
            if (trySelector(newValue)) {            // CSS selector to match event.target
                this.options.allowFrom = newValue;
                return this;
            }

            if (isElement(newValue)) {              // specific element
                this.options.allowFrom = newValue;
                return this;
            }

            return this.options.allowFrom;
        },

        /*\
         * Interactable.element
         [ method ]
         *
         * If this is not a selector Interactable, it returns the element this
         * interactable represents
         *
         = (Element) HTML / SVG Element
        \*/
        element: function () {
            return this._element;
        },

        /*\
         * Interactable.fire
         [ method ]
         *
         * Calls listeners for the given InteractEvent type bound globally
         * and directly to this Interactable
         *
         - iEvent (InteractEvent) The InteractEvent object to be fired on this Interactable
         = (Interactable) this Interactable
        \*/
        fire: function (iEvent) {
            if (!(iEvent && iEvent.type) || !contains(eventTypes, iEvent.type)) {
                return this;
            }

            var listeners,
                i,
                len,
                onEvent = 'on' + iEvent.type,
                funcName = '';

            // Interactable#on() listeners
            if (iEvent.type in this._iEvents) {
                listeners = this._iEvents[iEvent.type];

                for (i = 0, len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                    funcName = listeners[i].name;
                    listeners[i](iEvent);
                }
            }

            // interactable.onevent listener
            if (isFunction(this[onEvent])) {
                funcName = this[onEvent].name;
                this[onEvent](iEvent);
            }

            // interact.on() listeners
            if (iEvent.type in globalEvents && (listeners = globalEvents[iEvent.type]))  {

                for (i = 0, len = listeners.length; i < len && !iEvent.immediatePropagationStopped; i++) {
                    funcName = listeners[i].name;
                    listeners[i](iEvent);
                }
            }

            return this;
        },

        /*\
         * Interactable.on
         [ method ]
         *
         * Binds a listener for an InteractEvent or DOM event.
         *
         - eventType  (string | array | object) The types of events to listen for
         - listener   (function) The function to be called on the given event(s)
         - useCapture (boolean) #optional useCapture flag for addEventListener
         = (object) This Interactable
        \*/
        on: function (eventType, listener, useCapture) {
            var i;

            if (isString(eventType) && eventType.search(' ') !== -1) {
                eventType = eventType.trim().split(/ +/);
            }

            if (isArray(eventType)) {
                for (i = 0; i < eventType.length; i++) {
                    this.on(eventType[i], listener, useCapture);
                }

                return this;
            }

            if (isObject(eventType)) {
                for (var prop in eventType) {
                    this.on(prop, eventType[prop], listener);
                }

                return this;
            }

            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // convert to boolean
            useCapture = useCapture? true: false;

            if (contains(eventTypes, eventType)) {
                // if this type of event was never bound to this Interactable
                if (!(eventType in this._iEvents)) {
                    this._iEvents[eventType] = [listener];
                }
                else {
                    this._iEvents[eventType].push(listener);
                }
            }
            // delegated event for selector
            else if (this.selector) {
                if (!delegatedEvents[eventType]) {
                    delegatedEvents[eventType] = {
                        selectors: [],
                        contexts : [],
                        listeners: []
                    };

                    // add delegate listener functions
                    for (i = 0; i < documents.length; i++) {
                        events.add(documents[i], eventType, delegateListener);
                        events.add(documents[i], eventType, delegateUseCapture, true);
                    }
                }

                var delegated = delegatedEvents[eventType],
                    index;

                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {
                        break;
                    }
                }

                if (index === -1) {
                    index = delegated.selectors.length;

                    delegated.selectors.push(this.selector);
                    delegated.contexts .push(this._context);
                    delegated.listeners.push([]);
                }

                // keep listener and useCapture flag
                delegated.listeners[index].push([listener, useCapture]);
            }
            else {
                events.add(this._element, eventType, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.off
         [ method ]
         *
         * Removes an InteractEvent or DOM event listener
         *
         - eventType  (string | array | object) The types of events that were listened for
         - listener   (function) The listener function to be removed
         - useCapture (boolean) #optional useCapture flag for removeEventListener
         = (object) This Interactable
        \*/
        off: function (eventType, listener, useCapture) {
            var i;

            if (isString(eventType) && eventType.search(' ') !== -1) {
                eventType = eventType.trim().split(/ +/);
            }

            if (isArray(eventType)) {
                for (i = 0; i < eventType.length; i++) {
                    this.off(eventType[i], listener, useCapture);
                }

                return this;
            }

            if (isObject(eventType)) {
                for (var prop in eventType) {
                    this.off(prop, eventType[prop], listener);
                }

                return this;
            }

            var eventList,
                index = -1;

            // convert to boolean
            useCapture = useCapture? true: false;

            if (eventType === 'wheel') {
                eventType = wheelEvent;
            }

            // if it is an action event type
            if (contains(eventTypes, eventType)) {
                eventList = this._iEvents[eventType];

                if (eventList && (index = indexOf(eventList, listener)) !== -1) {
                    this._iEvents[eventType].splice(index, 1);
                }
            }
            // delegated event
            else if (this.selector) {
                var delegated = delegatedEvents[eventType],
                    matchFound = false;

                if (!delegated) { return this; }

                // count from last index of delegated to 0
                for (index = delegated.selectors.length - 1; index >= 0; index--) {
                    // look for matching selector and context Node
                    if (delegated.selectors[index] === this.selector
                        && delegated.contexts[index] === this._context) {

                        var listeners = delegated.listeners[index];

                        // each item of the listeners array is an array: [function, useCaptureFlag]
                        for (i = listeners.length - 1; i >= 0; i--) {
                            var fn = listeners[i][0],
                                useCap = listeners[i][1];

                            // check if the listener functions and useCapture flags match
                            if (fn === listener && useCap === useCapture) {
                                // remove the listener from the array of listeners
                                listeners.splice(i, 1);

                                // if all listeners for this interactable have been removed
                                // remove the interactable from the delegated arrays
                                if (!listeners.length) {
                                    delegated.selectors.splice(index, 1);
                                    delegated.contexts .splice(index, 1);
                                    delegated.listeners.splice(index, 1);

                                    // remove delegate function from context
                                    events.remove(this._context, eventType, delegateListener);
                                    events.remove(this._context, eventType, delegateUseCapture, true);

                                    // remove the arrays if they are empty
                                    if (!delegated.selectors.length) {
                                        delegatedEvents[eventType] = null;
                                    }
                                }

                                // only remove one listener
                                matchFound = true;
                                break;
                            }
                        }

                        if (matchFound) { break; }
                    }
                }
            }
            // remove listener from this Interatable's element
            else {
                events.remove(this._element, eventType, listener, useCapture);
            }

            return this;
        },

        /*\
         * Interactable.set
         [ method ]
         *
         * Reset the options of this Interactable
         - options (object) The new settings to apply
         = (object) This Interactable
        \*/
        set: function (options) {
            if (!isObject(options)) {
                options = {};
            }

            this.options = extend({}, defaultOptions.base);

            var i,
                actions = ['drag', 'drop', 'resize', 'gesture'],
                methods = ['draggable', 'dropzone', 'resizable', 'gesturable'],
                perActions = extend(extend({}, defaultOptions.perAction), options[action] || {});

            for (i = 0; i < actions.length; i++) {
                var action = actions[i];

                this.options[action] = extend({}, defaultOptions[action]);

                this.setPerAction(action, perActions);

                this[methods[i]](options[action]);
            }

            var settings = [
                    'accept', 'actionChecker', 'allowFrom', 'deltaSource',
                    'dropChecker', 'ignoreFrom', 'origin', 'preventDefault',
                    'rectChecker', 'styleCursor'
                ];

            for (i = 0, len = settings.length; i < len; i++) {
                var setting = settings[i];

                this.options[setting] = defaultOptions.base[setting];

                if (setting in options) {
                    this[setting](options[setting]);
                }
            }

            return this;
        },

        /*\
         * Interactable.unset
         [ method ]
         *
         * Remove this interactable from the list of interactables and remove
         * it's drag, drop, resize and gesture capabilities
         *
         = (object) @interact
        \*/
        unset: function () {
            events.remove(this._element, 'all');

            if (!isString(this.selector)) {
                events.remove(this, 'all');
                if (this.options.styleCursor) {
                    this._element.style.cursor = '';
                }
            }
            else {
                // remove delegated events
                for (var type in delegatedEvents) {
                    var delegated = delegatedEvents[type];

                    for (var i = 0; i < delegated.selectors.length; i++) {
                        if (delegated.selectors[i] === this.selector
                            && delegated.contexts[i] === this._context) {

                            delegated.selectors.splice(i, 1);
                            delegated.contexts .splice(i, 1);
                            delegated.listeners.splice(i, 1);

                            // remove the arrays if they are empty
                            if (!delegated.selectors.length) {
                                delegatedEvents[type] = null;
                            }
                        }

                        events.remove(this._context, type, delegateListener);
                        events.remove(this._context, type, delegateUseCapture, true);

                        break;
                    }
                }
            }

            this.dropzone(false);

            interactables.splice(indexOf(interactables, this), 1);

            return interact;
        }
    };

    function warnOnce (method, message) {
        var warned = false;

        return function () {
            if (!warned) {
                window.console.warn(message);
                warned = true;
            }

            return method.apply(this, arguments);
        };
    }

    Interactable.prototype.snap = warnOnce(Interactable.prototype.snap,
         'Interactable#snap is deprecated. See the new documentation for snapping at http://interactjs.io/docs/snapping');
    Interactable.prototype.restrict = warnOnce(Interactable.prototype.restrict,
         'Interactable#restrict is deprecated. See the new documentation for resticting at http://interactjs.io/docs/restriction');
    Interactable.prototype.inertia = warnOnce(Interactable.prototype.inertia,
         'Interactable#inertia is deprecated. See the new documentation for inertia at http://interactjs.io/docs/inertia');
    Interactable.prototype.autoScroll = warnOnce(Interactable.prototype.autoScroll,
         'Interactable#autoScroll is deprecated. See the new documentation for autoScroll at http://interactjs.io/docs/#autoscroll');
    Interactable.prototype.squareResize = warnOnce(Interactable.prototype.squareResize,
         'Interactable#squareResize is deprecated. See http://interactjs.io/docs/#resize-square');

    Interactable.prototype.accept = warnOnce(Interactable.prototype.accept,
         'Interactable#accept is deprecated. use Interactable#dropzone({ accept: target }) instead');
    Interactable.prototype.dropChecker = warnOnce(Interactable.prototype.dropChecker,
         'Interactable#dropChecker is deprecated. use Interactable#dropzone({ dropChecker: checkerFunction }) instead');
    Interactable.prototype.context = warnOnce(Interactable.prototype.context,
         'Interactable#context as a method is deprecated. It will soon be a DOM Node instead');

    /*\
     * interact.isSet
     [ method ]
     *
     * Check if an element has been set
     - element (Element) The Element being searched for
     = (boolean) Indicates if the element or CSS selector was previously passed to interact
    \*/
    interact.isSet = function(element, options) {
        return interactables.indexOfElement(element, options && options.context) !== -1;
    };

    /*\
     * interact.on
     [ method ]
     *
     * Adds a global listener for an InteractEvent or adds a DOM event to
     * `document`
     *
     - type       (string | array | object) The types of events to listen for
     - listener   (function) The function to be called on the given event(s)
     - useCapture (boolean) #optional useCapture flag for addEventListener
     = (object) interact
    \*/
    interact.on = function (type, listener, useCapture) {
        if (isString(type) && type.search(' ') !== -1) {
            type = type.trim().split(/ +/);
        }

        if (isArray(type)) {
            for (var i = 0; i < type.length; i++) {
                interact.on(type[i], listener, useCapture);
            }

            return interact;
        }

        if (isObject(type)) {
            for (var prop in type) {
                interact.on(prop, type[prop], listener);
            }

            return interact;
        }

        // if it is an InteractEvent type, add listener to globalEvents
        if (contains(eventTypes, type)) {
            // if this type of event was never bound
            if (!globalEvents[type]) {
                globalEvents[type] = [listener];
            }
            else {
                globalEvents[type].push(listener);
            }
        }
        // If non InteractEvent type, addEventListener to document
        else {
            events.add(document, type, listener, useCapture);
        }

        return interact;
    };

    /*\
     * interact.off
     [ method ]
     *
     * Removes a global InteractEvent listener or DOM event from `document`
     *
     - type       (string | array | object) The types of events that were listened for
     - listener   (function) The listener function to be removed
     - useCapture (boolean) #optional useCapture flag for removeEventListener
     = (object) interact
     \*/
    interact.off = function (type, listener, useCapture) {
        if (isString(type) && type.search(' ') !== -1) {
            type = type.trim().split(/ +/);
        }

        if (isArray(type)) {
            for (var i = 0; i < type.length; i++) {
                interact.off(type[i], listener, useCapture);
            }

            return interact;
        }

        if (isObject(type)) {
            for (var prop in type) {
                interact.off(prop, type[prop], listener);
            }

            return interact;
        }

        if (!contains(eventTypes, type)) {
            events.remove(document, type, listener, useCapture);
        }
        else {
            var index;

            if (type in globalEvents
                && (index = indexOf(globalEvents[type], listener)) !== -1) {
                globalEvents[type].splice(index, 1);
            }
        }

        return interact;
    };

    /*\
     * interact.enableDragging
     [ method ]
     *
     * Deprecated.
     *
     * Returns or sets whether dragging is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableDragging = warnOnce(function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.drag = newValue;

            return interact;
        }
        return actionIsEnabled.drag;
    }, 'interact.enableDragging is deprecated and will soon be removed.');

    /*\
     * interact.enableResizing
     [ method ]
     *
     * Deprecated.
     *
     * Returns or sets whether resizing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableResizing = warnOnce(function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.resize = newValue;

            return interact;
        }
        return actionIsEnabled.resize;
    }, 'interact.enableResizing is deprecated and will soon be removed.');

    /*\
     * interact.enableGesturing
     [ method ]
     *
     * Deprecated.
     *
     * Returns or sets whether gesturing is enabled for any Interactables
     *
     - newValue (boolean) #optional `true` to allow the action; `false` to disable action for all Interactables
     = (boolean | object) The current setting or interact
    \*/
    interact.enableGesturing = warnOnce(function (newValue) {
        if (newValue !== null && newValue !== undefined) {
            actionIsEnabled.gesture = newValue;

            return interact;
        }
        return actionIsEnabled.gesture;
    }, 'interact.enableGesturing is deprecated and will soon be removed.');

    interact.eventTypes = eventTypes;

    /*\
     * interact.debug
     [ method ]
     *
     * Returns debugging data
     = (object) An object with properties that outline the current state and expose internal functions and variables
    \*/
    interact.debug = function () {
        var interaction = interactions[0] || new Interaction();

        return {
            interactions          : interactions,
            target                : interaction.target,
            dragging              : interaction.dragging,
            resizing              : interaction.resizing,
            gesturing             : interaction.gesturing,
            prepared              : interaction.prepared,
            matches               : interaction.matches,
            matchElements         : interaction.matchElements,

            prevCoords            : interaction.prevCoords,
            startCoords           : interaction.startCoords,

            pointerIds            : interaction.pointerIds,
            pointers              : interaction.pointers,
            addPointer            : listeners.addPointer,
            removePointer         : listeners.removePointer,
            recordPointer        : listeners.recordPointer,

            snap                  : interaction.snapStatus,
            restrict              : interaction.restrictStatus,
            inertia               : interaction.inertiaStatus,

            downTime              : interaction.downTimes[0],
            downEvent             : interaction.downEvent,
            downPointer           : interaction.downPointer,
            prevEvent             : interaction.prevEvent,

            Interactable          : Interactable,
            interactables         : interactables,
            pointerIsDown         : interaction.pointerIsDown,
            defaultOptions        : defaultOptions,
            defaultActionChecker  : defaultActionChecker,

            actionCursors         : actionCursors,
            dragMove              : listeners.dragMove,
            resizeMove            : listeners.resizeMove,
            gestureMove           : listeners.gestureMove,
            pointerUp             : listeners.pointerUp,
            pointerDown           : listeners.pointerDown,
            pointerMove           : listeners.pointerMove,
            pointerHover          : listeners.pointerHover,

            eventTypes            : eventTypes,

            events                : events,
            globalEvents          : globalEvents,
            delegatedEvents       : delegatedEvents,

            prefixedPropREs       : prefixedPropREs
        };
    };

    // expose the functions used to calculate multi-touch properties
    interact.getPointerAverage = pointerAverage;
    interact.getTouchBBox     = touchBBox;
    interact.getTouchDistance = touchDistance;
    interact.getTouchAngle    = touchAngle;

    interact.getElementRect         = getElementRect;
    interact.getElementClientRect   = getElementClientRect;
    interact.matchesSelector        = matchesSelector;
    interact.closest                = closest;

    /*\
     * interact.margin
     [ method ]
     *
     * Deprecated. Use `interact(target).resizable({ margin: number });` instead.
     * Returns or sets the margin for autocheck resizing used in
     * @Interactable.getAction. That is the distance from the bottom and right
     * edges of an element clicking in which will start resizing
     *
     - newValue (number) #optional
     = (number | interact) The current margin value or interact
    \*/
    interact.margin = warnOnce(function (newvalue) {
        if (isNumber(newvalue)) {
            margin = newvalue;

            return interact;
        }
        return margin;
    },
    'interact.margin is deprecated. Use interact(target).resizable({ margin: number }); instead.') ;

    /*\
     * interact.supportsTouch
     [ method ]
     *
     = (boolean) Whether or not the browser supports touch input
    \*/
    interact.supportsTouch = function () {
        return supportsTouch;
    };

    /*\
     * interact.supportsPointerEvent
     [ method ]
     *
     = (boolean) Whether or not the browser supports PointerEvents
    \*/
    interact.supportsPointerEvent = function () {
        return supportsPointerEvent;
    };

    /*\
     * interact.stop
     [ method ]
     *
     * Cancels all interactions (end events are not fired)
     *
     - event (Event) An event on which to call preventDefault()
     = (object) interact
    \*/
    interact.stop = function (event) {
        for (var i = interactions.length - 1; i >= 0; i--) {
            interactions[i].stop(event);
        }

        return interact;
    };

    /*\
     * interact.dynamicDrop
     [ method ]
     *
     * Returns or sets whether the dimensions of dropzone elements are
     * calculated on every dragmove or only on dragstart for the default
     * dropChecker
     *
     - newValue (boolean) #optional True to check on each move. False to check only before start
     = (boolean | interact) The current setting or interact
    \*/
    interact.dynamicDrop = function (newValue) {
        if (isBool(newValue)) {
            //if (dragging && dynamicDrop !== newValue && !newValue) {
                //calcRects(dropzones);
            //}

            dynamicDrop = newValue;

            return interact;
        }
        return dynamicDrop;
    };

    /*\
     * interact.pointerMoveTolerance
     [ method ]
     * Returns or sets the distance the pointer must be moved before an action
     * sequence occurs. This also affects tolerance for tap events.
     *
     - newValue (number) #optional The movement from the start position must be greater than this value
     = (number | Interactable) The current setting or interact
    \*/
    interact.pointerMoveTolerance = function (newValue) {
        if (isNumber(newValue)) {
            pointerMoveTolerance = newValue;

            return this;
        }

        return pointerMoveTolerance;
    };

    /*\
     * interact.maxInteractions
     [ method ]
     **
     * Returns or sets the maximum number of concurrent interactions allowed.
     * By default only 1 interaction is allowed at a time (for backwards
     * compatibility). To allow multiple interactions on the same Interactables
     * and elements, you need to enable it in the draggable, resizable and
     * gesturable `'max'` and `'maxPerElement'` options.
     **
     - newValue (number) #optional Any number. newValue <= 0 means no interactions.
    \*/
    interact.maxInteractions = function (newValue) {
        if (isNumber(newValue)) {
            maxInteractions = newValue;

            return this;
        }

        return maxInteractions;
    };

    interact.createSnapGrid = function (grid) {
        return function (x, y) {
            var offsetX = 0,
                offsetY = 0;

            if (isObject(grid.offset)) {
                offsetX = grid.offset.x;
                offsetY = grid.offset.y;
            }

            var gridx = Math.round((x - offsetX) / grid.x),
                gridy = Math.round((y - offsetY) / grid.y),

                newX = gridx * grid.x + offsetX,
                newY = gridy * grid.y + offsetY;

            return {
                x: newX,
                y: newY,
                range: grid.range
            };
        };
    };

    function endAllInteractions (event) {
        for (var i = 0; i < interactions.length; i++) {
            interactions[i].pointerEnd(event, event);
        }
    }

    function listenToDocument (doc) {
        if (contains(documents, doc)) { return; }

        var win = doc.defaultView || doc.parentWindow;

        // add delegate event listener
        for (var eventType in delegatedEvents) {
            events.add(doc, eventType, delegateListener);
            events.add(doc, eventType, delegateUseCapture, true);
        }

        if (supportsPointerEvent) {
            if (PointerEvent === win.MSPointerEvent) {
                pEventTypes = {
                    up: 'MSPointerUp', down: 'MSPointerDown', over: 'mouseover',
                    out: 'mouseout', move: 'MSPointerMove', cancel: 'MSPointerCancel' };
            }
            else {
                pEventTypes = {
                    up: 'pointerup', down: 'pointerdown', over: 'pointerover',
                    out: 'pointerout', move: 'pointermove', cancel: 'pointercancel' };
            }

            events.add(doc, pEventTypes.down  , listeners.selectorDown );
            events.add(doc, pEventTypes.move  , listeners.pointerMove  );
            events.add(doc, pEventTypes.over  , listeners.pointerOver  );
            events.add(doc, pEventTypes.out   , listeners.pointerOut   );
            events.add(doc, pEventTypes.up    , listeners.pointerUp    );
            events.add(doc, pEventTypes.cancel, listeners.pointerCancel);

            // autoscroll
            events.add(doc, pEventTypes.move, listeners.autoScrollMove);
        }
        else {
            events.add(doc, 'mousedown', listeners.selectorDown);
            events.add(doc, 'mousemove', listeners.pointerMove );
            events.add(doc, 'mouseup'  , listeners.pointerUp   );
            events.add(doc, 'mouseover', listeners.pointerOver );
            events.add(doc, 'mouseout' , listeners.pointerOut  );

            events.add(doc, 'touchstart' , listeners.selectorDown );
            events.add(doc, 'touchmove'  , listeners.pointerMove  );
            events.add(doc, 'touchend'   , listeners.pointerUp    );
            events.add(doc, 'touchcancel', listeners.pointerCancel);

            // autoscroll
            events.add(doc, 'mousemove', listeners.autoScrollMove);
            events.add(doc, 'touchmove', listeners.autoScrollMove);
        }

        events.add(win, 'blur', endAllInteractions);

        try {
            if (win.frameElement) {
                var parentDoc = win.frameElement.ownerDocument,
                    parentWindow = parentDoc.defaultView;

                events.add(parentDoc   , 'mouseup'      , listeners.pointerEnd);
                events.add(parentDoc   , 'touchend'     , listeners.pointerEnd);
                events.add(parentDoc   , 'touchcancel'  , listeners.pointerEnd);
                events.add(parentDoc   , 'pointerup'    , listeners.pointerEnd);
                events.add(parentDoc   , 'MSPointerUp'  , listeners.pointerEnd);
                events.add(parentWindow, 'blur'         , endAllInteractions );
            }
        }
        catch (error) {
            interact.windowParentError = error;
        }

        // prevent native HTML5 drag on interact.js target elements
        events.add(doc, 'dragstart', function (event) {
            for (var i = 0; i < interactions.length; i++) {
                var interaction = interactions[i];

                if (interaction.element
                    && (interaction.element === event.target
                        || nodeContains(interaction.element, event.target))) {

                    interaction.checkAndPreventDefault(event, interaction.target, interaction.element);
                    return;
                }
            }
        });

        if (events.useAttachEvent) {
            // For IE's lack of Event#preventDefault
            events.add(doc, 'selectstart', function (event) {
                var interaction = interactions[0];

                if (interaction.currentAction()) {
                    interaction.checkAndPreventDefault(event);
                }
            });

            // For IE's bad dblclick event sequence
            events.add(doc, 'dblclick', doOnInteractions('ie8Dblclick'));
        }

        documents.push(doc);
    }

    listenToDocument(document);

    function indexOf (array, target) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === target) {
                return i;
            }
        }

        return -1;
    }

    function contains (array, target) {
        return indexOf(array, target) !== -1;
    }

    function matchesSelector (element, selector, nodeList) {
        if (ie8MatchesSelector) {
            return ie8MatchesSelector(element, selector, nodeList);
        }

        // remove /deep/ from selectors if shadowDOM polyfill is used
        if (window !== realWindow) {
            selector = selector.replace(/\/deep\//g, ' ');
        }

        return element[prefixedMatchesSelector](selector);
    }

    function matchesUpTo (element, selector, limit) {
        while (isElement(element)) {
            if (matchesSelector(element, selector)) {
                return true;
            }

            element = parentElement(element);

            if (element === limit) {
                return matchesSelector(element, selector);
            }
        }

        return false;
    }

    // For IE8's lack of an Element#matchesSelector
    // taken from http://tanalin.com/en/blog/2012/12/matches-selector-ie8/ and modified
    if (!(prefixedMatchesSelector in Element.prototype) || !isFunction(Element.prototype[prefixedMatchesSelector])) {
        ie8MatchesSelector = function (element, selector, elems) {
            elems = elems || element.parentNode.querySelectorAll(selector);

            for (var i = 0, len = elems.length; i < len; i++) {
                if (elems[i] === element) {
                    return true;
                }
            }

            return false;
        };
    }

    // requestAnimationFrame polyfill
    (function() {
        var lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];

        for(var x = 0; x < vendors.length && !realWindow.requestAnimationFrame; ++x) {
            reqFrame = realWindow[vendors[x]+'RequestAnimationFrame'];
            cancelFrame = realWindow[vendors[x]+'CancelAnimationFrame'] || realWindow[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!reqFrame) {
            reqFrame = function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!cancelFrame) {
            cancelFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    /* global exports: true, module, define */

    // http://documentcloud.github.io/underscore/docs/underscore.html#section-11
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = interact;
        }
        exports.interact = interact;
    }
    // AMD
    else if (typeof define === 'function' && define.amd) {
        define('interact', function() {
            return interact;
        });
    }
    else {
        realWindow.interact = interact;
    }

} (typeof window === 'undefined'? undefined : window));

},{}],8:[function(require,module,exports){
/*!
 * Knockout JavaScript library v3.4.2
 * (c) The Knockout.js team - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function(){
var DEBUG=true;
(function(undefined){
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    var window = this || (0, eval)('this'),
        document = window['document'],
        navigator = window['navigator'],
        jQueryInstance = window["jQuery"],
        JSON = window["JSON"];
(function(factory) {
    // Support three module loading scenarios
    if (typeof define === 'function' && define['amd']) {
        // [1] AMD anonymous module
        define(['exports', 'require'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        // [2] CommonJS/Node.js
        factory(module['exports'] || exports);  // module.exports is for Node.js
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['ko'] = {});
    }
}(function(koExports, amdRequire){
// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
var ko = typeof koExports !== 'undefined' ? koExports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
ko.exportSymbol = function(koPath, object) {
    var tokens = koPath.split(".");

    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
    var target = ko;

    for (var i = 0; i < tokens.length - 1; i++)
        target = target[tokens[i]];
    target[tokens[tokens.length - 1]] = object;
};
ko.exportProperty = function(owner, publicName, object) {
    owner[publicName] = object;
};
ko.version = "3.4.2";

ko.exportSymbol('version', ko.version);
// For any options that may affect various areas of Knockout and aren't directly associated with data binding.
ko.options = {
    'deferUpdates': false,
    'useOnlyNativeEvents': false
};

//ko.exportSymbol('options', ko.options);   // 'options' isn't minified
ko.utils = (function () {
    function objectForEach(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(prop, obj[prop]);
            }
        }
    }

    function extend(target, source) {
        if (source) {
            for(var prop in source) {
                if(source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    function setPrototypeOf(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }

    var canSetPrototype = ({ __proto__: [] } instanceof Array);
    var canUseSymbols = !DEBUG && typeof Symbol === 'function';

    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
    var knownEvents = {}, knownEventTypesByEventName = {};
    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    objectForEach(knownEvents, function(eventType, knownEventsForType) {
        if (knownEventsForType.length) {
            for (var i = 0, j = knownEventsForType.length; i < j; i++)
                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    });
    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
    // If there is a future need to detect specific versions of IE10+, we will amend this.
    var ieVersion = document && (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        ) {}
        return version > 4 ? version : undefined;
    }());
    var isIe6 = ieVersion === 6,
        isIe7 = ieVersion === 7;

    function isClickOnCheckableElement(element, eventType) {
        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
        if (eventType.toLowerCase() != "click") return false;
        var inputType = element.type;
        return (inputType == "checkbox") || (inputType == "radio");
    }

    // For details on the pattern for changing node classes
    // see: https://github.com/knockout/knockout/issues/1597
    var cssClassNameRegex = /\S+/g;

    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
        var addOrRemoveFn;
        if (classNames) {
            if (typeof node.classList === 'object') {
                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
                    addOrRemoveFn.call(node.classList, className);
                });
            } else if (typeof node.className['baseVal'] === 'string') {
                // SVG tag .classNames is an SVGAnimatedString instance
                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
            } else {
                // node.className ought to be a string.
                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
            }
        }
    }

    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
        });
        obj[prop] = currentClassNames.join(" ");
    }

    return {
        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

        arrayForEach: function (array, action) {
            for (var i = 0, j = array.length; i < j; i++)
                action(array[i], i);
        },

        arrayIndexOf: function (array, item) {
            if (typeof Array.prototype.indexOf == "function")
                return Array.prototype.indexOf.call(array, item);
            for (var i = 0, j = array.length; i < j; i++)
                if (array[i] === item)
                    return i;
            return -1;
        },

        arrayFirst: function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate.call(predicateOwner, array[i], i))
                    return array[i];
            return null;
        },

        arrayRemoveItem: function (array, itemToRemove) {
            var index = ko.utils.arrayIndexOf(array, itemToRemove);
            if (index > 0) {
                array.splice(index, 1);
            }
            else if (index === 0) {
                array.shift();
            }
        },

        arrayGetDistinctValues: function (array) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++) {
                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
                    result.push(array[i]);
            }
            return result;
        },

        arrayMap: function (array, mapping) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                result.push(mapping(array[i], i));
            return result;
        },

        arrayFilter: function (array, predicate) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate(array[i], i))
                    result.push(array[i]);
            return result;
        },

        arrayPushAll: function (array, valuesToPush) {
            if (valuesToPush instanceof Array)
                array.push.apply(array, valuesToPush);
            else
                for (var i = 0, j = valuesToPush.length; i < j; i++)
                    array.push(valuesToPush[i]);
            return array;
        },

        addOrRemoveItem: function(array, value, included) {
            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
            if (existingEntryIndex < 0) {
                if (included)
                    array.push(value);
            } else {
                if (!included)
                    array.splice(existingEntryIndex, 1);
            }
        },

        canSetPrototype: canSetPrototype,

        extend: extend,

        setPrototypeOf: setPrototypeOf,

        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

        objectForEach: objectForEach,

        objectMap: function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        },

        emptyDomNode: function (domNode) {
            while (domNode.firstChild) {
                ko.removeNode(domNode.firstChild);
            }
        },

        moveCleanedNodesToContainerElement: function(nodes) {
            // Ensure it's a real array, as we're about to reparent the nodes and
            // we don't want the underlying collection to change while we're doing that.
            var nodesArray = ko.utils.makeArray(nodes);
            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

            var container = templateDocument.createElement('div');
            for (var i = 0, j = nodesArray.length; i < j; i++) {
                container.appendChild(ko.cleanNode(nodesArray[i]));
            }
            return container;
        },

        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        },

        setDomNodeChildren: function (domNode, childNodes) {
            ko.utils.emptyDomNode(domNode);
            if (childNodes) {
                for (var i = 0, j = childNodes.length; i < j; i++)
                    domNode.appendChild(childNodes[i]);
            }
        },

        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
            if (nodesToReplaceArray.length > 0) {
                var insertionPoint = nodesToReplaceArray[0];
                var parent = insertionPoint.parentNode;
                for (var i = 0, j = newNodesArray.length; i < j; i++)
                    parent.insertBefore(newNodesArray[i], insertionPoint);
                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
                    ko.removeNode(nodesToReplaceArray[i]);
                }
            }
        },

        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
            //
            // Rules:
            //   [A] Any leading nodes that have been removed should be ignored
            //       These most likely correspond to memoization nodes that were already removed during binding
            //       See https://github.com/knockout/knockout/pull/440
            //   [B] Any trailing nodes that have been remove should be ignored
            //       This prevents the code here from adding unrelated nodes to the array while processing rule [C]
            //       See https://github.com/knockout/knockout/pull/1903
            //   [C] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
            //       and include any nodes that have been inserted among the previous collection

            if (continuousNodeArray.length) {
                // The parent node can be a virtual element; so get the real parent node
                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

                // Rule [A]
                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
                    continuousNodeArray.splice(0, 1);

                // Rule [B]
                while (continuousNodeArray.length > 1 && continuousNodeArray[continuousNodeArray.length - 1].parentNode !== parentNode)
                    continuousNodeArray.length--;

                // Rule [C]
                if (continuousNodeArray.length > 1) {
                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
                    // Replace with the actual new continuous node set
                    continuousNodeArray.length = 0;
                    while (current !== last) {
                        continuousNodeArray.push(current);
                        current = current.nextSibling;
                    }
                    continuousNodeArray.push(last);
                }
            }
            return continuousNodeArray;
        },

        setOptionNodeSelectionState: function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (ieVersion < 7)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        },

        stringTrim: function (string) {
            return string === null || string === undefined ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        },

        stringStartsWith: function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        },

        domNodeIsContainedBy: function (node, containedByNode) {
            if (node === containedByNode)
                return true;
            if (node.nodeType === 11)
                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
            if (containedByNode.contains)
                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
            if (containedByNode.compareDocumentPosition)
                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
            return !!node;
        },

        domNodeIsAttachedToDocument: function (node) {
            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
        },

        anyDomNodeIsAttachedToDocument: function(nodes) {
            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
        },

        tagNameLower: function(element) {
            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
            return element && element.tagName && element.tagName.toLowerCase();
        },

        catchFunctionErrors: function (delegate) {
            return ko['onError'] ? function () {
                try {
                    return delegate.apply(this, arguments);
                } catch (e) {
                    ko['onError'] && ko['onError'](e);
                    throw e;
                }
            } : delegate;
        },

        setTimeout: function (handler, timeout) {
            return setTimeout(ko.utils.catchFunctionErrors(handler), timeout);
        },

        deferError: function (error) {
            setTimeout(function () {
                ko['onError'] && ko['onError'](error);
                throw error;
            }, 0);
        },

        registerEventHandler: function (element, eventType, handler) {
            var wrappedHandler = ko.utils.catchFunctionErrors(handler);

            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
            if (!ko.options['useOnlyNativeEvents'] && !mustUseAttachEvent && jQueryInstance) {
                jQueryInstance(element)['bind'](eventType, wrappedHandler);
            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
                element.addEventListener(eventType, wrappedHandler, false);
            else if (typeof element.attachEvent != "undefined") {
                var attachEventHandler = function (event) { wrappedHandler.call(element, event); },
                    attachEventName = "on" + eventType;
                element.attachEvent(attachEventName, attachEventHandler);

                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
                // so to avoid leaks, we have to remove them manually. See bug #856
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    element.detachEvent(attachEventName, attachEventHandler);
                });
            } else
                throw new Error("Browser doesn't support addEventListener or attachEvent");
        },

        triggerEvent: function (element, eventType) {
            if (!(element && element.nodeType))
                throw new Error("element must be a DOM node when calling triggerEvent");

            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
            // In both cases, we'll use the click method instead.
            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

            if (!ko.options['useOnlyNativeEvents'] && jQueryInstance && !useClickWorkaround) {
                jQueryInstance(element)['trigger'](eventType);
            } else if (typeof document.createEvent == "function") {
                if (typeof element.dispatchEvent == "function") {
                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
                    var event = document.createEvent(eventCategory);
                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                    element.dispatchEvent(event);
                }
                else
                    throw new Error("The supplied element doesn't support dispatchEvent");
            } else if (useClickWorkaround && element.click) {
                element.click();
            } else if (typeof element.fireEvent != "undefined") {
                element.fireEvent("on" + eventType);
            } else {
                throw new Error("Browser doesn't support triggering events");
            }
        },

        unwrapObservable: function (value) {
            return ko.isObservable(value) ? value() : value;
        },

        peekObservable: function (value) {
            return ko.isObservable(value) ? value.peek() : value;
        },

        toggleDomNodeCssClass: toggleDomNodeCssClass,

        setTextContent: function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            // We need there to be exactly one child: a text node.
            // If there are no children, more than one, or if it's not a text node,
            // we'll clear everything and create a single text node.
            var innerTextNode = ko.virtualElements.firstChild(element);
            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
            } else {
                innerTextNode.data = value;
            }

            ko.utils.forceRefresh(element);
        },

        setElementName: function(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        },

        forceRefresh: function(node) {
            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
            if (ieVersion >= 9) {
                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
                var elem = node.nodeType == 1 ? node : node.parentNode;
                if (elem.style)
                    elem.style.zoom = elem.style.zoom;
            }
        },

        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
            if (ieVersion) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        },

        range: function (min, max) {
            min = ko.utils.unwrapObservable(min);
            max = ko.utils.unwrapObservable(max);
            var result = [];
            for (var i = min; i <= max; i++)
                result.push(i);
            return result;
        },

        makeArray: function(arrayLikeObject) {
            var result = [];
            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
                result.push(arrayLikeObject[i]);
            };
            return result;
        },

        createSymbolOrString: function(identifier) {
            return canUseSymbols ? Symbol(identifier) : identifier;
        },

        isIe6 : isIe6,
        isIe7 : isIe7,
        ieVersion : ieVersion,

        getFormFields: function(form, fieldName) {
            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
            var isMatchingField = (typeof fieldName == 'string')
                ? function(field) { return field.name === fieldName }
                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
            var matches = [];
            for (var i = fields.length - 1; i >= 0; i--) {
                if (isMatchingField(fields[i]))
                    matches.push(fields[i]);
            };
            return matches;
        },

        parseJson: function (jsonString) {
            if (typeof jsonString == "string") {
                jsonString = ko.utils.stringTrim(jsonString);
                if (jsonString) {
                    if (JSON && JSON.parse) // Use native parsing where available
                        return JSON.parse(jsonString);
                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
                }
            }
            return null;
        },

        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
            if (!JSON || !JSON.stringify)
                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
        },

        postJson: function (urlOrForm, data, options) {
            options = options || {};
            var params = options['params'] || {};
            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
            var url = urlOrForm;

            // If we were given a form, use its 'action' URL and pick out any requested field values
            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
                var originalForm = urlOrForm;
                url = originalForm.action;
                for (var i = includeFields.length - 1; i >= 0; i--) {
                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
                    for (var j = fields.length - 1; j >= 0; j--)
                        params[fields[j].name] = fields[j].value;
                }
            }

            data = ko.utils.unwrapObservable(data);
            var form = document.createElement("form");
            form.style.display = "none";
            form.action = url;
            form.method = "post";
            for (var key in data) {
                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
                form.appendChild(input);
            }
            objectForEach(params, function(key, value) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            options['submitter'] ? options['submitter'](form) : form.submit();
            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
        }
    }
}());

ko.exportSymbol('utils', ko.utils);
ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
ko.exportSymbol('utils.extend', ko.utils.extend);
ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
ko.exportSymbol('utils.postJson', ko.utils.postJson);
ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
ko.exportSymbol('utils.range', ko.utils.range);
ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

if (!Function.prototype['bind']) {
    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
    Function.prototype['bind'] = function (object) {
        var originalFunction = this;
        if (arguments.length === 1) {
            return function () {
                return originalFunction.apply(object, arguments);
            };
        } else {
            var partialArgs = Array.prototype.slice.call(arguments, 1);
            return function () {
                var args = partialArgs.slice(0);
                args.push.apply(args, arguments);
                return originalFunction.apply(object, args);
            };
        }
    };
}

ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    function getAll(node, createIfNotFound) {
        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
        if (!hasExistingDataStore) {
            if (!createIfNotFound)
                return undefined;
            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
            dataStore[dataStoreKey] = {};
        }
        return dataStore[dataStoreKey];
    }

    return {
        get: function (node, key) {
            var allDataForNode = getAll(node, false);
            return allDataForNode === undefined ? undefined : allDataForNode[key];
        },
        set: function (node, key, value) {
            if (value === undefined) {
                // Make sure we don't actually create a new domData key if we are actually deleting a value
                if (getAll(node, false) === undefined)
                    return;
            }
            var allDataForNode = getAll(node, true);
            allDataForNode[key] = value;
        },
        clear: function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        },

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

ko.utils.domNodeDisposal = new (function () {
    var domDataKey = ko.utils.domData.nextKey();
    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

    function getDisposeCallbacksCollection(node, createIfNotFound) {
        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
            allDisposeCallbacks = [];
            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
        }
        return allDisposeCallbacks;
    }
    function destroyCallbacksCollection(node) {
        ko.utils.domData.set(node, domDataKey, undefined);
    }

    function cleanSingleNode(node) {
        // Run all the dispose callbacks
        var callbacks = getDisposeCallbacksCollection(node, false);
        if (callbacks) {
            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
            for (var i = 0; i < callbacks.length; i++)
                callbacks[i](node);
        }

        // Erase the DOM data
        ko.utils.domData.clear(node);

        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
        ko.utils.domNodeDisposal["cleanExternalData"](node);

        // Clear any immediate-child comment nodes, as these wouldn't have been found by
        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
        if (cleanableNodeTypesWithDescendants[node.nodeType])
            cleanImmediateCommentTypeChildren(node);
    }

    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
        var child, nextChild = nodeWithChildren.firstChild;
        while (child = nextChild) {
            nextChild = child.nextSibling;
            if (child.nodeType === 8)
                cleanSingleNode(child);
        }
    }

    return {
        addDisposeCallback : function(node, callback) {
            if (typeof callback != "function")
                throw new Error("Callback must be a function");
            getDisposeCallbacksCollection(node, true).push(callback);
        },

        removeDisposeCallback : function(node, callback) {
            var callbacksCollection = getDisposeCallbacksCollection(node, false);
            if (callbacksCollection) {
                ko.utils.arrayRemoveItem(callbacksCollection, callback);
                if (callbacksCollection.length == 0)
                    destroyCallbacksCollection(node);
            }
        },

        cleanNode : function(node) {
            // First clean this node, where applicable
            if (cleanableNodeTypes[node.nodeType]) {
                cleanSingleNode(node);

                // ... then its descendants, where applicable
                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
                    // Clone the descendants list in case it changes during iteration
                    var descendants = [];
                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
                    for (var i = 0, j = descendants.length; i < j; i++)
                        cleanSingleNode(descendants[i]);
                }
            }
            return node;
        },

        removeNode : function(node) {
            ko.cleanNode(node);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        },

        "cleanExternalData" : function (node) {
            // Special support for jQuery here because it's so commonly used.
            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
            // so notify it to tear down any resources associated with the node & descendants here.
            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
                jQueryInstance['cleanData']([node]);
        }
    };
})();
ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
ko.exportSymbol('cleanNode', ko.cleanNode);
ko.exportSymbol('removeNode', ko.removeNode);
ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
(function () {
    var none = [0, "", ""],
        table = [1, "<table>", "</table>"],
        tbody = [2, "<table><tbody>", "</tbody></table>"],
        tr = [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        select = [1, "<select multiple='multiple'>", "</select>"],
        lookup = {
            'thead': table,
            'tbody': table,
            'tfoot': table,
            'tr': tbody,
            'td': tr,
            'th': tr,
            'option': select,
            'optgroup': select
        },

        // This is needed for old IE if you're *not* using either jQuery or innerShiv. Doesn't affect other cases.
        mayRequireCreateElementHack = ko.utils.ieVersion <= 8;

    function getWrap(tags) {
        var m = tags.match(/^<([a-z]+)[ >]/);
        return (m && lookup[m[1]]) || none;
    }

    function simpleHtmlParse(html, documentContext) {
        documentContext || (documentContext = document);
        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;

        // Based on jQuery's "clean" function, but only accounting for table-related elements.
        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div"),
            wrap = getWrap(tags),
            depth = wrap[0];

        // Go to html and back, then peel off extra wrappers
        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
        if (typeof windowContext['innerShiv'] == "function") {
            // Note that innerShiv is deprecated in favour of html5shiv. We should consider adding
            // support for html5shiv (except if no explicit support is needed, e.g., if html5shiv
            // somehow shims the native APIs so it just works anyway)
            div.appendChild(windowContext['innerShiv'](markup));
        } else {
            if (mayRequireCreateElementHack) {
                // The document.createElement('my-element') trick to enable custom elements in IE6-8
                // only works if we assign innerHTML on an element associated with that document.
                documentContext.appendChild(div);
            }

            div.innerHTML = markup;

            if (mayRequireCreateElementHack) {
                div.parentNode.removeChild(div);
            }
        }

        // Move to the right depth
        while (depth--)
            div = div.lastChild;

        return ko.utils.makeArray(div.lastChild.childNodes);
    }

    function jQueryHtmlParse(html, documentContext) {
        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
        if (jQueryInstance['parseHTML']) {
            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
        } else {
            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
            var elems = jQueryInstance['clean']([html], documentContext);

            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
            if (elems && elems[0]) {
                // Find the top-most parent element that's a direct child of a document fragment
                var elem = elems[0];
                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
                    elem = elem.parentNode;
                // ... then detach it
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }

            return elems;
        }
    }

    ko.utils.parseHtmlFragment = function(html, documentContext) {
        return jQueryInstance ?
            jQueryHtmlParse(html, documentContext) :   // As below, benefit from jQuery's optimisations where possible
            simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
    };

    ko.utils.setHtml = function(node, html) {
        ko.utils.emptyDomNode(node);

        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
        html = ko.utils.unwrapObservable(html);

        if ((html !== null) && (html !== undefined)) {
            if (typeof html != 'string')
                html = html.toString();

            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
            // for example <tr> elements which are not normally allowed to exist on their own.
            // If you've referenced jQuery we'll use that rather than duplicating its code.
            if (jQueryInstance) {
                jQueryInstance(node)['html'](html);
            } else {
                // ... otherwise, use KO's own parsing logic.
                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
                for (var i = 0; i < parsedNodes.length; i++)
                    node.appendChild(parsedNodes[i]);
            }
        }
    };
})();

ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

ko.memoization = (function () {
    var memos = {};

    function randomMax8HexChars() {
        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
    }
    function generateRandomId() {
        return randomMax8HexChars() + randomMax8HexChars();
    }
    function findMemoNodes(rootNode, appendToArray) {
        if (!rootNode)
            return;
        if (rootNode.nodeType == 8) {
            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
            if (memoId != null)
                appendToArray.push({ domNode: rootNode, memoId: memoId });
        } else if (rootNode.nodeType == 1) {
            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
                findMemoNodes(childNodes[i], appendToArray);
        }
    }

    return {
        memoize: function (callback) {
            if (typeof callback != "function")
                throw new Error("You can only pass a function to ko.memoization.memoize()");
            var memoId = generateRandomId();
            memos[memoId] = callback;
            return "<!--[ko_memo:" + memoId + "]-->";
        },

        unmemoize: function (memoId, callbackParams) {
            var callback = memos[memoId];
            if (callback === undefined)
                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
            try {
                callback.apply(null, callbackParams || []);
                return true;
            }
            finally { delete memos[memoId]; }
        },

        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
            var memos = [];
            findMemoNodes(domNode, memos);
            for (var i = 0, j = memos.length; i < j; i++) {
                var node = memos[i].domNode;
                var combinedParams = [node];
                if (extraCallbackParamsArray)
                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
                if (node.parentNode)
                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
            }
        },

        parseMemoText: function (memoText) {
            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
            return match ? match[1] : null;
        }
    };
})();

ko.exportSymbol('memoization', ko.memoization);
ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
ko.tasks = (function () {
    var scheduler,
        taskQueue = [],
        taskQueueLength = 0,
        nextHandle = 1,
        nextIndexToProcess = 0;

    if (window['MutationObserver']) {
        // Chrome 27+, Firefox 14+, IE 11+, Opera 15+, Safari 6.1+
        // From https://github.com/petkaantonov/bluebird * Copyright (c) 2014 Petka Antonov * License: MIT
        scheduler = (function (callback) {
            var div = document.createElement("div");
            new MutationObserver(callback).observe(div, {attributes: true});
            return function () { div.classList.toggle("foo"); };
        })(scheduledProcess);
    } else if (document && "onreadystatechange" in document.createElement("script")) {
        // IE 6-10
        // From https://github.com/YuzuJS/setImmediate * Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola * License: MIT
        scheduler = function (callback) {
            var script = document.createElement("script");
            script.onreadystatechange = function () {
                script.onreadystatechange = null;
                document.documentElement.removeChild(script);
                script = null;
                callback();
            };
            document.documentElement.appendChild(script);
        };
    } else {
        scheduler = function (callback) {
            setTimeout(callback, 0);
        };
    }

    function processTasks() {
        if (taskQueueLength) {
            // Each mark represents the end of a logical group of tasks and the number of these groups is
            // limited to prevent unchecked recursion.
            var mark = taskQueueLength, countMarks = 0;

            // nextIndexToProcess keeps track of where we are in the queue; processTasks can be called recursively without issue
            for (var task; nextIndexToProcess < taskQueueLength; ) {
                if (task = taskQueue[nextIndexToProcess++]) {
                    if (nextIndexToProcess > mark) {
                        if (++countMarks >= 5000) {
                            nextIndexToProcess = taskQueueLength;   // skip all tasks remaining in the queue since any of them could be causing the recursion
                            ko.utils.deferError(Error("'Too much recursion' after processing " + countMarks + " task groups."));
                            break;
                        }
                        mark = taskQueueLength;
                    }
                    try {
                        task();
                    } catch (ex) {
                        ko.utils.deferError(ex);
                    }
                }
            }
        }
    }

    function scheduledProcess() {
        processTasks();

        // Reset the queue
        nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
    }

    function scheduleTaskProcessing() {
        ko.tasks['scheduler'](scheduledProcess);
    }

    var tasks = {
        'scheduler': scheduler,     // Allow overriding the scheduler

        schedule: function (func) {
            if (!taskQueueLength) {
                scheduleTaskProcessing();
            }

            taskQueue[taskQueueLength++] = func;
            return nextHandle++;
        },

        cancel: function (handle) {
            var index = handle - (nextHandle - taskQueueLength);
            if (index >= nextIndexToProcess && index < taskQueueLength) {
                taskQueue[index] = null;
            }
        },

        // For testing only: reset the queue and return the previous queue length
        'resetForTesting': function () {
            var length = taskQueueLength - nextIndexToProcess;
            nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
            return length;
        },

        runEarly: processTasks
    };

    return tasks;
})();

ko.exportSymbol('tasks', ko.tasks);
ko.exportSymbol('tasks.schedule', ko.tasks.schedule);
//ko.exportSymbol('tasks.cancel', ko.tasks.cancel);  "cancel" isn't minified
ko.exportSymbol('tasks.runEarly', ko.tasks.runEarly);
ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttling means two things:

        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
        target['throttleEvaluation'] = timeout;

        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
        //     so the target cannot change value synchronously or faster than a certain rate
        var writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = ko.utils.setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'rateLimit': function(target, options) {
        var timeout, method, limitFunction;

        if (typeof options == 'number') {
            timeout = options;
        } else {
            timeout = options['timeout'];
            method = options['method'];
        }

        // rateLimit supersedes deferred updates
        target._deferUpdates = false;

        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
        target.limit(function(callback) {
            return limitFunction(callback, timeout);
        });
    },

    'deferred': function(target, options) {
        if (options !== true) {
            throw new Error('The \'deferred\' extender only accepts the value \'true\', because it is not supported to turn deferral off once enabled.')
        }

        if (!target._deferUpdates) {
            target._deferUpdates = true;
            target.limit(function (callback) {
                var handle,
                    ignoreUpdates = false;
                return function () {
                    if (!ignoreUpdates) {
                        ko.tasks.cancel(handle);
                        handle = ko.tasks.schedule(callback);

                        try {
                            ignoreUpdates = true;
                            target['notifySubscribers'](undefined, 'dirty');
                        } finally {
                            ignoreUpdates = false;
                        }
                    }
                };
            });
        }
    },

    'notify': function(target, notifyWhen) {
        target["equalityComparer"] = notifyWhen == "always" ?
            null :  // null equalityComparer means to always notify
            valuesArePrimitiveAndEqual;
    }
};

var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
function valuesArePrimitiveAndEqual(a, b) {
    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

function throttle(callback, timeout) {
    var timeoutInstance;
    return function () {
        if (!timeoutInstance) {
            timeoutInstance = ko.utils.setTimeout(function () {
                timeoutInstance = undefined;
                callback();
            }, timeout);
        }
    };
}

function debounce(callback, timeout) {
    var timeoutInstance;
    return function () {
        clearTimeout(timeoutInstance);
        timeoutInstance = ko.utils.setTimeout(callback, timeout);
    };
}

function applyExtenders(requestedExtenders) {
    var target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            var extenderHandler = ko.extenders[key];
            if (typeof extenderHandler == 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

ko.subscription = function (target, callback, disposeCallback) {
    this._target = target;
    this.callback = callback;
    this.disposeCallback = disposeCallback;
    this.isDisposed = false;
    ko.exportProperty(this, 'dispose', this.dispose);
};
ko.subscription.prototype.dispose = function () {
    this.isDisposed = true;
    this.disposeCallback();
};

ko.subscribable = function () {
    ko.utils.setPrototypeOfOrExtend(this, ko_subscribable_fn);
    ko_subscribable_fn.init(this);
}

var defaultEvent = "change";

// Moved out of "limit" to avoid the extra closure
function limitNotifySubscribers(value, event) {
    if (!event || event === defaultEvent) {
        this._limitChange(value);
    } else if (event === 'beforeChange') {
        this._limitBeforeChange(value);
    } else {
        this._origNotifySubscribers(value, event);
    }
}

var ko_subscribable_fn = {
    init: function(instance) {
        instance._subscriptions = { "change": [] };
        instance._versionNumber = 1;
    },

    subscribe: function (callback, callbackTarget, event) {
        var self = this;

        event = event || defaultEvent;
        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

        var subscription = new ko.subscription(self, boundCallback, function () {
            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
            if (self.afterSubscriptionRemove)
                self.afterSubscriptionRemove(event);
        });

        if (self.beforeSubscriptionAdd)
            self.beforeSubscriptionAdd(event);

        if (!self._subscriptions[event])
            self._subscriptions[event] = [];
        self._subscriptions[event].push(subscription);

        return subscription;
    },

    "notifySubscribers": function (valueToNotify, event) {
        event = event || defaultEvent;
        if (event === defaultEvent) {
            this.updateVersion();
        }
        if (this.hasSubscriptionsForEvent(event)) {
            var subs = event === defaultEvent && this._changeSubscriptions || this._subscriptions[event].slice(0);
            try {
                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
                for (var i = 0, subscription; subscription = subs[i]; ++i) {
                    // In case a subscription was disposed during the arrayForEach cycle, check
                    // for isDisposed on each subscription before invoking its callback
                    if (!subscription.isDisposed)
                        subscription.callback(valueToNotify);
                }
            } finally {
                ko.dependencyDetection.end(); // End suppressing dependency detection
            }
        }
    },

    getVersion: function () {
        return this._versionNumber;
    },

    hasChanged: function (versionToCheck) {
        return this.getVersion() !== versionToCheck;
    },

    updateVersion: function () {
        ++this._versionNumber;
    },

    limit: function(limitFunction) {
        var self = this, selfIsObservable = ko.isObservable(self),
            ignoreBeforeChange, notifyNextChange, previousValue, pendingValue, beforeChange = 'beforeChange';

        if (!self._origNotifySubscribers) {
            self._origNotifySubscribers = self["notifySubscribers"];
            self["notifySubscribers"] = limitNotifySubscribers;
        }

        var finish = limitFunction(function() {
            self._notificationIsPending = false;

            // If an observable provided a reference to itself, access it to get the latest value.
            // This allows computed observables to delay calculating their value until needed.
            if (selfIsObservable && pendingValue === self) {
                pendingValue = self._evalIfChanged ? self._evalIfChanged() : self();
            }
            var shouldNotify = notifyNextChange || self.isDifferent(previousValue, pendingValue);

            notifyNextChange = ignoreBeforeChange = false;

            if (shouldNotify) {
                self._origNotifySubscribers(previousValue = pendingValue);
            }
        });

        self._limitChange = function(value) {
            self._changeSubscriptions = self._subscriptions[defaultEvent].slice(0);
            self._notificationIsPending = ignoreBeforeChange = true;
            pendingValue = value;
            finish();
        };
        self._limitBeforeChange = function(value) {
            if (!ignoreBeforeChange) {
                previousValue = value;
                self._origNotifySubscribers(value, beforeChange);
            }
        };
        self._notifyNextChangeIfValueIsDifferent = function() {
            if (self.isDifferent(previousValue, self.peek(true /*evaluate*/))) {
                notifyNextChange = true;
            }
        };
    },

    hasSubscriptionsForEvent: function(event) {
        return this._subscriptions[event] && this._subscriptions[event].length;
    },

    getSubscriptionsCount: function (event) {
        if (event) {
            return this._subscriptions[event] && this._subscriptions[event].length || 0;
        } else {
            var total = 0;
            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
                if (eventName !== 'dirty')
                    total += subscriptions.length;
            });
            return total;
        }
    },

    isDifferent: function(oldValue, newValue) {
        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
    },

    extend: applyExtenders
};

ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

// For browsers that support proto assignment, we overwrite the prototype of each
// observable instance. Since observables are functions, we need Function.prototype
// to still be in the prototype chain.
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
}

ko.subscribable['fn'] = ko_subscribable_fn;


ko.isSubscribable = function (instance) {
    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
};

ko.exportSymbol('subscribable', ko.subscribable);
ko.exportSymbol('isSubscribable', ko.isSubscribable);

ko.computedContext = ko.dependencyDetection = (function () {
    var outerFrames = [],
        currentFrame,
        lastId = 0;

    // Return a unique ID that can be assigned to an observable for dependency tracking.
    // Theoretically, you could eventually overflow the number storage size, resulting
    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
    // take over 285 years to reach that number.
    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
    function getId() {
        return ++lastId;
    }

    function begin(options) {
        outerFrames.push(currentFrame);
        currentFrame = options;
    }

    function end() {
        currentFrame = outerFrames.pop();
    }

    return {
        begin: begin,

        end: end,

        registerDependency: function (subscribable) {
            if (currentFrame) {
                if (!ko.isSubscribable(subscribable))
                    throw new Error("Only subscribable things can act as dependencies");
                currentFrame.callback.call(currentFrame.callbackTarget, subscribable, subscribable._id || (subscribable._id = getId()));
            }
        },

        ignore: function (callback, callbackTarget, callbackArgs) {
            try {
                begin();
                return callback.apply(callbackTarget, callbackArgs || []);
            } finally {
                end();
            }
        },

        getDependenciesCount: function () {
            if (currentFrame)
                return currentFrame.computed.getDependenciesCount();
        },

        isInitial: function() {
            if (currentFrame)
                return currentFrame.isInitial;
        }
    };
})();

ko.exportSymbol('computedContext', ko.computedContext);
ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);

ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
var observableLatestValue = ko.utils.createSymbolOrString('_latestValue');

ko.observable = function (initialValue) {
    function observable() {
        if (arguments.length > 0) {
            // Write

            // Ignore writes if the value hasn't changed
            if (observable.isDifferent(observable[observableLatestValue], arguments[0])) {
                observable.valueWillMutate();
                observable[observableLatestValue] = arguments[0];
                observable.valueHasMutated();
            }
            return this; // Permits chained assignments
        }
        else {
            // Read
            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
            return observable[observableLatestValue];
        }
    }

    observable[observableLatestValue] = initialValue;

    // Inherit from 'subscribable'
    if (!ko.utils.canSetPrototype) {
        // 'subscribable' won't be on the prototype chain unless we put it there directly
        ko.utils.extend(observable, ko.subscribable['fn']);
    }
    ko.subscribable['fn'].init(observable);

    // Inherit from 'observable'
    ko.utils.setPrototypeOfOrExtend(observable, observableFn);

    if (ko.options['deferUpdates']) {
        ko.extenders['deferred'](observable, true);
    }

    return observable;
}

// Define prototype for observables
var observableFn = {
    'equalityComparer': valuesArePrimitiveAndEqual,
    peek: function() { return this[observableLatestValue]; },
    valueHasMutated: function () { this['notifySubscribers'](this[observableLatestValue]); },
    valueWillMutate: function () { this['notifySubscribers'](this[observableLatestValue], 'beforeChange'); }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(observableFn, ko.subscribable['fn']);
}

var protoProperty = ko.observable.protoProperty = '__ko_proto__';
observableFn[protoProperty] = ko.observable;

ko.hasPrototype = function(instance, prototype) {
    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
    if (instance[protoProperty] === prototype) return true;
    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
};

ko.isObservable = function (instance) {
    return ko.hasPrototype(instance, ko.observable);
}
ko.isWriteableObservable = function (instance) {
    // Observable
    if ((typeof instance == 'function') && instance[protoProperty] === ko.observable)
        return true;
    // Writeable dependent observable
    if ((typeof instance == 'function') && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
        return true;
    // Anything else
    return false;
}

ko.exportSymbol('observable', ko.observable);
ko.exportSymbol('isObservable', ko.isObservable);
ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
ko.exportSymbol('observable.fn', observableFn);
ko.exportProperty(observableFn, 'peek', observableFn.peek);
ko.exportProperty(observableFn, 'valueHasMutated', observableFn.valueHasMutated);
ko.exportProperty(observableFn, 'valueWillMutate', observableFn.valueWillMutate);
ko.observableArray = function (initialValues) {
    initialValues = initialValues || [];

    if (typeof initialValues != 'object' || !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
    return result.extend({'trackArrayChanges':true});
};

ko.observableArray['fn'] = {
    'remove': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var removedValues = [];
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        for (var i = 0; i < underlyingArray.length; i++) {
            var value = underlyingArray[i];
            if (predicate(value)) {
                if (removedValues.length === 0) {
                    this.valueWillMutate();
                }
                removedValues.push(value);
                underlyingArray.splice(i, 1);
                i--;
            }
        }
        if (removedValues.length) {
            this.valueHasMutated();
        }
        return removedValues;
    },

    'removeAll': function (arrayOfValues) {
        // If you passed zero args, we remove everything
        if (arrayOfValues === undefined) {
            var underlyingArray = this.peek();
            var allValues = underlyingArray.slice(0);
            this.valueWillMutate();
            underlyingArray.splice(0, underlyingArray.length);
            this.valueHasMutated();
            return allValues;
        }
        // If you passed an arg, we interpret it as an array of entries to remove
        if (!arrayOfValues)
            return [];
        return this['remove'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'destroy': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        this.valueWillMutate();
        for (var i = underlyingArray.length - 1; i >= 0; i--) {
            var value = underlyingArray[i];
            if (predicate(value))
                underlyingArray[i]["_destroy"] = true;
        }
        this.valueHasMutated();
    },

    'destroyAll': function (arrayOfValues) {
        // If you passed zero args, we destroy everything
        if (arrayOfValues === undefined)
            return this['destroy'](function() { return true });

        // If you passed an arg, we interpret it as an array of entries to destroy
        if (!arrayOfValues)
            return [];
        return this['destroy'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'indexOf': function (item) {
        var underlyingArray = this();
        return ko.utils.arrayIndexOf(underlyingArray, item);
    },

    'replace': function(oldItem, newItem) {
        var index = this['indexOf'](oldItem);
        if (index >= 0) {
            this.valueWillMutate();
            this.peek()[index] = newItem;
            this.valueHasMutated();
        }
    }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observableArray constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
}

// Populate ko.observableArray.fn with read/write functions from native arrays
// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
        this.valueHasMutated();
        // The native sort and reverse methods return a reference to the array, but it makes more sense to return the observable array instead.
        return methodCallResult === underlyingArray ? this : methodCallResult;
    };
});

// Populate ko.observableArray.fn with read-only functions from native arrays
ko.utils.arrayForEach(["slice"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        var underlyingArray = this();
        return underlyingArray[methodName].apply(underlyingArray, arguments);
    };
});

ko.exportSymbol('observableArray', ko.observableArray);
var arrayChangeEventName = 'arrayChange';
ko.extenders['trackArrayChanges'] = function(target, options) {
    // Use the provided options--each call to trackArrayChanges overwrites the previously set options
    target.compareArrayOptions = {};
    if (options && typeof options == "object") {
        ko.utils.extend(target.compareArrayOptions, options);
    }
    target.compareArrayOptions['sparse'] = true;

    // Only modify the target observable once
    if (target.cacheDiffForKnownOperation) {
        return;
    }
    var trackingChanges = false,
        cachedDiff = null,
        arrayChangeSubscription,
        pendingNotifications = 0,
        underlyingNotifySubscribersFunction,
        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;

    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
    target.beforeSubscriptionAdd = function (event) {
        if (underlyingBeforeSubscriptionAddFunction)
            underlyingBeforeSubscriptionAddFunction.call(target, event);
        if (event === arrayChangeEventName) {
            trackChanges();
        }
    };
    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
    target.afterSubscriptionRemove = function (event) {
        if (underlyingAfterSubscriptionRemoveFunction)
            underlyingAfterSubscriptionRemoveFunction.call(target, event);
        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
            if (underlyingNotifySubscribersFunction) {
                target['notifySubscribers'] = underlyingNotifySubscribersFunction;
                underlyingNotifySubscribersFunction = undefined;
            }
            arrayChangeSubscription.dispose();
            trackingChanges = false;
        }
    };

    function trackChanges() {
        // Calling 'trackChanges' multiple times is the same as calling it once
        if (trackingChanges) {
            return;
        }

        trackingChanges = true;

        // Intercept "notifySubscribers" to track how many times it was called.
        underlyingNotifySubscribersFunction = target['notifySubscribers'];
        target['notifySubscribers'] = function(valueToNotify, event) {
            if (!event || event === defaultEvent) {
                ++pendingNotifications;
            }
            return underlyingNotifySubscribersFunction.apply(this, arguments);
        };

        // Each time the array changes value, capture a clone so that on the next
        // change it's possible to produce a diff
        var previousContents = [].concat(target.peek() || []);
        cachedDiff = null;
        arrayChangeSubscription = target.subscribe(function(currentContents) {
            // Make a copy of the current contents and ensure it's an array
            currentContents = [].concat(currentContents || []);

            // Compute the diff and issue notifications, but only if someone is listening
            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
                var changes = getChanges(previousContents, currentContents);
            }

            // Eliminate references to the old, removed items, so they can be GCed
            previousContents = currentContents;
            cachedDiff = null;
            pendingNotifications = 0;

            if (changes && changes.length) {
                target['notifySubscribers'](changes, arrayChangeEventName);
            }
        });
    }

    function getChanges(previousContents, currentContents) {
        // We try to re-use cached diffs.
        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
        // notifications are issued immediately so we wouldn't be queueing up more than one.
        if (!cachedDiff || pendingNotifications > 1) {
            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, target.compareArrayOptions);
        }

        return cachedDiff;
    }

    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
        // Only run if we're currently tracking changes for this observable array
        // and there aren't any pending deferred notifications.
        if (!trackingChanges || pendingNotifications) {
            return;
        }
        var diff = [],
            arrayLength = rawArray.length,
            argsLength = args.length,
            offset = 0;

        function pushDiff(status, value, index) {
            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
        }
        switch (operationName) {
            case 'push':
                offset = arrayLength;
            case 'unshift':
                for (var index = 0; index < argsLength; index++) {
                    pushDiff('added', args[index], offset + index);
                }
                break;

            case 'pop':
                offset = arrayLength - 1;
            case 'shift':
                if (arrayLength) {
                    pushDiff('deleted', rawArray[offset], offset);
                }
                break;

            case 'splice':
                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
                    endAddIndex = startIndex + argsLength - 2,
                    endIndex = Math.max(endDeleteIndex, endAddIndex),
                    additions = [], deletions = [];
                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
                    if (index < endDeleteIndex)
                        deletions.push(pushDiff('deleted', rawArray[index], index));
                    if (index < endAddIndex)
                        additions.push(pushDiff('added', args[argsIndex], index));
                }
                ko.utils.findMovesInArrayComparison(deletions, additions);
                break;

            default:
                return;
        }
        cachedDiff = diff;
    };
};
var computedState = ko.utils.createSymbolOrString('_state');

ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
    if (typeof evaluatorFunctionOrOptions === "object") {
        // Single-parameter syntax - everything is on this "options" param
        options = evaluatorFunctionOrOptions;
    } else {
        // Multi-parameter syntax - construct the options according to the params passed
        options = options || {};
        if (evaluatorFunctionOrOptions) {
            options["read"] = evaluatorFunctionOrOptions;
        }
    }
    if (typeof options["read"] != "function")
        throw Error("Pass a function that returns the value of the ko.computed");

    var writeFunction = options["write"];
    var state = {
        latestValue: undefined,
        isStale: true,
        isDirty: true,
        isBeingEvaluated: false,
        suppressDisposalUntilDisposeWhenReturnsFalse: false,
        isDisposed: false,
        pure: false,
        isSleeping: false,
        readFunction: options["read"],
        evaluatorFunctionTarget: evaluatorFunctionTarget || options["owner"],
        disposeWhenNodeIsRemoved: options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
        disposeWhen: options["disposeWhen"] || options.disposeWhen,
        domNodeDisposalCallback: null,
        dependencyTracking: {},
        dependenciesCount: 0,
        evaluationTimeoutInstance: null
    };

    function computedObservable() {
        if (arguments.length > 0) {
            if (typeof writeFunction === "function") {
                // Writing a value
                writeFunction.apply(state.evaluatorFunctionTarget, arguments);
            } else {
                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
            }
            return this; // Permits chained assignments
        } else {
            // Reading the value
            ko.dependencyDetection.registerDependency(computedObservable);
            if (state.isDirty || (state.isSleeping && computedObservable.haveDependenciesChanged())) {
                computedObservable.evaluateImmediate();
            }
            return state.latestValue;
        }
    }

    computedObservable[computedState] = state;
    computedObservable.hasWriteFunction = typeof writeFunction === "function";

    // Inherit from 'subscribable'
    if (!ko.utils.canSetPrototype) {
        // 'subscribable' won't be on the prototype chain unless we put it there directly
        ko.utils.extend(computedObservable, ko.subscribable['fn']);
    }
    ko.subscribable['fn'].init(computedObservable);

    // Inherit from 'computed'
    ko.utils.setPrototypeOfOrExtend(computedObservable, computedFn);

    if (options['pure']) {
        state.pure = true;
        state.isSleeping = true;     // Starts off sleeping; will awake on the first subscription
        ko.utils.extend(computedObservable, pureComputedOverrides);
    } else if (options['deferEvaluation']) {
        ko.utils.extend(computedObservable, deferEvaluationOverrides);
    }

    if (ko.options['deferUpdates']) {
        ko.extenders['deferred'](computedObservable, true);
    }

    if (DEBUG) {
        // #1731 - Aid debugging by exposing the computed's options
        computedObservable["_options"] = options;
    }

    if (state.disposeWhenNodeIsRemoved) {
        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
        // we'll prevent disposal until "disposeWhen" first returns false.
        state.suppressDisposalUntilDisposeWhenReturnsFalse = true;

        // disposeWhenNodeIsRemoved: true can be used to opt into the "only dispose after first false result"
        // behaviour even if there's no specific node to watch. In that case, clear the option so we don't try
        // to watch for a non-node's disposal. This technique is intended for KO's internal use only and shouldn't
        // be documented or used by application code, as it's likely to change in a future version of KO.
        if (!state.disposeWhenNodeIsRemoved.nodeType) {
            state.disposeWhenNodeIsRemoved = null;
        }
    }

    // Evaluate, unless sleeping or deferEvaluation is true
    if (!state.isSleeping && !options['deferEvaluation']) {
        computedObservable.evaluateImmediate();
    }

    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
    if (state.disposeWhenNodeIsRemoved && computedObservable.isActive()) {
        ko.utils.domNodeDisposal.addDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback = function () {
            computedObservable.dispose();
        });
    }

    return computedObservable;
};

// Utility function that disposes a given dependencyTracking entry
function computedDisposeDependencyCallback(id, entryToDispose) {
    if (entryToDispose !== null && entryToDispose.dispose) {
        entryToDispose.dispose();
    }
}

// This function gets called each time a dependency is detected while evaluating a computed.
// It's factored out as a shared function to avoid creating unnecessary function instances during evaluation.
function computedBeginDependencyDetectionCallback(subscribable, id) {
    var computedObservable = this.computedObservable,
        state = computedObservable[computedState];
    if (!state.isDisposed) {
        if (this.disposalCount && this.disposalCandidates[id]) {
            // Don't want to dispose this subscription, as it's still being used
            computedObservable.addDependencyTracking(id, subscribable, this.disposalCandidates[id]);
            this.disposalCandidates[id] = null; // No need to actually delete the property - disposalCandidates is a transient object anyway
            --this.disposalCount;
        } else if (!state.dependencyTracking[id]) {
            // Brand new subscription - add it
            computedObservable.addDependencyTracking(id, subscribable, state.isSleeping ? { _target: subscribable } : computedObservable.subscribeToDependency(subscribable));
        }
        // If the observable we've accessed has a pending notification, ensure we get notified of the actual final value (bypass equality checks)
        if (subscribable._notificationIsPending) {
            subscribable._notifyNextChangeIfValueIsDifferent();
        }
    }
}

var computedFn = {
    "equalityComparer": valuesArePrimitiveAndEqual,
    getDependenciesCount: function () {
        return this[computedState].dependenciesCount;
    },
    addDependencyTracking: function (id, target, trackingObj) {
        if (this[computedState].pure && target === this) {
            throw Error("A 'pure' computed must not be called recursively");
        }

        this[computedState].dependencyTracking[id] = trackingObj;
        trackingObj._order = this[computedState].dependenciesCount++;
        trackingObj._version = target.getVersion();
    },
    haveDependenciesChanged: function () {
        var id, dependency, dependencyTracking = this[computedState].dependencyTracking;
        for (id in dependencyTracking) {
            if (dependencyTracking.hasOwnProperty(id)) {
                dependency = dependencyTracking[id];
                if ((this._evalDelayed && dependency._target._notificationIsPending) || dependency._target.hasChanged(dependency._version)) {
                    return true;
                }
            }
        }
    },
    markDirty: function () {
        // Process "dirty" events if we can handle delayed notifications
        if (this._evalDelayed && !this[computedState].isBeingEvaluated) {
            this._evalDelayed(false /*isChange*/);
        }
    },
    isActive: function () {
        var state = this[computedState];
        return state.isDirty || state.dependenciesCount > 0;
    },
    respondToChange: function () {
        // Ignore "change" events if we've already scheduled a delayed notification
        if (!this._notificationIsPending) {
            this.evaluatePossiblyAsync();
        } else if (this[computedState].isDirty) {
            this[computedState].isStale = true;
        }
    },
    subscribeToDependency: function (target) {
        if (target._deferUpdates && !this[computedState].disposeWhenNodeIsRemoved) {
            var dirtySub = target.subscribe(this.markDirty, this, 'dirty'),
                changeSub = target.subscribe(this.respondToChange, this);
            return {
                _target: target,
                dispose: function () {
                    dirtySub.dispose();
                    changeSub.dispose();
                }
            };
        } else {
            return target.subscribe(this.evaluatePossiblyAsync, this);
        }
    },
    evaluatePossiblyAsync: function () {
        var computedObservable = this,
            throttleEvaluationTimeout = computedObservable['throttleEvaluation'];
        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
            clearTimeout(this[computedState].evaluationTimeoutInstance);
            this[computedState].evaluationTimeoutInstance = ko.utils.setTimeout(function () {
                computedObservable.evaluateImmediate(true /*notifyChange*/);
            }, throttleEvaluationTimeout);
        } else if (computedObservable._evalDelayed) {
            computedObservable._evalDelayed(true /*isChange*/);
        } else {
            computedObservable.evaluateImmediate(true /*notifyChange*/);
        }
    },
    evaluateImmediate: function (notifyChange) {
        var computedObservable = this,
            state = computedObservable[computedState],
            disposeWhen = state.disposeWhen,
            changed = false;

        if (state.isBeingEvaluated) {
            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
            return;
        }

        // Do not evaluate (and possibly capture new dependencies) if disposed
        if (state.isDisposed) {
            return;
        }

        if (state.disposeWhenNodeIsRemoved && !ko.utils.domNodeIsAttachedToDocument(state.disposeWhenNodeIsRemoved) || disposeWhen && disposeWhen()) {
            // See comment above about suppressDisposalUntilDisposeWhenReturnsFalse
            if (!state.suppressDisposalUntilDisposeWhenReturnsFalse) {
                computedObservable.dispose();
                return;
            }
        } else {
            // It just did return false, so we can stop suppressing now
            state.suppressDisposalUntilDisposeWhenReturnsFalse = false;
        }

        state.isBeingEvaluated = true;
        try {
            changed = this.evaluateImmediate_CallReadWithDependencyDetection(notifyChange);
        } finally {
            state.isBeingEvaluated = false;
        }

        if (!state.dependenciesCount) {
            computedObservable.dispose();
        }

        return changed;
    },
    evaluateImmediate_CallReadWithDependencyDetection: function (notifyChange) {
        // This function is really just part of the evaluateImmediate logic. You would never call it from anywhere else.
        // Factoring it out into a separate function means it can be independent of the try/catch block in evaluateImmediate,
        // which contributes to saving about 40% off the CPU overhead of computed evaluation (on V8 at least).

        var computedObservable = this,
            state = computedObservable[computedState],
            changed = false;

        // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
        // Then, during evaluation, we cross off any that are in fact still being used.
        var isInitial = state.pure ? undefined : !state.dependenciesCount,   // If we're evaluating when there are no previous dependencies, it must be the first time
            dependencyDetectionContext = {
                computedObservable: computedObservable,
                disposalCandidates: state.dependencyTracking,
                disposalCount: state.dependenciesCount
            };

        ko.dependencyDetection.begin({
            callbackTarget: dependencyDetectionContext,
            callback: computedBeginDependencyDetectionCallback,
            computed: computedObservable,
            isInitial: isInitial
        });

        state.dependencyTracking = {};
        state.dependenciesCount = 0;

        var newValue = this.evaluateImmediate_CallReadThenEndDependencyDetection(state, dependencyDetectionContext);

        if (computedObservable.isDifferent(state.latestValue, newValue)) {
            if (!state.isSleeping) {
                computedObservable["notifySubscribers"](state.latestValue, "beforeChange");
            }

            state.latestValue = newValue;
            if (DEBUG) computedObservable._latestValue = newValue;

            if (state.isSleeping) {
                computedObservable.updateVersion();
            } else if (notifyChange) {
                computedObservable["notifySubscribers"](state.latestValue);
            }

            changed = true;
        }

        if (isInitial) {
            computedObservable["notifySubscribers"](state.latestValue, "awake");
        }

        return changed;
    },
    evaluateImmediate_CallReadThenEndDependencyDetection: function (state, dependencyDetectionContext) {
        // This function is really part of the evaluateImmediate_CallReadWithDependencyDetection logic.
        // You'd never call it from anywhere else. Factoring it out means that evaluateImmediate_CallReadWithDependencyDetection
        // can be independent of try/finally blocks, which contributes to saving about 40% off the CPU
        // overhead of computed evaluation (on V8 at least).

        try {
            var readFunction = state.readFunction;
            return state.evaluatorFunctionTarget ? readFunction.call(state.evaluatorFunctionTarget) : readFunction();
        } finally {
            ko.dependencyDetection.end();

            // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
            if (dependencyDetectionContext.disposalCount && !state.isSleeping) {
                ko.utils.objectForEach(dependencyDetectionContext.disposalCandidates, computedDisposeDependencyCallback);
            }

            state.isStale = state.isDirty = false;
        }
    },
    peek: function (evaluate) {
        // By default, peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
        // Pass in true to evaluate if needed.
        var state = this[computedState];
        if ((state.isDirty && (evaluate || !state.dependenciesCount)) || (state.isSleeping && this.haveDependenciesChanged())) {
            this.evaluateImmediate();
        }
        return state.latestValue;
    },
    limit: function (limitFunction) {
        // Override the limit function with one that delays evaluation as well
        ko.subscribable['fn'].limit.call(this, limitFunction);
        this._evalIfChanged = function () {
            if (this[computedState].isStale) {
                this.evaluateImmediate();
            } else {
                this[computedState].isDirty = false;
            }
            return this[computedState].latestValue;
        };
        this._evalDelayed = function (isChange) {
            this._limitBeforeChange(this[computedState].latestValue);

            // Mark as dirty
            this[computedState].isDirty = true;
            if (isChange) {
                this[computedState].isStale = true;
            }

            // Pass the observable to the "limit" code, which will evaluate it when
            // it's time to do the notification.
            this._limitChange(this);
        };
    },
    dispose: function () {
        var state = this[computedState];
        if (!state.isSleeping && state.dependencyTracking) {
            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                if (dependency.dispose)
                    dependency.dispose();
            });
        }
        if (state.disposeWhenNodeIsRemoved && state.domNodeDisposalCallback) {
            ko.utils.domNodeDisposal.removeDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback);
        }
        state.dependencyTracking = null;
        state.dependenciesCount = 0;
        state.isDisposed = true;
        state.isStale = false;
        state.isDirty = false;
        state.isSleeping = false;
        state.disposeWhenNodeIsRemoved = null;
    }
};

var pureComputedOverrides = {
    beforeSubscriptionAdd: function (event) {
        // If asleep, wake up the computed by subscribing to any dependencies.
        var computedObservable = this,
            state = computedObservable[computedState];
        if (!state.isDisposed && state.isSleeping && event == 'change') {
            state.isSleeping = false;
            if (state.isStale || computedObservable.haveDependenciesChanged()) {
                state.dependencyTracking = null;
                state.dependenciesCount = 0;
                if (computedObservable.evaluateImmediate()) {
                    computedObservable.updateVersion();
                }
            } else {
                // First put the dependencies in order
                var dependeciesOrder = [];
                ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                    dependeciesOrder[dependency._order] = id;
                });
                // Next, subscribe to each one
                ko.utils.arrayForEach(dependeciesOrder, function (id, order) {
                    var dependency = state.dependencyTracking[id],
                        subscription = computedObservable.subscribeToDependency(dependency._target);
                    subscription._order = order;
                    subscription._version = dependency._version;
                    state.dependencyTracking[id] = subscription;
                });
            }
            if (!state.isDisposed) {     // test since evaluating could trigger disposal
                computedObservable["notifySubscribers"](state.latestValue, "awake");
            }
        }
    },
    afterSubscriptionRemove: function (event) {
        var state = this[computedState];
        if (!state.isDisposed && event == 'change' && !this.hasSubscriptionsForEvent('change')) {
            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                if (dependency.dispose) {
                    state.dependencyTracking[id] = {
                        _target: dependency._target,
                        _order: dependency._order,
                        _version: dependency._version
                    };
                    dependency.dispose();
                }
            });
            state.isSleeping = true;
            this["notifySubscribers"](undefined, "asleep");
        }
    },
    getVersion: function () {
        // Because a pure computed is not automatically updated while it is sleeping, we can't
        // simply return the version number. Instead, we check if any of the dependencies have
        // changed and conditionally re-evaluate the computed observable.
        var state = this[computedState];
        if (state.isSleeping && (state.isStale || this.haveDependenciesChanged())) {
            this.evaluateImmediate();
        }
        return ko.subscribable['fn'].getVersion.call(this);
    }
};

var deferEvaluationOverrides = {
    beforeSubscriptionAdd: function (event) {
        // This will force a computed with deferEvaluation to evaluate when the first subscription is registered.
        if (event == 'change' || event == 'beforeChange') {
            this.peek();
        }
    }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.computed constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(computedFn, ko.subscribable['fn']);
}

// Set the proto chain values for ko.hasPrototype
var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
ko.computed[protoProp] = ko.observable;
computedFn[protoProp] = ko.computed;

ko.isComputed = function (instance) {
    return ko.hasPrototype(instance, ko.computed);
};

ko.isPureComputed = function (instance) {
    return ko.hasPrototype(instance, ko.computed)
        && instance[computedState] && instance[computedState].pure;
};

ko.exportSymbol('computed', ko.computed);
ko.exportSymbol('dependentObservable', ko.computed);    // export ko.dependentObservable for backwards compatibility (1.x)
ko.exportSymbol('isComputed', ko.isComputed);
ko.exportSymbol('isPureComputed', ko.isPureComputed);
ko.exportSymbol('computed.fn', computedFn);
ko.exportProperty(computedFn, 'peek', computedFn.peek);
ko.exportProperty(computedFn, 'dispose', computedFn.dispose);
ko.exportProperty(computedFn, 'isActive', computedFn.isActive);
ko.exportProperty(computedFn, 'getDependenciesCount', computedFn.getDependenciesCount);

ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
    if (typeof evaluatorFunctionOrOptions === 'function') {
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
    } else {
        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
        evaluatorFunctionOrOptions['pure'] = true;
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
    }
}
ko.exportSymbol('pureComputed', ko.pureComputed);

(function() {
    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

    ko.toJS = function(rootObject) {
        if (arguments.length == 0)
            throw new Error("When calling ko.toJS, pass the object you want to convert.");

        // We just unwrap everything at every level in the object graph
        return mapJsObjectGraph(rootObject, function(valueToMap) {
            // Loop because an observable's value might in turn be another observable wrapper
            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
                valueToMap = valueToMap();
            return valueToMap;
        });
    };

    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
        var plainJavaScriptObject = ko.toJS(rootObject);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
        visitedObjects = visitedObjects || new objectLookup();

        rootObject = mapInputCallback(rootObject);
        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof RegExp)) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
        if (!canHaveProperties)
            return rootObject;

        var outputProperties = rootObject instanceof Array ? [] : {};
        visitedObjects.save(rootObject, outputProperties);

        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
            var propertyValue = mapInputCallback(rootObject[indexer]);

            switch (typeof propertyValue) {
                case "boolean":
                case "number":
                case "string":
                case "function":
                    outputProperties[indexer] = propertyValue;
                    break;
                case "object":
                case "undefined":
                    var previouslyMappedValue = visitedObjects.get(propertyValue);
                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
                        ? previouslyMappedValue
                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
                    break;
            }
        });

        return outputProperties;
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (rootObject instanceof Array) {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);

            // For arrays, also respect toJSON property for custom mappings (fixes #278)
            if (typeof rootObject['toJSON'] == 'function')
                visitorCallback('toJSON');
        } else {
            for (var propertyName in rootObject) {
                visitorCallback(propertyName);
            }
        }
    };

    function objectLookup() {
        this.keys = [];
        this.values = [];
    };

    objectLookup.prototype = {
        constructor: objectLookup,
        save: function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            if (existingIndex >= 0)
                this.values[existingIndex] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        },
        get: function(key) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
        }
    };
})();

ko.exportSymbol('toJS', ko.toJS);
ko.exportSymbol('toJSON', ko.toJSON);
(function () {
    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
    ko.selectExtensions = {
        readValue : function(element) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    if (element[hasDomDataExpandoProperty] === true)
                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
                    return ko.utils.ieVersion <= 7
                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
                        : element.value;
                case 'select':
                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
                default:
                    return element.value;
            }
        },

        writeValue: function(element, value, allowUnset) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    switch(typeof value) {
                        case "string":
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
                                delete element[hasDomDataExpandoProperty];
                            }
                            element.value = value;
                            break;
                        default:
                            // Store arbitrary object using DomData
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
                            element[hasDomDataExpandoProperty] = true;

                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
                            element.value = typeof value === "number" ? value : "";
                            break;
                    }
                    break;
                case 'select':
                    if (value === "" || value === null)       // A blank string or null value will select the caption
                        value = undefined;
                    var selection = -1;
                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
                        optionValue = ko.selectExtensions.readValue(element.options[i]);
                        // Include special check to handle selecting a caption with a blank string value
                        if (optionValue == value || (optionValue == "" && value === undefined)) {
                            selection = i;
                            break;
                        }
                    }
                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
                        element.selectedIndex = selection;
                    }
                    break;
                default:
                    if ((value === null) || (value === undefined))
                        value = "";
                    element.value = value;
                    break;
            }
        }
    };
})();

ko.exportSymbol('selectExtensions', ko.selectExtensions);
ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
ko.expressionRewriting = (function () {
    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

    function getWriteableValue(expression) {
        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
            return false;
        var match = expression.match(javaScriptAssignmentTarget);
        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
    }

    // The following regular expressions will be used to split an object-literal string into tokens

        // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function parseObjectLiteral(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = ko.utils.stringTrim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
                        key = depth = 0;
                        values = [];
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(bindingToken);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    }

    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
    var twoWayBindings = {};

    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
        bindingOptions = bindingOptions || {};

        function processKeyValue(key, val) {
            var writableVal;
            function callPreprocessHook(obj) {
                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
            }
            if (!bindingParams) {
                if (!callPreprocessHook(ko['getBindingHandler'](key)))
                    return;

                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
                    // For two-way bindings, provide a write method in case the value
                    // isn't a writable observable.
                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
                }
            }
            // Values are wrapped in a function so that each value can be accessed independently
            if (makeValueAccessors) {
                val = 'function(){return ' + val + ' }';
            }
            resultStrings.push("'" + key + "':" + val);
        }

        var resultStrings = [],
            propertyAccessorResultStrings = [],
            makeValueAccessors = bindingOptions['valueAccessors'],
            bindingParams = bindingOptions['bindingParams'],
            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
        });

        if (propertyAccessorResultStrings.length)
            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

        return resultStrings.join(",");
    }

    return {
        bindingRewriteValidators: [],

        twoWayBindings: twoWayBindings,

        parseObjectLiteral: parseObjectLiteral,

        preProcessBindings: preProcessBindings,

        keyValueArrayContainsKey: function(keyValueArray, key) {
            for (var i = 0; i < keyValueArray.length; i++)
                if (keyValueArray[i]['key'] == key)
                    return true;
            return false;
        },

        // Internal, private KO utility for updating model properties from within bindings
        // property:            If the property being updated is (or might be) an observable, pass it here
        //                      If it turns out to be a writable observable, it will be written to directly
        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
        // value:               The value to be written
        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
        //                      it is !== existing value on that writable observable
        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
            if (!property || !ko.isObservable(property)) {
                var propWriters = allBindings.get('_ko_property_writers');
                if (propWriters && propWriters[key])
                    propWriters[key](value);
            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
                property(value);
            }
        }
    };
})();

ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
// all bindings could use an official 'property writer' API without needing to declare that they might). However,
// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
// as an internal implementation detail in the short term.
// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
(function() {
    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
    // of that virtual hierarchy
    //
    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
    // without having to scatter special cases all over the binding and templating code.

    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
    // So, use node.text where available, and node.nodeValue elsewhere
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

    function isStartComment(node) {
        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function getVirtualChildren(startComment, allowUnbalanced) {
        var currentNode = startComment;
        var depth = 1;
        var children = [];
        while (currentNode = currentNode.nextSibling) {
            if (isEndComment(currentNode)) {
                depth--;
                if (depth === 0)
                    return children;
            }

            children.push(currentNode);

            if (isStartComment(currentNode))
                depth++;
        }
        if (!allowUnbalanced)
            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
        return null;
    }

    function getMatchingEndComment(startComment, allowUnbalanced) {
        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
        if (allVirtualChildren) {
            if (allVirtualChildren.length > 0)
                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
            return startComment.nextSibling;
        } else
            return null; // Must have no matching end comment, and allowUnbalanced is true
    }

    function getUnbalancedChildTags(node) {
        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
        var childNode = node.firstChild, captureRemaining = null;
        if (childNode) {
            do {
                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
                    captureRemaining.push(childNode);
                else if (isStartComment(childNode)) {
                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
                        childNode = matchingEndComment;
                    else
                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
                } else if (isEndComment(childNode)) {
                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
                }
            } while (childNode = childNode.nextSibling);
        }
        return captureRemaining;
    }

    ko.virtualElements = {
        allowedBindings: {},

        childNodes: function(node) {
            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
        },

        emptyNode: function(node) {
            if (!isStartComment(node))
                ko.utils.emptyDomNode(node);
            else {
                var virtualChildren = ko.virtualElements.childNodes(node);
                for (var i = 0, j = virtualChildren.length; i < j; i++)
                    ko.removeNode(virtualChildren[i]);
            }
        },

        setDomNodeChildren: function(node, childNodes) {
            if (!isStartComment(node))
                ko.utils.setDomNodeChildren(node, childNodes);
            else {
                ko.virtualElements.emptyNode(node);
                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
                for (var i = 0, j = childNodes.length; i < j; i++)
                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
            }
        },

        prepend: function(containerNode, nodeToPrepend) {
            if (!isStartComment(containerNode)) {
                if (containerNode.firstChild)
                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
                else
                    containerNode.appendChild(nodeToPrepend);
            } else {
                // Start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
            }
        },

        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
            if (!insertAfterNode) {
                ko.virtualElements.prepend(containerNode, nodeToInsert);
            } else if (!isStartComment(containerNode)) {
                // Insert after insertion point
                if (insertAfterNode.nextSibling)
                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
                else
                    containerNode.appendChild(nodeToInsert);
            } else {
                // Children of start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
            }
        },

        firstChild: function(node) {
            if (!isStartComment(node))
                return node.firstChild;
            if (!node.nextSibling || isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        nextSibling: function(node) {
            if (isStartComment(node))
                node = getMatchingEndComment(node);
            if (node.nextSibling && isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        hasBindingValue: isStartComment,

        virtualNodeBindingValue: function(node) {
            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
            return regexMatch ? regexMatch[1] : null;
        },

        normaliseVirtualElementDomStructure: function(elementVerified) {
            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
            // that are direct descendants of <ul> into the preceding <li>)
            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
                return;

            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
            // must be intended to appear *after* that child, so move them there.
            var childNode = elementVerified.firstChild;
            if (childNode) {
                do {
                    if (childNode.nodeType === 1) {
                        var unbalancedTags = getUnbalancedChildTags(childNode);
                        if (unbalancedTags) {
                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
                            var nodeToInsertBefore = childNode.nextSibling;
                            for (var i = 0; i < unbalancedTags.length; i++) {
                                if (nodeToInsertBefore)
                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
                                else
                                    elementVerified.appendChild(unbalancedTags[i]);
                            }
                        }
                    }
                } while (childNode = childNode.nextSibling);
            }
        }
    };
})();
ko.exportSymbol('virtualElements', ko.virtualElements);
ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
(function() {
    var defaultBindingAttributeName = "data-bind";

    ko.bindingProvider = function() {
        this.bindingCache = {};
    };

    ko.utils.extend(ko.bindingProvider.prototype, {
        'nodeHasBindings': function(node) {
            switch (node.nodeType) {
                case 1: // Element
                    return node.getAttribute(defaultBindingAttributeName) != null
                        || ko.components['getComponentNameForNode'](node);
                case 8: // Comment node
                    return ko.virtualElements.hasBindingValue(node);
                default: return false;
            }
        },

        'getBindings': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
        },

        'getBindingAccessors': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'getBindingsString': function(node, bindingContext) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
                default: return null;
            }
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
            try {
                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
                return bindingFunction(bindingContext, node);
            } catch (ex) {
                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
                throw ex;
            }
        }
    });

    ko.bindingProvider['instance'] = new ko.bindingProvider();

    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
        return cache[cacheKey]
            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
    }

    function createBindingsStringEvaluator(bindingsString, options) {
        // Build the source for a function that evaluates "expression"
        // For each scope variable, add an extra level of "with" nesting
        // Example result: with(sc1) { with(sc0) { return (expression) } }
        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
        return new Function("$context", "$element", functionBody);
    }
})();

ko.exportSymbol('bindingProvider', ko.bindingProvider);
(function () {
    ko.bindingHandlers = {};

    // The following element types will not be recursed into during binding.
    var bindingDoesNotRecurseIntoElementTypes = {
        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
        // because it's unexpected and a potential XSS issue.
        // Also bindings should not operate on <template> elements since this breaks in Internet Explorer
        // and because such elements' contents are always intended to be bound in a different context
        // from where they appear in the document.
        'script': true,
        'textarea': true,
        'template': true
    };

    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
    ko['getBindingHandler'] = function(bindingKey) {
        return ko.bindingHandlers[bindingKey];
    };

    // The ko.bindingContext constructor is only called directly to create the root context. For child
    // contexts, use bindingContext.createChildContext or bindingContext.extend.
    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback, options) {

        // The binding context object includes static properties for the current, parent, and root view models.
        // If a view model is actually stored in an observable, the corresponding binding context object, and
        // any child contexts, must be updated when the view model is changed.
        function updateContext() {
            // Most of the time, the context will directly get a view model object, but if a function is given,
            // we call the function to retrieve the view model. If the function accesses any observables or returns
            // an observable, the dependency is tracked, and those observables can later cause the binding
            // context to be updated.
            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

            if (parentContext) {
                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
                // parent context is updated, this context will also be updated.
                if (parentContext._subscribable)
                    parentContext._subscribable();

                // Copy $root and any custom properties from the parent context
                ko.utils.extend(self, parentContext);

                // Because the above copy overwrites our own properties, we need to reset them.
                self._subscribable = subscribable;
            } else {
                self['$parents'] = [];
                self['$root'] = dataItem;

                // Export 'ko' in the binding context so it will be available in bindings and templates
                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
                // See https://github.com/SteveSanderson/knockout/issues/490
                self['ko'] = ko;
            }
            self['$rawData'] = dataItemOrObservable;
            self['$data'] = dataItem;
            if (dataItemAlias)
                self[dataItemAlias] = dataItem;

            // The extendCallback function is provided when creating a child context or extending a context.
            // It handles the specific actions needed to finish setting up the binding context. Actions in this
            // function could also add dependencies to this binding context.
            if (extendCallback)
                extendCallback(self, parentContext, dataItem);

            return self['$data'];
        }
        function disposeWhen() {
            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
        }

        var self = this,
            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
            nodes,
            subscribable;

        if (options && options['exportDependencies']) {
            // The "exportDependencies" option means that the calling code will track any dependencies and re-create
            // the binding context when they change.
            updateContext();
        } else {
            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

            // At this point, the binding context has been initialized, and the "subscribable" computed observable is
            // subscribed to any observables that were accessed in the process. If there is nothing to track, the
            // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
            // the context object.
            if (subscribable.isActive()) {
                self._subscribable = subscribable;

                // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
                subscribable['equalityComparer'] = null;

                // We need to be able to dispose of this computed observable when it's no longer needed. This would be
                // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
                // we cannot assume that those nodes have any relation to each other. So instead we track any node that
                // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

                // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
                nodes = [];
                subscribable._addNode = function(node) {
                    nodes.push(node);
                    ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
                        ko.utils.arrayRemoveItem(nodes, node);
                        if (!nodes.length) {
                            subscribable.dispose();
                            self._subscribable = subscribable = undefined;
                        }
                    });
                };
            }
        }
    }

    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
    // any observables, the new child context will automatically get a dependency on the parent context.
    // But this does not mean that the $data value of the child context will also get updated. If the child
    // view model also depends on the parent view model, you must provide a function that returns the correct
    // view model on each update.
    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback, options) {
        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
            // Extend the context hierarchy by setting the appropriate pointers
            self['$parentContext'] = parentContext;
            self['$parent'] = parentContext['$data'];
            self['$parents'] = (parentContext['$parents'] || []).slice(0);
            self['$parents'].unshift(self['$parent']);
            if (extendCallback)
                extendCallback(self);
        }, options);
    };

    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
    // when an observable view model is updated.
    ko.bindingContext.prototype['extend'] = function(properties) {
        // If the parent context references an observable view model, "_subscribable" will always be the
        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
            // This "child" context doesn't directly track a parent observable view model,
            // so we need to manually set the $rawData value to match the parent.
            self['$rawData'] = parentContext['$rawData'];
            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
        });
    };

    ko.bindingContext.prototype.createStaticChildContext = function (dataItemOrAccessor, dataItemAlias) {
        return this['createChildContext'](dataItemOrAccessor, dataItemAlias, null, { "exportDependencies": true });
    };

    // Returns the valueAccesor function for a binding value
    function makeValueAccessor(value) {
        return function() {
            return value;
        };
    }

    // Returns the value of a valueAccessor function
    function evaluateValueAccessor(valueAccessor) {
        return valueAccessor();
    }

    // Given a function that returns bindings, create and return a new object that contains
    // binding value-accessors functions. Each accessor function calls the original function
    // so that it always gets the latest value and all dependencies are captured. This is used
    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
    function makeAccessorsFromFunction(callback) {
        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
            return function() {
                return callback()[key];
            };
        });
    }

    // Given a bindings function or object, create and return a new object that contains
    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
    function makeBindingAccessors(bindings, context, node) {
        if (typeof bindings === 'function') {
            return makeAccessorsFromFunction(bindings.bind(null, context, node));
        } else {
            return ko.utils.objectMap(bindings, makeValueAccessor);
        }
    }

    // This function is used if the binding provider doesn't include a getBindingAccessors function.
    // It must be called with 'this' set to the provider instance.
    function getBindingsAndMakeAccessors(node, context) {
        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
    }

    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
        var validator = ko.virtualElements.allowedBindings[bindingName];
        if (!validator)
            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
    }

    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
        var currentChild,
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
            provider = ko.bindingProvider['instance'],
            preprocessNode = provider['preprocessNode'];

        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
        // trigger insertion of <template> contents at that point in the document.
        if (preprocessNode) {
            while (currentChild = nextInQueue) {
                nextInQueue = ko.virtualElements.nextSibling(currentChild);
                preprocessNode.call(provider, currentChild);
            }
            // Reset nextInQueue for the next loop
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
        }

        while (currentChild = nextInQueue) {
            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
            nextInQueue = ko.virtualElements.nextSibling(currentChild);
            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
        }
    }

    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
        var shouldBindDescendants = true;

        // Perf optimisation: Apply bindings only if...
        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
        var isElement = (nodeVerified.nodeType === 1);
        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
        if (shouldApplyBindings)
            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
            //    hence bindingContextsMayDifferFromDomParentElement is false
            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
            //    hence bindingContextsMayDifferFromDomParentElement is true
            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
        }
    }

    var boundElementDomDataKey = ko.utils.domData.nextKey();


    function topologicalSortBindings(bindings) {
        // Depth-first sort
        var result = [],                // The list of key/handler pairs that we will return
            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
            if (!bindingsConsidered[bindingKey]) {
                var binding = ko['getBindingHandler'](bindingKey);
                if (binding) {
                    // First add dependencies (if any) of the current binding
                    if (binding['after']) {
                        cyclicDependencyStack.push(bindingKey);
                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
                            if (bindings[bindingDependencyKey]) {
                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
                                } else {
                                    pushBinding(bindingDependencyKey);
                                }
                            }
                        });
                        cyclicDependencyStack.length--;
                    }
                    // Next add the current binding
                    result.push({ key: bindingKey, handler: binding });
                }
                bindingsConsidered[bindingKey] = true;
            }
        });

        return result;
    }

    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
        if (!sourceBindings) {
            if (alreadyBound) {
                throw Error("You cannot apply bindings multiple times to the same element.");
            }
            ko.utils.domData.set(node, boundElementDomDataKey, true);
        }

        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
        // we can easily recover it just by scanning up the node's ancestors in the DOM
        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
            ko.storedBindingContextForNode(node, bindingContext);

        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
        var bindings;
        if (sourceBindings && typeof sourceBindings !== 'function') {
            bindings = sourceBindings;
        } else {
            var provider = ko.bindingProvider['instance'],
                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
            // the binding context is updated or if the binding provider accesses observables.
            var bindingsUpdater = ko.dependentObservable(
                function() {
                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
                    // Register a dependency on the binding context to support observable view models.
                    if (bindings && bindingContext._subscribable)
                        bindingContext._subscribable();
                    return bindings;
                },
                null, { disposeWhenNodeIsRemoved: node }
            );

            if (!bindings || !bindingsUpdater.isActive())
                bindingsUpdater = null;
        }

        var bindingHandlerThatControlsDescendantBindings;
        if (bindings) {
            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
            // the latest binding value and registers a dependency on the binding updater.
            var getValueAccessor = bindingsUpdater
                ? function(bindingKey) {
                    return function() {
                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
                    };
                } : function(bindingKey) {
                    return bindings[bindingKey];
                };

            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
            function allBindings() {
                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
            }
            // The following is the 3.x allBindings API
            allBindings['get'] = function(key) {
                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
            };
            allBindings['has'] = function(key) {
                return key in bindings;
            };

            // First put the bindings into the right order
            var orderedBindings = topologicalSortBindings(bindings);

            // Go through the sorted bindings, calling init and update for each
            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
                // so bindingKeyAndHandler.handler will always be nonnull.
                var handlerInitFn = bindingKeyAndHandler.handler["init"],
                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
                    bindingKey = bindingKeyAndHandler.key;

                if (node.nodeType === 8) {
                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
                }

                try {
                    // Run init, ignoring any dependencies
                    if (typeof handlerInitFn == "function") {
                        ko.dependencyDetection.ignore(function() {
                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

                            // If this binding handler claims to control descendant bindings, make a note of this
                            if (initResult && initResult['controlsDescendantBindings']) {
                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                bindingHandlerThatControlsDescendantBindings = bindingKey;
                            }
                        });
                    }

                    // Run update in its own computed wrapper
                    if (typeof handlerUpdateFn == "function") {
                        ko.dependentObservable(
                            function() {
                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
                            },
                            null,
                            { disposeWhenNodeIsRemoved: node }
                        );
                    }
                } catch (ex) {
                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
                    throw ex;
                }
            });
        }

        return {
            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
        };
    };

    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
    ko.storedBindingContextForNode = function (node, bindingContext) {
        if (arguments.length == 2) {
            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
            if (bindingContext._subscribable)
                bindingContext._subscribable._addNode(node);
        } else {
            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
        }
    }

    function getBindingContext(viewModelOrBindingContext) {
        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
            ? viewModelOrBindingContext
            : new ko.bindingContext(viewModelOrBindingContext);
    }

    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(node);
        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
    };

    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
        var context = getBindingContext(viewModelOrBindingContext);
        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
    };

    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
        if (!jQueryInstance && window['jQuery']) {
            jQueryInstance = window['jQuery'];
        }

        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    // Retrieving binding context from arbitrary nodes
    ko.contextFor = function(node) {
        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
        switch (node.nodeType) {
            case 1:
            case 8:
                var context = ko.storedBindingContextForNode(node);
                if (context) return context;
                if (node.parentNode) return ko.contextFor(node.parentNode);
                break;
        }
        return undefined;
    };
    ko.dataFor = function(node) {
        var context = ko.contextFor(node);
        return context ? context['$data'] : undefined;
    };

    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
    ko.exportSymbol('applyBindings', ko.applyBindings);
    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
    ko.exportSymbol('contextFor', ko.contextFor);
    ko.exportSymbol('dataFor', ko.dataFor);
})();
(function(undefined) {
    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
        loadedDefinitionsCache = {};    // Tracks component loads that have already completed

    ko.components = {
        get: function(componentName, callback) {
            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
            if (cachedDefinition) {
                // It's already loaded and cached. Reuse the same definition object.
                // Note that for API consistency, even cache hits complete asynchronously by default.
                // You can bypass this by putting synchronous:true on your component config.
                if (cachedDefinition.isSynchronousComponent) {
                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
                        callback(cachedDefinition.definition);
                    });
                } else {
                    ko.tasks.schedule(function() { callback(cachedDefinition.definition); });
                }
            } else {
                // Join the loading process that is already underway, or start a new one.
                loadComponentAndNotify(componentName, callback);
            }
        },

        clearCachedDefinition: function(componentName) {
            delete loadedDefinitionsCache[componentName];
        },

        _getFirstResultFromLoaders: getFirstResultFromLoaders
    };

    function getObjectOwnProperty(obj, propName) {
        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
    }

    function loadComponentAndNotify(componentName, callback) {
        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
            completedAsync;
        if (!subscribable) {
            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
            subscribable.subscribe(callback);

            beginLoadingComponent(componentName, function(definition, config) {
                var isSynchronousComponent = !!(config && config['synchronous']);
                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
                delete loadingSubscribablesCache[componentName];

                // For API consistency, all loads complete asynchronously. However we want to avoid
                // adding an extra task schedule if it's unnecessary (i.e., the completion is already
                // async).
                //
                // You can bypass the 'always asynchronous' feature by putting the synchronous:true
                // flag on your component configuration when you register it.
                if (completedAsync || isSynchronousComponent) {
                    // Note that notifySubscribers ignores any dependencies read within the callback.
                    // See comment in loaderRegistryBehaviors.js for reasoning
                    subscribable['notifySubscribers'](definition);
                } else {
                    ko.tasks.schedule(function() {
                        subscribable['notifySubscribers'](definition);
                    });
                }
            });
            completedAsync = true;
        } else {
            subscribable.subscribe(callback);
        }
    }

    function beginLoadingComponent(componentName, callback) {
        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
            if (config) {
                // We have a config, so now load its definition
                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
                    callback(definition, config);
                });
            } else {
                // The component has no config - it's unknown to all the loaders.
                // Note that this is not an error (e.g., a module loading error) - that would abort the
                // process and this callback would not run. For this callback to run, all loaders must
                // have confirmed they don't know about this component.
                callback(null, null);
            }
        });
    }

    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
        // On the first call in the stack, start with the full set of loaders
        if (!candidateLoaders) {
            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
        }

        // Try the next candidate
        var currentCandidateLoader = candidateLoaders.shift();
        if (currentCandidateLoader) {
            var methodInstance = currentCandidateLoader[methodName];
            if (methodInstance) {
                var wasAborted = false,
                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
                        if (wasAborted) {
                            callback(null);
                        } else if (result !== null) {
                            // This candidate returned a value. Use it.
                            callback(result);
                        } else {
                            // Try the next candidate
                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
                        }
                    }));

                // Currently, loaders may not return anything synchronously. This leaves open the possibility
                // that we'll extend the API to support synchronous return values in the future. It won't be
                // a breaking change, because currently no loader is allowed to return anything except undefined.
                if (synchronousReturnValue !== undefined) {
                    wasAborted = true;

                    // Method to suppress exceptions will remain undocumented. This is only to keep
                    // KO's specs running tidily, since we can observe the loading got aborted without
                    // having exceptions cluttering up the console too.
                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
                    }
                }
            } else {
                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
            }
        } else {
            // No candidates returned a value
            callback(null);
        }
    }

    // Reference the loaders via string name so it's possible for developers
    // to replace the whole array by assigning to ko.components.loaders
    ko.components['loaders'] = [];

    ko.exportSymbol('components', ko.components);
    ko.exportSymbol('components.get', ko.components.get);
    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
})();
(function(undefined) {

    // The default loader is responsible for two things:
    // 1. Maintaining the default in-memory registry of component configuration objects
    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
    // 2. Answering requests for components by fetching configuration objects
    //    from that default in-memory registry and resolving them into standard
    //    component definition objects (of the form { createViewModel: ..., template: ... })
    // Custom loaders may override either of these facilities, i.e.,
    // 1. To supply configuration objects from some other source (e.g., conventions)
    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.

    var defaultConfigRegistry = {};

    ko.components.register = function(componentName, config) {
        if (!config) {
            throw new Error('Invalid configuration for ' + componentName);
        }

        if (ko.components.isRegistered(componentName)) {
            throw new Error('Component ' + componentName + ' is already registered');
        }

        defaultConfigRegistry[componentName] = config;
    };

    ko.components.isRegistered = function(componentName) {
        return defaultConfigRegistry.hasOwnProperty(componentName);
    };

    ko.components.unregister = function(componentName) {
        delete defaultConfigRegistry[componentName];
        ko.components.clearCachedDefinition(componentName);
    };

    ko.components.defaultLoader = {
        'getConfig': function(componentName, callback) {
            var result = defaultConfigRegistry.hasOwnProperty(componentName)
                ? defaultConfigRegistry[componentName]
                : null;
            callback(result);
        },

        'loadComponent': function(componentName, config, callback) {
            var errorCallback = makeErrorCallback(componentName);
            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
                resolveConfig(componentName, errorCallback, loadedConfig, callback);
            });
        },

        'loadTemplate': function(componentName, templateConfig, callback) {
            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
        },

        'loadViewModel': function(componentName, viewModelConfig, callback) {
            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
        }
    };

    var createViewModelKey = 'createViewModel';

    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
    // into the standard component definition format:
    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
    // so this is implemented manually below.
    function resolveConfig(componentName, errorCallback, config, callback) {
        var result = {},
            makeCallBackWhenZero = 2,
            tryIssueCallback = function() {
                if (--makeCallBackWhenZero === 0) {
                    callback(result);
                }
            },
            templateConfig = config['template'],
            viewModelConfig = config['viewModel'];

        if (templateConfig) {
            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
                    result['template'] = resolvedTemplate;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }

        if (viewModelConfig) {
            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
                    result[createViewModelKey] = resolvedViewModel;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }
    }

    function resolveTemplate(errorCallback, templateConfig, callback) {
        if (typeof templateConfig === 'string') {
            // Markup - parse it
            callback(ko.utils.parseHtmlFragment(templateConfig));
        } else if (templateConfig instanceof Array) {
            // Assume already an array of DOM nodes - pass through unchanged
            callback(templateConfig);
        } else if (isDocumentFragment(templateConfig)) {
            // Document fragment - use its child nodes
            callback(ko.utils.makeArray(templateConfig.childNodes));
        } else if (templateConfig['element']) {
            var element = templateConfig['element'];
            if (isDomElement(element)) {
                // Element instance - copy its child nodes
                callback(cloneNodesFromTemplateSourceElement(element));
            } else if (typeof element === 'string') {
                // Element ID - find it, then copy its child nodes
                var elemInstance = document.getElementById(element);
                if (elemInstance) {
                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
                } else {
                    errorCallback('Cannot find element with ID ' + element);
                }
            } else {
                errorCallback('Unknown element type: ' + element);
            }
        } else {
            errorCallback('Unknown template value: ' + templateConfig);
        }
    }

    function resolveViewModel(errorCallback, viewModelConfig, callback) {
        if (typeof viewModelConfig === 'function') {
            // Constructor - convert to standard factory function format
            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
            // be used in factory functions, not viewmodel constructors.
            callback(function (params /*, componentInfo */) {
                return new viewModelConfig(params);
            });
        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
            // Already a factory function - use it as-is
            callback(viewModelConfig[createViewModelKey]);
        } else if ('instance' in viewModelConfig) {
            // Fixed object instance - promote to createViewModel format for API consistency
            var fixedInstance = viewModelConfig['instance'];
            callback(function (params, componentInfo) {
                return fixedInstance;
            });
        } else if ('viewModel' in viewModelConfig) {
            // Resolved AMD module whose value is of the form { viewModel: ... }
            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
        } else {
            errorCallback('Unknown viewModel value: ' + viewModelConfig);
        }
    }

    function cloneNodesFromTemplateSourceElement(elemInstance) {
        switch (ko.utils.tagNameLower(elemInstance)) {
            case 'script':
                return ko.utils.parseHtmlFragment(elemInstance.text);
            case 'textarea':
                return ko.utils.parseHtmlFragment(elemInstance.value);
            case 'template':
                // For browsers with proper <template> element support (i.e., where the .content property
                // gives a document fragment), use that document fragment.
                if (isDocumentFragment(elemInstance.content)) {
                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
                }
        }

        // Regular elements such as <div>, and <template> elements on old browsers that don't really
        // understand <template> and just treat it as a regular container
        return ko.utils.cloneNodes(elemInstance.childNodes);
    }

    function isDomElement(obj) {
        if (window['HTMLElement']) {
            return obj instanceof HTMLElement;
        } else {
            return obj && obj.tagName && obj.nodeType === 1;
        }
    }

    function isDocumentFragment(obj) {
        if (window['DocumentFragment']) {
            return obj instanceof DocumentFragment;
        } else {
            return obj && obj.nodeType === 11;
        }
    }

    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
        if (typeof config['require'] === 'string') {
            // The config is the value of an AMD module
            if (amdRequire || window['require']) {
                (amdRequire || window['require'])([config['require']], callback);
            } else {
                errorCallback('Uses require, but no AMD loader is present');
            }
        } else {
            callback(config);
        }
    }

    function makeErrorCallback(componentName) {
        return function (message) {
            throw new Error('Component \'' + componentName + '\': ' + message);
        };
    }

    ko.exportSymbol('components.register', ko.components.register);
    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
    ko.exportSymbol('components.unregister', ko.components.unregister);

    // Expose the default loader so that developers can directly ask it for configuration
    // or to resolve configuration
    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);

    // By default, the default loader is the only registered component loader
    ko.components['loaders'].push(ko.components.defaultLoader);

    // Privately expose the underlying config registry for use in old-IE shim
    ko.components._allRegisteredComponents = defaultConfigRegistry;
})();
(function (undefined) {
    // Overridable API for determining which component name applies to a given node. By overriding this,
    // you can for example map specific tagNames to components that are not preregistered.
    ko.components['getComponentNameForNode'] = function(node) {
        var tagNameLower = ko.utils.tagNameLower(node);
        if (ko.components.isRegistered(tagNameLower)) {
            // Try to determine that this node can be considered a *custom* element; see https://github.com/knockout/knockout/issues/1603
            if (tagNameLower.indexOf('-') != -1 || ('' + node) == "[object HTMLUnknownElement]" || (ko.utils.ieVersion <= 8 && node.tagName === tagNameLower)) {
                return tagNameLower;
            }
        }
    };

    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
        // Determine if it's really a custom element matching a component
        if (node.nodeType === 1) {
            var componentName = ko.components['getComponentNameForNode'](node);
            if (componentName) {
                // It does represent a component, so add a component binding for it
                allBindings = allBindings || {};

                if (allBindings['component']) {
                    // Avoid silently overwriting some other 'component' binding that may already be on the element
                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
                }

                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };

                allBindings['component'] = valueAccessors
                    ? function() { return componentBindingValue; }
                    : componentBindingValue;
            }
        }

        return allBindings;
    }

    var nativeBindingProviderInstance = new ko.bindingProvider();

    function getComponentParamsFromCustomElement(elem, bindingContext) {
        var paramsAttribute = elem.getAttribute('params');

        if (paramsAttribute) {
            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
                }),
                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
                    var paramValue = paramValueComputed.peek();
                    // Does the evaluation of the parameter value unwrap any observables?
                    if (!paramValueComputed.isActive()) {
                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
                        return paramValue;
                    } else {
                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
                        // level of observability, and any inner (resulting model value) level of observability.
                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
                        // writable observable, the computed will also be writable and pass the value on to the observable.
                        return ko.computed({
                            'read': function() {
                                return ko.utils.unwrapObservable(paramValueComputed());
                            },
                            'write': ko.isWriteableObservable(paramValue) && function(value) {
                                paramValueComputed()(value);
                            },
                            disposeWhenNodeIsRemoved: elem
                        });
                    }
                });

            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
            // This is in case the developer wants to react to outer (binding) observability separately from inner
            // (model value) observability, or in case the model value observable has subobservables.
            if (!result.hasOwnProperty('$raw')) {
                result['$raw'] = rawParamComputedValues;
            }

            return result;
        } else {
            // For consistency, absence of a "params" attribute is treated the same as the presence of
            // any empty one. Otherwise component viewmodels need special code to check whether or not
            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
            return { '$raw': {} };
        }
    }

    // --------------------------------------------------------------------------------
    // Compatibility code for older (pre-HTML5) IE browsers

    if (ko.utils.ieVersion < 9) {
        // Whenever you preregister a component, enable it as a custom element in the current document
        ko.components['register'] = (function(originalFunction) {
            return function(componentName) {
                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
                return originalFunction.apply(this, arguments);
            }
        })(ko.components['register']);

        // Whenever you create a document fragment, enable all preregistered component names as custom elements
        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
        document.createDocumentFragment = (function(originalFunction) {
            return function() {
                var newDocFrag = originalFunction(),
                    allComponents = ko.components._allRegisteredComponents;
                for (var componentName in allComponents) {
                    if (allComponents.hasOwnProperty(componentName)) {
                        newDocFrag.createElement(componentName);
                    }
                }
                return newDocFrag;
            };
        })(document.createDocumentFragment);
    }
})();(function(undefined) {

    var componentLoadingOperationUniqueId = 0;

    ko.bindingHandlers['component'] = {
        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
            var currentViewModel,
                currentLoadingOperationId,
                disposeAssociatedComponentViewModel = function () {
                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
                    if (typeof currentViewModelDispose === 'function') {
                        currentViewModelDispose.call(currentViewModel);
                    }
                    currentViewModel = null;
                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
                    currentLoadingOperationId = null;
                },
                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

            ko.computed(function () {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    componentName, componentParams;

                if (typeof value === 'string') {
                    componentName = value;
                } else {
                    componentName = ko.utils.unwrapObservable(value['name']);
                    componentParams = ko.utils.unwrapObservable(value['params']);
                }

                if (!componentName) {
                    throw new Error('No component name specified');
                }

                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
                ko.components.get(componentName, function(componentDefinition) {
                    // If this is not the current load operation for this element, ignore it.
                    if (currentLoadingOperationId !== loadingOperationId) {
                        return;
                    }

                    // Clean up previous state
                    disposeAssociatedComponentViewModel();

                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
                    if (!componentDefinition) {
                        throw new Error('Unknown component \'' + componentName + '\'');
                    }
                    cloneTemplateIntoElement(componentName, componentDefinition, element);
                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
                            ctx['$component'] = componentViewModel;
                            ctx['$componentTemplateNodes'] = originalChildNodes;
                        });
                    currentViewModel = componentViewModel;
                    ko.applyBindingsToDescendants(childBindingContext, element);
                });
            }, null, { disposeWhenNodeIsRemoved: element });

            return { 'controlsDescendantBindings': true };
        }
    };

    ko.virtualElements.allowedBindings['component'] = true;

    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
        var template = componentDefinition['template'];
        if (!template) {
            throw new Error('Component \'' + componentName + '\' has no template');
        }

        var clonedNodesArray = ko.utils.cloneNodes(template);
        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
    }

    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
        var componentViewModelFactory = componentDefinition['createViewModel'];
        return componentViewModelFactory
            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
            : componentParams; // Template-only component
    }

})();
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['attr'] = {
    'update': function(element, valueAccessor, allBindings) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
        ko.utils.objectForEach(value, function(attrName, attrValue) {
            attrValue = ko.utils.unwrapObservable(attrValue);

            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
            // when someProp is a "no value"-like value (strictly null, false, or undefined)
            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
            if (toRemove)
                element.removeAttribute(attrName);

            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
            // property for IE <= 8.
            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
                attrName = attrHtmlToJavascriptMap[attrName];
                if (toRemove)
                    element.removeAttribute(attrName);
                else
                    element[attrName] = attrValue;
            } else if (!toRemove) {
                element.setAttribute(attrName, attrValue.toString());
            }

            // Treat "name" specially - although you can think of it as an attribute, it also needs
            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
            // entirely, and there's no strong reason to allow for such casing in HTML.
            if (attrName === "name") {
                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
            }
        });
    }
};
(function() {

ko.bindingHandlers['checked'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        var checkedValue = ko.pureComputed(function() {
            // Treat "value" like "checkedValue" when it is included with "checked" binding
            if (allBindings['has']('checkedValue')) {
                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
            } else if (allBindings['has']('value')) {
                return ko.utils.unwrapObservable(allBindings.get('value'));
            }

            return element.value;
        });

        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (click) and changes in checkedValue.
            var isChecked = element.checked,
                elemValue = useCheckedValue ? checkedValue() : isChecked;

            // When we're first setting up this computed, don't change any model state.
            if (ko.computedContext.isInitial()) {
                return;
            }

            // We can ignore unchecked radio buttons, because some other radio
            // button will be getting checked, and that one can take care of updating state.
            if (isRadio && !isChecked) {
                return;
            }

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            if (valueIsArray) {
                var writableValue = rawValueIsNonArrayObservable ? modelValue.peek() : modelValue;
                if (oldElemValue !== elemValue) {
                    // When we're responding to the checkedValue changing, and the element is
                    // currently checked, replace the old elem value with the new elem value
                    // in the model array.
                    if (isChecked) {
                        ko.utils.addOrRemoveItem(writableValue, elemValue, true);
                        ko.utils.addOrRemoveItem(writableValue, oldElemValue, false);
                    }

                    oldElemValue = elemValue;
                } else {
                    // When we're responding to the user having checked/unchecked a checkbox,
                    // add/remove the element value to the model array.
                    ko.utils.addOrRemoveItem(writableValue, elemValue, isChecked);
                }
                if (rawValueIsNonArrayObservable && ko.isWriteableObservable(modelValue)) {
                    modelValue(writableValue);
                }
            } else {
                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
            }
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (checked) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (valueIsArray) {
                // When a checkbox is bound to an array, being checked represents its value being present in that array
                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
            } else if (isCheckbox) {
                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
                element.checked = modelValue;
            } else {
                // For radio buttons, being checked means that the radio button's value corresponds to the model value
                element.checked = (checkedValue() === modelValue);
            }
        };

        var isCheckbox = element.type == "checkbox",
            isRadio = element.type == "radio";

        // Only bind to check boxes and radio buttons
        if (!isCheckbox && !isRadio) {
            return;
        }

        var rawValue = valueAccessor(),
            valueIsArray = isCheckbox && (ko.utils.unwrapObservable(rawValue) instanceof Array),
            rawValueIsNonArrayObservable = !(valueIsArray && rawValue.push && rawValue.splice),
            oldElemValue = valueIsArray ? checkedValue() : undefined,
            useCheckedValue = isRadio || valueIsArray;

        // IE 6 won't allow radio buttons to be selected unless they have a name
        if (isRadio && !element.name)
            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

        // Set up two computeds to update the binding:

        // The first responds to changes in the checkedValue value and to element clicks
        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "click", updateModel);

        // The second responds to changes in the model value (the one associated with the checked binding)
        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });

        rawValue = undefined;
    }
};
ko.expressionRewriting.twoWayBindings['checked'] = true;

ko.bindingHandlers['checkedValue'] = {
    'update': function (element, valueAccessor) {
        element.value = ko.utils.unwrapObservable(valueAccessor());
    }
};

})();var classesWrittenByBindingKey = '__ko__cssValue';
ko.bindingHandlers['css'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value !== null && typeof value == "object") {
            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
            });
        } else {
            value = ko.utils.stringTrim(String(value || '')); // Make sure we don't try to store or set a non-string value
            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
            element[classesWrittenByBindingKey] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    }
};
ko.bindingHandlers['enable'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && element.disabled)
            element.removeAttribute("disabled");
        else if ((!value) && (!element.disabled))
            element.disabled = true;
    }
};

ko.bindingHandlers['disable'] = {
    'update': function (element, valueAccessor) {
        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
    }
};
// For certain common events (currently just 'click'), allow a simplified data-binding syntax
// e.g. click:handler instead of the usual full-length event:{click:handler}
function makeEventHandlerShortcut(eventName) {
    ko.bindingHandlers[eventName] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
        }
    }
}

ko.bindingHandlers['event'] = {
    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var eventsToHandle = valueAccessor() || {};
        ko.utils.objectForEach(eventsToHandle, function(eventName) {
            if (typeof eventName == "string") {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor()[eventName];
                    if (!handlerFunction)
                        return;

                    try {
                        // Take all the event args, and prefix with the viewmodel
                        var argsForHandler = ko.utils.makeArray(arguments);
                        viewModel = bindingContext['$data'];
                        argsForHandler.unshift(viewModel);
                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
                    if (!bubble) {
                        event.cancelBubble = true;
                        if (event.stopPropagation)
                            event.stopPropagation();
                    }
                });
            }
        });
    }
};
// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
ko.bindingHandlers['foreach'] = {
    makeTemplateValueAccessor: function(valueAccessor) {
        return function() {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

            // If unwrappedValue is the array, pass in the wrapped value on its own
            // The value will be unwrapped and tracked within the template binding
            // (See https://github.com/SteveSanderson/knockout/issues/523)
            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
            ko.utils.unwrapObservable(modelValue);
            return {
                'foreach': unwrappedValue['data'],
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        };
    },
    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
    },
    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
ko.virtualElements.allowedBindings['foreach'] = true;
var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
var hasfocusLastValue = '__ko_hasfocusLastValue';
ko.bindingHandlers['hasfocus'] = {
    'init': function(element, valueAccessor, allBindings) {
        var handleElementFocusChange = function(isFocused) {
            // Where possible, ignore which event was raised and determine focus state using activeElement,
            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
            // from calling 'blur()' on the element when it loses focus.
            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
            element[hasfocusUpdatingProperty] = true;
            var ownerDoc = element.ownerDocument;
            if ("activeElement" in ownerDoc) {
                var active;
                try {
                    active = ownerDoc.activeElement;
                } catch(e) {
                    // IE9 throws if you access activeElement during page load (see issue #703)
                    active = ownerDoc.body;
                }
                isFocused = (active === element);
            }
            var modelValue = valueAccessor();
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
            element[hasfocusLastValue] = isFocused;
            element[hasfocusUpdatingProperty] = false;
        };
        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
    },
    'update': function(element, valueAccessor) {
        var value = !!ko.utils.unwrapObservable(valueAccessor());

        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
            value ? element.focus() : element.blur();

            // In IE, the blur method doesn't always cause the element to lose focus (for example, if the window is not in focus).
            // Setting focus to the body element does seem to be reliable in IE, but should only be used if we know that the current
            // element was focused already.
            if (!value && element[hasfocusLastValue]) {
                element.ownerDocument.body.focus();
            }

            // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]);
        }
    }
};
ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
ko.bindingHandlers['html'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
    }
};
// Makes a binding like with or if
function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
    ko.bindingHandlers[bindingKey] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var didDisplayOnLastUpdate,
                savedNodes;
            ko.computed(function() {
                var rawValue = valueAccessor(),
                    dataValue = ko.utils.unwrapObservable(rawValue),
                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
                    isFirstRender = !savedNodes,
                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

                if (needsRefresh) {
                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                    }

                    if (shouldDisplay) {
                        if (!isFirstRender) {
                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
                        }
                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, rawValue) : bindingContext, element);
                    } else {
                        ko.virtualElements.emptyNode(element);
                    }

                    didDisplayOnLastUpdate = shouldDisplay;
                }
            }, null, { disposeWhenNodeIsRemoved: element });
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings[bindingKey] = true;
}

// Construct the actual binding handlers
makeWithIfBinding('if');
makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
makeWithIfBinding('with', true /* isWith */, false /* isNot */,
    function(bindingContext, dataValue) {
        return bindingContext.createStaticChildContext(dataValue);
    }
);
var captionPlaceholder = {};
ko.bindingHandlers['options'] = {
    'init': function(element) {
        if (ko.utils.tagNameLower(element) !== "select")
            throw new Error("options binding applies only to SELECT elements");

        // Remove all existing <option>s.
        while (element.length > 0) {
            element.remove(0);
        }

        // Ensures that the binding processor doesn't try to bind the options
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor, allBindings) {
        function selectedOptions() {
            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
        }

        var selectWasPreviouslyEmpty = element.length == 0,
            multiple = element.multiple,
            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
            arrayToDomNodeChildrenOptions = {},
            captionValue,
            filteredArray,
            previousSelectedValues = [];

        if (!valueAllowUnset) {
            if (multiple) {
                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
            } else if (element.selectedIndex >= 0) {
                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
            }
        }

        if (unwrappedArray) {
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // If caption is included, add it to the array
            if (allBindings['has']('optionsCaption')) {
                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
                // If caption value is null or undefined, don't show a caption
                if (captionValue !== null && captionValue !== undefined) {
                    filteredArray.unshift(captionPlaceholder);
                }
            }
        } else {
            // If a falsy value is provided (e.g. null), we'll simply empty the select element
        }

        function applyToObject(object, predicate, defaultValue) {
            var predicateType = typeof predicate;
            if (predicateType == "function")    // Given a function; run it against the data value
                return predicate(object);
            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
                return object[predicate];
            else                                // Given no optionsText arg; use the data value itself
                return defaultValue;
        }

        // The following functions can run at two different times:
        // The first is when the whole array is being updated directly from this binding handler.
        // The second is when an observable value for a specific array entry is updated.
        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
        var itemUpdate = false;
        function optionForArrayItem(arrayEntry, index, oldOptions) {
            if (oldOptions.length) {
                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
                itemUpdate = true;
            }
            var option = element.ownerDocument.createElement("option");
            if (arrayEntry === captionPlaceholder) {
                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
                ko.selectExtensions.writeValue(option, undefined);
            } else {
                // Apply a value to the option element
                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

                // Apply some text to the option element
                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
                ko.utils.setTextContent(option, optionText);
            }
            return [option];
        }

        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
        arrayToDomNodeChildrenOptions['beforeRemove'] =
            function (option) {
                element.removeChild(option);
            };

        function setSelectionCallback(arrayEntry, newOptions) {
            if (itemUpdate && valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else if (previousSelectedValues.length) {
                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
                // That's why we first added them without selection. Now it's time to set the selection.
                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

                // If this option was changed from being selected during a single-item update, notify the change
                if (itemUpdate && !isSelected) {
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                }
            }
        }

        var callback = setSelectionCallback;
        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
            callback = function(arrayEntry, newOptions) {
                setSelectionCallback(arrayEntry, newOptions);
                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
            }
        }

        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

        ko.dependencyDetection.ignore(function () {
            if (valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else {
                // Determine if the selection has changed as a result of updating the options list
                var selectionChanged;
                if (multiple) {
                    // For a multiple-select box, compare the new selection count to the previous one
                    // But if nothing was selected before, the selection can't have changed
                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
                } else {
                    // For a single-select box, compare the current value to the previous value
                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
                        : (previousSelectedValues.length || element.selectedIndex >= 0);
                }

                // Ensure consistency between model value and selected option.
                // If the dropdown was changed so that selection is no longer the same,
                // notify the value or selectedOptions binding.
                if (selectionChanged) {
                    ko.utils.triggerEvent(element, "change");
                }
            }
        });

        // Workaround for IE bug
        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
            element.scrollTop = previousScrollTop;
    }
};
ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");

        var newValue = ko.utils.unwrapObservable(valueAccessor()),
            previousScrollTop = element.scrollTop;

        if (newValue && typeof newValue.length == "number") {
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                if (node.selected != isSelected) {      // This check prevents flashing of the select element in IE
                    ko.utils.setOptionNodeSelectionState(node, isSelected);
                }
            });
        }

        element.scrollTop = previousScrollTop;
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
ko.bindingHandlers['style'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor() || {});
        ko.utils.objectForEach(value, function(styleName, styleValue) {
            styleValue = ko.utils.unwrapObservable(styleValue);

            if (styleValue === null || styleValue === undefined || styleValue === false) {
                // Empty string removes the value, whereas null/undefined have no effect
                styleValue = "";
            }

            element.style[styleName] = styleValue;
        });
    }
};
ko.bindingHandlers['submit'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (typeof valueAccessor() != "function")
            throw new Error("The value for a submit binding must be a function");
        ko.utils.registerEventHandler(element, "submit", function (event) {
            var handlerReturnValue;
            var value = valueAccessor();
            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
            finally {
                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;
                }
            }
        });
    }
};
ko.bindingHandlers['text'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        ko.utils.setTextContent(element, valueAccessor());
    }
};
ko.virtualElements.allowedBindings['text'] = true;
(function () {

if (window && window.navigator) {
    var parseVersion = function (matches) {
        if (matches) {
            return parseFloat(matches[1]);
        }
    };

    // Detect various browser versions because some old versions don't fully support the 'input' event
    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
        userAgent = window.navigator.userAgent,
        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
}

// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
// But it does fire the 'selectionchange' event on many of those, presumably because the
// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
// fired at the document level only and doesn't directly indicate which element changed. We
// set up just one event handler for the document and use 'activeElement' to determine which
// element was changed.
if (ko.utils.ieVersion < 10) {
    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
        selectionChangeHandlerName = ko.utils.domData.nextKey();
    var selectionChangeHandler = function(event) {
        var target = this.activeElement,
            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
        if (handler) {
            handler(event);
        }
    };
    var registerForSelectionChangeEvent = function (element, handler) {
        var ownerDoc = element.ownerDocument;
        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
        }
        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
    };
}

ko.bindingHandlers['textInput'] = {
    'init': function (element, valueAccessor, allBindings) {

        var previousElementValue = element.value,
            timeoutHandle,
            elementValueBeforeEvent;

        var updateModel = function (event) {
            clearTimeout(timeoutHandle);
            elementValueBeforeEvent = timeoutHandle = undefined;

            var elementValue = element.value;
            if (previousElementValue !== elementValue) {
                // Provide a way for tests to know exactly which event was processed
                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
                previousElementValue = elementValue;
                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
            }
        };

        var deferUpdateModel = function (event) {
            if (!timeoutHandle) {
                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
                // event firing and the updateModel function running. This allows us to ignore model
                // updates that are from the previous state of the element, usually due to techniques
                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
                elementValueBeforeEvent = element.value;
                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
                timeoutHandle = ko.utils.setTimeout(handler, 4);
            }
        };

        // IE9 will mess up the DOM if you handle events synchronously which results in DOM changes (such as other bindings);
        // so we'll make sure all updates are asynchronous
        var ieUpdateModel = ko.utils.ieVersion == 9 ? deferUpdateModel : updateModel;

        var updateView = function () {
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (modelValue === null || modelValue === undefined) {
                modelValue = '';
            }

            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
                ko.utils.setTimeout(updateView, 4);
                return;
            }

            // Update the element only if the element and model are different. On some browsers, updating the value
            // will move the cursor to the end of the input, which would be bad while the user is typing.
            if (element.value !== modelValue) {
                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
                element.value = modelValue;
            }
        };

        var onEvent = function (event, handler) {
            ko.utils.registerEventHandler(element, event, handler);
        };

        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
            // Provide a way for tests to specify exactly which events are bound
            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
                if (eventName.slice(0,5) == 'after') {
                    onEvent(eventName.slice(5), deferUpdateModel);
                } else {
                    onEvent(eventName, updateModel);
                }
            });
        } else {
            if (ko.utils.ieVersion < 10) {
                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
                // when using autocomplete, we'll use 'propertychange' for it also.
                onEvent('propertychange', function(event) {
                    if (event.propertyName === 'value') {
                        ieUpdateModel(event);
                    }
                });

                if (ko.utils.ieVersion == 8) {
                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
                    // events too.
                    onEvent('keyup', updateModel);      // A single keystoke
                    onEvent('keydown', updateModel);    // The first character when a key is held down
                }
                if (ko.utils.ieVersion >= 8) {
                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
                    // These are also needed in IE8 because of the bug described above.
                    registerForSelectionChangeEvent(element, ieUpdateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
                    onEvent('dragend', deferUpdateModel);
                }
            } else {
                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
                // through the user interface.
                onEvent('input', updateModel);

                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
                    onEvent('keydown', deferUpdateModel);
                    onEvent('paste', deferUpdateModel);
                    onEvent('cut', deferUpdateModel);
                } else if (operaVersion < 11) {
                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
                    // We can try to catch some of those using 'keydown'.
                    onEvent('keydown', deferUpdateModel);
                } else if (firefoxVersion < 4.0) {
                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
                    onEvent('DOMAutoComplete', updateModel);

                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
                    onEvent('dragdrop', updateModel);       // <3.5
                    onEvent('drop', updateModel);           // 3.5
                }
            }
        }

        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
        onEvent('change', updateModel);

        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['textInput'] = true;

// textinput is an alias for textInput
ko.bindingHandlers['textinput'] = {
    // preprocess is the only way to set up a full alias
    'preprocess': function (value, name, addBinding) {
        addBinding('textInput', value);
    }
};

})();ko.bindingHandlers['uniqueName'] = {
    'init': function (element, valueAccessor) {
        if (valueAccessor()) {
            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
            ko.utils.setElementName(element, name);
        }
    }
};
ko.bindingHandlers['uniqueName'].currentIndex = 0;
ko.bindingHandlers['value'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
            return;
        }

        // Always catch "change" event; possibly other events too if asked
        var eventsToCatch = ["change"];
        var requestedEventsToCatch = allBindings.get("valueUpdate");
        var propertyChangedFired = false;
        var elementValueBeforeEvent = null;

        if (requestedEventsToCatch) {
            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                requestedEventsToCatch = [requestedEventsToCatch];
            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
        }

        var valueUpdateHandler = function() {
            elementValueBeforeEvent = null;
            propertyChangedFired = false;
            var modelValue = valueAccessor();
            var elementValue = ko.selectExtensions.readValue(element);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
        }

        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
            ko.utils.registerEventHandler(element, "blur", function() {
                if (propertyChangedFired) {
                    valueUpdateHandler();
                }
            });
        }

        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
            // This is useful, for example, to catch "keydown" events after the browser has updated the control
            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
            var handler = valueUpdateHandler;
            if (ko.utils.stringStartsWith(eventName, "after")) {
                handler = function() {
                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
                    // at the earliest asynchronous opportunity. We store this temporary information so that
                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
                    // we can overwrite that model value change with the value the user just typed. Otherwise,
                    // techniques like rateLimit can trigger model changes at critical moments that will
                    // override the user's inputs, causing keystrokes to be lost.
                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
                    ko.utils.setTimeout(valueUpdateHandler, 0);
                };
                eventName = eventName.substring("after".length);
            }
            ko.utils.registerEventHandler(element, eventName, handler);
        });

        var updateFromModel = function () {
            var newValue = ko.utils.unwrapObservable(valueAccessor());
            var elementValue = ko.selectExtensions.readValue(element);

            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
                ko.utils.setTimeout(updateFromModel, 0);
                return;
            }

            var valueHasChanged = (newValue !== elementValue);

            if (valueHasChanged) {
                if (ko.utils.tagNameLower(element) === "select") {
                    var allowUnset = allBindings.get('valueAllowUnset');
                    var applyValueAction = function () {
                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
                    };
                    applyValueAction();

                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                    } else {
                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                        // to apply the value as well.
                        ko.utils.setTimeout(applyValueAction, 0);
                    }
                } else {
                    ko.selectExtensions.writeValue(element, newValue);
                }
            }
        };

        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
    },
    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
};
ko.expressionRewriting.twoWayBindings['value'] = true;
ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};
// 'click' is just a shorthand for the usual full-length event:{click:handler}
makeEventHandlerShortcut('click');
// If you want to make a custom template engine,
//
// [1] Inherit from this class (like ko.nativeTemplateEngine does)
// [2] Override 'renderTemplateSource', supplying a function with this signature:
//
//        function (templateSource, bindingContext, options) {
//            // - templateSource.text() is the text of the template you should render
//            // - bindingContext.$data is the data you should pass into the template
//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
//            //     and bindingContext.$root available in the template too
//            // - options gives you access to any other properties set on "data-bind: { template: options }"
//            // - templateDocument is the document object of the template
//            //
//            // Return value: an array of DOM nodes
//        }
//
// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
//
//        function (script) {
//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
//        }
//
//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

ko.templateEngine = function () { };

ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    throw new Error("Override renderTemplateSource");
};

ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
    throw new Error("Override createJavaScriptEvaluatorBlock");
};

ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem)
            throw new Error("Cannot find template with ID " + template);
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
};

ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
    // Skip rewriting if requested
    if (this['allowTemplateRewriting'] === false)
        return true;
    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
};

ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    var rewritten = rewriterCallback(templateSource['text']());
    templateSource['text'](rewritten);
    templateSource['data']("isRewritten", true);
};

ko.exportSymbol('templateEngine', ko.templateEngine);

ko.templateRewriting = (function () {
    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

    function validateDataBindValuesForRewriting(keyValueArray) {
        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
        for (var i = 0; i < keyValueArray.length; i++) {
            var key = keyValueArray[i]['key'];
            if (allValidators.hasOwnProperty(key)) {
                var validator = allValidators[key];

                if (typeof validator === "function") {
                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
                    if (possibleErrorMessage)
                        throw new Error(possibleErrorMessage);
                } else if (!validator) {
                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
                }
            }
        }
    }

    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
        validateDataBindValuesForRewriting(dataBindKeyValueArray);
        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
        // extra indirection.
        var applyBindingsToNextSiblingScript =
            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
    }

    return {
        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
                templateEngine['rewriteTemplate'](template, function (htmlString) {
                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
                }, templateDocument);
        },

        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
            });
        },

        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
            return ko.memoization.memoize(function (domNode, bindingContext) {
                var nodeToBind = domNode.nextSibling;
                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
                }
            });
        }
    }
})();


// Exported only because it has to be referenced by string lookup from within rewritten template
ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
(function() {
    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
    //
    // Two are provided by default:
    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
    //                                           without reading/writing the actual element text content, since it will be overwritten
    //                                           with the rendered template output.
    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
    // Template sources need to have the following functions:
    //   text() 			- returns the template text from your storage location
    //   text(value)		- writes the supplied template text to your storage location
    //   data(key)			- reads values stored using data(key, value) - see below
    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
    //
    // Optionally, template sources can also have the following functions:
    //   nodes()            - returns a DOM element containing the nodes of this template, where available
    //   nodes(value)       - writes the given DOM element to your storage location
    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
    //
    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

    ko.templateSources = {};

    // ---- ko.templateSources.domElement -----

    // template types
    var templateScript = 1,
        templateTextArea = 2,
        templateTemplate = 3,
        templateElement = 4;

    ko.templateSources.domElement = function(element) {
        this.domElement = element;

        if (element) {
            var tagNameLower = ko.utils.tagNameLower(element);
            this.templateType =
                tagNameLower === "script" ? templateScript :
                tagNameLower === "textarea" ? templateTextArea :
                    // For browsers with proper <template> element support, where the .content property gives a document fragment
                tagNameLower == "template" && element.content && element.content.nodeType === 11 ? templateTemplate :
                templateElement;
        }
    }

    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
        var elemContentsProperty = this.templateType === templateScript ? "text"
                                 : this.templateType === templateTextArea ? "value"
                                 : "innerHTML";

        if (arguments.length == 0) {
            return this.domElement[elemContentsProperty];
        } else {
            var valueToWrite = arguments[0];
            if (elemContentsProperty === "innerHTML")
                ko.utils.setHtml(this.domElement, valueToWrite);
            else
                this.domElement[elemContentsProperty] = valueToWrite;
        }
    };

    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
        if (arguments.length === 1) {
            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
        } else {
            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
        }
    };

    var templatesDomDataKey = ko.utils.domData.nextKey();
    function getTemplateDomData(element) {
        return ko.utils.domData.get(element, templatesDomDataKey) || {};
    }
    function setTemplateDomData(element, data) {
        ko.utils.domData.set(element, templatesDomDataKey, data);
    }

    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
        var element = this.domElement;
        if (arguments.length == 0) {
            var templateData = getTemplateDomData(element),
                containerData = templateData.containerData;
            return containerData || (
                this.templateType === templateTemplate ? element.content :
                this.templateType === templateElement ? element :
                undefined);
        } else {
            var valueToWrite = arguments[0];
            setTemplateDomData(element, {containerData: valueToWrite});
        }
    };

    // ---- ko.templateSources.anonymousTemplate -----
    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

    ko.templateSources.anonymousTemplate = function(element) {
        this.domElement = element;
    }
    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = getTemplateDomData(this.domElement);
            if (templateData.textData === undefined && templateData.containerData)
                templateData.textData = templateData.containerData.innerHTML;
            return templateData.textData;
        } else {
            var valueToWrite = arguments[0];
            setTemplateDomData(this.domElement, {textData: valueToWrite});
        }
    };

    ko.exportSymbol('templateSources', ko.templateSources);
    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
})();
(function () {
    var _templateEngine;
    ko.setTemplateEngine = function (templateEngine) {
        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
            throw new Error("templateEngine must inherit from ko.templateEngine");
        _templateEngine = templateEngine;
    }

    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
            nextInQueue = ko.virtualElements.nextSibling(node);
            action(node, nextInQueue);
        }
    }

    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

        if (continuousNodeArray.length) {
            var firstNode = continuousNodeArray[0],
                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
                parentNode = firstNode.parentNode,
                provider = ko.bindingProvider['instance'],
                preprocessNode = provider['preprocessNode'];

            if (preprocessNode) {
                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
                    var nodePreviousSibling = node.previousSibling;
                    var newNodes = preprocessNode.call(provider, node);
                    if (newNodes) {
                        if (node === firstNode)
                            firstNode = newNodes[0] || nextNodeInRange;
                        if (node === lastNode)
                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
                    }
                });

                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
                // first node needs to be in the array).
                continuousNodeArray.length = 0;
                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
                    return;
                }
                if (firstNode === lastNode) {
                    continuousNodeArray.push(firstNode);
                } else {
                    continuousNodeArray.push(firstNode, lastNode);
                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
                }
            }

            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
            // whereas a regular applyBindings won't introduce new memoized nodes
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.applyBindings(bindingContext, node);
            });
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
            });

            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
        }
    }

    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
                                        : null;
    }

    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
        options = options || {};
        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

        // Loosely check result is an array of DOM nodes
        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
            throw new Error("Template engine must return an array of DOM nodes");

        var haveAddedNodesToParent = false;
        switch (renderMode) {
            case "replaceChildren":
                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "replaceNode":
                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "ignoreTargetNode": break;
            default:
                throw new Error("Unknown renderMode: " + renderMode);
        }

        if (haveAddedNodesToParent) {
            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
            if (options['afterRender'])
                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
        }

        return renderedNodesArray;
    }

    function resolveTemplateName(template, data, context) {
        // The template can be specified as:
        if (ko.isObservable(template)) {
            // 1. An observable, with string value
            return template();
        } else if (typeof template === 'function') {
            // 2. A function of (data, context) returning a string
            return template(data, context);
        } else {
            // 3. A string
            return template;
        }
    }

    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
        options = options || {};
        if ((options['templateEngine'] || _templateEngine) == undefined)
            throw new Error("Set a template engine before calling renderTemplate");
        renderMode = renderMode || "replaceChildren";

        if (targetNodeOrNodeArray) {
            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
                function () {
                    // Ensure we've got a proper binding context to work with
                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
                        ? dataOrBindingContext
                        : new ko.bindingContext(dataOrBindingContext, null, null, null, { "exportDependencies": true });

                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);

                    if (renderMode == "replaceNode") {
                        targetNodeOrNodeArray = renderedNodesArray;
                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
                    }
                },
                null,
                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
            );
        } else {
            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
            return ko.memoization.memoize(function (domNode) {
                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
            });
        }
    };

    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
        var arrayItemContext;

        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
        var executeTemplateForArrayItem = function (arrayValue, index) {
            // Support selecting template as a function of the data being rendered
            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
                context['$index'] = index;
            });

            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
        }

        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
            if (options['afterRender'])
                options['afterRender'](addedNodesArray, arrayValue);

            // release the "cache" variable, so that it can be collected by
            // the GC when its value isn't used from within the bindings anymore.
            arrayItemContext = null;
        };

        return ko.dependentObservable(function () {
            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

        }, null, { disposeWhenNodeIsRemoved: targetNode });
    };

    var templateComputedDomDataKey = ko.utils.domData.nextKey();
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
            oldComputed.dispose();
        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }

    ko.bindingHandlers['template'] = {
        'init': function(element, valueAccessor) {
            // Support anonymous templates
            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
            if (typeof bindingValue == "string" || bindingValue['name']) {
                // It's a named template - clear the element
                ko.virtualElements.emptyNode(element);
            } else if ('nodes' in bindingValue) {
                // We've been given an array of DOM nodes. Save them as the template source.
                // There is no known use case for the node array being an observable array (if the output
                // varies, put that behavior *into* your template - that's what templates are for), and
                // the implementation would be a mess, so assert that it's not observable.
                var nodes = bindingValue['nodes'] || [];
                if (ko.isObservable(nodes)) {
                    throw new Error('The "nodes" option must be a plain, non-observable array.');
                }
                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            } else {
                // It's an anonymous template - store the element contents, then clear the element
                var templateNodes = ko.virtualElements.childNodes(element),
                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            }
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                options = ko.utils.unwrapObservable(value),
                shouldDisplay = true,
                templateComputed = null,
                templateName;

            if (typeof options == "string") {
                templateName = value;
                options = {};
            } else {
                templateName = options['name'];

                // Support "if"/"ifnot" conditions
                if ('if' in options)
                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
                if (shouldDisplay && 'ifnot' in options)
                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);
            }

            if ('foreach' in options) {
                // Render once for each data point (treating data set as empty if shouldDisplay==false)
                var dataArray = (shouldDisplay && options['foreach']) || [];
                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
            } else if (!shouldDisplay) {
                ko.virtualElements.emptyNode(element);
            } else {
                // Render once for this single data point (or use the viewModel if no data was provided)
                var innerBindingContext = ('data' in options) ?
                    bindingContext.createStaticChildContext(options['data'], options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
            }

            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        }
    };

    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
            return null; // Named templates can be rewritten, so return "no error"
        return "This template engine does not support anonymous templates nested within its templates";
    };

    ko.virtualElements.allowedBindings['template'] = true;
})();

ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
ko.exportSymbol('renderTemplate', ko.renderTemplate);
// Go through the items that have been added and deleted and try to find matches between them.
ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
    if (left.length && right.length) {
        var failedCompares, l, r, leftItem, rightItem;
        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
            for (r = 0; rightItem = right[r]; ++r) {
                if (leftItem['value'] === rightItem['value']) {
                    leftItem['moved'] = rightItem['index'];
                    rightItem['moved'] = leftItem['index'];
                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
                    break;
                }
            }
            failedCompares += r;
        }
    }
};

ko.utils.compareArrays = (function () {
    var statusNotInOld = 'added', statusNotInNew = 'deleted';

    // Simple calculation based on Levenshtein distance.
    function compareArrays(oldArray, newArray, options) {
        // For backward compatibility, if the third arg is actually a bool, interpret
        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
        oldArray = oldArray || [];
        newArray = newArray || [];

        if (oldArray.length < newArray.length)
            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
        else
            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
    }

    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
        var myMin = Math.min,
            myMax = Math.max,
            editDistanceMatrix = [],
            smlIndex, smlIndexMax = smlArray.length,
            bigIndex, bigIndexMax = bigArray.length,
            compareRange = (bigIndexMax - smlIndexMax) || 1,
            maxDistance = smlIndexMax + bigIndexMax + 1,
            thisRow, lastRow,
            bigIndexMaxForRow, bigIndexMinForRow;

        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
            lastRow = thisRow;
            editDistanceMatrix.push(thisRow = []);
            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
            bigIndexMinForRow = myMax(0, smlIndex - 1);
            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
                if (!bigIndex)
                    thisRow[bigIndex] = smlIndex + 1;
                else if (!smlIndex)  // Top row - transform empty array into new array via additions
                    thisRow[bigIndex] = bigIndex + 1;
                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
                else {
                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
                }
            }
        }

        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
                notInSml.push(editScript[editScript.length] = {     // added
                    'status': statusNotInSml,
                    'value': bigArray[--bigIndex],
                    'index': bigIndex });
            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
                notInBig.push(editScript[editScript.length] = {     // deleted
                    'status': statusNotInBig,
                    'value': smlArray[--smlIndex],
                    'index': smlIndex });
            } else {
                --bigIndex;
                --smlIndex;
                if (!options['sparse']) {
                    editScript.push({
                        'status': "retained",
                        'value': bigArray[bigIndex] });
                }
            }
        }

        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
        // smlIndexMax keeps the time complexity of this algorithm linear.
        ko.utils.findMovesInArrayComparison(notInBig, notInSml, !options['dontLimitMoves'] && smlIndexMax * 10);

        return editScript.reverse();
    }

    return compareArrays;
})();

ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
(function () {
    // Objective:
    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
    //   previously mapped - retain those nodes, and just insert/delete other ones

    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
    // You can use this, for example, to activate bindings on those nodes.

    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
        // Map this array value inside a dependentObservable so we re-map when any dependency changes
        var mappedNodes = [];
        var dependentObservable = ko.dependentObservable(function() {
            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

            // On subsequent evaluations, just replace the previously-inserted DOM nodes
            if (mappedNodes.length > 0) {
                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
                if (callbackAfterAddingNodes)
                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
            }

            // Replace the contents of the mappedNodes array, thereby updating the record
            // of which nodes would be deleted if valueToMap was itself later removed
            mappedNodes.length = 0;
            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
    }

    var lastMappingResultDomDataKey = ko.utils.domData.nextKey(),
        deletedItemDummyValue = ko.utils.domData.nextKey();

    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
        // Compare the provided array against the previous one
        array = array || [];
        options = options || {};
        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

        // Build the new mapping result
        var newMappingResult = [];
        var lastMappingResultIndex = 0;
        var newMappingResultIndex = 0;

        var nodesToDelete = [];
        var itemsToProcess = [];
        var itemsForBeforeRemoveCallbacks = [];
        var itemsForMoveCallbacks = [];
        var itemsForAfterAddCallbacks = [];
        var mapData;

        function itemMovedOrRetained(editScriptIndex, oldPosition) {
            mapData = lastMappingResult[oldPosition];
            if (newMappingResultIndex !== oldPosition)
                itemsForMoveCallbacks[editScriptIndex] = mapData;
            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
            mapData.indexObservable(newMappingResultIndex++);
            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
            newMappingResult.push(mapData);
            itemsToProcess.push(mapData);
        }

        function callCallback(callback, items) {
            if (callback) {
                for (var i = 0, n = items.length; i < n; i++) {
                    if (items[i]) {
                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
                            callback(node, i, items[i].arrayEntry);
                        });
                    }
                }
            }
        }

        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
            movedIndex = editScriptItem['moved'];
            switch (editScriptItem['status']) {
                case "deleted":
                    if (movedIndex === undefined) {
                        mapData = lastMappingResult[lastMappingResultIndex];

                        // Stop tracking changes to the mapping for these nodes
                        if (mapData.dependentObservable) {
                            mapData.dependentObservable.dispose();
                            mapData.dependentObservable = undefined;
                        }

                        // Queue these nodes for later removal
                        if (ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode).length) {
                            if (options['beforeRemove']) {
                                newMappingResult.push(mapData);
                                itemsToProcess.push(mapData);
                                if (mapData.arrayEntry === deletedItemDummyValue) {
                                    mapData = null;
                                } else {
                                    itemsForBeforeRemoveCallbacks[i] = mapData;
                                }
                            }
                            if (mapData) {
                                nodesToDelete.push.apply(nodesToDelete, mapData.mappedNodes);
                            }
                        }
                    }
                    lastMappingResultIndex++;
                    break;

                case "retained":
                    itemMovedOrRetained(i, lastMappingResultIndex++);
                    break;

                case "added":
                    if (movedIndex !== undefined) {
                        itemMovedOrRetained(i, movedIndex);
                    } else {
                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
                        newMappingResult.push(mapData);
                        itemsToProcess.push(mapData);
                        if (!isFirstExecution)
                            itemsForAfterAddCallbacks[i] = mapData;
                    }
                    break;
            }
        }

        // Store a copy of the array items we just considered so we can difference it next time
        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);

        // Call beforeMove first before any changes have been made to the DOM
        callCallback(options['beforeMove'], itemsForMoveCallbacks);

        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
            // Get nodes for newly added items
            if (!mapData.mappedNodes)
                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

            // Put nodes in the right place if they aren't there already
            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
                if (node !== nextNode)
                    ko.virtualElements.insertAfter(domNode, node, lastNode);
            }

            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
            if (!mapData.initialized && callbackAfterAddingNodes) {
                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
                mapData.initialized = true;
            }
        }

        // If there's a beforeRemove callback, call it after reordering.
        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
        // Perhaps we'll make that change in the future if this scenario becomes more common.
        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

        // Replace the stored values of deleted items with a dummy value. This provides two benefits: it marks this item
        // as already "removed" so we won't call beforeRemove for it again, and it ensures that the item won't match up
        // with an actual item in the array and appear as "retained" or "moved".
        for (i = 0; i < itemsForBeforeRemoveCallbacks.length; ++i) {
            if (itemsForBeforeRemoveCallbacks[i]) {
                itemsForBeforeRemoveCallbacks[i].arrayEntry = deletedItemDummyValue;
            }
        }

        // Finally call afterMove and afterAdd callbacks
        callCallback(options['afterMove'], itemsForMoveCallbacks);
        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);
    }
})();

ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
ko.nativeTemplateEngine = function () {
    this['allowTemplateRewriting'] = false;
}

ko.nativeTemplateEngine.prototype = new ko.templateEngine();
ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

    if (templateNodes) {
        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
    } else {
        var templateText = templateSource['text']();
        return ko.utils.parseHtmlFragment(templateText, templateDocument);
    }
};

ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
(function() {
    ko.jqueryTmplTemplateEngine = function () {
        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
        // doesn't expose a version number, so we have to infer it.
        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
        // which KO internally refers to as version "2", so older versions are no longer detected.
        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
            if (!jQueryInstance || !(jQueryInstance['tmpl']))
                return 0;
            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
            try {
                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
                    return 2; // Final version of jquery.tmpl
                }
            } catch(ex) { /* Apparently not the version we were looking for */ }

            return 1; // Any older version that we don't support
        })();

        function ensureHasReferencedJQueryTemplates() {
            if (jQueryTmplVersion < 2)
                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
        }

        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
        }

        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
            templateDocument = templateDocument || document;
            options = options || {};
            ensureHasReferencedJQueryTemplates();

            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                var templateText = templateSource['text']() || "";
                // Wrap in "with($whatever.koBindingContext) { ... }"
                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

                precompiled = jQueryInstance['template'](null, templateText);
                templateSource['data']('precompiled', precompiled);
            }

            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
            return resultNodes;
        };

        this['createJavaScriptEvaluatorBlock'] = function(script) {
            return "{{ko_code ((function() { return " + script + " })()) }}";
        };

        this['addTemplate'] = function(templateName, templateMarkup) {
            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
        };

        if (jQueryTmplVersion > 0) {
            jQueryInstance['tmpl']['tag']['ko_code'] = {
                open: "__.push($1 || '');"
            };
            jQueryInstance['tmpl']['tag']['ko_with'] = {
                open: "with($1) {",
                close: "} "
            };
        }
    };

    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

    // Use this one by default *only if jquery.tmpl is referenced*
    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
})();
}));
}());
})();

},{}],9:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],10:[function(require,module,exports){
/*
Copyright (c) 2016 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = (function () {
  'use strict';

  //----------------------------------------------------------------------------
  var teak = {};

  // Token categories
  var tkNone = 0;         // No valid token
  var tkOpenParen = 1;    // (
  var tkCloseParen = 2;   // )
  var tkString = 3;       // 'abc'
  var tkNumber = 4;       // 123 456.289
  var tkSymbol = 5;       // add
  var tkName = 6;         // name:

  function isNumberChar (c) {
    return (c >= '0' && c <= '9');
  }

  function isAlphaChar (c) {
    return (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z');
  }

  teak.invalidToken = {string:'', cat: tkNone};

  //----------------------------------------------------------------------------
  teak.Parser = function Parser (buffer, begin, state, symbolTable) {
    // Buffer is an array of single unicode grapheme
    this.buffer = buffer;
    // Begin is the index to the next character
    this.begin = begin;
    // Parser state
    this.state = state;
    state.error = '';
    state.position = 0;

    // SymbolTable for mapping symbols (not strings) found in the expression
    this.symbolTable = symbolTable;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.markError = function (message, position) {
    this.state.error = message;
    this.state.position = position;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.empty = function () {
    return (this.begin >= this.buffer.length);
  };

  //----------------------------------------------------------------------------
  // Skip spaces and any comments found along the way.
  teak.Parser.prototype.skipSpace = function Parser () {
    var i = this.begin;
    var length = this.buffer.length;
    while (i < length) {
      var c = this.peekChar();
      if (c === ' ' || c === '\n' || c === '\r' || c === '\t') {
        this.readChar();
        continue;
      } else if (c === '/' && ((i + 1) < length) && this.buffer[i+1] === '/') {
        // Comment to end-of-line, or end-of-file
        this.readChar();
        this.readChar();
        do {
          c = this.readChar();
        } while (c !== '\n' && !this.empty());
      } else {
        // Found something that does not count was space, break.
        break;
      }
    }
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.peekChar = function () {
    return this.buffer[this.begin];
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.readChar = function () {
    var c = '';
    if (this.begin < this.buffer.length) {
      c = this.buffer[this.begin];
      this.begin += 1;
    }
    return c;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.scanNumberToken = function (isNeg) {
    var str = isNeg ? '-' : '';
    var c = '';
    do {
      str += this.readChar();
      c = this.peekChar();
      // TODO this is not as strict as it oughto be..
      // tighten up here or in tokenToObject().
    } while (isNumberChar(c) || c === '.');
    return { string:str, category:tkNumber };
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.scanSymbolToken = function (isNeg) {
    var str = isNeg ? '-' : '';
    var cat = tkSymbol;
    do {
      str += this.readChar();
      var c = this.peekChar();
    } while (isNumberChar(c) || isAlphaChar(c));

    // There are a few special cases
    if (c === ':') {
      if (isNeg) {
        this.markError('Invalid negated name', this.begin);
        return teak.invalidToken;
      }
      // symbol followed by a colon is really anchor/field name
      // this takes precedence over reserved words.
      cat = tkName;
      this.readChar();
    }
    return { string:str, category:cat };
  };

  //----------------------------------------------------------------------------
  // Reads characters from the buffer assuming it is a string
  teak.Parser.prototype.scanStringToken = function () {
    this.readChar();
    var str = '';
    var position = this.begin;
    var c = this.readChar();
    while (c !== '\'' && !this.empty()) {
      if (c !== '\\') {
        str += c;
        c = this.readChar();
      } else {
        // Read escape sequence and translate.
        c = this.readChar();
        if (c === 'n') {
          str += '\n';
        } else if (c === '\'') {
          str += '\'';
        } else if (c === '\"') {
          str += '\"';
        } else if (c === '\\') {
          str += '\\';
        } else if (c === 'u') {
          // TODO unicode characters
        } else {
          this.markError('Invalid string escape', this.begin);
        }
        c = this.readChar();
      }
    };

    if (c !== '\'') {
      this.markError('Invalid string', position);
    }
    return {
      string:str,
      category:tkString,
    };
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.readToken = function () {
    this.skipSpace();
    var c = this.peekChar();
    var isNeg = false;

    if (c === '(') {
      return { string: this.readChar(), category: tkOpenParen };
    } else if (c === ')') {
      return { string: this.readChar(), category: tkCloseParen };
    } else if (c === '\'') {
      return this.scanStringToken();
    } else if (c === '-') {
      // negative sign can prefix numbers and some symbols
      isNeg = true;
      this.readChar();
      c = this.peekChar();
    }

    if (isNumberChar(c)) {
      return this.scanNumberToken(isNeg);
    } else if (isAlphaChar(c)) {
      return this.scanSymbolToken(isNeg);
    }  else {
      return teak.invalidToken;
    }
  };

//------------------------------------------------------------------------------
teak.Parser.prototype.tokenToObject = function (token) {
    var str = token.string;
    if (token.category === tkNumber) {
      if (str.includes('.')) {
        return parseFloat(str, 10);
      } else {
        return parseInt(str, 10);
      }
    } else if (token.category === tkString) {
      // Its a string use the data as is.
      return str;
    } else if (token.category === tkSymbol) {
      // Check for reserved words first
      if (str === 'true') {
        return true;
      } else if (str === 'false') {
        return false;
      } else if (str === 'null') {
        return null;
      } else if (str === 'nan') {
        return Number.NaN;
      } else if (str === 'inf') {
        return Number.POSITIVE_INFINITY;
      } else if (str === '-inf') {
        return Number.NEGATIVE_INFINITY;
      } else {
        return this.lookupSymbol(str);
        // TODO unresolved symbols just pass through as undefined.
      }
    } else if (token.category === tkNone) {
      // Unrecognized characters or end of string
      this.markError('Invalid token', this.begin);
      return null;
    } else {
      // Token type not yet supported.
      this.markError('Invalid token category :' + token.category, this.begin);
    }
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.lookupSymbol = function (name) {
    var value = undefined;
    if (Array.isArray(this.symbolTable)) {
      for (var i = 0; i < this.symbolTable.length; i++) {
        value = this.symbolTable[i][name];
        if (value !== undefined) {
          break;
        }
      }
    } else if (typeof this.symbolTable === "function") {
      return this.symbolTable(name);
    } else {
      value = this.symbolTable[name];
    }
    return value;
  };

  //----------------------------------------------------------------------------
  teak.Parser.prototype.parseObject = function (token) {
      var obj = null;
      var names = [];
      var index = 0;

      if (token.category === tkOpenParen) {
        // Beginning of a list
        var array = [];
        token = this.readToken();
        while (token.category !== tkCloseParen && !this.empty()) {

          // See if item has a name
          if (token.category === tkName) {
            names[index] = token.string;
            token = this.readToken();
          }
          if (token.category === tkName) {
            this.markError('Invalid token', this.begin);
            return null;
          }

          array.push(this.parseObject(token));
          token = this.readToken();
          index += 1;
        }
        if (names.length > 0) {
          var objWithFields = {};
          var length = array.length;
          for (var i = 0; i < length; i++) {
            var name = names[i];
            if (name === undefined) {
              name = "_" + i;
            }
            objWithFields[name] = array[i];
          }
          obj = objWithFields;
        } else {
          obj = array;
        }
        if (token.category !== tkCloseParen) {
          this.markError('Invalid expression', this.begin);
          return null;
        }
      } else {
        // Not a list, is a single item
        obj = this.tokenToObject(token);
      }
      return obj;
  };

  //----------------------------------------------------------------------------
  teak.parse = function (string, state, symbolTable) {
    if (state === undefined || state === null) {
      state = {};
    }
    if (symbolTable === undefined || state === null) {
      symbolTable = {};
    }

    var st = '';
    if (!Array.from) {
      // For pre ES2015 runtimes use split, does not support surogate pairs.
      st = new teak.Parser(string.split(''), 0, state, symbolTable);
    } else {
      st = new teak.Parser(Array.from(string), 0, state, symbolTable);
    }

    var token = st.readToken();
    return st.parseObject(token);
  };

  return teak;
}());

},{}],11:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],12:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var actionButtons = {};
  var svgb = require('./svgbuilder.js');
  var cxnButton = require('./overlays/cxnButton.js');

  actionButtons.addActionButtons = function(buttons, tbe) {
    var position = null;
    var alignment = null;
    var command = '';
    var tweakx = 0;
    var label = '';
    var numMiddle = 0;
    var toReturn = [];

    var group = null;
    var svgCircle = null;
    var svgText = null;
    var svgText2 = null;
    var existing = document.getElementsByClassName('buttonGroup');
    var dropLength = document.getElementsByClassName('dropdown-buttons').length;

    // If action buttons exist, delete them.
    if(existing[0] !== undefined){
      while(existing.length > 0){
          existing[0].parentNode.removeChild(existing[0]);
      }
    }

    // Determine how many buttons are in the middle.
    for (var k = 0; k < buttons.length; k++) {
      if (buttons[k].alignment === 'M' && buttons[k].position > numMiddle) {
        numMiddle = buttons[k].position;
      }
    }

    var half = window.innerWidth/2;
    var middleLeft = half - ((numMiddle + 1) * 0.05 * window.innerWidth);
    var x = 0;

    for (var i = buttons.length - 1; i >= 0; i--) {
      position = buttons[i].position;
      alignment = buttons[i].alignment;
      command = buttons[i].command;
      tweakx = buttons[i].tweakx;
      if (tweakx === undefined) {
        tweakx = 0;
      }
      label = buttons[i].label;

      if (alignment === 'L') {
        x = ((0.1 * window.innerWidth) * position);
      } else if(alignment === 'M') {
        x = middleLeft + ((0.1 * window.innerWidth) * position);
      } else if (alignment === 'R') {
        x = window.innerWidth - ((0.1 * window.innerWidth) * position);
      }

      group = svgb.createGroup('buttonGroup', 0, 0);
      svgCircle = svgb.createCircle('action-dot', x, 40, 33);

      //Check if character strings are more than one character to create a label on top of the usual label
      if(label.length > 1){
        svgText = svgb.createText('fa action-dot-text', x + tweakx, 53, label.substring(0, 1));
        svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, 53, label.substring(1));
        group.appendChild(svgCircle);
        group.appendChild(svgText);
        group.appendChild(svgText2);
      } else {
        svgText = svgb.createText('fa action-dot-text', x + tweakx, 53, label);
        group.appendChild(svgCircle);
        group.appendChild(svgText);
      }

      if (command === 'connect') {
        var dLabel = actionButtons.addLabel(svgCircle, 160, "bot: " + cxnButton.deviceName, 'device-name-label');
        group.appendChild(dLabel);
        group.setAttribute('class', 'buttonGroup action-dot');
        svgCircle.setAttribute('class', '');
        group.setAttribute('command', command);
      }

      tbe.svg.appendChild(group);
      buttons[i].svgText = svgText;
      buttons[i].svgCircle = svgCircle;
      svgCircle.setAttribute('command', command);

      group.setAttribute('id', buttons[i].command + 'Command');
      toReturn[buttons.length - i - 1] = [svgCircle, svgText];
    }

    var underlay = document.getElementsByClassName('buttonGroupUnderlay');
    if(underlay[0] !== undefined){
      if(underlay[0].getAttribute('transform') === null){
        underlay[0].setAttribute('transform', 'translate (0 0)');
      }
      var animateSlide = {
        frame: 20,
        adx: 0,
        ady: -(dropLength*80)/20
      };
      this.slideButton(animateSlide, underlay[0], "delete");
      if(underlay[1].getAttribute('transform') === null){
        underlay[1].setAttribute('transform', 'translate (0 0)');
      }
      animateSlide = {
        frame: 20,
        adx: 0,
        ady: 0
      };
      this.slideButton(animateSlide, underlay[1], "delete");
    }

    underlay = document.getElementsByClassName('action-dot-rect-pages');
    if(underlay[0] !== undefined){
      underlay[0].setAttribute('class', 'action-dot-rect-remove-pages');
    }
    underlay = document.getElementsByClassName('action-dot-rect-edit');
    if(underlay[0] !== undefined){
      underlay[0].setAttribute('class', 'action-dot-rect-remove-edit');
    }

    return toReturn;
  };

  actionButtons.createDropdown = function(buttons, tbe, changeText, id){
    var droppoint = document.getElementById(id + 'Command').childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');

    var group = svgb.createGroup('buttonGroupUnderlay', 0, 0);
    var svgCircle = svgb.createCircle('action-dot-underlay', x, 40, 40);
    svgCircle.setAttribute('transform', 'translate (0 0)');
    group.appendChild(svgCircle);
    tbe.svg.appendChild(group);
    var animateSlideDown = {
      frame: 20,
      adx: 0,
      ady: (buttons.length*80)/20,
    };
    this.slideButton(animateSlideDown, group);
    var svgRect = svgb.createRect('action-dot-rect-' + id, x-40, 40, 80, buttons.length*80);
    group = svgb.createGroup('buttonGroupUnderlay', 0, 0);
    svgCircle = svgb.createCircle('action-dot-underlay', x, 40, 40);
    svgCircle.setAttribute('transform', 'translate (0 0)');
    group.appendChild(svgCircle);
    tbe.svg.appendChild(group);
    tbe.svg.appendChild(svgRect);
    this.addButton(changeText, x, y, tbe, 'pullUp' + id, 'pullUp' + id);
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);
    var newButtons = [];


    for(var i = 0; i < buttons.length; i++){
      var label = buttons[i].label;
      if(label.match(/[a-z]/i) !== null){
        newButtons[i] = this.addButton(label, x, y, tbe, buttons[i].command, undefined, 'dropdown-buttons', 'text-buttons');
      } else {
        newButtons[i] = this.addButton(label, x, y, tbe, buttons[i].command, undefined, 'dropdown-buttons');
      }
    }

    for(var k = 0; k < newButtons.length; k++){
      animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: ((80 * (k+1)))/20,
      };
      this.slideButton(animateSlideDown, newButtons[k]);
    }

    return newButtons;
  };
  actionButtons.deleteDropdown = function(buttons, tbe, changeText, id){
    for(var i = 0; i < buttons.length; i++){
      var animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: -((80 * (i+1))/20)
      };
      this.slideButton(animateSlideDown, buttons[i], "delete");
    }
    var droppoint = document.getElementById('pullUp' + id).childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');
    this.addButton(changeText, x, y, tbe, id, id);
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);
    var underlay = document.getElementsByClassName('buttonGroupUnderlay');
    var animateSlide = {
      frame: 20,
      adx: 0,
      ady: -(buttons.length*80)/20
    };
    this.slideButton(animateSlide, underlay[0], "delete");
    animateSlide = {
      frame: 20,
      adx: 0,
      ady: 0
    };
    this.slideButton(animateSlide, underlay[1], "delete");

    underlay = document.getElementsByClassName('action-dot-rect-' + id);
    underlay[0].setAttribute('class', 'action-dot-rect-remove-' + id);
  };

  actionButtons.addButton = function(label, x, y, tbe, command, id, eltClass, txtClass){
    var group = svgb.createGroup('buttonGroup', 0, 0);
    var svgCircle = svgb.createCircle('action-dot', x, y, 33);
    var svgText = svgb.createText('fa action-dot-text', x, parseInt(y, 10)+13, label);
    if(command !== undefined){
      svgCircle.setAttribute('command', command);
    }
    if(id !== undefined){
      group.setAttribute('id', id);
    }
    if(txtClass !== undefined){
      svgText.setAttribute('class', 'fa action-dot-text ' + txtClass);
    }
    if(eltClass !== undefined){
      group.setAttribute('class', 'buttonGroup ' + eltClass);
      if (command === 'copy') {
        var curr = group.getAttribute('class');
        group.setAttribute('class', curr + ' copy-button');
      }
    }
    group.appendChild(svgCircle);
    group.appendChild(svgText);
    tbe.svg.appendChild(group);
    return group;
  };

  actionButtons.addLabel = function(circle, width, label, idName){
    var x = parseInt(circle.getAttribute('cx'), 10);
    var y = parseInt(circle.getAttribute('cy'), 10);
    var r = parseInt(circle.getAttribute('r'), 10);

    var group = svgb.createGroup('buttonGroup', 0, 0);

    var rect = svgb.createRect('', x, y-r, width, r*2);
    var cir = svgb.createCircle('', x+width, y, r);
    var txt = svgb.createText('svg-clear action-dot-text', x+80, y-(r/3), label);
    txt.setAttribute('style', 'dominant-baseline: hanging;');
    txt.setAttribute('id', idName);
    group.appendChild(rect);
    group.appendChild(cir);
    group.appendChild(txt);
    return group;
  };

  actionButtons.slideButton = function slideButton(state, button, option){
    var frame = state.frame;
    var currentAttribute = button.getAttribute('transform');
    var parenPos = currentAttribute.lastIndexOf(')');
    var spacePos = currentAttribute.lastIndexOf(' ');
    var currentY = parseInt(currentAttribute.substring(spacePos, parenPos), 10);
    button.setAttribute('transform', 'translate(' + state.adx + ' ' + (currentY + state.ady) + ')');
    if (frame > 1) {
      state.frame = frame - 1;
      requestAnimationFrame(function() { slideButton(state, button, option); });
    } else if(option === "delete"){
      button.parentNode.removeChild(button);
    }
  };

  return actionButtons;

}();

},{"./overlays/cxnButton.js":39,"./svgbuilder.js":45}],13:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var ko = require('knockout');

  // Bindable properties
  var appSettings = {
    showCode: ko.observable(false),
    editorSounds: ko.observable(true),
  };

  appSettings.insert = function(domRoot) {
    var div = document.createElement("div");
    div.innerHTML = '';
/*
    <div id='app-settings'
      class='teakform pulldown closed' opened=false
      style='position:fixed;top:1em;right:1em;pointer-events:none'>
    <form>
      <label><input type="checkbox" id="show-code" data-bind="checked:showCode">
        <span class="label-text">Show code</span>
      </label><br><br>
      <label><input type="checkbox" id="editor-sounds" data-bind="checked:editorSounds">
        <span class="label-text">Sound effects</span>
      </label><br><br>
    </form>
    </div>`;
    */
    appSettings.domId = 'app-settings';
    domRoot.appendChild(div);
    //ko.applyBindings(appSettings, div);
  };

  return appSettings;
}();

},{"knockout":8}],14:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var log = require('./log.js');
  log.trace('App main');

  // Starts as an object and will be mosty empty until start()
  // is called.
  var app = {};


  // Application main, called once shell is fully up.
  app.start = function () {
    var ko = require('knockout');
    var Clipboard = require('clipboard');
    app.tbe = require('./teakblocks.js');
    app.conductor = require('./conductor.js');
    var actionButtons = require('./actionButtons.js');
    var teaktext = require('./teaktext.js');

    // Add major modules to the application object.
    var tbe = app.tbe;
    app.overlayDom = document.getElementById('overlayLayer');
    app.driverOverlay = require('./overlays/driveOverlay.js');
    app.debugOverlay = require('./overlays/debugOverlay.js');
    // Add shortcut function to app
    app.fileOverlay = require('./overlays/fileOverlay.js');
    app.settingsOverlay = require('./overlays/settings.js');
    app.splashOverlay = require('./overlays/splashOverlay.js');

    // fileOverlay will provide some from of localStorage, even if faked.
    app.storage = app.fileOverlay.localStorage();

    if (window.MobileAccessibility) {
      window.MobileAccessibility.usePreferredTextZoom(false);
    }

    // Unicode charcodes for FontAwesome symbols.
    var fastr = {
      play: '\uf04b',
      pause: '\uf04c',
      stop: '\uf04D',
      file: '\uf016',
      trash: '\uf014',
      folder: '\uf114',
      undo: '\uf0e2',
      redo: '\uf01e',
      settings: '\uf013',
      copy: '\uf24d',
      paste:'\uf0ea',
      page: '\uf0f6',
      edit: '\uf044',
      save: '\uf0c7',
      gamepad: '\uf11b',
      debug: '\uf120',
      camera: '\uf030',
      bluetooth: '\uf294',
      connect: '\uf1e6'
    };

    // Configuration components for the app and blocks
    // Initialize knockout databinding for documents DOM
    tbe.components = {};
    tbe.components.appSettings = require('./app-settings.js');
    tbe.components.blockSettings = require('./block-settings.js');
    ko.applyBindings(tbe.components);

    var formsDiv = document.getElementById('tbe-forms');
    tbe.components.appSettings.insert(formsDiv);
    tbe.components.blockSettings.insert(formsDiv);

    // Some early experiments. seems to work well for desktop Chrome
    // Safari has noticeable lag, with volume fluctuations.
    tbe.audio = {
      shortClick: document.getElementById('short-click'),
      poof: document.getElementById('poof'),
      playSound: function (element) {
        if (tbe.components.appSettings.editorSounds()) {
          element.play();
        }
      }
    };
    tbe.audio.shortClick.preload = 'true';
    tbe.audio.poof.preload = 'true';

    tbe.init(document.getElementById('editorSvgCanvas'));

    var buttonsPages = [
      {'label': 'A', 'command': 'loadDocA'},
      {'label': 'B', 'command': 'loadDocB'},
      {'label': 'C', 'command': 'loadDocC'},
      {'label': 'D', 'command': 'loadDocD'},
      {'label': 'E', 'command': 'loadDocE'},
    ];
    var buttonsEdit = [
      {'label': fastr.trash, 'command': 'trash'},
      {'label': fastr.copy, 'command': 'copy'},
      {'label': fastr.paste, 'command': 'paste'},
      {'label': fastr.save, 'command': 'save'},
      {'label': fastr.settings, 'command': 'splashOverlay'},
    ];

    tbe.deleteRay = null;
    tbe.commands = {
      //'settings': function() { tf.showHide(tbe.components.appSettings); },
      'play': function() { app.conductor.playAll(); },
      'stop': function() { app.conductor.stopAll(); },
      'trash': function() { tbe.clearAllBlocks(); },
      'pages': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.createDropdown(buttonsPages, tbe, fastr.folder, 'pages'); },
      'edit': function() { tbe.clearStates(); tbe.dropdownButtons = actionButtons.createDropdown(buttonsEdit, tbe, fastr.edit, 'edit'); },
      'loadDocA': function(){ tbe.loadDoc('docA'); },
      'loadDocB': function(){ tbe.loadDoc('docB'); },
      'loadDocC': function(){ tbe.loadDoc('docC'); },
      'loadDocD': function(){ tbe.loadDoc('docD'); },
      'loadDocE': function(){ tbe.loadDoc('docE'); },

      'docSnapShot': function(){ app.fileOverlay.cameraFlash(); },
      'driveOverlay': function(){ app.showOverlay(app.driverOverlay); },
      'debugOverlay': function(){ app.showOverlay(app.debugOverlay); },
      'splashOverlay': function(){ app.showOverlay(app.splashOverlay); },
      'settings': function() { tbe.loadSettings(); },
      'undo': function() { tbe.undoAction(); },
      'redo': function() { tbe.redoAction(); },
      'pullUppages': function() { actionButtons.deleteDropdown(tbe.dropdownButtons, tbe, fastr.folder, 'pages'); },
      'pullUpedit': function() { actionButtons.deleteDropdown(tbe.dropdownButtons, tbe, fastr.edit, 'edit'); },
      'copy': function() { tbe.copyText = teaktext.blocksToText(tbe.forEachDiagramChain); },
      'paste': function() { if(tbe.copyTest !== null) { teaktext.textToBlocks(tbe, tbe.copyText); } },
      'save': function() {
        var currentDocText = teaktext.blocksToText(tbe.forEachDiagramChain);
        app.fileOverlay.saveFile(tbe.currentDoc, currentDocText);
      },
      'connect': function(button) { tbe.openConnectionMenu(button); }
    };

    // Construct the clipboard
    var clipboard = new Clipboard('.copy-button', {
      text: function() {
          return teaktext.blocksToText(tbe.forEachDiagramChain);
      }
    });
    clipboard.on('success', function(e) {
      log.trace(e);
    });
    clipboard.on('error', function(e) {
      log.trace(e);
    });

    // these could be loaded from JSON files/strings
    var package1 = {
    name:'A',
    blocks:{
        'identity':{},
        'identityAccelerometer':{},
        'identityButton': {},
        'identityTemperature': {},
        'variableSet': {},
        'variableAdd': {},
        'print': {},
        'picture':{},
        'sound':{},
        'motor':{},
        'twoMotor':{},
        //'servo':{},
        'wait':{},
        'loop':{}
        //'identityEncoder':{}
      }
    };

    // Add the main command buttons, to left, middle and right locations.
    tbe.addPalette(package1);
    var actionButtonObj = [
     {'alignment': 'L', 'position': 1, 'label': fastr.play, 'command': 'play', 'tweakx': 4},
     {'alignment': 'L', 'position': 2, 'label': fastr.stop, 'command': 'stop'},
     {'alignment': 'L', 'position': 3, 'label': fastr.gamepad, 'command': 'driveOverlay'},
     {'alignment': 'M', 'position': 1, 'label': fastr.debug, 'command': 'debugOverlay'},
     {'alignment': 'M', 'position': 2, 'label': fastr.folder, 'command': 'pages'},
  //   {'alignment': 'M', 'position': 4, 'label': fastr.camera, 'command': 'docSnapShot'},
     {'alignment': 'M', 'position': 3, 'label': fastr.edit, 'command': 'edit'},
     {'alignment': 'R', 'position': 3, 'label': '', 'command': 'connect'},
     //{'alignment': 'R', 'position': 2, 'label': '', 'command': ''},
    ];

    tbe.actionButtons = actionButtonObj;
    actionButtons.addActionButtons(actionButtonObj, tbe);
    document.body.onresize = tbe.updateScreenSizes; // Buttons/screen resizing

    app.conductor.attachToScoreEditor(tbe);

    if (app.splashOverlay.showLaunchAboutBox()) {
      app.doCommand('splashOverlay');
    }
  };

  app.doCommand = function(commandName, button) {
    var cmdFunction = app.tbe.commands[commandName];
    if (typeof cmdFunction === 'function') {
      cmdFunction(button);
    }
  };

  app.showOverlay = function(overlay) {
    // TODO modularized control of editor. Why is this part of the show overlay logic?
    app.tbe.undoArray = {}; // When we switch documents we want to clear undo history.
    app.tbe.undoTransactionIndex = 0;

    // First, save the current document.
    app.tbe.saveCurrentDoc();
    app.tbe.clearStates();
    overlay.start();
  };

  return app;
}();

},{"./actionButtons.js":12,"./app-settings.js":13,"./block-settings.js":15,"./conductor.js":33,"./log.js":38,"./overlays/debugOverlay.js":40,"./overlays/driveOverlay.js":41,"./overlays/fileOverlay.js":42,"./overlays/settings.js":43,"./overlays/splashOverlay.js":44,"./teakblocks.js":47,"./teaktext.js":49,"clipboard":2,"knockout":8}],15:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var ko = require('knockout');
  var tbe = require('./teakblocks.js');
  var conductor = require('./conductor.js');

  var moveUp = 0;

  // Bindable properties
  var blockSettings = {
    visible: ko.observable(true),
    activeBlock:null
  };

  blockSettings.insert = function(domRoot) {
    // Create a div shell that will be positioned and scaled as needed.
    var commonDiv = document.createElement("div");
    var groupDiv = document.createElement("div");
    commonDiv.innerHTML =
    `<div id="block-settings" class="block-config-form blockform">
      <div class="group-div">
        <button class="block-run width-third">
          <i class="fa fa-step-forward" aria-hidden="true"></i>
        </button>
        <button class="block-clone width-third">
          <i class="fa fa-clone" aria-hidden="true"></i>
        </button>
        <button class="block-clear width-third">
          <i class="fa fa-trash-o" aria-hidden="true"></i>
        </button>
      </div>
      <div id="block-settings-custom"></div>
      <div id="block-controller-tabs"></div>
    </div>`;
    groupDiv.innerHTML =
    `<div id="block-settings" class="block-config-form blockform">
      <div class="group-div">
        <button class="block-run width-third">
          <i class="fa fa-step-forward" aria-hidden="true"></i>
        </button>
        <button class="block-clone width-third">
          <i class="fa fa-clone" aria-hidden="true"></i>
        </button>
        <button class="block-clear width-third">
          <i class="fa fa-trash-o" aria-hidden="true"></i>
        </button>
      </div>
    </div>`;
    domRoot.appendChild(commonDiv);
    domRoot.appendChild(groupDiv);
    blockSettings.commonDiv = commonDiv;
    blockSettings.groupDiv = groupDiv;


    for(var i = 0; i < 2; i++){ // To process through commonDiv and groupDiv
      // Add step/run button handler.
      document.getElementsByClassName('block-run')[i].onclick = function() {
        conductor.playOne(blockSettings.activeBlock);
      };

      // Add delete button handler.
      document.getElementsByClassName('block-clone')[i].onclick = function() {
        // TODO grab whole loop if necessary
        if (blockSettings.activeBlock !== null) {
          // Back up start if necessary for clone to be logical.
          var startBlock = tbe.findChunkStart(blockSettings.activeBlock);
          if (startBlock.isLoopTail()) {
            startBlock = startBlock.flowHead;
          }
          // Extend end if necessary for clone to be logical.
          var endBlock = startBlock;
          if (endBlock.isLoopHead()) {
            endBlock = endBlock.flowTail;
          }
          if(startBlock.isGroupSelected()){
            while(endBlock.next !== null && endBlock.next.isSelected()){
              endBlock = endBlock.next;
            }
          }
          var clone = tbe.replicateChunk(startBlock, endBlock);
          // move it to some open space
          // TODO use more logic to find a good place to put the block.
          var dy = 0;
          if(moveUp === 0){
            dy = -120;
            moveUp = dy;
          } else if(moveUp < 0){
            dy = -40 + moveUp;
            moveUp = dy;
          } else if(moveUp > 0){
            dy = 40 + moveUp;
            moveUp = dy;
          }
          if (clone.top < -dy) {
            dy = 120;
            moveUp = dy;
          } else if(clone.bottom > window.innerHeight - moveUp - 80){
            dy = 120;
            moveUp = dy;
          }
          tbe.animateMove(clone, clone.last, 0, dy, 20);
        }
      };

      // Add delete button handler.
      document.getElementsByClassName('block-clear')[i].onclick = function() {
        // TODO grab whole loop if necessary
        if (blockSettings.activeBlock !== null) {
          // Delete the block.
          var block1 = tbe.findChunkStart(blockSettings.activeBlock);
          var block2 = null;
          var endBlock = block1;

          // If the block is part of a selected chain, find the last block in the chain
          while(endBlock.next !== null && endBlock.next.isSelected()){
            endBlock = endBlock.next;
          }

          // If ends of a flow block remove both parts,
          // delete the tail first, since it owns the graphics.
          if (block1.isLoopTail()) {
            block2 = block1.flowHead;
          } else if (block1.isLoopHead() && block1.flowTail.next !== null && !block1.flowTail.next.isSelected()) {
            block2 = block1;
            block1 = block1.flowTail;
          }


          if (block2 !== null) {
            tbe.deleteChunk(block2, block1);
          } else {
            tbe.deleteChunk(block1, endBlock);
          }
        }
      };
    }

    // Get a reference to the div that is customized for each block.
    blockSettings.customDiv = document.getElementById('block-settings-custom');

    // Get a reference to the div that lists controllers.
    blockSettings.controllersDiv = document.getElementById('block-controller-tabs');//TABS - uncomment
  };

  blockSettings.hide = function(exceptBlock, diagram) {

    var diagramChanger = true;
    var isSelectedGroup = false;
    var block = this.activeBlock;

    if(block !== null && block.isGroupSelected()){
      if(!block.isIsolatedLoop()){
        isSelectedGroup = true;
      }
    }

    // If the form is actually associated with a block, hide it.
    if (block !== null && block !== exceptBlock) {
      if (block.funcs.configuratorClose !== undefined) {
        block.funcs.configuratorClose(this.customDiv, block);
        // TODO too aggresive, but works
      }
      this.activeBlock = null;

      var div = null;

      // Start animation to hide the form.
      if(isSelectedGroup){
        div = this.groupDiv;
      } else {
        div = this.commonDiv;
      }
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.transform = 'scale(0.33, 0.0)';
      div.style.pointerEvents = 'all';

      // Clear out the custom part of the form.
      this.customDiv.innerHTML = '';

      this.tabNames = [];
      this.tabButtons = [];
    }
    // Catch the clear states from the redo button.
    if(diagram !== undefined){
      diagramChanger = diagram;
    }

    if(diagramChanger){
      tbe.diagramChanged();
    }

  };

  // A block has been tapped on, the gesture for the config page.
  // Bring it up, toggle it, or move it as apppropriate.
  blockSettings.tap = function(block) {
    if (this.activeBlock === block) {
      // Clicked on the same block so make it go away.
      //this.hide();
      tbe.clearStates();
    } else if (this.activeBlock !== null) {
      // Clicked on a block other than the one that is showing.
      // Make the block that is showing go away,
      // then show the new one once the hide transition is done.
      //this.hide();
      tbe.clearStates();
      this.activeBlock = block;
      if(block.name === 'tail'){
        block.markSelected(true);
        block.flowHead.markSelected(true);
      } else if(block.name === 'loop'){
        block.markSelected(true);
        block.flowTail.markSelected(true);
      } else {
        block.markSelected(true);
      }
      setTimeout(function() { blockSettings.showActive(); }, 400);
//      this.addEventListener(this.showActive, 500);
    } else {
      // Nothing is showing, so make it pop-up.
      //block.markSelected(true);
      if(block.name === 'tail'){
        block.markSelected(true);
        block.flowHead.markSelected(true);
      } else if(block.name === 'loop'){
        block.markSelected(true);
        block.flowTail.markSelected(true);
      } else {
        block.markSelected(true);
      }
      this.activeBlock = block;
      this.showActive(null);
    }
  };

  // Build the row of tabs one for each controller editor that can be used
  // by the actor.
  blockSettings.buildControllerTabs = function() {
    // Clear out old tabs.
    blockSettings.controllersDiv.innerHTML = '';//TABS - uncomment

    // Get the list of tabs with HTML snippets.
    var tabs = this.activeBlock.funcs.tabs;
    this.tabButtons = [];
    if (tabs !== undefined) {
      this.tabNames = Object.keys(tabs);

      // Build some SOM for the buttons.
      var tabCount = this.tabNames.length;
      var tabsDiv = document.createElement('div');
      var width = (100 / tabCount) + '%';

      for (var i = 0; i < tabCount; i++) {
        // Create the button.
        var button = document.createElement('button');
        var name = this.tabNames[i];
        blockSettings.tabButtons.push(button);
        tabsDiv.appendChild(button);//TABS - uncomment

        // Configure all its settings.
        button.id = name;
        button.className = 'block-settings-tab';
        button.style.width = width;
        // Tweak the curved edges based on position.
        if (i===0) {
          button.style.borderRadius='0px 0px 0px 10px';
        } else if (i === (tabCount-1)) {
          button.style.borderRadius='0px 0px 10px 0px';
        } else {
          button.style.borderRadius='0px';
        }

        // Inject the HTML snippet.
        button.innerHTML = tabs[name];
        button.onclick = blockSettings.onClickTab;
      }
      // Add the row of tabs to the view.
      this.controllersDiv.appendChild(tabsDiv);//TABS - uncomment

      // Select the initial tab.
      this.selectActiveTab(this.activeBlock.controllerSettings.controller);
    } else {
      // Add controller tabs at the bottom.
      var controllers = this.activeBlock.funcs.controllers;
      if (typeof controllers === "function") {
        // OLD way, delete once other code is merged.
        controllers(blockSettings.controllersDiv);//TABS - uncomment
      } else {
        blockSettings.controllersDiv.innerHTML = '';//TABS - uncomment
      }
    }
  };

  blockSettings.onClickTab = function() {
    // Since its DOM event, 'this' will be the button.
    blockSettings.selectActiveTab(this.id);
  };

  blockSettings.selectActiveTab = function(name) {
    var count = this.tabNames.length;
    for ( var i = 0; i < count; i++) {
      if (this.tabNames[i] === name) {
        this.tabButtons[i].classList.add('tab-selected');
      } else {
        this.tabButtons[i].classList.remove('tab-selected');
      }
    }
  };

  // Build the middle from part, the controllers editor.
  blockSettings.buildController = function() {
    // Allow block to customize bottom part of form.
    var configuratorOpen = this.activeBlock.funcs.configuratorOpen;
    if (typeof configuratorOpen === "function") {
      configuratorOpen(blockSettings.customDiv, this.activeBlock);
    } else {
      blockSettings.customDiv.innerHTML =
      `<div>
          <label><input type="checkbox">
            <span class="label-text">Power</span>
          </label>
      </div>`;
    }
  };

  // Internal method to show the form.
  blockSettings.showActive = function (event) {
    var isSelectedGroup = false;
    var tweakx = 0;
    var tweaky = 0;
    var block = this.activeBlock;

    if(block !== null && block.isGroupSelected()){
      if(!block.isIsolatedLoop()){
        isSelectedGroup = true;
      }
    }
    if (event !== null) {
    //  this.removeEventListener('transitionend', this.showActive);
    }
    if (block === null) {
      return; // Nothing to show.
    }

    this.buildControllerTabs();
    this.buildController();

    // Start animation to show settings form.
    var x = block.left;
    var y = block.bottom;
    var div = null;
    if(isSelectedGroup){
      div = blockSettings.groupDiv;
    } else {
      div = blockSettings.commonDiv;
    }
    // TODO make the config panel height NOT hardcoded
    var settingsHeight = 0;
    if(block.funcs.tabs !== undefined && Object.keys(block.funcs.tabs).length !== 0){
      settingsHeight = 260;
    } else {
      settingsHeight = 220;
    }
    if(x-80 < 0){
      tweakx = 85-x;
    } else if(x+160 > window.innerWidth){
      tweakx = window.innerWidth - (x+165);
    }
    if(y+settingsHeight > window.innerHeight && (!block.isGroupSelected() || block.isIsolatedLoop())){
      tweaky = -settingsHeight -10 - block.height;
    }
    div.style.transition = 'all 0.0s ease';
    div.style.left = ((x-80) + tweakx) + 'px';
    div.style.right = ((x+80) + tweakx) + 'px';
    div.style.top = ((y+5) + tweaky) + 'px';
    // Second step has to be done in callback in order to allow
    // animation to work.
    setTimeout(function() {
      div.style.transition = 'all 0.2s ease';
      div.style.position = 'absolute';
      div.style.width= '240px';
      div.style.transform = 'scale(1.0, 1.0)';
      div.style.pointerEvents = 'all';
    }, 10);
  };


  return blockSettings;
}();

},{"./conductor.js":33,"./teakblocks.js":47,"knockout":8}],16:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  // var interact = require('interact.js');
  // var svgb = require('./../svgbuilder.js');
  // var pb = svgb.pathBuilder;
  var colorStripBlock = {};

  // Block for one or more color LEDs in a strip, typically implemented with
  // ws2811, ws2812 LED, AKA neopixels. The block is not coupled to how the
  // colors are produced.
  colorStripBlock.svg = function(root) {
    // TODO
    return root;
  };

  return colorStripBlock;
}();

},{}],17:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  // var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var flowBlockHead = {};
  var flowBlockTail = {};
  var flowBlockWidth = 50;

  // List of HTML snippets used for controller tabs.
  // Flow block uses text labels for now.
  flowBlockHead.tabs= {
    // Simple iteration count based for loop
    //'forLoop' : 'for',
    // Loop while something is true
    //'whileLoop'  : 'while',
    // Skip body if condition not true
    //'ifThen'   : 'if'
  };

  flowBlockHead.keyPadValue = ko.observable(0+" times");

  flowBlockHead.svg = function (root, block) {
    var loop = svgb.createText('svg-clear block-flowhead-loop', 10, 40, '\uf021');
    root.appendChild(loop);
    var data = block.controllerSettings.data.duration;
    var duration = svgb.createText('svg-clear block-flowhead-count block-stencil-fill', 25, 70, data); //
    duration.setAttribute('text-anchor', 'middle');
    root.appendChild(duration);
    return root;
  };


  // Initial settings for blocks of this type.
  flowBlockHead.defaultSettings= function() {
    // Return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data: {duration:5},
      // Indicate what controller is active. This may affect the data format.
      controller: 'forLoop',
      // Width of the block
      width: flowBlockWidth,
    };
  };
  flowBlockTail.defaultSettings = flowBlockHead.defaultSettings;

  flowBlockTail.calculateEnclosedScopeDepth = function(blockTail) {
    // Walk back from end of a loop to its front and determine the deepest
    // number of scopes it contains. That depth determines how far out
    // the flowBar needs to be.
    var nesting = 0;
    var maxDepth = 0;
    var b = blockTail.prev;
    // Null should not be hit.
    while ((b !== null) && (b !== blockTail.flowHead)) {
      if (b.flowHead !== null) {
        nesting += 1;
        if (nesting > maxDepth) {
          maxDepth = nesting;
        }
      } else if (b.flowTail !== null) {
        nesting -= 1;
      }
      // Walk back looking for head.
      b = b.prev;
    }
    return maxDepth;
  };

  flowBlockTail.svg = function() {
  };

  flowBlockTail.crossBlockSvg = function(block) {
    // Remove old cross block graphic.
    var scb = block.svgCrossBlock;
    if (scb !== undefined) {
      block.svgGroup.removeChild(scb);
    }

    // Make a new one.
    var depth = this.calculateEnclosedScopeDepth(block) + 1;
    // The tail of the flow block does the flow-bar rendering.
    var left = (flowBlockWidth / 2) - (block.left - block.flowHead.left);
    var width = block.right - block.flowHead.left - flowBlockWidth;
    var hieght = (8 * depth);
    var dxBar = 4 * depth;
    var radius = 8;

    var pb = svgb.pathBuilder;
    var pathd = '';
    pathd =  pb.move(left, 0);
    pathd += pb.line(dxBar, -hieght);
    pathd += pb.arc(radius , 60, 0, 1, (radius * 0.9), -(radius * 0.7));
    pathd += pb.hline(width - (2*radius) - (2*dxBar));
    pathd += pb.arc(radius, 60, 0, 1, (radius*0.9), (radius*0.7));
    pathd += pb.line(dxBar, hieght);
    scb = svgb.createPath('flow-path svg-clear', pathd);
    block.svgGroup.insertBefore(scb, block.svgRect);
    block.svgCrossBlock = scb;
  };
  flowBlockHead.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.duration; },
      'setValue': function(duration) { block.controllerSettings.data.duration = duration; },
      'type':flowBlockHead,
      'div': div,
      'block': block,
      'min':1,
      'max':100,
      'suffix':" times",
      'numArray': ["+1", "C", "+10", "-1", undefined, "-10"],//["1", "2", "3", "4", "5","6", "7", "8", "9", "0", "<-"],
      'calcLayout': 'simple'//'complex'
    });
  };
  flowBlockHead.configuratorClose = function(div) {
    keypad.closeTabs({'div': div});
  };
  flowBlockTail.configuratorOpen = function(div, block) {
    flowBlockHead.configuratorOpen(div, block.flowHead);
  };
  flowBlockTail.configuratorClose = function(div) {
    flowBlockHead.configuratorClose(div);
  };

  return {flowBlockHead:flowBlockHead, flowBlockTail:flowBlockTail};
}();

},{"./../svgbuilder.js":45,"./keypadTab.js":23,"knockout":8}],18:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {

  var icons = {};

  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;

  icons.accelerometer = function(scale, classes, x, y) {
    var pathd = '';
    pathd += pb.move(x, y);
    pathd += pb.vline(-20);
    pathd += pb.hline(-5);
    pathd += pb.line(6, -10);
    pathd += pb.line(6, 10);
    pathd += pb.hline(-5);
    pathd += pb.vline(20);

    pathd += pb.line(15, 10);
    pathd += pb.line(5, -5);
    pathd += pb.line(2, 11);
    pathd += pb.line(-11, -2);
    pathd += pb.line(5, -5);
    pathd += pb.line(-15, -10);

    pathd += pb.move(-3, 0);
    pathd += pb.line(-15, 10);
    pathd += pb.line(5, 5);
    pathd += pb.line(-11, 2);
    pathd += pb.line(2, -11);
    pathd += pb.line(5, 5);
    pathd += pb.line(15, -10);

    var path = svgb.createPath(classes, pathd);
    path.setAttribute('transform', 'scale(' + scale + ')');
    return path;
  };

  icons.pictureNumeric = function(scale, x, y) {
    var data = [0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0];
    var board = icons.picture(scale, x, y, data);
    return board;
  };

  icons.pictureSmile = function(scale, x, y) {
    var data = [0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0];
    var board = icons.picture(scale, x, y, data);
    return board;
  };

  icons.picture = function(scale, x, y, data) {
    var pix = data;
    var group = svgb.createGroup('svg-clear', 26+x, 15+y);
    var box = svgb.createRect('svg-clear block-picture-board', x-7, y-7, 42, 42, 4);
    group.appendChild(box);
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        var style = '';
        if (pix[ix + (iy * 5)] === 0) {
          style = 'svg-clear block-picture-led-off';
        } else {
          style = 'svg-clear block-picture-led-on';
        }
        var led = svgb.createCircle(style, x+(ix*7), y+(iy*7), 3);
        group.appendChild(led);
      }
    }
    group.setAttribute('transform', 'scale(' + scale + ')');
    return group;
  };

  icons.variable = function(scale, x, y, data) {
    var group = svgb.createGroup('svg-clear', 0, 0);

    var pathd = '';
    pathd += pb.move(13, 5);
    pathd += pb.hline(30);
    pathd += pb.line(15, 20);
    pathd += pb.line(-15, 20);
    pathd += pb.hline(-30);
    pathd += pb.line(-15, -20);
    pathd += pb.line(15, -20);

    var path = svgb.createPath('svg-clear vars-back-fill', pathd);
    group.appendChild(path);

    pathd = '';
    pathd += pb.move(15, 10);
    pathd += pb.hline(25);
    pathd += pb.line(11, 15);
    pathd += pb.line(-11, 15);
    pathd += pb.hline(-25);
    pathd += pb.line(-11, -15);
    pathd += pb.line(11, -15);

    path = svgb.createPath('svg-clear vars-front-fill', pathd);
    group.appendChild(path);

    //var buttonFront = svgb.createRect('svg-clear vars-back-fill', 30, -26, 40, 40, 6);
    //group.appendChild(buttonFront);

    //var buttonBack = svgb.createRect('svg-clear vars-front-fill', 35, -21, 30, 30, 6);
    //group.appendChild(buttonBack);

    var variable = data;
    var text = svgb.createText('svg-clear vars-var-text', 27, 35, variable);
    text.setAttribute('text-anchor', 'middle');
    group.appendChild(text);

    group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    return group;
  };

  icons.motor = function(scale, x, y, doScale) {
    var group = svgb.createGroup('svg-clear', 0, 0);
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    group.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    group.appendChild(shaft);

    if(doScale !== false){
      group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    }
    return group;
  };

  icons.motorWithDial = function(scale, x, y, data) {
    var group = svgb.createGroup('svg-clear', 0, 0);

    var motorBody = icons.motor(scale, x, y, false);
    group.appendChild(motorBody);

    var data1 = data;
    var rotate = (data1/100)*180;
    var dx = Math.cos((rotate) * (Math.PI/180));
    var dy = Math.sin((rotate) * (Math.PI/180));
    var spread = 1;
    if(rotate < 0){
      spread = 0;
    }
    var pathd = '';
    pathd = pb.move(40, 30);
    pathd += pb.line(0, -20);
    pathd += pb.arc(20, rotate, 0, spread, (dy*20), -((dx*20)-20));
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill-back', pathd);
    group.appendChild(path);
    pathd = '';
    pathd =  pb.move(37, 30);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    path.setAttribute('transform', "rotate(" + rotate + " 40 30)"); //rotate
    group.appendChild(path);

    group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    return group;
  };

  return icons;
}();

},{"./../svgbuilder.js":45}],19:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  var icons = require('./../icons.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  var identityAccelerometerBlock = {};

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  identityAccelerometerBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  identityAccelerometerBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: =, <, >
        comparison:'=',
        // Value
        value:0
      },
    };
  };

  identityAccelerometerBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':identityAccelerometerBlock,
      'div': div,
      'block': block,
      'min':-2000,
      'max':2000,
      'suffix':"",
      'numArray': ["-10", "C", "+10", "-100", undefined, "+100"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">accel
          </div>
          <select class="dropdown-comparison" id="dropdown-comparison">
            <option value="=" id="idAccel-equals">=</option>
            <option value=">" id="idAccel-greater">></option>
            <option value="<" id="idAccel-less"><</option>
          </select>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.comparison) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  identityAccelerometerBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityAccelerometerBlock.svg = function(root) {
    var path = icons.accelerometer(1, 'svg-clear block-stencil-fill', 38, 40);
    root.appendChild(path);
  };

  return identityAccelerometerBlock;
  }();

},{"./../../svgbuilder.js":45,"./../icons.js":18,"./../keypadTab.js":23,"knockout":8}],20:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  //var pb = svgb.pathBuilder;
  var identityBlock = {};

  // Items for selecting a device from a list.
  //identityBlock.devices = ko.observableArray([]);

  // When an item is clicked on select that device.
  /*identityBlock.onDeviceClick = function() {
    // Ah JavaScript... 'this' is NOT identityBlock.
    // It is the knockout item in the observable array.

    var newBotName = this.name;

    if (typeof name === 'string') {

      var block = identityBlock.activeBlock;
      var currentBotName = block.controllerSettings.data.deviceName;
      if (currentBotName !== newBotName) {
        // Find the current item, and mark it as unselected.
        var match = ko.utils.arrayFirst(identityBlock.devices(), function(item) {
          return (item().name === currentBotName);
        });
        if (match) {
          match().selected(false);
        }
        // Select the item that was clicked.
        this.selected(true);
      }
      // Move the selected name into the object.
      block.controllerSettings.data.deviceName = newBotName;

      block.updateSvg();
    }
  };

  // Start block is a work in progress; it might not be needed.
  // It might be for naming seperate targets.
  identityBlock.tabs = {
    //'event': '<i class="fa fa-bolt" aria-hidden="true"></i>',
    //'target-bt': '<i class="fa fa-bluetooth-b" aria-hidden="true"></i>',
    //'target-usb': '<i class="fa fa-usb" aria-hidden="true"></i>',
  };*/

  // Initial settings for blocks of this type.
  identityBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What triggers this chain, mouse click, button, message,...
        start:true,
        // Device name
        //deviceName:'-?-',
        // Connection mechanism
        //bus:'ble',
      },
      // Indicate what controller is active. This may affect the data format.
      //controller:'target-bt',
      //status:0,
    };
  };

  identityBlock.configuratorOpen = function(div, block) {
    identityBlock.activeBlock = block;
    div.innerHTML =
      `<div class='group-div'>
        <div class='svg-clear'>Play upon program run<div/>
        <!--<div class='list-box-shell'>
            <ul class='list-box' data-bind='foreach: devices'>
              <li data-bind= "css:{'list-item-selected':selected()}">
                <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
              </li>
            </ul>
        </div>
        <button id='bt-scan' class='width-whole'>
        </button>-->
      </div>`;

    // Connect the dataBinding.
    ko.applyBindings(identityBlock, div);

    //identityBlock.scanButton = document.getElementById('bt-scan');
    //identityBlock.scanButton.onclick = identityBlock.handleScanButton;

    // If currently connected then disconnect and let them choose the same again
    // or pick another.
    //var currentBotName = block.controllerSettings.data.deviceName;
    //log.trace('currently connected to', currentBotName);
    /*
    var dev = cxn.devices[currentBotName];
    if (dev !== undefined) {
      var mac = cxn.devices[currentBotName].mac;
      log.trace('current mac', mac);
      cxn.disconnect(mac, currentBotName);
    }

    if (!cxn.scanUsesHostDialog && !cxn.scannning) {
      // If scanning is unobtrusive, start it when the form is shown.
      identityBlock.toggleBtScan();
    } else {
      // Otherwise at least fix up the button label.
      identityBlock.configBtnScan(false);
    }*/
  };

  /*identityBlock.handleScanButton = function() {
    if(cxn.scanning){
      console.log('disconnect block');
      var block = identityBlock.activeBlock;
      var currentBotName = block.controllerSettings.data.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        log.trace('disconnect from current mac', mac);
        cxn.disconnect(mac, currentBotName);
      }
    } else{
      console.log('go to toggleBtScan');
      identityBlock.toggleBtScan();
    }
  };

  // Turn on Scanning
  identityBlock.configBtnScan = function(scanning) {
    log.trace('config scaning button', scanning);
    var button= identityBlock.scanButton;
    if (scanning) {
      // Turn on scanning.
      button.innerHTML =
      "<span>Looking for bots <i class='fa fa-spinner fa-pulse fa-fw'></i></span>";
    } else {
      // Turn off back scanning
      button.innerHTML = "<span>Look for bots </span>";
    }
  };

  identityBlock.toggleBtScan = function() {
    if (cxn.scannning) {
      // Turn off back scanning
      cxn.stopScanning();
      identityBlock.watch.dispose();
      identityBlock.watch = null;
    } else {
      console.log('in theory start scanning');
      // Turn on scanning.
      // Set up a callback to get notified when when devices show up.
      identityBlock.refreshList(cxn.devices);
      identityBlock.watch = cxn.connectionChanged.subscribe(identityBlock.refreshList);
      cxn.startScanning();
    }
    identityBlock.configBtnScan(cxn.scanning);
  };

  // Update the list of devices in the configuration box
  identityBlock.refreshList = function (bots) {
    // TODO, might be able to use data binding to do this as well.
    identityBlock.devices.removeAll();
    for (var key in bots) {
      if (bots.hasOwnProperty(key)) {
        identityBlock.addItem(key);
      }
    }

    // If scanning has stopped update the button.
    if (!cxn.scanning) {
      identityBlock.configBtnScan(false);
    }
  };*/

  // Close the identity blocks and clean up hooks related to it.
  identityBlock.configuratorClose = function(div) {
    // Stop looking for visible devices.
    //if (cxn.scannning) {
    //  identityBlock.toggleBtScan();
    //}
    identityBlock.activeBlock = null;
    ko.cleanNode(div);
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityBlock.svg = function(root, block) {
    /*var pathd = '';
    pathd =  pb.move(31, 11);
    pathd += pb.hline(18);
    pathd += pb.arc(9, 180, 0, 1, 0, 18);
    pathd += pb.hline(-18);
    pathd += pb.arc(9, 180, 0, 1, 0, -18);
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 31, 20, 2));
    root.appendChild(svgb.createCircle('svg-clear block-stencil-fill', 49, 20, 2));*/

    // Add identity name
    //var botName = block.controllerSettings.data.deviceName;
    /*var status = cxn.connectionStatus(botName);
    if (status === cxn.statusEnum.NOT_THERE) {
      botName = '-?-';
      block.controllerSettings.data.deviceName = botName;
    }
    var text = svgb.createText('block-identity-text svg-clear', 40, 50, botName);
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);

    if (botName !== '-?-') {
      var statusClass = 0;
      // Connection status dot
      if (status === cxn.statusEnum.NOT_THERE) {
        statusClass = 'block-bot-not-found';
      } else if (status === cxn.statusEnum.BEACON) {
        statusClass = 'block-bot-visible';
      } else if (status === cxn.statusEnum.CONNECTING) {
        statusClass = 'block-bot-connecting';
      } else if (status === cxn.statusEnum.CONNECTED) {
        statusClass = 'block-bot-connected';
      } else {
        // Connected but with protocol errors. Might be wrong FW
        // or not really a teakblocks device.
        statusClass = 'block-bot-connection-error';
      }
      root.appendChild(svgb.createCircle('svg-clear ' + statusClass, 40, 65, 5));
    }*/
    var play = svgb.createText('svg-clear block-identity-text', 20, 60, '\uf04b');
    //play.setAttribute('style', 'font-family: FontAwesome;');
    root.appendChild(play);
  };

/*identityBlock.addItem = function (botName) {
    var block = identityBlock.activeBlock;
    if (block !== null) {
      var targetName = block.controllerSettings.data.deviceName;
      var item = ko.observable({
        name: botName, //+ faBlueTooth,
        selected: ko.observable(botName === targetName)
      });
      identityBlock.devices.unshift(item);
    }
  };*/

  return identityBlock;
  }();

},{"./../../svgbuilder.js":45,"knockout":8}],21:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  var identityButtonBlock = {};

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);


  // Initial settings for blocks of this type.
  identityButtonBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: A, B, A+B
        button:'A'
        // Value
        //value:0,
      },
    };
  };

  identityButtonBlock.configuratorOpen = function(div, block) {
    identityButtonBlock.activeBlock = block;
    div.innerHTML =
      `<div class='editorDiv'>
          <div class="dropdown-label-txt svg-clear idButton-comparison-label">button:
          </div>
          <select class="dropdown-comparison idButton-comparison" id="dropdown-comparison">
            <option value="A" id="idButton-A">A</option>
            <option value="B" id="idButton-B">B</option>
            <option value="A+B" id="idButton-AB">A+B</option>
          </select>
      </div>`;

    // Connect the dataBinding.


    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.button) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  identityButtonBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.button = comparison.options[index].value;
    identityButtonBlock.activeBlock = null;
    block.updateSvg();
    //keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityButtonBlock.svg = function(root, block) {
    var buttonBack = svgb.createRect('svg-clear block-idButton-back', 15, 10, 50, 50, 3);
    root.appendChild(buttonBack);

    var screw = svgb.createCircle('svg-clear block-idButton-screw', 23, 18, 4);
    root.appendChild(screw);
    screw = svgb.createCircle('svg-clear block-idButton-screw', 57, 18, 4);
    root.appendChild(screw);
    screw = svgb.createCircle('svg-clear block-idButton-screw', 57, 52, 4);
    root.appendChild(screw);
    screw = svgb.createCircle('svg-clear block-idButton-screw', 23, 52, 4);
    root.appendChild(screw);

    var button = svgb.createCircle('svg-clear block-idButton-button', 40, 35, 18);
    root.appendChild(button);

    var data = block.controllerSettings.data.button;
    var txt = svgb.createText('svg-clear block-idButton-label', 40, 40, data);
    txt.setAttribute('text-anchor', 'middle');
    root.appendChild(txt);
  };

  return identityButtonBlock;
  }();

},{"./../../svgbuilder.js":45,"knockout":8}],22:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  // var pb = svgb.pathBuilder;
  var identityTemperatureBlock = {};

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  identityTemperatureBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  identityTemperatureBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: =, <, >
        comparison:'=',
        // Value
        value:80
      },
    };
  };

  identityTemperatureBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':identityTemperatureBlock,
      'div': div,
      'block': block,
      'min':20,
      'max':120,
      'suffix':"˚F",
      'numArray': ["-1", "C", "+1", "-10", undefined, "+10"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">temp
          </div>
          <select class="dropdown-comparison" id="dropdown-comparison">
            <option value="=" id="idTemp-equals">=</option>
            <option value=">" id="idTemp-greater">></option>
            <option value="<" id="idTemp-less"><</option>
          </select>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.comparison) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  identityTemperatureBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityTemperatureBlock.svg = function(root, block) {
    var text = svgb.createText('svg-clear block-identity-text', 42, 60, '\uf2c9');
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);
  };

  return identityTemperatureBlock;
  }();

},{"./../../svgbuilder.js":45,"./../keypadTab.js":23,"knockout":8}],23:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
    var svgb = require('./../svgbuilder.js');
    var interact = require('interact.js');
    var ko = require('knockout');
    var keypad = {};

    keypad.tabbedButtons = function(object){
      object.inner =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display-half svg-clear selectedDisplay" width='80px' height='80px' data-bind='text: keyPadValue'>
              </div>
              <div id="beats-display" class = "beats-display svg-clear" width='80px' height='80px' data-bind='text: beatsValue'>
              </div>
              <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
              <svg id="beatsSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
          </div>`;
      keypad.openTabs(object); //dataButton
      var beatsDisplay = document.getElementById('beats-display');
      var numericDisplay = document.getElementById('numeric-display');
      beatsDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('dataButton');
        beatsDisplay.className += " selectedDisplay";
        numericDisplay.className = "numeric-display-half svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        var svg = document.getElementById('keypadSvg');
        svg.parentNode.removeChild(svg);
        keypad.openBeats(object);
      };

      numericDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('beatsButton');
        numericDisplay.className += " selectedDisplay";
        beatsDisplay.className = "beats-display svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        ko.cleanNode(object.div);
        keypad.tabbedButtons(object);
      };
    };

    keypad.openTabs = function(object){
      // Get all the data from the parameter
      var div = object.div;
      var block = object.block;
      var min = object.min;
      var max = object.max;
      var suffix = object.suffix;
      var blockType = object.type;
      var setValue = object.setValue;
      var getValue = object.getValue;
      var numArray = object.numArray;
      var calcLayout = object.calcLayout;
      if(object.inner === undefined){
        div.innerHTML =
            `<div id='keypadDiv' class='editorDiv'>
                <div id="numeric-display" class = "numeric-display svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>
                </div>
                <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
            </div>`;
      } else {
        div.innerHTML = object.inner;
      }

      ko.applyBindings(blockType, div);
      var display = document.getElementById("numeric-display");
      var keypadSvg = document.getElementById('keypadSvg');

      // Show the current data on the configuration panel
      var num = getValue().toString();
      blockType.keyPadValue(num.toString() + suffix);
      var strNum = "";

      // Create an editor state object for the interactions to work with.

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('dataButton', 0, 0);
            var box = svgb.createRect('calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+(iy*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            keypadSvg.appendChild(button);
          }
        }
      }

      // Interact on calcButtons
      // do on tap
      // Take event, make event.target
      // get characteristic of dom element

      interact('.calcButtons', {context:keypadSvg})
        .on('tap', function (event) {
            // Get the clicked on button name
            strNum = event.target.getAttribute('name');

            if(calcLayout === "simple"){ // If the layout is a simple layout
              var increment = "";
              display.classList.remove("error");

              // Check if you want to change the value
              // Store if we are going up or down and the number that follows
              if(strNum.substring(0,1) === "+" ||strNum.substring(0,1) === "-"){
                increment = strNum.substring(0,1);
                strNum = strNum.substring(1);
              }

              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
              }

              // If we are subtracting, subtract the number from variable num
              if(increment === "-"){
                if(parseInt(num, 10)-parseInt(strNum, 10) >= min){
                  num = (parseInt(num, 10)-parseInt(strNum, 10)).toString();
                } else {
                  num = min;
                  display.classList.add("error");
                }
              } else if(increment === "+"){ //Otherwise, add
                if(parseInt(num, 10)+parseInt(strNum, 10) <= max){
                  num = (parseInt(num, 10)+parseInt(strNum, 10)).toString();
                } else {
                  num = max;
                  display.classList.add("error");
                }
              }
            } else if(calcLayout === "complex"){ // If the layout is a complex layout
              var isNegate = strNum === "+/-";
              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
                display.classList.remove("error");
              } else if(isNegate && num !== "0"){ // Negate the number
                display.classList.remove("error");
                if(num.substring(0, 1) === "-"){
                  num = num.substring(1);
                } else {
                  num = "-" + num;
                }
              } else if(num === "0" && !isNegate){ // If the number is 0, replace it
                display.classList.remove("error");
                num = strNum;
                // If the number is going to be within the max and min, then add the new number on.
              } else if(parseInt(num + strNum, 10) <= max && parseInt(num + strNum, 10) >= min && !isNegate){
                num += strNum;
              } else if(!isNegate){ // If the number doesn't satisfy the conditions above, then it is an error
                display.classList.add("error");
              }
            } else if(calcLayout === "defined"){ // If the layout is a defined layout
              num = strNum; // Set num to strNum
            }

            // Now show the number on the config panel
            blockType.keyPadValue(num.toString() + suffix);
            // And update the block data
            setValue(num);
            block.updateSvg();


        });

      return;
    };
    keypad.openBeats = function(object) {
      var getBeats = object.getBeats;
      var setBeats = object.setBeats;
      var blockType = object.type;
      var block = object.block;
      var numArray = object.beatsRay;

      if(numArray === undefined){
        numArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      }
      var beatsSvg = document.getElementById('beatsSvg');

      // Show the current data on the config panel
      var num = getBeats().toString();
      if(num === '1'){
        blockType.beatsValue(num.toString() + " beat");
      } else {
        blockType.beatsValue(num.toString() + " beats");
      }

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('', 0, 0);
            var box = svgb.createRect('beatsButtons', 2.5+((ix)*75), 5+((iy)*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+((iy)*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            beatsSvg.appendChild(button);
          }
        }
      }

      interact('.beatsButtons', {context:beatsSvg})
        .on('tap', function (event) {
          var strNum = event.target.getAttribute('name');

          num = strNum; // Set num to strNum

          // Now show the number on the config panel
          if(num === '1'){
            blockType.beatsValue(num.toString() + " beat");
          } else {
            blockType.beatsValue(num.toString() + " beats");
          }
          // And update the block data
          setBeats(num);
          block.updateSvg();
        });

    };

    keypad.openTabsWithBeats = function(object) {
      object.inner =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display-half svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>

              </div>
              <div id="beats-display" class = "beats-display svg-clear" width='80px' height='80px' data-bind='text: beatsValue'>

              </div>
              <svg id="keypadSvg" class='area' width='225px' height='72px' xmlns='http://www.w3.org/2000/svg'></svg>
              <svg id="beatsSvg" class='area' width='225px' height='80px' xmlns='http://www.w3.org/2000/svg'></svg>
          </div>`;
      keypad.openTabs(object);
      object.beatsRay = ["1", "2", "3", "4", "5", "6"];
      keypad.openBeats(object);
      };

    keypad.closeTabs = function createKeyPad(object){
      ko.cleanNode(object.div);
    };
    return keypad;
}();

},{"./../svgbuilder.js":45,"interact.js":7,"knockout":8}],24:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var svgb = require('./../svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var icons = require('./icons.js');
  //var formTools = require('./../block-settings.js');
  var pb = svgb.pathBuilder;
  var motorBlock = {};
  motorBlock.tabs = {
    //'speed': '<i class="fa fa-tachometer" aria-hidden="true"></i>',
    //'duration': '<i class="fa fa-clock-o" aria-hidden="true"></i>',
    '1': '1',
    '2': '2'
  };
  motorBlock.keyPadValue = ko.observable(100 + "%");
  motorBlock.beatsValue = ko.observable("1 beat");
  // Initial setting for blocks of this type.
  motorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 100,
        duration: 1,
        motor: '1'
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  // Wait block - Wait until something happens, it can wait for things other
  // than time, but it is given that time pasing is part of the function.
  motorBlock.svg = function(root, block) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var data = block.controllerSettings.data.speed;
    var motor = icons.motorWithDial(1, 0, 0, data);
    root.appendChild(motor);

    var data2 = block.controllerSettings.data.duration;
    var textToDisplay = svgb.createGroup('displayText', 0, 0);
    var duration = svgb.createText('svg-clear block-motor-text-duration block-stencil-fill', 40, 70, data2 + " \uf192"); //data2 + " \uf192"
    textToDisplay.appendChild(duration);
    textToDisplay.setAttribute('text-anchor', 'middle');
    root.appendChild(textToDisplay);
    return root;
  };
  motorBlock.configuratorOpen = function(div, block) {
    var tabs = document.getElementsByClassName('block-settings-tab');
    for(var i = 0; i < tabs.length; i++){
      if(tabs[i].textContent === block.controllerSettings.data.motor){
        tabs[i].classList.add('tab-selected');
      }
    }
    keypad.tabbedButtons({
      'getValue': function() { return block.controllerSettings.data.speed; },
      'setValue': function(speed) { block.controllerSettings.data.speed = speed; },
      'type':motorBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':" %",
      'numArray': ["+1", "+10", "+50", "-1", "-10", "-50", undefined, "C"],
      'calcLayout': 'simple',
      'getBeats': function() { return block.controllerSettings.data.duration; },
      'setBeats': function(duration) { block.controllerSettings.data.duration = duration; },
    });
  };
  motorBlock.configuratorClose = function(div, block) {
    var tabs = document.getElementsByClassName('block-settings-tab');
    for(var i = 0; i < tabs.length; i++){
      if(tabs[i].classList.contains('tab-selected')){
        block.controllerSettings.data.motor = tabs[i].textContent;
      }
    }
    keypad.closeTabs({'div': div});
  };

  return motorBlock;
}();

},{"./../svgbuilder.js":45,"./icons.js":18,"./keypadTab.js":23,"knockout":8}],25:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pictureBlock = {};
  var icons = require('./icons.js');

  // Use CSS clases for LED lit state.
  function setPicturePixel(svgPixel, state) {
    if (svgPixel === undefined) {
      return;
    }
    if (state === 1) {
      svgPixel.setAttribute('class', 'svg-clear block-picture-led-on');
    } else {
      svgPixel.setAttribute('class', 'svg-clear block-picture-led-off');
    }
  }

  // Map page XY to index in pixel array.
  function pictureEventToIndex(event) {
    // Offset is experimental and not supported on all browsers.
    // var x = Math.floor(event.offsetX / 35);
    // var y = Math.floor(event.offsetY / 35);
    var bb = event.target.parentNode.getBoundingClientRect();
    var x = Math.floor((event.pageX - bb.left) / 35);
    var y = Math.floor((event.pageY - bb.top) / 35);
    if ((x > 4) || (y > 4)) {
      return -1;
    } else {
      return (y * 5) + x;
    }
  }

  // List of HTML snippets used for controller tabs.
  pictureBlock.tabs= {
    //'5x5picture' : '<i class="fa fa-smile-o" aria-hidden="true"></i>',
    //'5x5string'  : 'abc',
    //'5x5movie'   : '<i class="fa fa-film" aria-hidden="true"></i>',
    //'5x5sensor'  : '<i class="fa fa-tachometer" aria-hidden="true"></i>'
  };

  // Initial setting for blocks of this type.
  pictureBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{pix:[0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0]},
      // Indicate what controller is active. This may affect the data format.
      controller:'5x5picture',
    };
  };

  // Generate an SVG based image for a specific block.
  pictureBlock.svg= function(svg, block) {
    var pix = block.controllerSettings.data.pix;
    var group = icons.picture(1.4, 15, 14, pix);
    svg.appendChild(group);
  };

  // Inject the HTML for the controller's editor.
  // TODO: pass in the controller. That might all move out of this class.
  pictureBlock.configuratorClose = function() {
  };

  pictureBlock.configuratorOpen = function(div, block) {
    div.innerHTML =
        `<div id='pictureEditorDiv' class='editorDiv'>
          <svg id='pictureEditor' width=175px height=175px xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' width=175px height=175px rx=10 ry=10 class='pix-editor block-picture-board'/>
          </svg>
        </div>`;

    // Create a editor state object for the interactions to work with.
    var svg = document.getElementById('pictureEditor');
    var pix = block.controllerSettings.data.pix;
    var pixOn = 0;
    var dindex = 0;
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        // Create each LED and initialize its lit state.
        var led = svgb.createCircle('', 17.5+(ix*35), 17.5+(iy*35), 13);
        setPicturePixel(led, pix[dindex]);
        svg.appendChild(led);
        dindex += 1;
      }
    }

    interact('.pix-editor', {context:svg})
      .on('down', function (event) {
        // Flip brush state based on pixel clicked on, then paint.
        var i = pictureEventToIndex(event);
        if (i >= 0) {
          if (pix[i] === 0) {
            pixOn = 1;
          } else {
            pixOn = 0;
          }
        }
        pix[i] = pixOn;
        setPicturePixel(event.target.parentNode.children[i+1], pix[i]);
        block.updateSvg();
      })
      .on('move', function(event) {
        // Paint pixel based on brush state.
        if (event.interaction.pointerIsDown) {
          //If it's in range and there was an actualy change then paint.
          var i = pictureEventToIndex(event);
          if ((i >= 0) &&  (pix[i] !== pixOn)) {
            pix[i] = pixOn;
            setPicturePixel(event.target.parentNode.children[i+1], pix[i]);
            block.updateSvg();
          }
        }
      });
    return;
  };

  return pictureBlock;
}();

},{"./../svgbuilder.js":45,"./icons.js":18,"interact.js":7}],26:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../svgbuilder.js');
  var interact = require('interact.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./keypadTab.js');
  var icons = require('./icons.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  // var pb = svgb.pathBuilder;
  var printBlock = {};
  // var variables = require('./../../variables.js');

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  printBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  printBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What to print: var, sensor
        print:'var',
        variable:'A',
        sensor:'accel',
        button:'A',
        // Value
        value:0
      },
    };
  };

  printBlock.configuratorOpen = function(div, block) {
    var data = block.controllerSettings.data;
    printBlock.activeBlock = block;
    div.innerHTML =
        `<div id='printEditorDiv' class='editorDiv'>
          <div class='printBlock-buttons' y="100%">
            <div class='printBlock-option' value='A'><span class="svg-clear">A</span></div>
            <div class='printBlock-option' value='B'><span class="svg-clear">B</span></div>
          </div>
          <div class="vert-line"></div>
          <div id='printBlock-editor'>
          </div>
        </div>`;
    printBlock.loadSlide(data.button, block);

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (data.print === 'var' && opts[i].value === data.variable) {
        drop.selectedIndex = i;
        break;
      } else if(data.print === 'sensor' && opts[i].value === data.sensor){
        drop.selectedIndex = i;
        break;
      }
    }

    interact('.printBlock-option')
      .on('down', function (event) {
        var button = event.srcElement;
        var tabs = document.getElementsByClassName('printBlock-option');
        for(var k = 0; k < tabs.length; k++){
          tabs[k].setAttribute('class', 'printBlock-option');
        }
        button.classList.add('printBlock-selected');
        printBlock.loadSlide(button.getAttribute('value'), block);
      });
  };

  printBlock.loadSlide = function(buttonName, block) {
    var editor = document.getElementById('printBlock-editor');
    var opts = document.getElementsByClassName('printBlock-option');
    for(var i = 0; i < opts.length; i++){
      if(opts[i].getAttribute('value') === buttonName){
        opts[i].setAttribute('class', 'printBlock-option printBlock-selected');
      }
    }
    if(buttonName === 'A'){ // var
      block.controllerSettings.data.print = "var";
      block.controllerSettings.data.button = "A";
      editor.innerHTML = `<select class="dropdown-comparison printBlock-dropdown" id="dropdown-comparison">
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>`;
    } else if(buttonName === 'B'){ //sensor
      block.controllerSettings.data.print = "sensor";
      block.controllerSettings.data.button = "B";
      editor.innerHTML = `<select class="dropdown-comparison printBlock-dropdown" id="dropdown-comparison">
        <option value="accel">accel</option>
        <option value="temp">temp</option>
      </select>`;
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  printBlock.configuratorClose = function(div, block) {
    var vars = document.getElementById('dropdown-comparison');
    var index = vars.selectedIndex;
    var data = block.controllerSettings.data;
    if(data.print === 'var'){
      data.variable = vars.options[index].value;
    } else if(data.print === 'sensor'){
      data.sensor = vars.options[index].value;
    }
    block.updateSvg();
    printBlock.activeBlock = null;
    //keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  printBlock.svg = function(root, block) {
    var board = icons.pictureNumeric(1, 27, 15);
    board.setAttribute('text-anchor', 'middle');
    root.appendChild(board);

    var print = block.controllerSettings.data.print;
    if(print === 'var'){
      var varData = block.controllerSettings.data.variable;
      var variable = icons.variable(0.5, 27, 52, varData);
      root.appendChild(variable);
    } else if(print === 'sensor'){
      var sensor = block.controllerSettings.data.sensor;
      if(sensor === 'accel'){
        var accel = icons.accelerometer(0.55, 'svg-clear block-stencil-fill', 73, 120);
        root.appendChild(accel);
      } else if (sensor === 'temp'){
        var temp = svgb.createText('svg-clear block-identity-text', 75, 160, '\uf2c9');
        temp.setAttribute('transform', 'scale(0.45)');
        root.appendChild(temp);
      }
    }
  };

  return printBlock;
  }();

},{"./../svgbuilder.js":45,"./icons.js":18,"./keypadTab.js":23,"interact.js":7,"knockout":8}],27:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var pb = svgb.pathBuilder;
  var servoBlock = {};
  var ko = require('knockout');

  servoBlock.keyPadValue = ko.observable(0+"%");
  // Initial setting for blocks of this type.
  servoBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{
        'pos':0
      },
      // Indicate what controller is active. This may affect the data format.
    };
  };

  servoBlock.svg = function (root, block) {
    // servo body
    var box = svgb.createRect('svg-clear block-micro-servo-body', 18, 20, 44, 24, 2.5);
    root.appendChild(box);

    // simple servo arm
    var pathd = '';
    pathd =  pb.move(45, 32);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    // Rotate it according to the block data
    var data = block.controllerSettings.data.pos;
    path.setAttribute('transform', "rotate(" + data + " 48 32)");
    root.appendChild(path);

    var pos = svgb.createText('svg-clear block-servo-text block-stencil-fill', 40, 70, data + "˚");
    pos.setAttribute('text-anchor', 'middle');
    root.appendChild(pos);

    //servoBlock.testExpression(root);
    return root;
  };

  servoBlock.testExpression = function(root) {

    var pathd = '';
    pathd =  pb.move(24, 52);
    pathd += pb.line(-9, 0);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 0);
    var path = svgb.createPath('svg-clear block-sensor-stencil', pathd);
    root.appendChild(path);

    var circle = svgb.createCircle('svg-clear block-sensor-stencil-value', 19.5, 62, 4);
    root.appendChild(circle);

    circle = svgb.createCircle('svg-clear', 19.5, 62, 1);
    root.appendChild(circle);

    return root;
  };

  servoBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.pos; },
      'setValue': function(position) { block.controllerSettings.data.pos = position; },
      'type':servoBlock,
      'div': div,
      'block': block,
      'min':0,
      'max':180,
      'suffix':"˚",
      'numArray': ["+50", "+10", "+1", "-50", "-10", "-1", undefined, "C"],
      'calcLayout': 'simple'
    });
  };
  servoBlock.configuratorClose = function(div) {
    keypad.closeTabs({'div': div});
  };

  return servoBlock;
}();

},{"./../svgbuilder.js":45,"./keypadTab.js":23,"knockout":8}],28:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;
  var soundBlock = {};

  // List of HTML snippets used for controller tabs.
  soundBlock.tabs= {
    //'pianoKeyboard' : '<i class="fa fa-music" aria-hidden="true"></i>'
  };

  // Initial setting for blocks of this type.
  soundBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{'description':'', 'period':'1/4', 's':'', 'duration': 0},
      // Indicate what controller is active. This may affect the data format.
      controller:'pianoKeyboard',
    };
  };

  var keyInfo = [
    // Naturals 8
    { name:'C4', f:261.6, s:1}, //0
    { name:'D4', f:293.7, s:3 },
    { name:'E4', f:329.6, s:5 },
    { name:'F4', f:349.2, s:6 },
    { name:'G4', f:392.0, s:8 }, //4
    { name:'A4', f:440.0, s:10 },
    { name:'B4', f:493.9, s:12 },
    { name:'C5', f:523.2, s:13 }, //7
    // Accidentals, its easier to not to interleave them.
    { name:'C#4', f:277.2, keyShift:-3, s:2 },
    { name:'D#4', f:311.1, keyShift:3, s:4  },
    { name:'F#4', f:370.0, keyShift:-4, s:7 },
    { name:'G#4', f:415.3, keyShift:0, s:9  },
    { name:'A#4', f:466.1, keyShift:4, s:11  }
  ];

  soundBlock.configuratorOpen = function(div, block) {
    soundBlock.activeBlock = block;
    div.innerHTML =
        `<div id='pictureEditorDiv' class='editorDiv'>
          <svg id='pianoSvg' width=231px height=175px xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' y=2px width=231px height=100px rx=4 ry=4 class='block-sound-piano'/>
          </svg>
        </div>`;

    // Create an editor state object for the interactions to work with.
    var svg = document.getElementById('pianoSvg');
    var keyIndex = 0;
    for (var iwKey = 0; iwKey < 8; iwKey++) {
      var wkey = svgb.createRect('piano-key block-sound-piano-w', 4+(iwKey*28), 15, 27, 84, 3);
      wkey.setAttribute('key', keyIndex);
      keyIndex += 1;
      svg.appendChild(wkey);
    }
    for (var ibKey = 0; ibKey < 7; ibKey++) {
      if (ibKey !== 2 && ibKey !== 6) {
        var left = 21+(ibKey*28) + keyInfo[keyIndex].keyShift;
        var bkey = svgb.createRect('piano-key block-sound-piano-b', left, 15, 22, 45, 3);
        bkey.setAttribute('key', keyIndex);
        keyIndex += 1;
        svg.appendChild(bkey);
      }
    }
    var r = svgb.createRect('svg-clear block-sound-piano', 0, 2, 231, 15, 4);
    svg.appendChild(r);

    var textData = soundBlock.activeBlock.controllerSettings.data.description.split(" ");
    for(var itxtBox = 0; itxtBox < 4; itxtBox++){
      var txtBox = svgb.createRect('svg-clear block-sound-txtBox block-sound-noteBox', 5+(itxtBox*60), 108, 40, 30, 3);
      svg.appendChild(txtBox);
      var txt = svgb.createText('svg-clear block-sound-text block-sound-noteTxt', 13+(itxtBox*60), 130, '__');
      if(textData[itxtBox] !== undefined && textData[itxtBox] !== ""){
        txt.innerHTML = textData[itxtBox];
      }
      txt.setAttribute('box', itxtBox);
      svg.appendChild(txt);
    }

    var clearBox = svgb.createRect('block-sound-txtBox block-sound-clearBox', 75, 145, 80, 25, 3);
    svg.appendChild(clearBox);
    var clearTxt = svgb.createText('svg-clear block-sound-text block-sound-clearTxt', 90, 165, 'Clear');
    svg.appendChild(clearTxt);

    // Create audio context for generating tones.
    soundBlock.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    interact('.piano-key ', {context:svg})
    .on('down', function (event) {
      soundBlock.lastKey = event.target;
      soundBlock.playKey(event.target);
    })
    .on('move', function (event) {
      if (event.interaction.pointerIsDown) {
        if (soundBlock.currentKey !== event.target && soundBlock.lastKey !== event.target) {
          soundBlock.lastKey = event.target;
          soundBlock.playKey(event.target);
        }
      }
    })
    .on('up', function () {
      soundBlock.stopCurrentKey();
    });

    interact('.block-sound-clearBox', {context:svg})
    .on('down', function() {
      soundBlock.activeBlock.controllerSettings.data.description = "";
      soundBlock.activeBlock.controllerSettings.data.s = "";
      var text = document.getElementsByClassName('block-sound-noteTxt');
      for(var i = 0; i < 4; i++){
        text[i].innerHTML = '__';
      }
      soundBlock.activeBlock.controllerSettings.data.duration = 0;
      soundBlock.activeBlock.updateSvg();
    });
  };

  // Release the audioContext.
  soundBlock.configuratorClose = function() {
    soundBlock.audioContext.close();
    soundBlock.audioContext = null;
  };

  // State variables for pointer tracking.
  soundBlock.currentKey = null;
  soundBlock.originalClass = null;
  soundBlock.lastKey = null;

  // Play a key, update graphics, etc.
  soundBlock.playKey = function(svgElt) {
    var keyIndex = Number(svgElt.getAttribute('key'));
    svgElt.setAttribute('key', keyIndex);
    soundBlock.stopCurrentKey();
    soundBlock.currentKey = svgElt;
    soundBlock.originalClass = svgElt.getAttribute('class');
    var newClass = soundBlock.originalClass + '-pressed';
    svgElt.setAttribute('class', newClass);

    // Start oscillator
    var ctx = soundBlock.audioContext;
    var oscillator = ctx.createOscillator();
    var gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;
    oscillator.type = 'sine';
    oscillator.frequency.value = keyInfo[keyIndex].f;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
    gain.gain.setTargetAtTime(0, ctx.currentTime + 0.3, 0.015);

    // Make sure note ends.
    soundBlock.keyTimer = setTimeout(function() {
      soundBlock.stopCurrentKey();
    }, 400);

    // Update block
    var arr = document.getElementsByClassName('block-sound-text');
    var data1 = soundBlock.activeBlock.controllerSettings.data.description;
    var data2 = soundBlock.activeBlock.controllerSettings.data.s;
    for(var i = 0; i < 4; i++){
      if(arr[i].innerHTML === '__'){
        arr[i].innerHTML = keyInfo[keyIndex].name;
        if(data1 === '' || data2 === ''){
          data1 = arr[i].innerHTML;
          data2 = String(keyInfo[keyIndex].s);
        } else{
          data1 = data1 + " " + arr[i].innerHTML;
          data2 = data2 + " " + keyInfo[keyIndex].s;
        }
        soundBlock.activeBlock.controllerSettings.data.duration += 1;
        break;
      }
    }

    soundBlock.activeBlock.controllerSettings.data.description = data1;

    soundBlock.activeBlock.controllerSettings.data.s = data2;

    soundBlock.activeBlock.updateSvg();
  };

  soundBlock.stopCurrentKey = function() {
    if (soundBlock.currentKey !== null) {
      clearTimeout(soundBlock.keyTimer);
      soundBlock.keyTimer = undefined;
      soundBlock.currentKey.setAttribute('class', soundBlock.originalClass);
      soundBlock.currentKey = null;
    }
    // Stop oscillator
  };
  // Sound block to make a joyful noise.
  soundBlock.svg = function(root, block) {
    // Speaker
    var pathd = '';
    pathd =  pb.move(20, 25);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    // Sound wave arcs
    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);

    // Description such as note name.
    if(block.controllerSettings.data.s !== ''){
      var name = block.controllerSettings.data.s.split(' ');
      var s = '';
      s += svgb.pathBuilder.move(8, 75);
      for(var i = 0; i < name.length; i++){
        s += svgb.pathBuilder.move(5, 0 - (name[i]*1.5));
        s += svgb.pathBuilder.line(10, 0);
        s += svgb.pathBuilder.move(0, (name[i]*1.5));
        var line = svgb.createPath('svg-clear block-stencil', s);
        root.appendChild(line);
      }
    }

    return root;
  };

  return soundBlock;
}();

},{"./../svgbuilder.js":45,"interact.js":7}],29:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var svgb = require('./../svgbuilder.js');
  //var formTools = require('./../block-settings.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var pb = svgb.pathBuilder;
  var icons = require('./icons.js');
  var twoMotorBlock = {};

  twoMotorBlock.keyPadValue = ko.observable(100 + "%");
  twoMotorBlock.beatsValue = ko.observable("1 beat");

  // Initial settings for blocks of this type.
  twoMotorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 100,
        duration: 1,
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  // Two Motor block
  twoMotorBlock.svg = function(root, block) {
    // Motor 1
    var motor1 = icons.motor(1, -12, 0);
    root.appendChild(motor1);

    var data = block.controllerSettings.data.speed;
    var motor2 = icons.motorWithDial(1, 12, 0, data);
    root.appendChild(motor2);

    var data2 = block.controllerSettings.data.duration;
    var textToDisplay = svgb.createGroup('displayText', 0, 0);
    var duration = svgb.createText('svg-clear block-motor-text-duration block-stencil-fill', 40, 70, data2 + " \uf192"); //data2 + " \uf192"
    textToDisplay.appendChild(duration);
    textToDisplay.setAttribute('text-anchor', 'middle');
    root.appendChild(textToDisplay);
    return root;
  };

  twoMotorBlock.configuratorOpen = function(div, block) {
    keypad.tabbedButtons({
      'getValue': function() { return block.controllerSettings.data.speed; },
      'setValue': function(speed) { block.controllerSettings.data.speed = speed; },
      'type':twoMotorBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"%",
      'numArray': ["+1", "+10", "+50", "-1", "-10", "-50", undefined, "C"],
      'calcLayout': 'simple',
      'getBeats': function() { return block.controllerSettings.data.duration; },
      'setBeats': function(duration) { block.controllerSettings.data.duration = duration; },
    });
  };
  twoMotorBlock.configuratorClose = function(div) {
    keypad.closeTabs({'div': div});
  };

  return twoMotorBlock;
}();

},{"./../svgbuilder.js":45,"./icons.js":18,"./keypadTab.js":23,"knockout":8}],30:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  var icons = require('./../icons.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  var pb = svgb.pathBuilder;
  var variableAddBlock = {};
  // var variables = require('./../../variables.js');

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  variableAddBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  variableAddBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What variable: A, B, C
        variable:'A',
        incdec: '+',
        // Value
        value:1
      },
    };
  };

  variableAddBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) {
        block.controllerSettings.data.value = value;
        if(block.controllerSettings.data.value === '0') {
          block.controllerSettings.data.incdec = '';
        } else if(block.controllerSettings.data.value < 0) {
          block.controllerSettings.data.incdec = '-';
        } else if(block.controllerSettings.data.value > 0) {
          block.controllerSettings.data.incdec = '+';
        }
        //document.getElementById('varAdd-incdec').innerHTML = block.controllerSettings.data.incdec;
      },
      'type':variableAddBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"",
      'numArray': ["-1", "C", "+1", "-10", undefined, "+10"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <select class="dropdown-comparison vars-dropdown-comparison" id="dropdown-comparison">
            <option value="A" id="idAccel-equals">A</option>
            <option value="B" id="idAccel-greater">B</option>
            <option value="C" id="idAccel-less">C</option>
          </select>
          <div class="dropdown-label-txt varAdd-label-txt svg-clear" id="varAdd-incdec">\uf061
          </div>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.variable) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  variableAddBlock.configuratorClose = function(div, block) {
    var vars = document.getElementById('dropdown-comparison');
    var index = vars.selectedIndex;
    block.controllerSettings.data.variable = vars.options[index].value;

    block.updateSvg();
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  variableAddBlock.svg = function(root, block) {
    var varData = block.controllerSettings.data.variable;
    var variable = icons.variable(1, 13, 5, varData);
    root.appendChild(variable);

    var val = block.controllerSettings.data.value;
    var incdec = block.controllerSettings.data.incdec;
    var num = svgb.createText('svg-clear vars-bottom-txt', 40, 71, incdec + ' ' + Math.abs(String(val)));
    num.setAttribute('text-anchor', 'middle');
    root.appendChild(num);
  };

  return variableAddBlock;
  }();

},{"./../../svgbuilder.js":45,"./../icons.js":18,"./../keypadTab.js":23,"knockout":8}],31:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  var icons = require('./../icons.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  // var pb = svgb.pathBuilder;
  var variableSetBlock = {};
  // var variables = require('./../../variables.js');

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  variableSetBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  variableSetBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What variable: A, B, C
        variable:'A',
        // Value
        value:0
      },
    };
  };

  variableSetBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':variableSetBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"",
      'numArray': ["-1", "C", "+1", "-10", undefined, "+10"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <select class="dropdown-comparison vars-dropdown-comparison" id="dropdown-comparison">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <div class="dropdown-label-txt varSet-label-txt svg-clear">=
          </div>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.variable) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  variableSetBlock.configuratorClose = function(div, block) {
    var vars = document.getElementById('dropdown-comparison');
    var index = vars.selectedIndex;
    block.controllerSettings.data.variable = vars.options[index].value;
    block.updateSvg();
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  variableSetBlock.svg = function(root, block) {
    var varData = block.controllerSettings.data.variable;
    var variable = icons.variable(1, 13, 5, varData);
    root.appendChild(variable);

    var val = block.controllerSettings.data.value;
    var num = svgb.createText('svg-clear vars-bottom-txt', 40, 71, String(val));
    num.setAttribute('text-anchor', 'middle');
    root.appendChild(num);
  };

  return variableSetBlock;
  }();

},{"./../../svgbuilder.js":45,"./../icons.js":18,"./../keypadTab.js":23,"knockout":8}],32:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var svgb = require('./../svgbuilder.js');
  //var formTools = require('./../block-settings.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var pb = svgb.pathBuilder;
  var waitBlock = {};

  waitBlock.keyPadValue = ko.observable(1);

  // Initial settings for blocks of this type.
  waitBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{ 'duration':1.0 },
      // Indicate what controller is active. This may affect the data format.
    };
  };
  // Wait block - Wait until something happens. It can wait for things other
  // than time, but it is assumed that time passing is part of the function.
  waitBlock.svg = function(root, block) {
    var pathd = '';
    pathd =  pb.move(40, 19);
    pathd += pb.vline(-7);
    pathd += pb.arc(19, 340, 1, 1, -12, 4);
    pathd += pb.move(10.6, 16.5);
    pathd += pb.arc(1.3, 300, 0, 0, 2.2, -0.8);
    pathd += pb.line(-7.8, -10.5);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    var data = block.controllerSettings.data.duration;
    var time = svgb.createText('svg-clear block-wait-text block-stencil-fill', 40, 70, data + " \uf192");
    time.setAttribute('text-anchor', 'middle');
    root.appendChild(time);
    return root;
  };

  waitBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.duration; },
      'setValue': function(duration) { block.controllerSettings.data.duration = duration; },
      'type':waitBlock,
      'div': div,
      'block': block,
      'min':1,
      'max':50,
      'suffix':" beats",
      'numArray': ["+1", "C", "-1", "+10", undefined, "-10"],
      'calcLayout': 'simple'
    });
  //  formTools.sliderInteract(div);
    };
    waitBlock.configuratorClose = function(div) {
      keypad.closeTabs({'div': div});
    };

  return waitBlock;
}();

},{"./../svgbuilder.js":45,"./keypadTab.js":23,"knockout":8}],33:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var log = require('./log.js');
  var conductor = {};
  var cxnButton = require('./overlays/cxnButton.js');
  var cxn = require('./cxn.js');
  var variables = require('./variables.js');

  conductor.cxn = require('./cxn.js');
  conductor.tbe = null;
  conductor.hbTimer = 0;
  conductor.sensorTimer = 0;
  conductor.runningBlocks = [];
  conductor.count = null;
  conductor.defaultPix = '0000000000';
  conductor.run = false;

  // Once the conductor system is connected to the editor,
  // it will ping the target device to determine
  // its current state.

  // Scan the editor looking for identity blocks
  // For each id block,
  // determine if it is currently connected and still responding.

  // Give some time for the animation to complete, then remove.

  conductor.activeBits = [];

  conductor.attachToScoreEditor = function(tbe) {
    log.trace('attached to ', tbe);
    conductor.tbe = tbe;
    conductor.linkHeartBeat();
    conductor.cxn.connectionChanged.subscribe(conductor.updateIndentityBlocks);
  };

  // If there is a change in connections update teh indentity blocks
  // TODO this linkage is ver much a bit of a hack.
  conductor.updateIndentityBlocks = function() {
    log.trace(' updating identity blocks');
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      if (chainStart.name.startsWith('identity')) {
        var botName = cxnButton.deviceName;
        var status = conductor.cxn.connectionStatus(botName);
        if (status === conductor.cxn.statusEnum.BEACON) {
          // Try to connect ot it.
          conductor.cxn.connect(botName);
        }
        chainStart.updateSvg();
      }
    });
  };

  conductor.linkHeartBeat = function() {
    conductor.hbTimer = 0;

    // Visit all chains and see if any have changed connection states.
    // conductor.checkAllIdentityBlocks();

    // Set all of the blocks to a regular state.
    conductor.tbe.forEachDiagramBlock(function(b){
      b.svgRect.classList.remove('running-block');
    });

    if (conductor.runningBlocks.length > 0) {
      for (var i = 0; i < conductor.runningBlocks.length; i++) {
        var block = conductor.runningBlocks[i];
        if (block !== null) {
          if(conductor.loopCount === undefined && block.isLoopHead()){
            conductor.loopCount = block.controllerSettings.data.duration;
          }

          if (block.name === 'tail' && conductor.loopCount > 1) {
            block = block.flowHead;
            conductor.loopCount -= 1;
          } else if (block.name === 'tail' && conductor.loopCount === 1) {
            conductor.loopCount = undefined;
            if (block.next !== null) {
              block = block.next;
            } else {
              conductor.stopAll();
            }
          }

          if (block !== null && block.name === 'loop') {
            block = block.next;
          }
          // If this is a new block, get its duration
          if (conductor.count === null) {
            conductor.count = block.controllerSettings.data.duration;
          }

          // If it does not have a duration or it has a duration of 0
          // then set its duration to 1
          if (conductor.count === undefined || conductor.count === '0') {
            conductor.count = 1;
          }
          log.trace(conductor.count);

          if (block !== null) {
            conductor.count = parseInt(conductor.count, 10);

            // Mark the current block as running
            var id = block.first;
            if (id.name.startsWith('identity')) { // && !block.isCommented()
              conductor.tbe.svg.appendChild(block.svgGroup);
              block.svgRect.classList.add('running-block');
            }

            // If the block has not played for its entire duration,
            // continue playing the block.
            // Otherwise, get the next block ready and set count to null.
            conductor.playOne(block);
            if (conductor.count > 1) {
              conductor.count -= 1;
            } else {
              conductor.runningBlocks[i] = block.next;
              conductor.count = null;
            }
          }
        }
      }
    }
    conductor.hbTimer = setTimeout(function() { conductor.linkHeartBeat(); }, 1000);
  };

  // Find all start all blocks and start them running.
  conductor.playAll = function() {
    conductor.runningBlocks = [];
    conductor.run = true;
    variables.resetVars();
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    blockChainIterator(function(chainStart) {
      // Ignore chains that don't start with an identity block.
      if (chainStart.name === 'identity') {
        conductor.runningBlocks.push(chainStart.next);
      } else if(chainStart.name === 'identityAccelerometer' || chainStart.name === 'identityButton' || chainStart.name === 'identityTemperature') {
        //chainStart.controllerSettings.data.run = "yes";
        cxn.buttonA = null;
        cxn.buttonB = null;
        cxn.buttonAB = null;
        conductor.checkSensorIdentity(chainStart);
      }
    });
  };

  conductor.satisfiesStart = function(val, block, error) {
    var blockValue = parseInt(block.controllerSettings.data.value, 10);
    if(block.controllerSettings.data.comparison === '<'){
      return val < blockValue;
    } else if(block.controllerSettings.data.comparison === '>'){
      return val > blockValue;
    } else if(block.controllerSettings.data.comparison === '='){
      if(val === blockValue){
        return true;
      } else if(val + error > blockValue && val - error < blockValue) {
        return true;
      }
      return false;
    }
    return null;
  };

  conductor.runningBlockIsNotInChain = function(block) {
    while(block !== null){
      if(block.svgRect.classList.contains('running-block')) {
        return false;
      }
      block = block.next;
    }
    return true;
  };

  conductor.checkSensorIdentity = function(block) {
    conductor.sensorTimer = 0;
    var data = block.controllerSettings.data;
    //conductor.cxn.write(cxnButton.deviceName, '(sensor);');
    if(conductor.run){
      if(block.name === 'identityAccelerometer' && cxn.accelerometer !== null) {
        var accel = cxn.accelerometer;
        console.log("Accelerometer", accel);
        if(conductor.satisfiesStart(accel, block, 32) && conductor.runningBlockIsNotInChain(block)){
          conductor.runningBlocks.push(block.next);
        }
      } else if(block.name === 'identityTemperature' && cxn.temperature !== null) {
        var temp = cxn.temperature;
        console.log("Temperature", temp);
        if(conductor.satisfiesStart(temp, block, 0)){
          conductor.runningBlocks.push(block.next);
        }
      } else if (block.name === 'identityButton') {
        //console.log(data.button);
        if(data.button === 'A' && cxn.buttonA){
          conductor.runningBlocks.push(block.next);
          cxn.buttonA = null;
        } else if(data.button === 'B' && cxn.buttonB){
          conductor.runningBlocks.push(block.next);
          cxn.buttonB = null;
        } else if(data.button === 'A+B' && cxn.buttonAB){
          conductor.runningBlocks.push(block.next);
          cxn.buttonAB = null;
        }
      }
    }
    conductor.sensorTimer = setTimeout(function() { conductor.checkSensorIdentity(block); }, 500);
  };

  // Stop all running chains.
  conductor.stopAll = function() {
    var blockChainIterator  = conductor.tbe.forEachDiagramChain;
    var botName = '';
    var message = '(m:(1 2) d:0);';
    var message2 = '(px:' + conductor.defaultPix + ');';
    conductor.run = false;
    blockChainIterator(function(chainStart) {
      chainStart.svgRect.classList.remove('running-block');
      // Ignore chains that don't start with an identity block.
      if (chainStart.name.startsWith('identity')) {
        botName = cxnButton.deviceName;
        conductor.cxn.write(botName, message);
        conductor.cxn.write(botName, message2);
      }
    });
    conductor.count = null;
    conductor.runningBlocks = [];
    log.trace('stop all');
    // Single step, find target and head of chain, and run the single block.
  };

  conductor.playOne = function(block) {
    var first = block.first;

    if (first.name.startsWith('identity')) {
      var botName = cxnButton.deviceName;
      var message = '';
      var d = block.controllerSettings.data;
      if (block.name === 'picture') {
        var imageData = d.pix;
        var pixStr = conductor.packPix(imageData);
        message = '(px:' + pixStr + ':' + 1 + ');';
      } else if (block.name === 'servo') {
        message = '(sr:' + 50 + ');';
      } else if (block.name === 'motor') {
        message = '(m:'+ d.motor + ' d:' + d.speed +' b:' + d.duration + ');';
      } else if (block.name === 'twoMotor') {
        message = '(m:(1 2) d:' + d.speed + ');'; // +' b:' + d.duration
      } else if (block.name === 'sound') {
        // pass the Solfege index
        message = '(nt:' + d.s.split(" ")[0] + ');';
        console.log('message', message);
      } else if (block.name === 'wait') {
        message = '';
      } else if (block.name === 'variableSet'){
        variables.setVal(d.variable, d.value);
      } else if (block.name === 'variableAdd'){
        variables.incdec(d.variable, d.incdec, d.value);
      } else if(block.name === 'print'){
        var val = conductor.getPrintVal(d);
        message = '(pr:' + val + ');';
      }
      conductor.cxn.write(botName, message);
    }
    // Single step, find target and head of chain and run the single block.
  };

  conductor.getPrintVal = function(d){
    var val = 0;
    if(d.print === 'var'){
      if(d.variable === 'A'){
        val = variables.a;
      } else if(d.variable === 'B'){
        val = variables.b;
      } else if(d.variable === 'C'){
        val = variables.c;
      }
    } else if(d.print === 'sensor'){
      if(d.sensor === 'accel'){
        val = cxn.accelerometer;
      } else if(d.sensor === 'temp'){
        val = cxn.temperature;
      }
    }
    return val;
  };

  conductor.playSingleChain = function() {
    log.trace('play single chain');
    // The conductor starts one chain (part of the score).
  };

  conductor.packPix = function(imageData) {
    var pixStr = '';
    for (var i = 0; i < 5; i++) {
      var value = 0;
      for(var j = 0; j < 5; j++) {
        value *= 2;
        if (imageData[(i*5) + j] !== 0) {
          value += 1;
        }
      }
      var str = value.toString(16);
      if (str.length===1) {
        str = '0' + str;
      }
      pixStr += str;
    }
    return pixStr;
  };
  return conductor;
}();

},{"./cxn.js":34,"./log.js":38,"./overlays/cxnButton.js":39,"./variables.js":51}],34:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Module for managing BLE connections and lists of devices found.
module.exports = function factory(){
  var log = require('./log.js');
  var ko = require('knockout');

  var cxn = {};
  cxn.connectionChanged = ko.observable({});
  cxn.connectionChanged.extend({ notify: 'always' });
  cxn.messages = [];
  cxn.compass = 0;
  cxn.temp = 0;
  cxn.connectingTimeout = 0;

  cxn.accelerometer = null;
  cxn.temperature = null;
  cxn.buttonA = null;
  cxn.buttonB = null;
  cxn.buttonAB = null;

// State enumeration for conections.
cxn.statusEnum = {
  NOT_THERE : 0,
  BEACON : 1,
  CONNECTING : 2,
  CONNECTED : 3,
  CONNECTION_ERROR : 4
};

// GUIDs for Nordic BLE UART services.
var nordicUARTservice = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

cxn.webBLERead = null;
cxn.webBLEWrite = null;

// Convert a string to an array of int (int8s).
function stringToBuffer(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

// Convert an array ints to a string.
function bufferToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// Sniff out which BLE API to use. The order of testing is important
if (typeof ble !== 'undefined') {
  // First, look for a cordova based one. Its based on a global
  cxn.appBLE = ble; // eslint-disable-line no-undef
  cxn.webBLE = null;
} else if (navigator.bluetooth !== null && navigator.bluetooth !== undefined) {
  // Second, see if ther appears to be a web bluetooth implmentation.
  cxn.appBLE = null;
  cxn.webBLE = navigator.bluetooth;
} else {
  // None found.
  cxn.appBLE = null;
  cxn.webBLE = null;
}

//
cxn.scanUsesHostDialog = cxn.webBLE;

var pbi = 0;

// fake list of beacons for testing.
var pseudoBeacons = [
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:500},
 {name:'puck.js 4e75', mac:'00004e75', delay:500},
 {name:'BBC micro:bit [frodo]', mac:'0000000F', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [frodo]', mac:'0000000F', delay:500},
 {name:'BBC micro:bit [aslan]', mac:'000000AA', delay:100},
 {name:'puck.js 4e75', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:1000},
 {name:'BBC micro:bit [aragorn]', mac:'0000000A', delay:200},
 {name:'BBC micro:bit [zorgav]', mac:'000000FF', delay:500}
];

cxn.devices = {};
cxn.scanning = false;
cxn.psedoScan = function () {
  if (pbi >= pseudoBeacons.length) {
    pbi = 0;
  }
  var beaconInfo = pseudoBeacons[pbi];
  cxn.beaconReceived(beaconInfo);
  pbi += 1;
  if (cxn.scanning) {
    setTimeout(function() { cxn.psedoScan(); }, beaconInfo.delay);
  }
};

cxn.stopScanning = function () {
  cxn.scanning = false;
  if (cxn.appBLE) {
    cxn.appBLE.stopScan();
  }
};

cxn.findDeviceByMac = function(mac) {
  for (var deviceName in cxn.devices) {
    var device = cxn.devices[deviceName];
    if (mac === device.mac) {
      return device;
    }
  }
  return null;
};

// strip down the name to the core 5 character name
cxn.bleNameToBotName = function(rawName) {
  if (rawName.startsWith('BBC micro:bit [')) {
    return rawName.split('[', 2)[1].split(']',1)[0];
  } else {
    return null;
  }
};

// A Device has been seen.
cxn.beaconReceived = function(beaconInfo) {
  if (beaconInfo.name !== undefined) {
    var botName = cxn.bleNameToBotName(beaconInfo.name);

    // If its a legit name make sure it is in the list or devices.
    if (botName !== null) {

      // Merge into list
      if (!this.devices.hasOwnProperty(botName)) {
        this.devices[botName] = {
           name: botName,
           mac: beaconInfo.id,
          };
          // Now set the status and trigger observers
          cxn.setConnectionStatus(botName, cxn.statusEnum.BEACON);
      }

      // Update last-seen time stamp, signal strength
      this.devices[botName].ts = Date.now();
      if (Number.isInteger(beaconInfo.rssi)) {
        this.devices[botName].rssi = beaconInfo.rssi;
      }
      this.cullList();
    }
  }
};

cxn.cullList = function() {
  var now = Date.now();
  for (var botName in cxn.devices) {
    var botInfo = cxn.devices[botName];

    // Per ECMAScript 5.1 standard section 12.6.4 it is OK to delete while
    // iterating through a an object.
    if ((botInfo.status === cxn.statusEnum.BEACON) && (now - botInfo.ts) > 4000) {
      log.trace('culling beacon thath has not been refreshed for a long while.');
      delete cxn.devices[botName];
    } else if (botInfo.status === cxn.statusEnum.NOT_THERE) {
      log.trace('culling missing bot');
      delete cxn.devices[botName];
    } else if (botInfo.status === cxn.statusEnum.CONNECTING) {
      // If it is stuck in connecting then drop it.
      // This is probably too quick. should do disconnect as well.
      log.trace('culling hung connection', cxn.connectingTimeout);
      if ( Date.now() - cxn.connectingStart > 10000 ) {
        delete cxn.devices[botName];
      }
    }
  }

  // Let observers know something about the list of devices has changed.
  cxn.connectionChanged(cxn.devices);
};

cxn.startScanning = function () {
  cxn.connectingStart =  Date.now();  // a bit of a hack
  cxn.scanning = true;

  if (cxn.webBLE) {
    cxn.webBTConnect();
  } else if (cxn.appBLE) {
    cxn.appBLE.startScanWithOptions([], { reportDuplicates: true },
      function(device) {
        cxn.beaconReceived(device);
      },
      function(errorCode) {
        log.trace('error1:' + errorCode);
      });
  } else {  // bleAPI is not null looks like cordova model.
    log.trace ('simulated bluetooth scan');
    cxn.psedoScan();
  }
};

// For Web bluetooth use the promises style of chaining callbacks.
// It looks a bit like one function, but it is a chain of 'then'
// call backs
cxn.webBTConnect = function () {

  let options = {
      filters: [
        {services: ['generic_attribute']},
        {namePrefix: 'BBC micro:bit'}
      ],
      optionalServices: [nordicUARTservice.serviceUUID, 'link_loss']
  };

  // requestDevice will trigger a browse dialog once back to the browser loop.
  // When a user selects one the then is called. Since the user has already
  // selected on at that point, add it to the list and select.
  navigator.bluetooth.requestDevice(options)
    .then(function(device) {
      log.trace('> device:', device);
      var beaconInfo = {
        name : device.name,     // Should be in 'BBC micro:bit [xxxxx]' format
        id: device.id,          // looks like a hast of mac id perhaps
        rssi: -1,               // signal strength is not shared with JS code
        autoSelect: true        // indicate that the app should now connect.
      };
      cxn.beaconReceived(beaconInfo);
      device.addEventListener('gattserverdisconnected', cxn.onDisconnecWebBLE);
      return device.gatt.connect();
    })
    .then(function(server) {
      log.trace('> primary service:', server);
      return server.getPrimaryService(nordicUARTservice.serviceUUID);
    })
    .then(function(primaryService) {
      log.trace('> primary Service:', primaryService);
      // Calling getCharacteristics with no parameters
      // should return the one associated with the primary service
      // ( the tx and rx service)
      return primaryService.getCharacteristics();
    })
    .then(function(characteristics) {
      var rawName = characteristics[0].service.device.name;
      log.trace('> characteristics:', rawName, characteristics);
      var botName = cxn.bleNameToBotName(rawName);
      cxn.scanning = false;
      cxn.setConnectionStatus(botName, cxn.statusEnum.CONNECTED);

      // testing this in chrome has worked.
      // Could add validation code to confirm nothing has changes
      // [0].uuid = 6e400002-... (tx)
      // [1].uuid = 6e400003-... (rx)
      cxn.webBLEWrite = characteristics[0];
      cxn.webBLERead = characteristics[1];
      cxn.webBLERead.startNotifications()
      .then(function() {
          log.trace ('adding event listener');
          cxn.webBLERead.addEventListener('characteristicvaluechanged',
          cxn.onValChange);
      });
    })
    .catch(function(error) {
      cxn.scanning = false;
      cxn.connectionChanged(cxn.devices);
      log.trace('cancel or error :' + error);
    });
};

cxn.onDisconnectAppBLE = function(info) {
  log.trace('onDisconnectAppBLE:', info);
  var botName = cxn.bleNameToBotName(info.name);
  cxn.setConnectionStatus(botName, cxn.statusEnum.NOT_THERE);
  cxn.cullList();
};

cxn.onDisconnecWebBLE = function(event) {
  log.trace('onDisconnecWebBLE:', event.target.name);
  var botName = cxn.bleNameToBotName(event.target.name);
  cxn.setConnectionStatus(botName, cxn.statusEnum.NOT_THERE);
  cxn.cullList();
};

// Determine the status of a named connection.
cxn.connectionStatus = function (name) {
  if (cxn.devices.hasOwnProperty(name)) {
    return cxn.devices[name].status;
  } else {
    return cxn.statusEnum.NOT_THERE;
  }
};

// Change a devices status and trigger observers
cxn.setConnectionStatus = function (name, status) {
  //
  log.trace('SCS', cxn.devices);
  var dev = cxn.devices[name];
  if (dev !== null) {
    dev.status = status;
  }
  // cxn.devices[name].status = status;
  // Trigger notifications.
  cxn.connectionChanged(cxn.devices);
};

// NOT USED, TODO where should it be used.
cxn.disconnect = function(mac, name) {
  // TODO need to resolve where MAC vs name is used.
  if (cxn.appBLE) {
    console.log ('disconnecting appble', mac);
    cxn.appBLE.disconnect(mac);
    cxn.setConnectionStatus(name, cxn.statusEnum.NOT_THERE);
    cxn.cullList();
  } else if (cxn.webBLE) {
    // Not really set up to manage multiple connections. yet
    console.log ('cxn.webBLEWrite', cxn.webBLEWrite);
    var dev = cxn.webBLEWrite.service.device;
    console.log ('existing device', dev);
    if (dev.gatt.connected) {
        console.log ('disconnecting');
        dev.gatt.disconnect();
    }
    cxn.webBLEWrite = null;
    cxn.webBLERead = null;
  }
};

cxn.connect = function(name) {
  cxn.connectingStart =  Date.now();
  if (cxn.devices.hasOwnProperty(name)) {
    var mac = cxn.devices[name].mac;

    if (cxn.appBLE) {
      cxn.setConnectionStatus(name, cxn.statusEnum.CONNECTING);
      cxn.appBLE.connect(mac, cxn.onConnectAppBLE,
        cxn.onDisconnectAppBLE, cxn.onError);
    } else if (cxn.webBLE) {
      // Should already be connected.
      // TODO, no the connection can be postponed until needed (perhaps)
    } else {
      // For no BLE present, pretend the device is connected.
      cxn.setConnectionStatus(name, cxn.statusEnum.CONNECTED);
    }
  }
};

cxn.onConnectAppBLE = function(info) {
  log.trace('On Connected:', info.name, info);
  // If connection works, then start listening for incomming messages.
  cxn.appBLE.startNotification(info.id,
     nordicUARTservice.serviceUUID,
     nordicUARTservice.rxCharacteristic,
     function (data) { cxn.onData(info.name, data); },
     cxn.onError);

  var dev = cxn.findDeviceByMac(info.id);
  if (dev !== null) {
    cxn.setConnectionStatus(dev.name, cxn.statusEnum.CONNECTED);
  }
};

cxn.onData = function(name, data) {
  var str = bufferToString(data);
  log.trace('On Data:', name, str);
  cxn.messages.push(name + ':' + str);
  if(str.includes('accel')){
    var accelData = str.substring(7, str.length - 1);
    cxn.accelerometer = parseInt(accelData, 10);
  } else if(str.includes('(a)')){
    cxn.buttonA = true;
  } else if(str.includes('(b)')){
    cxn.buttonB = true;
  } else if(str.includes('(ab)')){
    cxn.buttonAB = true;
  } else if(str.includes('compass')){
    cxn.compass = str.substring(9, str.length - 2);
  } else if(str.includes('temp')){
    var tempData = str.substring(6, str.length - 1);
    var fData = (1.8*parseInt(tempData, 10))+32;
    cxn.temperature = fData;
  }
};

cxn.onValChange = function (event) {
  let value = event.target.value;
  log.trace('BLE message recieved', str);
  cxn.onData('Received', value.buffer);
};

cxn.onError = function(reason) {
  log.trace('Error2:', reason);
};

cxn.write = function(name, message) {
  if (cxn.devices.hasOwnProperty(name)) {
    var mac = cxn.devices[name].mac;
    var buffer = stringToBuffer(message);

    if (cxn.appBLE) {
      buffer = stringToBuffer(message);

      // Break the message into smaller sections.
      cxn.appBLE.write(mac,
        nordicUARTservice.serviceUUID,
        nordicUARTservice.txCharacteristic,
        buffer,
        cxn.onWriteOK,
        cxn.onWriteFail);
    } else if (cxn.webBLE) {

      if (cxn.webBLEWrite) {
        cxn.webBLEWrite.writeValue(buffer)
        .then(function() {
          log.trace('write complete');
        })
        .catch(function(error) {
          log.trace('write failed', error);
        });
      }
      //var cxn.webBLEWrite = null;
    }
  }
};

cxn.onWriteOK = function (data) {
  log.trace('write ok', data);
};
cxn.onWriteFail = function (data) {
  log.trace('write fail', data);
};

return cxn;
}();

},{"./log.js":38,"knockout":8}],35:[function(require,module,exports){
/*
Copyright (c) 2016 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var defaultFiles = {};
  var app = require('./appMain.js');
  var defaultDocA = '()';

  var defaultDocB = `(
  (chain x:80 y:240 (
    (identity start:'click' deviceName:'-?-' bus:'ble')
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 1 0 0 0 1 0 1 1 1 0))
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 1 1 0 1 0 0 0 1))
    (picture pix:(0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 1 1 1 1 1 0 0 0 0 0))
    (picture pix:(0 1 0 1 0 0 0 0 0 0 0 1 1 1 0 1 0 0 0 1 0 1 1 1 0))
  )))`;

  var defaultDocC = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (loop count:'25' (
        (picture pix:(1 1 1 1 1 1 0 0 0 1 1 0 0 0 1 1 0 0 0 1 1 1 1 1 1))
        (picture pix:(0 0 0 0 0 0 1 1 1 0 0 1 0 1 0 0 1 1 1 0 0 0 0 0 0))
        (picture pix:(0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0))
      ))
    )))`;

  var defaultDocD = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (sound description:'C4' period:'1/4')
      (sound description:'E4' period:'1/4')
      (sound description:'G4' period:'1/4')
      (sound description:'E4' period:'1/4')
      (sound description:'C4' period:'1/4')
    )))`;

  var defaultDocE = `(
    (chain x:80 y:240 (
      (identity start:'click' deviceName:'-?-' bus:'ble')
      (motor speed:50 duration:0)
      (motor speed:'100' duration:0)
      (motor speed:50 duration:0)
      (motor speed:'0' duration:0)
      (motor speed:'-50' duration:0)
      (motor speed:'-100' duration:0)
      (motor speed:'-50' duration:0)
    )))`;

 // check if contains file (file name)
 defaultFiles.containsFile = function(fileName){
   if(app.fileOverlay.loadFile(fileName) === null || app.fileOverlay.loadFile(fileName) === `null`){
     return false;
   }
   return true;
 };

 // default Files
 defaultFiles.default = function(files){
   for(var i = 0; i < files.length; i++){
     if(!this.containsFile(files[i])){
       var file = '';
       switch (files[i]) {
         case 'docA':
           file = defaultDocA;
           break;
         case 'docB':
           file = defaultDocB;
           break;
         case 'docC':
            file = defaultDocC;
           break;
         case 'docD':
           file = defaultDocD;
           break;
         case 'docE':
           file = defaultDocE;
           break;
         default:
           file = defaultDocA;
           break;

       }
       app.fileOverlay.saveFile(files[i], file);
     }
   }
 };

 return defaultFiles;
}();

},{"./appMain.js":14}],36:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
var log = require('./log.js');
var svgb = require('./svgbuilder.js');
var b = {};

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
    log.trace('cant find style for ', key);
  }
  return def;
};

b.unknownBlock = {
  svg: function(root, block) {
    //var group = svgb.createGroup('', 10, 10);
    //root.appendChild(group);
    var text = svgb.createText('function-text svg-clear', 10, 40, block.name);
    root.appendChild(text);
    return root;
  }
};

b.identityBlock = require('./blocks/identityBlocks/identityBlock.js');
b.pictureBlock = require('./blocks/pictureBlock.js');
b.soundBlock = require('./blocks/soundBlock.js');
b.servoBlock = require('./blocks/servoBlock.js');
b.waitBlock = require('./blocks/waitBlock.js');
b.colorStripBlock = require('./blocks/colorStripBlock.js');
var flowBlocks = require('./blocks/flowBlocks.js');
b.loopBlock = flowBlocks.flowBlockHead;  // TODO name change
b.tailBlock = flowBlocks.flowBlockTail;  // TODO name change
b.motorBlock = require('./blocks/motorBlock.js');
b.twoMotorBlock = require('./blocks/twoMotorBlock.js');
b.identityAccelerometerBlock = require('./blocks/identityBlocks/identityAccelerometerBlock.js');
b.identityButtonBlock = require('./blocks/identityBlocks/identityButtonBlock.js');
b.identityTemperatureBlock = require('./blocks/identityBlocks/identityTemperatureBlock.js');
b.variableSetBlock = require('./blocks/variables/variableSetBlock.js');
b.variableAddBlock = require('./blocks/variables/variableAddBlock.js');
b.printBlock = require('./blocks/printBlock.js');

b.digitalWriteBlock = {
  svg: function(root) {
    // TODO
    return root;
  }
};

b.analogWriteBlock = {
  // TODO
};

b.serialWriteBlock = {
  // TODO
};

b.I2CWriteBlock = {
  // TODO
};

// Calculator
b.calculatorBlock = {
  svg: function(root) {
    return root;
  }
};
// Binding sources are things that provide values that can be connected to
// actors. Much still TODO :)
b.musicNoteValue = {
  // TODO
};

b.constantValue = {
  // TODO
};

b.rangeValue = {
  // TODO
};

b.acceleromoterValue = {
  // TODO
};

b.timeValue = {
   // TODO
};

b.compassValue = {
  // TODO
};

b.temperatureValue = {
  // TODO
};

b.funcionValue = {
  // TODO
};

b.messageValue = {
  // TODO
// May be globals on the device, or across a mesh.
};

return b;
}();

},{"./blocks/colorStripBlock.js":16,"./blocks/flowBlocks.js":17,"./blocks/identityBlocks/identityAccelerometerBlock.js":19,"./blocks/identityBlocks/identityBlock.js":20,"./blocks/identityBlocks/identityButtonBlock.js":21,"./blocks/identityBlocks/identityTemperatureBlock.js":22,"./blocks/motorBlock.js":24,"./blocks/pictureBlock.js":25,"./blocks/printBlock.js":26,"./blocks/servoBlock.js":27,"./blocks/soundBlock.js":28,"./blocks/twoMotorBlock.js":29,"./blocks/variables/variableAddBlock.js":30,"./blocks/variables/variableSetBlock.js":31,"./blocks/waitBlock.js":32,"./log.js":38,"./svgbuilder.js":45}],37:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var app = require('./appMain.js');

// Determine if page launched in broswer, or cordova/phone-gap app.
app.isRegularBrowser =
  document.URL.indexOf('http://') >= 0 ||
  document.URL.indexOf('https://') >= -0;

if (!app.isRegularBrowser) {
  // Guess that it is Cordova then. Not intened to run directly from file:
  document.addEventListener('deviceready', app.start, false);
  var script = document.createElement('script');
  // Load cordova.js if not in regular browser, and then set up initialization.
  script.setAttribute('src','./cordova.js');
  document.head.appendChild(script);
} else {
  // If in regular broswer, call start directly.
  app.start();
}

},{"./appMain.js":14}],38:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {

  var log = {};

  log.trace = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('t:');
      console.log.apply(console, args);       // eslint-disable-line no-console
  };

  log.error = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('e:');
      console.log.apply(console, arguments);  // eslint-disable-line no-console
  };

  return log;
}();

},{}],39:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var log = require('./../log.js');
  var cxn = require('./../cxn.js');
  var ko = require('knockout');

  var cxnButton =  {};

  cxnButton.devices = ko.observableArray([]);
  cxnButton.deviceName = '-?-';

  cxnButton.onDeviceClick = function() {
    // Ah JavaScript... 'this' is NOT identityBlock.
    // It is the knockout item in the observable array.

    var newBotName = this.name;

    if (typeof name === 'string') {

      var currentBotName = cxnButton.deviceName;
      if (currentBotName !== newBotName) {
        // Find the current item, and mark it as unselected.
        var match = ko.utils.arrayFirst(cxnButton.devices(), function(item) {
          return (item().name === currentBotName);
        });
        if (match) {
          match().selected(false);
        }
        // Select the item that was clicked.
        this.selected(true);
      }
      // Move the selected name into the object.
      cxnButton.deviceName = newBotName;
      cxnButton.updateScreenName();
    }
  };

  cxnButton.updateScreenName = function() {
    var txt = document.getElementById('device-name-label');
    txt.innerHTML = "bot: " + cxnButton.deviceName;
  };

  // Initial settings for blocks of this type.
  cxnButton.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What triggers this chain, mouse click, button, message,...
        start:'click',
        // Device name
        deviceName:'-?-',
        // Connection mechanism
        bus:'ble',
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'target-bt',
      status:0,
    };
  };

  cxnButton.configuratorOpen = function(button, tbe) {
    if(document.getElementById('bot-search-overlay') !== null){
      return;
    }
    var div = document.createElement('div');
    div.innerHTML =
      `<div class='group-div'>
        <div class='list-box-shell'>
            <ul class='list-box' data-bind='foreach: devices'>
              <li data-bind= "css:{'list-item-selected':selected()}">
                <span data-bind= "text:name, click:$parent.onDeviceClick"></span>
              </li>
            </ul>
        </div>
        <button id='bt-scan' class='width-twothirds'>
        </button>
        <button class='width-third cxnButton-x' id="cxnButton-x">
          <i class="fa fa-times" class="svg-clear"></i>
        </button>

      </div>`;

    div.setAttribute('style', 'transition: all 0.2s ease;left: 600px; top:260px;position: absolute;width: 240px;transform: scale(3.5, 3.5);pointer-events: all;');
    div.setAttribute('class', 'block-config-form blockform');
    div.setAttribute('id', 'bot-search-overlay');

    //

    var tbeForms = document.getElementById('tbe-forms');
    tbeForms.appendChild(div);

    var xButton = document.getElementById('cxnButton-x');
    xButton.addEventListener('click', function(){
        cxnButton.configuratorClose(div);
    });

    // Connect the dataBinding.
    ko.applyBindings(cxnButton, div);

    cxnButton.scanButton = document.getElementById('bt-scan');
    cxnButton.scanButton.onclick = cxnButton.handleScanButton;

    // If currently connected then disconnect and let them choose the same again
    // or pick another.
    var currentBotName = cxnButton.deviceName;
    log.trace('currently connected to', currentBotName);
    /*
    var dev = cxn.devices[currentBotName];
    if (dev !== undefined) {
      var mac = cxn.devices[currentBotName].mac;
      log.trace('current mac', mac);
      cxn.disconnect(mac, currentBotName);
    }
    */
    if (!cxn.scanUsesHostDialog && !cxn.scannning) {
      // If scanning is unobtrusive, start it when the form is shown.
      cxnButton.toggleBtScan();
    } else {
      // Otherwise at least fix up the button label.
      cxnButton.configBtnScan(false);
    }
  };

  cxnButton.handleScanButton = function() {
    if(cxn.scanning){
      console.log('disconnect block');
      var currentBotName = cxnButton.deviceName;
      var dev = cxn.devices[currentBotName];
      if (dev !== undefined) {
        var mac = cxn.devices[currentBotName].mac;
        log.trace('disconnect from current mac', mac);
        cxn.disconnect(mac, currentBotName);
      }
    } else{
      console.log('go to toggleBtScan');
      cxnButton.toggleBtScan();
    }
  };

  // Turn on Scanning
  cxnButton.configBtnScan = function(scanning) {
    log.trace('config scaning button', scanning);
    var button= cxnButton.scanButton;
    if (scanning) {
      // Turn on scanning.
      button.innerHTML =
      "<span>Looking for bots <i class='fa fa-spinner fa-pulse fa-fw'></i></span>";
    } else {
      // Turn off back scanning
      button.innerHTML = "<span>Look for bots </span>";
    }
  };

  cxnButton.toggleBtScan = function() {
    if (cxn.scannning) {
      // Turn off back scanning
      cxn.stopScanning();
      cxnButton.watch.dispose();
      cxnButton.watch = null;
    } else {
      console.log('in theory start scanning');
      // Turn on scanning.
      // Set up a callback to get notified when when devices show up.
      cxnButton.refreshList(cxn.devices);
      cxnButton.watch = cxn.connectionChanged.subscribe(cxnButton.refreshList);
      cxn.startScanning();
    }
    cxnButton.configBtnScan(cxn.scanning);
  };

  // Update the list of devices in the configuration box
  cxnButton.refreshList = function (bots) {
    // TODO, might be able to use data binding to do this as well.
    cxnButton.devices.removeAll();
    for (var key in bots) {
      if (bots.hasOwnProperty(key)) {
        cxnButton.addItem(key);
      }
    }

    // If scanning has stopped update the button.
    if (!cxn.scanning) {
      cxnButton.configBtnScan(false);
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  cxnButton.configuratorClose = function(div) {
    // Stop looking for visible devices.

    if (cxn.scannning) {
      cxnButton.toggleBtScan();
    }
    ko.cleanNode(div);
    div.parentNode.removeChild(div);
  };

  cxnButton.addItem = function (botName) {
    var targetName = cxnButton.deviceName;
    var item = ko.observable({
      name: botName, //+ faBlueTooth,
      selected: ko.observable(botName === targetName)
    });
    cxnButton.devices.unshift(item);
  };

  return cxnButton;
}();

},{"./../cxn.js":34,"./../log.js":38,"knockout":8}],40:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// An overlay to see log messages and communications
// between the app and the robot.
module.exports = function () {
  var log = require('./../log.js');
  var cxn = require('./../cxn.js');
  var app = require('./../appMain.js');
  var debugMode = {};

  // External function for putting it all together.
  debugMode.start = function () {

    // Construct the DOM for the overlay.
    app.overlayDom.innerHTML = `
      <div id='debugOverlay' class ='fullScreenSlideIn'>
        <div id='debugLogBackground'>
          <i class='fa fa-times driver-x-debug' id="overlayExitButton" aria-hidden='true' horizontal-align='middle'></i>
          <div id='debugLog'></div>
        </div>
      </div>`;

    var exitButton = document.getElementById('overlayExitButton');
    exitButton.onclick = debugMode.exit;
    debugMode.logElement = document.getElementById('debugLog');

    // Start update function.
    debugMode.updateDebug();
    log.trace('> Hello');
  };

  // Add a messge to the log.
  debugMode.log = function (text) {
    debugMode.logElement.innerHTML += text;
    // TODO need way to trim buffer to a max size (10K??)
    log.trace('> Hello');
  };

  // Update the list of messages show in the display.
  debugMode.updateDebug = function() {

    // Erase old text.
    // debugMode.logElement.innerHTML = '';
    // Replace contents with existing list of messages.
    for(var i = 0; i < cxn.messages.length; i++) {
      debugMode.log(cxn.messages[i] + '\n');
    }

    // Prime the timer again.
    debugMode.timer = setTimeout(function() { debugMode.updateDebug(); }, 2000);
  };

  // Close the overlay.
  debugMode.exit = function() {

    clearTimeout(debugMode.timer);
    var overlay = document.getElementById('debugOverlay');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }

    // For now, leave the element there until the next overlay replaces it.
    // app.overlayDom.innerHTML = '';
  };

  return debugMode;
}();

},{"./../appMain.js":14,"./../cxn.js":34,"./../log.js":38}],41:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){
  var log = require('./../log.js');
  var interact = require('interact.js');
  var conductor = require('./../conductor.js');
  var app = require('./../appMain.js');
  var cxn = require('./../cxn.js');
  var driveMode = {};

  driveMode.pastRight = 0;
  driveMode.pastLeft = 0;

  driveMode.start = function() {
    driveMode.activeDivice = driveMode.findConnectedDevice();
    driveMode.buildSlider(app.overlayDom);
    driveMode.updateSlider();
  };

  driveMode.buildSlider = function() {
    // TODO need to upate value as they change
    app.overlayDom.innerHTML = `
    <div id='driverBackground' class='fullScreenSlideIn'>
      <div class='slider sliderRight' data-value='0'></div>
      <div class='slider sliderLeft' data-value='0'></div>
      <div id='drive-diagnostics' class='drive-diagnostics'>
        <!--h1 class='connected-brick svg-clear'>Connected Bot: -?-</h1>
        <h1 class="drive-accelerometer svg-clear">Accelerometer: 100</h1>
        <h1 class="drive-compass svg-clear">Compass: 100</h1>
        <h1 class="drive-temperature svg-clear">Temperature: 100</h1>
        <h1 class="drive-encoderL svg-clear">Left Encoder: 100</h1>
        <h1 class="drive-encoderR svg-clear">Right Encoder: 100</h1-->
      </div>
      <div id='exitGroup' class ='exitGroup'>
        <div id='driver-exit' class ='driver-exit'>
          <i class='fa fa-times driver-x svg-clear' aria-hidden='true'></i>
        </div>
      </div>
      <!--div id='stopGroup' class='stopGroup'>
        <div id='driver-stop' class='driver-stop' text-anchor='middle'>
          <i class='fa fa-stop driver-stop-icon svg-clear' aria-hidden='true'></i>
        </div>
      </div-->
    </div>
    `;

    var exitButton = document.getElementById('exitGroup');
    exitButton.onclick = driveMode.exit;

    // TODO connect the stop button
    driveMode.sliderInteract('slider');
  };

  driveMode.findConnectedDevice = function() {
    var botName = null;
    app.tbe.forEachDiagramBlock( function(block){
      if (block.name === 'identity'){
        botName = block.controllerSettings.data.deviceName;
        var status = cxn.connectionStatus(botName);
        if (status !== cxn.statusEnum.CONNECTED) {
          botName = null;
        }
      }
    });
    return botName;
  };

  driveMode.sliderInteract = function sliderInteract(eltClass) {
    interact('.' + eltClass)              // target the matches of that selector
      .origin('self')                     // (0, 0) will be the element's top-left
      .restrict({drag: 'self'})           // keep the drag within the element
      .inertia(true)                      // start inertial movement if thrown
      .draggable({                        // make the element fire drag events
        max: Infinity                     // allow drags on multiple elements
      })
      .on('dragmove', function (event) {  // call this function on every move
        var sliderHeight = interact.getElementRect(event.target).height,
            value = event.pageY / sliderHeight;

        event.target.style.paddingTop = (value * 7) + 'em';
        var display = (100 - Math.round((value.toFixed(3)*200)));
        event.target.setAttribute('data-value', display);
        if(event.target.classList.contains('sliderRight')) {
          driveMode.displayRight = display;
        } else if (event.target.classList.contains('sliderLeft')) {
          driveMode.displayLeft = display;
        }
      })
    .on('dragend', function(event){
      event.target.style.paddingTop = (0.5 * 7) + 'em';
      event.target.setAttribute('data-value', 0);
      if(event.target.classList.contains('sliderRight')) {
        driveMode.displayRight = 0;
      } else if (event.target.classList.contains('sliderLeft')) {
        driveMode.displayLeft = 0;
      }
    });
    interact(".stopGroup")
      .on('tap', function(){
        var sliders = document.getElementsByClassName('slider');
        sliders[0].style.paddingTop = (0.5 * 7) + 'em';
        sliders[0].setAttribute('data-value', 0);
        sliders[1].style.paddingTop = (0.5 * 7) + 'em';
        sliders[1].setAttribute('data-value', 0);
        driveMode.displayRight = 0;
        driveMode.displayLeft = 0;
      });
    interact.maxInteractions(Infinity);   // Allow multiple interactions
  };

  driveMode.updateSlider = function() {
    var id = driveMode.activeDivice;
    log.trace('updTE', id);
    //var changed = driveMode.displayLeft !== driveMode.pastLeft || driveMode.displayRight !== driveMode.pastRight;
    if (id !== null && id !== '-?-') {
      if (driveMode.displayLeft !== undefined && driveMode.displayLeft !== driveMode.pastLeft) {
        var message2 = '(m:1 d:' + driveMode.displayLeft + ');';
        conductor.cxn.write(id, message2);
      }
      if (driveMode.displayRight !== undefined && driveMode.displayRight !== driveMode.pastRight) {
        var message1 = '(m:2 d:' + driveMode.displayRight + ');';
        conductor.cxn.write(id, message1);
      }

      driveMode.pastRight = driveMode.displayRight;
      driveMode.pastLeft = driveMode.displayLeft;
    }
/*
    var accel = document.getElementsByClassName("drive-accelerometer")[0];
    accel.innerHTML = "Accelerometer:" + cxn.accelerometer;

    var compass = document.getElementsByClassName("drive-compass")[0];
    compass.innerHTML = "Compass:" + cxn.compass;

    var temp = document.getElementsByClassName("drive-temperature")[0];
    temp.innerHTML = "Temperature:" + cxn.temp;
*/
    driveMode.timer = setTimeout( function() {
      driveMode.updateSlider();
    }
    , 500);
  };

  // Close the driveMode overlay.
  driveMode.exit = function() {
    clearTimeout(driveMode.timer);

    var overlay = document.getElementById('driverBackground');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }
    // TODO Remove content after it is off the screen.
    //  app.overlayDom.innerHTML = '';

    // Why load docA ?, it will still be there.
    // TODO add animations
    //app.tbe.loadDoc('docA');
  };

  return driveMode;
}();

},{"./../appMain.js":14,"./../conductor.js":33,"./../cxn.js":34,"./../log.js":38,"interact.js":7}],42:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// An overlay to see access saved and sample programs
/* Theory of operation
  I core challenge is how to come up with simple/meaningful identifers for the
  many programs authored. The programs are pictures so the first approximation
  is to use picture.

  Hypothesis - programs come in two comon forms:
  >  adhoc, simple demos, easy to remake, standalone
  >  more thoght out parts for a bigger plan.

  For the adhoc simple test, the ide is to treat these a bit more like
  photographs. There is no for a name. The program its self is the identifier
  If a user can thumb through recent programs that is simple than having to make
  up a name for each one. Most programs.



  For the work sheet. Two key operation
  <new> save the current one and show a new sheet.
  <clear> wipe the current workspace.
  <snapshot> take a picture of the current work and let me continue woring.
   this fit the photograph model.

  <record> future perhasp alwasy on, let you roll back any time you want.
*/
module.exports = function () {

  var fileOverlay = {};
  var app = require('./../appMain.js');

  fileOverlay.saveCamera = document.getElementById('saveCamera');

  // External function for putting it all together.
  fileOverlay.start = function () {

    // Construct the DOM for the overlay.
    app.overlayDom.innerHTML = `
      <div id='fileOverlay' class ='fullScreenSlideIn'>
        <div id='overlayExitButton'>
          <i class='fa fa-times driver-x-debug svg-clear' aria-hidden='true'></i>
        </div>
        <div id='debugLogBackground'>
          <div id='debugLog'></div>
        </div>
      </div>`;

    var exitButton = document.getElementById('overlayExitButton');
    exitButton.onclick = fileOverlay.exit;
  };

  // Close the overlay.
  fileOverlay.exit = function() {
    var overlay = document.getElementById('fileOverlay');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }

    // For now, leave the element there until the next overlay replaces it.
    // app.overlayDom.innerHTML = '';
  };

  // Get an canvas image of the curret screen.
  // TODO save in medium size perahsp 1/4 scale, for a regualr screen that is
  // 1/16 the storeac, then show smaller thumb nails. on hover the thumb nail
  // can be magnified.

  fileOverlay.saveFile = function(fileName, content) {
    app.storage.setItem(fileName, content);
  };

  fileOverlay.loadFile = function(fileName) {
    return app.storage.getItem(fileName);
  };

  fileOverlay.mockLocalStorage = {
    getItem: function (key) {
      return null;
    },
    setItem: function (key, value) {
    },
    key: function(index) {
      return null;
    }
  };

  fileOverlay.localStorage = function() {
    if (typeof window.localStorage !== 'undefined') {
      // if localStoarge exists then use it directly.
      return window.localStorage;
    } else {
      return fileOverlay.mockLocalStorage;
    }
  };

  fileOverlay.cameraFlash = function() {
    fileOverlay.saveCamera.className = 'cameraFlash';
    setTimeout(function() {
      fileOverlay.saveCamera.className = 'cameraIdle';
      }, 1000);

      // add picture, animate to folder
  };

  fileOverlay.snapShot = function() {

    // Create a SVG string by joining the serialized form with a header.

  };

  return fileOverlay;
}();

},{"./../appMain.js":14}],43:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function(){

  var settings = {};

  settings.applyBackground = function(overlayDom) {

    // Can one div hold all parts? why insert all individually in the overlay?
    // this will simplifiy cleanup.
    var div = document.createElement('div');
    div.setAttribute('class', 'debugBackground');
    div.setAttribute('id', 'debugBackground');

    overlayDom.appendChild(div);

    var exitGroup = document.createElement('div');
    exitGroup.setAttribute('class', 'debugExitGroup');
    exitGroup.setAttribute('id', 'debugExitGroup');

    var exit = document.createElement('div');
    exit.setAttribute('class', 'debug-exit');
    exit.setAttribute('id', 'debug-exit');

    exitGroup.onclick = settings.exit;
    exitGroup.appendChild(exit);
    exitGroup.innerHTML += `<i class="fa fa-times driver-x-debug svg-clear" aria-hidden="true"></i>`;
    overlayDom.appendChild(exitGroup);

    div = document.createElement('div');
    div.setAttribute('id', 'debugWindow');
    div.setAttribute('class', 'debugWindow');
    div.innerHTML = `
      <div class="debug-log" id="debug-log"></div>
    `;
    overlayDom.appendChild(div);
  };

  settings.startOverlay = function(overlayDom){
    settings.applyBackground(overlayDom);
  };

  settings.exit = function() {
    // Can this just be GC'd by javascript.
    var back = document.getElementById('debugBackground');
    back.parentNode.removeChild(back);

    var exit = document.getElementById('debugExitGroup');
    exit.parentNode.removeChild(exit);

    var debugConsole = document.getElementById('debugWindow');
    debugConsole.parentNode.removeChild(debugConsole);
  };

  return settings;
}();

},{}],44:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){

  var splashOverlay = {};
  var app = require('./../appMain.js');
  // External function for putting it all together.
  splashOverlay.start = function () {

    // Construct the DOM for the overlay.
    // TODO Add a method to app for showing overlays.
    app.overlayDom.innerHTML = `
    <div id='overlayFrame' class='fullScreenSlideIn'>
      <div id='splashOverlay'>
      <p class='splashTitle'>Teak blocks<p>
      <p class='splashBody'>A block sequencing tool for simple programs.<p>
      <p class='splashBody'> This site uses cookies and local storage to maintain your settings.<p>
      <p class='splashBody'> © 2017 Paul Austin and Sidharth Srinivasan. All rights reserved.<p>
      <br>
      <div class='margin:20'>
        <button id='clearAllBlocksButton' type='button'>Start clean!</button>
        <button id='clearAllBlocksButton' type='button'>Close</button>
      </div>
      <br>
      <div>
        <label class='splashBody'>
        <input checked='true' id='noLaunchSplash' type='checkbox'>
        <span class='label-text'> Show this box at launch. </span>
        </label>
      <div>
      </div>
    </div>`;
    var exitButton = document.getElementById('splashOverlay');
    // TODO add exit button.
    exitButton.onclick = splashOverlay.exit;

    // Get the clear button and clear the blocks if it is pressed.
    var clearAllButton = document.getElementById('clearAllBlocksButton');
    clearAllButton.onclick = app.tbe.clearAllBlocks;
  };

  splashOverlay.showLaunchAboutBox = function() {
    var value = app.storage.getItem('teakBlockShowAboutBox');
    return (value === null) || (value === true);
  };

  splashOverlay.exit = function (event) {
    // Get the checkbox and its label text
    var labelText = document.getElementsByClassName('label-text');
    var checkbox = document.getElementById('noLaunchSplash');

    // TODO should be done by application class.
    var overlay = document.getElementById('overlayFrame');

    // Check if the spot clicked on is not the checkbox or its label
    if (overlay !== null && event.target !== checkbox && event.target !== labelText[0]) {
      overlay.className = 'fullScreenSlideOut';

      // If the checkbox is checked, should store into local memory
      if(!checkbox.checked){
        app.storage.setItem('teakBlockShowAboutBox', false);
      }
    }
  };

  return splashOverlay;
}();

},{"./../appMain.js":14}],45:[function(require,module,exports){
/*
Copyright (c) 2016 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** @module svgBuilder */

module.exports = function () {

  /** @class svgBuilder */
var svgBuilder = {};
svgBuilder.ns = 'http://www.w3.org/2000/svg';
svgBuilder.xlinkns = 'http://www.w3.org/1999/xlink';

/**
 * A class for building SVG path descriptions
 */
/** @summary  pathBuilder */
svgBuilder.pathBuilder = {
  //* relative pen relocation with no drawing
  move: function (dx, dy) {
    return 'm' + dx + ' ' + dy + ' ';
  },
  //* realtive horizontal line
  hline: function (dx) {
    return 'h' + dx + ' ';
  },
  //* relative vertical line
  vline: function (dy) {
    return 'v' + dy + ' ';
  },
  //* relative straight line
  line: function (dx, dy) {
    return 'l' + dx + ' ' + dy + ' ';
  },
  //* arc path element
  arc: function (radius, degrees, large, sweep, dx, dy) {
    var text = 'a' + radius + ' ' + radius + ' ' + degrees;
    text += ' ' + large + ' ' + sweep + ' ' + dx + ' ' + dy + ' ';
    return text;
  },
  //* path closing
  close: function () {
    return 'z ';
  }
};


/** @function */
svgBuilder.createUse = function createSymbolUse(elementClass, symbolName) {
  var elt  = document.createElementNS(svgBuilder.ns, 'use');
  elt.setAttribute('class', elementClass);
  elt.setAttributeNS(svgBuilder.xlinkns, 'xlink:href', symbolName);
  return elt;
};

svgBuilder.resizeRect = function resizeRect(elt, w, h) {
  elt.setAttribute('width', String(w) + 'px');
  elt.setAttribute('height', String(h) + 'px');
};

svgBuilder.translateXY = function translateXY(elt, x, y) {
  elt.setAttribute('transform', 'translate (' +  String(x) + ' ' + String(y) + ')');
};

svgBuilder.createRect = function createRect(elementClass, x, y, w, h, rxy) {
  var elt  = document.createElementNS(svgBuilder.ns, 'rect');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('x', x);
  elt.setAttribute('y', y);
  this.resizeRect(elt, w, h);
  if (rxy !== undefined) {
    elt.setAttribute('rx', rxy);
    elt.setAttribute('ry', rxy);
  }
  return elt;
};

svgBuilder.createCircle = function creatCircle(elementClass, cx, cy, r) {
  var elt  = document.createElementNS(svgBuilder.ns, 'circle');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('cx', cx);
  elt.setAttribute('cy', cy);
  elt.setAttribute('r', r);
  return elt;
};

svgBuilder.createGroup = function createGroup(elementClass, x, y) {
  var elt  = document.createElementNS(svgBuilder.ns, 'g');
  elt.setAttribute('class', elementClass);
  elt.setAttribute ('transform', 'translate (' + x + ' ' + y + ')');
  return elt;
};

svgBuilder.createText = function createText(elementClass, x, y, text) {
  var elt  = document.createElementNS(svgBuilder.ns, 'text');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('x', x);
  elt.setAttribute('y', y);
  elt.textContent = text;
  return elt;
};

svgBuilder.createPath = function createText(elementClass, pathData) {
  var elt = document.createElementNS(svgBuilder.ns, 'path');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('d', pathData);
  return elt;
};

return svgBuilder;
}();

},{}],46:[function(require,module,exports){
/*
Copyright (c) 2016 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var teakForm = {};

  // Only one form should be showing, and none to start with.
  teakForm.openForm = null;

  // Toggle the position of a form. Since they are actually all
  // stacked but with different transform locations, it is necessary
  // to toggle pointerEvents, otherwise the top one eats them all.
  teakForm.showHide = function showHide(component) {
    var tform = document.getElementById(component.domId);
    // See what the current state is.
    var opened = tform.getAttribute('opened');
    if (opened === 'false') {
      this.hideOpenForm();
      opened = 'true';
      tform.style.pointerEvents = 'all';
      tform.classList.remove('closed');
      tform.classList.add('opened');
      teakForm.openForm = component;
    } else {
      opened = 'false';
      tform.style.pointerEvents = 'none';
      tform.classList.remove('opened');
      tform.classList.add('closed');
      teakForm.openForm = null;
    }
    if (tform.showHide !== undefined) {
      tform.showHide(opened === 'true');
    }
    if (typeof component.onShowHide === 'function') {
      component.onShowHide(opened === 'true');
    }
    tform.setAttribute('opened', opened);
  };

  teakForm.hideOpenForm = function hideOpenForm() {
    if (teakForm.openForm !== null) {
      teakForm.showHide(teakForm.openForm);
    }
  };

  return teakForm;
}();

},{}],47:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {

var log = require('./log.js');
var assert = require('assert');
var interact = require('interact.js');
var tf = require('./teak-forms.js');
var teakText = require('./teaktext.js');
var svgb = require('./svgbuilder.js');
var trashBlocks = require('./trashBlocks.js');
var fblocks = require('./fblock-settings.js');
var teakselection = require('./teakselection');
var actionButtons = require('./actionButtons.js');
var defaultFiles = require('./defaultFiles.js');
var conductor = require('./conductor.js');
var app = require('./appMain.js');
var cxnButton = require('./overlays/cxnButton.js');

var tbe = {};

tbe.fblocks = fblocks;
tbe.diagramBlocks = {};
tbe.paletteBlocks = {};
tbe.blockIdSequence = 100;
tbe.currentDoc = 'docA';
tbe.undoArray = [];
tbe.currentUndoIndex = 0;
tbe.stopUndo = false;
tbe.actionButtons = null;
tbe.draggingSelectionArea = null;
tbe.defaultBlockLoc = [80, 240];

// Visitor for each block in the diagram
tbe.forEachDiagramBlock = function (callBack) {
  for (var key in tbe.diagramBlocks) {
    if (tbe.diagramBlocks.hasOwnProperty(key)) {
      var block = tbe.diagramBlocks[key];
      if (typeof block === 'object') {
        callBack(block);
      }
    }
  }
};

// Visitor for each block in the palette
tbe.forEachPalette = function (callBack) {
  for (var key in tbe.paletteBlocks) {
    if (tbe.paletteBlocks.hasOwnProperty(key)) {
      var block = tbe.paletteBlocks[key];
      if (typeof block === 'object') {
        callBack(block);
      }
    }
  }
};

// Visitor that finds the head of each chain.
tbe.forEachDiagramChain = function (callBack) {
  tbe.forEachDiagramBlock(function(block) {
    if (block.prev === null) {
      callBack(block);
    }
  });
};

// Clear any semi modal state
tbe.clearStates = function clearStates(block) {
  // Clear any showing forms or multi step state.
  // If the user has interacted with a general part of the editor.
  tf.hideOpenForm();
  this.components.blockSettings.hide(block);
  tbe.forEachDiagramBlock( function(b) { b.markSelected(false); });
  actionButtons.addActionButtons(tbe.actionButtons, tbe);
};

tbe.init = function init(svg) {
  this.svg = svg;
  this.background = svgb.createRect('editor-background', 0, 0, 20, 20, 0);
  this.svg.appendChild(this.background);
  this.configInteractions();
  interact.maxInteractions(Infinity);
  this.initPaletteBox();
  var files = ['docA', 'docB', 'docC', 'docD', 'docE'];
  defaultFiles.default(files);
  var loadedDocText = app.fileOverlay.loadFile('docA');
  if (loadedDocText !== null) {
    teakText.textToBlocks(tbe, loadedDocText);
  }

  teakselection.init(tbe);
  tbe.svg.onmousemove = function() {
    for(var i = 0; i < tbe.actionButtons.length; i++) {
      if (tbe.actionButtons[i].svgCircle.classList.contains('switch-bg')) {
        tbe.actionButtons[i].svgCircle.classList.remove('switch-bg');
      }
    }
  };

  return this;
};

tbe.elementToBlock = function(el) {
    var text = el.getAttribute('interact-id');
    if (text === null) {
      log.trace('svg elt had no id:', el);
      return null;
    }
    var values = text.split(':');
    var obj = null;
    if (values[0] === 'd') {
      obj = this.diagramBlocks[text];
    } else if (values[0] === 'p') {
      obj = this.paletteBlocks[text];
    }
    if (obj === undefined) {
      obj = null;
    }
    if (obj === null)  {
      log.trace('block not found, id was <', text, '>');
    }
    return obj;
};

tbe.clearAllBlocks = function() {
  tbe.clearStates();
  trashBlocks(tbe);
};

tbe.saveCurrentDoc = function() {
  var currentDocText = teakText.blocksToText(tbe.forEachDiagramChain);
  app.fileOverlay.saveFile(tbe.currentDoc, currentDocText);
};

tbe.loadDoc = function(docName) {

  tbe.undoArray = {}; // When we switch documents we want to clear undo history.
  tbe.undoTransactionIndex = 0;

  // First, save the current document if actually a doc.
  if (tbe.currentDoc !== 'driveMode') {
    tbe.saveCurrentDoc();
  }

  // Second if they are actully switching then load the new one.
  if (tbe.currentDoc !== docName) {
    tbe.clearStates();
    tbe.clearDiagramBlocks();
    tbe.currentDoc = docName;
    var loadedDocText = app.fileOverlay.loadFile(docName);

    if (loadedDocText !== null) {
      teakText.textToBlocks(tbe, loadedDocText);
    }
  }
};

tbe.openConnectionMenu = function(button) {
  cxnButton.configuratorOpen(button, tbe);
};

tbe.nextBlockId = function(prefix) {
  var blockId = prefix + String(tbe.blockIdSequence);
  tbe.blockIdSequence += 1;
  return blockId;
};

tbe.addBlock = function(x, y, name) {
   var block = new this.FunctionBlock(x, y, name);
   block.isPaletteBlock = false;
   block.interactId = tbe.nextBlockId('d:');
   this.diagramBlocks[block.interactId] = block;
   return block;
};

tbe.addPaletteBlock = function(x, y, name) {
   var block = new this.FunctionBlock(x, y, name);
   block.isPaletteBlock = true;
   block.interactId = tbe.nextBlockId('p:');
   this.paletteBlocks[block.interactId] = block;
   return block;
};

// Delete a chunk of blocks (typically one).
tbe.deleteChunk = function(block, endBlock) {


  // Remember any tail so it can be slid over.
  var tail = endBlock.next;

  // Disconnect the chunk from its surroundings.
  if (block.prev !== null) {
    block.prev.next = endBlock.next;
  }
  if (endBlock.next !== null) {
    endBlock.next.prev = block.prev;
  }
  block.prev = null;
  endBlock.next = null;

  // Now that the chunk has been disconnected, measure it.
  var deleteWidth = block.chainWidth;
  var tempBlock = null;

  if ((block.flowTail === endBlock) && (!block.isGroupSelected())) {
    tbe.clearStates();
    if (block.prev !== null) {
      block.next.prev = block.prev;
    } else {
      block.next.prev = null;
    }
    block.next = null;

    if (endBlock.next !== null) {
      endBlock.prev.next = endBlock.next;
    } else {
      endBlock.prev.next = null;
    }
    endBlock.prev = null;

    delete tbe.diagramBlocks[block.interactId];

    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;

    delete tbe.diagramBlocks[endBlock.interactId];

    tbe.svg.removeChild(endBlock.svgGroup);
    endBlock.svgGroup = null;
    endBlock.svgRect = null;
    endBlock.next = null;
    endBlock.prev = null;
  } else {
    // Delete the chunk.
    tbe.clearStates();

    while(block !== null) {
      tempBlock = block.next; // Make a copy of block.next before it becomes null
      // Remove map entry for the block.
      delete tbe.diagramBlocks[block.interactId];

      tbe.svg.removeChild(block.svgGroup);
      block.svgGroup = null;
      block.svgRect = null;
      block.next = null;
      block.prev = null;

      block = tempBlock;
    }
  }

  // Slide any remaining blocks over to the left.
  // The links have already been fixed.
  if (tail !== null) {
    tbe.animateMove(tail, tail.last, -deleteWidth, 0, 10);
  }
};

// Copy a chunk or the rest of the chain, and return the copy.
// The section specified should not have links to parts outside.
tbe.replicateChunk = function(chain, endBlock) {

  this.clearStates(); //???

  var stopPoint = null;
  if (endBlock !== undefined && endBlock !== null) {
    // This might be null as well.
    stopPoint = endBlock.next;
  }

  var newChain = null;
  var newBlock = null;
  var b = null;

  // Copy the chain of blocks and set the newBlock field.
  b = chain;
  while (b !== stopPoint) {
    newBlock = new this.FunctionBlock(b.left, b.top, b.name);
    b.newBlock = newBlock;
    if (newChain === null) {
      newChain = newBlock;
    }

    // TODO can params and controller settings be combined?
    //newBlock.params = JSON.parse(JSON.stringify(b.params));
    newBlock.controllerSettings = JSON.parse(JSON.stringify(b.controllerSettings));
    newBlock.isPaletteBlock = false;
    newBlock.interactId = tbe.nextBlockId('d:');
    this.diagramBlocks[newBlock.interactId] = newBlock;
    b = b.next;
  }
  // Fix up pointers in the new chain.
  b = chain;
  while (b !== stopPoint) {
    newBlock = b.newBlock;
    newBlock.next = b.mapToNewBlock(b.next);
    newBlock.prev = b.mapToNewBlock(b.prev);
    newBlock.flowHead = b.mapToNewBlock(b.flowHead);
    newBlock.flowTail = b.mapToNewBlock(b.flowTail);
    b = b.next;
  }
  // Clear out the newBlock field, and fix up svg as needed.
  b = chain;
  while (b !== stopPoint) {
    var temp = b.newBlock;
    b.newBlock = null;
    b = b.next;
    temp.fixupChainCrossBlockSvg();
  }

  // Update images in the new chain.
  b = newChain;
  while (b !== null) {
    b.updateSvg();
    b = b.next;
  }

  // Return pointer to head of new chain.
  return newChain;
};

//------------------------------------------------------------------------------
// FunctionBlock -- Constructor for FunctionBlock object.
//
//      *-- svgGroup
//        |
//        *--- custom graphics for bloc (clear to pointer)
//        |
//        *--- svgRect framing rec common to all blocks
//        |
//        *--- [svgCrossBlock] option behind block region graphics
//
tbe.FunctionBlock = function FunctionBlock (x, y, blockName) {

  // Connect the generic block class to the behavior definition class.
  this.name = blockName;
  this.funcs = fblocks.bind(blockName);
  if (typeof this.funcs.defaultSettings === 'function' ) {
    this.controllerSettings = this.funcs.defaultSettings();
  } else {
    this.controllerSettings = {controller:'none', data:4 };
  }

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;
  this.flowHead = null;
  this.flowTail = null;

  // Blocks at the top level have a nesting of 0.
  this.nesting = 0;
  this.newBlock = null;

  // Dragging state information.
  this.dragging = false;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.snapOpen = {         // Object for snapping to the grid
    top: null,
    left: null
  };
  this.snapAction = null;   // append, prepend, replace, ...
  this.targetShadow = null; // Svg element to hilite target location

  // Create the actual SVG object.
  // It's a group of two pieces:
  // a rounded rect and a group that holds the custom graphics for the block.
  let width = this.controllerSettings.width;
  if (width === undefined) {
    width = 80;
  }
  this.rect  = {
      left:   0,
      top:    0,
      right:  width,
      bottom: 80,
  };
  this.svgGroup = svgb.createGroup('drag-group', 0, 0);
  this.svgRect = svgb.createRect('function-block', 0, 0, width, 80, 10);
  if(blockName.startsWith('identity')){
    this.svgRect.setAttribute('class', 'function-block identity-block');
  }
  this.svgGroup.appendChild(this.svgRect);
  this.svgCustomGroup = null; // see updateSvg()
  this.updateSvg();

  // Position block, relative to its initial location at (0, 0).
  this.dmove(x, y, true);

  // Add block to the editor tree. This makes it visible.
  tbe.svg.appendChild(this.svgGroup);
};

// Create an image for the block base on its type.
tbe.FunctionBlock.prototype.updateSvg = function() {

  // Remove the old custom image if they exist.
  if (this.svgCustomGroup !== null) {
    this.svgGroup.removeChild(this.svgCustomGroup);
  }

  // Build custom image for this block.
  this.svgCustomGroup = svgb.createGroup('', 0, 0);
  if (typeof this.funcs.svg === 'function' ) {
    this.funcs.svg(this.svgCustomGroup, this);
  }

  // Add it to doc's SVG tree.
  this.svgGroup.appendChild(this.svgCustomGroup);
};

// Checks if block passed in is in the same chain as this.
tbe.FunctionBlock.prototype.chainContainsBlock = function(other) {
  // Block is the first block of the chain.
  var block = this.first;
  // Go through the whole chain and look for if any blocks same as other.
  while(block !== null) {
    // If a similarity is found, return true.
    if (block === other) {
      return true;
    }
    block = block.next;
  }
  // If no blocks that were the same were found, return false.
  return false;
};

tbe.FunctionBlock.prototype.refreshNesting = function() {
  var nesting = 0;
  var b = this.first;
  while (b !== null) {
    if (b.flowTail !== null) {
      b.nesting = nesting;
      nesting += 1;
    } else if (b.flowHead !== null) {
      nesting -= 1;
      b.nesting = nesting;
    } else {
      b.nesting = nesting;
    }
    b = b.next;
  }
};

// Scan down the chain and allow any block that has cross block graphics
// to update them.
tbe.FunctionBlock.prototype.fixupChainCrossBlockSvg = function() {
  // TODO, only refresh nesting when the links actually change.
  // no need to do it during each animation step.
  this.refreshNesting();
  var b = this;
  while (b !== null) {
    if (typeof b.funcs.crossBlockSvg === 'function' ) {
      b.funcs.crossBlockSvg(b);
    }
    b = b.next;
  }
};

Object.defineProperty(tbe.FunctionBlock.prototype, 'first', {
  get: function() {
    var block = this;
    while (block.prev !== null)  {
      block = block.prev;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'last', {
  get: function() {
    var block = this;
    while (block.next !== null)  {
      block = block.next;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'chainWidth', {
  get: function() {
    var block = this;
    var width = 0;
    while (block !== null)  {
      width  += block.rect.right - block.rect.left;
      block = block.next;
    }
    return width;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'top', {
  get: function() { return this.rect.top; }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'left', {
  get: function() { return this.rect.left; }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'bottom', {
  get: function() { return this.rect.bottom; }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'right', {
  get: function() { return this.rect.right; }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'width', {
  get: function() { return this.rect.right - this.rect.left; }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'height', {
  get: function() { return this.rect.bottom - this.rect.top; }});

// Example of an object property added with defineProperty with an accessor property descriptor
Object.defineProperty(tbe.FunctionBlock.prototype, 'interactId', {
  get: function() {
    return this.svgRect.getAttribute('interact-id');
  },
  set: function(id) {
    this.svgGroup.setAttribute('interact-id', id);
    this.svgRect.setAttribute('interact-id', id);
  },
});

// mapToNewBlock -- uUed by replicateChunk to fix up pointers in a
// copied chain.
tbe.FunctionBlock.prototype.mapToNewBlock = function (object) {
  if (object === undefined || object === null) {
    return null;
  } else {
    return object.newBlock;
  }
};

// Mark all block in the chain starting with 'this' block as being dragged.
// Disconnect from the previous part of the chain.
tbe.FunctionBlock.prototype.setDraggingState = function (state) {
  // If this block is in a chain, disconnect it from blocks in front.
  if (state && (this.prev !== null)) {
    this.prev.next = null;
    this.prev = null;
  }
  // Set the state of all blocks down the chain.
  var block = this;
  while (block !== null) {
    block.dragging = state;
  // block.hilite(state);
    block = block.next;
  }
};

tbe.FunctionBlock.prototype.markSelected = function(state) {
  if (state) {
    // TODO moving to the front interrupts (prevents) the animations.
    tbe.svg.removeChild(this.svgGroup);
    tbe.svg.appendChild(this.svgGroup);
    this.svgRect.classList.add('selectedBlock');
    if (this.flowHead !== null) {
      this.flowHead.svgRect.classList.add('selectedBlock');
    }
    if (this.flowTail !== null) {
      this.flowTail.svgRect.classList.add('selectedBlock');
    }
  } else {
    this.svgRect.classList.remove('selectedBlock');
  }
};

tbe.FunctionBlock.prototype.isSelected = function() {
  return this.svgRect.classList.contains('selectedBlock');
};

tbe.FunctionBlock.prototype.isLoopHead = function() {
  return (this.flowTail !== null);
};

tbe.FunctionBlock.prototype.isLoopTail = function() {
  return (this.flowHead !== null);
};

tbe.FunctionBlock.prototype.isCommented = function() {
  return (this.svgRect.classList.contains('commented'));
};

// Checks if a selected loop is the only thing selected.
tbe.FunctionBlock.prototype.isIsolatedLoop = function() {
  if (this.isLoopHead() && this.isSelected()) {
    if (this.prev !== null && this.prev.isSelected()) {
      return false;
    } else if (this.flowTail.next !== null && this.flowTail.next.isSelected()) {
      return false;
    } else if (this.next !== this.flowTail && this.next.isSelected()) {
      return false;
    }
  }
  if (this.isLoopTail() && this.isSelected()) {
    if (this.next !== null && this.next.isSelected()) {
      return false;
    } else if (this.flowHead.prev !== null && this.flowHead.prev.isSelected()) {
      return false;
    } else if (this.prev !== this.flowHead && this.prev.isSelected()) {
      return false;
    }
  }
  if (!this.isLoopHead() && !this.isLoopTail()) {
    return false;
  }
  if (!this.isSelected()) {
    return false;
  }
  return true;
};

tbe.FunctionBlock.prototype.isGroupSelected = function() {
  var before = false;
  var after = false;
  if (this.next !== null) {
    before = this.next.isSelected();
  }
  if (this.prev !== null) {
    after = this.prev.isSelected();
  }
  if (this.isSelected() && (before || after)) {
    return true;
  }
  return false;
};

tbe.FunctionBlock.prototype.isOnScreen = function() {
  if (this.rect !== null) {
    if (this.rect.left+this.width >= 0 && this.rect.right-this.width <= window.innerWidth) {
      if (this.rect.top+this.height >= 0 && this.rect.bottom-this.height <= window.innerHeight) {
        return true;
      }
    }
  }
  return false;
};

// Change the element class to trigger CSS changes.
tbe.FunctionBlock.prototype.hilite = function(state) {
  // TODO looks like there is more than one bring to front
  // unify the function and give it a better name.
  if (state) {
    // Bring highlighted block to top. Blocks don't normally
    // overlap, so z plane is not important. But blocks
    // that are being dragged need to float above ones on
    // the diagram.
    tbe.svg.appendChild(this.svgGroup);
  }
};

// Move a section of a chain by a delta (x, y) (from this to endBlock)
tbe.FunctionBlock.prototype.dmove = function (dx, dy, snapToInt, endBlock) {
  var block = this;
  if (endBlock === undefined) {
   endBlock = null;
  }

  while (block !== null) {
    var r = block.rect;
    r.left += dx;
    r.top += dy;
    r.right += dx;
    r.bottom += dy;
    if (snapToInt) {
      // Final locations are forced to integers for clean serialization.
      r.top = Math.round(r.top);
      r.left = Math.round(r.left);
      r.bottom = Math.round(r.bottom);
      r.right = Math.round(r.right);
    }

    if (block.svgGroup) {
      svgb.translateXY(block.svgGroup, r.left, r.top);
    }

    if (block === endBlock) {
      break;
    }
    block = block.next;
  }
};

//------------------------------------------------------------------------------
// Calculate the intersecting area of two rectangles.
tbe.intersectingArea = function intersectingArea(r1, r2) {
    var x = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
    if (x < 0 )
      return 0;
    var y = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
    if (y < 0) {
      return 0;
    }
    return x * y;
};

tbe.FunctionBlock.prototype.hilitePossibleTarget = function() {
  var self = this;
  var target = null;
  var overlap = 0;
  var bestOverlap = 0;
  var action = null;
  var rect = null;
  var thisWidth = this.width;

  // Look at every diagram block taking into consideration
  // whether or not it is in the chain.
  tbe.forEachDiagramBlock(function (entry) {
    if (entry !== self  && !entry.dragging) {
      rect = {
        top:    entry.top,
        bottom: entry.bottom,
        left:   entry.left - (thisWidth * 0.5),
        right:  entry.right - (thisWidth * 0.5),
      };
      if (entry.prev === null) {
        // For left edge, increase gravity field
        rect.left -= thisWidth * 0.5;
      }
      if (entry.next === null) {
        // For right edge, increase gravity field
        rect.right += thisWidth * 1.5;
      }

      overlap = tbe.intersectingArea(self.rect, rect);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        target = entry;
      }
    }
  });

  // Refine the action based on geometery.
  if (target !== null) {
    if (self.left <= (target.left)) {
      if (target.prev !== null) {
        action = 'insert';
      } else {
        action = 'prepend';
      }
    } else {
      action = 'append';
    }
  } else {
      action = 'outsnap';
      //target = 0;  //?
  }
  var gridsize = 40;
  var shadowX = Math.round(this.rect.top/gridsize)*gridsize;
  var shadowY = Math.round(this.rect.left/gridsize)*gridsize;

  // Update shadows as needed.
  if ((this.snapTarget !== target || this.snapAction !== action)) {
    if (this.snapTarget !== null) {
      this.removeTargetShadows();
    }
    this.snapTarget = target;
    this.snapAction = action;
    if (target !== null) {
      this.insertTargetShadows(target, action);
    }
  } else if (action === 'outsnap' && ((this.snapOpen.top !== shadowX || this.snapOpen.left !== shadowY) || this.snapAction !== action)) {
    this.removeTargetShadows();
    this.snapAction = action;
    this.snapOpen = {
      top: shadowX,
      left: shadowY
    };

    this.insertTargetShadows(this.snapOpen, action);
  }
  return target;
};

// Show the shadow blocks to indicate where the blocks will end up if placed
// in the current location.
tbe.FunctionBlock.prototype.insertTargetShadows = function(target, action) {
  var block = this;
  var y = target.top;
  var x = 0;
  if (action === 'prepend') {
    x = target.left - this.chainWidth;
  } else if (action === 'insert') {
    // The shadows will be covered up, and not going to move the
    // down stream blocks until the move is committed.
    // so offset them a bit.
    // TODO show above OR based on where dragging blocks are coming from.
    x = target.left - 20;
    y -= 25;
  } else if (action === 'append') {
    x = target.right;
  } else if (action === 'outsnap') {
    var gridsize = 40;
    x = gridsize*(Math.round(this.rect.left/gridsize));
    y = gridsize*(Math.round(this.rect.top/gridsize));
  } else {
    return;
  }
  var shadow = null;
  while (block !== null) {
    if (action === 'outsnap') {
      shadow = svgb.createRect('shadow-block shadow-block-outsnap', x, y, block.width, block.height, 10);
    } else {
      shadow = svgb.createRect('shadow-block', x, y, block.width, block.height, 10);
    }
    tbe.svg.insertBefore(shadow, tbe.background.nextSibling);
    block.targetShadow = shadow;
    x += block.width;
    block = block.next;
  }
};

tbe.FunctionBlock.prototype.removeTargetShadows = function() {
  var block = this;
  var shadowsToRemove = [];
  while (block !== null) {
    var shadow = block.targetShadow;
    if (shadow !== null) {
      shadowsToRemove.push(shadow);
      if (block.snapAction === 'outsnap') {
        shadow.setAttribute('class', 'shadow-block-leave shadow-block-leave-outsnap');
      } else {
        shadow.setAttribute('class', 'shadow-block-leave');
      }
      block.targetShadow = null;
    }
    block = block.next;
  }
  // Give some time for the animation to complete, then remove.
  setTimeout(function() {
    shadowsToRemove.forEach( function(elt) {
      if (elt.parentNode !== null) {
        tbe.svg.removeChild(elt);
      }
      });
    },
    1000);
    var shadows = document.getElementsByClassName('shadow-block');
    for(var i = shadows.length - 1; i >= 0; i--) {
      shadows[i].parentNode.removeChild(shadows[i]);
    }
};

tbe.FunctionBlock.prototype.moveToPossibleTarget = function() {
  var thisLast = this.last;
  var targx = 0;
  var frameCount = 10;
  var dx = 0;
  var dy = 0;

  assert(this.prev === null);
  assert(thisLast.next === null);

  if (this.snapTarget !==  null && this.targetShadow !== null) {
    // TODO:assert that chain we have has clean prev/next links
    // Append/Prepend the block(chain) to the list
    if (this.snapAction === 'prepend') {
      assert(this.snapTarget.prev === null);
      targx =  this.snapTarget.left - this.chainWidth;
      thisLast.next = this.snapTarget;
      this.snapTarget.prev = thisLast;
    } else if (this.snapAction === 'append') {
      assert(this.snapTarget.next === null);
      targx =  this.snapTarget.right;
      this.prev = this.snapTarget;
      this.snapTarget.next = this;
      // slide down post blocks if insert
      // logically here, in annimation bellow
    } else if (this.snapAction === 'insert') {
      assert(this.snapTarget.prev !== null);
      targx =  this.snapTarget.left;
      // Determin space needed for new segment
      // before its spliced in.
      var width = this.chainWidth;

      thisLast.next = this.snapTarget;
      this.prev = this.snapTarget.prev;
      this.snapTarget.prev.next = this;
      this.snapTarget.prev = thisLast;

      // Set up animation to slide down old blocks.
      tbe.animateMove(this.snapTarget, this.snapTarget.last, width, 0, 10);
    }

    // Set up an animation to move the dragging blocks to new location.
    dx = targx - this.left;
    dy = this.snapTarget.top - this.top;
    // The model snaps directly to the target location
    // but the view eases to it.
    tbe.animateMove(this, thisLast, dx, dy, 10);
  } else if (this.snapOpen !== null) {
    dx = Math.round(this.snapOpen.left - this.rect.left);
    dy = Math.round(this.snapOpen.top - this.rect.top);
    tbe.animateMove(this, thisLast, dx, dy, 10);
  } else {
    // Nothing to snap to so leave it where is ended up.
    // still need sound though
    // tbe.audio.drop.play();
  }
  this.hilite(false);
  this.snapTarget = null;
  this.snapAction = null;
  this.snapOpen = {
    top: null,
    left: null
  };
};

// animateMove -- move a chunk of block to its new location. The prev and next
// links should already be set up for the final location.
tbe.animateMove = function (firstBlock, lastBlock, dx, dy, frames) {
  var state = {
    frame: frames,
    adx: dx / frames,
    ady: dy / frames,
    chunkStart: firstBlock,
    chunkEnd: lastBlock
  };
  tbe.animateMoveCore(state);
};

tbe.animateMoveCore = function (state) {
  var frame = state.frame;
  state.chunkStart.dmove(state.adx, state.ady, (frame === 1), state.chunkEnd);
  state.chunkStart.fixupChainCrossBlockSvg();
  if (frame > 1) {
    state.frame = frame - 1;
    requestAnimationFrame(function() { tbe.animateMoveCore(state); });
  } else {
    // Once animation is over shadows are covered, remove them.
    tbe.audio.playSound(tbe.audio.shortClick);
    state.chunkStart.removeTargetShadows();
  }
};

tbe.clearDiagramBlocks = function clearDiagramBlocks() {
  tbe.internalClearDiagramBlocks();
  tbe.diagramChanged();
};
tbe.internalClearDiagramBlocks = function clearDiagramBlocks() {
  tbe.forEachDiagramBlock(function (block) {
    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgCustomGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;
  });
  tbe.diagramBlocks = {};
};

// Starting at a block that was clicked on find the logical range that
// should be selected, typically that is the selected block to the end.
// But for flow blocks it more subtle.
tbe.findChunkStart = function findChunkStart(clickedBlock) {
  var chunkStart = clickedBlock;
  while(chunkStart.isSelected()) {
    if (chunkStart.prev !== null && chunkStart.prev.isSelected()) {
      chunkStart = chunkStart.prev;
    } else {
      break;
    }
  }
  // Scan to end see if a flow tail is found.
  /*var b = chunkStart;
  while (b !== null) {
    // If tail found inlcude the whole flow block.
    if (b.flowHead !== null) {
      chunkStart = b.flowHead;
    }
    // If at the top its a clean place to break the chain.
    if (b.nesting === 0) {
      break;
    }
    b = b.next;
  }*/
  return chunkStart;
};
// Finds the block before where a block can be placed (end of chain)
// Used when block is dropped by tapping on palette
tbe.findInsertionPoint = function findInsertionPoint() {
  var foundBlock = null;
  var defaultX = Math.round(tbe.defaultBlockLoc[0]);
  var defaultY = Math.round(tbe.defaultBlockLoc[1]);

  // Find the block at the default location
  tbe.forEachDiagramBlock( function(block) {
    var top = block.top;
    var left = block.left;
    if (top === defaultY && left === defaultX) {
      foundBlock = block;
    }
  });
  // Go find the end of the chain with foundBlock as the start
  while(foundBlock !== null && foundBlock.next !== null) {
    foundBlock = foundBlock.next;
  }
  return foundBlock;
};
// Places variable block after the the insertion point
tbe.autoPlace = function autoPlace(block) {
  var foundBlock = tbe.findInsertionPoint();
  block = tbe.replicateChunk(block);
  var x = tbe.defaultBlockLoc[0];
  var y = tbe.defaultBlockLoc[1];
  var dx = Math.round(x-block.left);
  var dy = Math.round(y-block.top);

  // Check if a chain currently exists
  // If one exists, move the block next to it
  if (foundBlock === null) {
    block.dmove(dx, dy);
  } else {
    block.dmove(dx + foundBlock.right - x, dy);
    foundBlock.next = block;
    block.prev = foundBlock;
  }
};

document.body.addEventListener("keydown", function(e) {
    e = e || window.event;

    // Browsers report keys code differently, check both.
    var key = e.which || e.keyCode || 0;

    // Look for control modifier
    var ctrl = e.ctrlKey ? e.ctrlKey : (key === 17);

    if ( key === 86 && ctrl ) {
      log.trace("Ctrl + V Pressed !");
    } else if ( key === 67 && ctrl ) {
      log.trace("Ctrl + C Pressed !");
      var array = [];
      tbe.forEachDiagramBlock( function(block) {
        if (block.isSelected()) {
          array.push(block);
        }
      });
      var textArea = document.createElement("textarea");

      textArea.style.position = 'fixed';
      textArea.style.top = 0;
      textArea.style.left = 0;
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = 0;
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      if (array.length >= 0) {
        textArea.value = teakText.chunkToText(tbe.findChunkStart(array[0]), null, '');
        log.trace(textArea);
        document.body.appendChild(textArea);
        textArea.select();

        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          log.trace('Copying text command was ' + msg);
        } catch (err) {
          log.trace('Oops, unable to copy');
        }
      }

      document.body.removeChild(textArea);
    } else if ( key === 90 && ctrl) {
      tbe.undoAction();
    } else if ( key === 89 && ctrl) {
      tbe.redoAction();
    } else if ( key === 8) {
      var todelete = [];
      tbe.forEachDiagramBlock( function(block) {
        if (block.isSelected()) {
          todelete.push(block);
        }
      });
      if (todelete.length !== 0) {
        tbe.deleteChunk(todelete[0], todelete[todelete.length - 1]);
      }
    } else if ( key === 49 ) {
      tbe.loadDoc('docA');
    } else if ( key === 50 ) {
      tbe.loadDoc('docB');
    } else if ( key === 51 ) {
      tbe.loadDoc('docC');
    } else if ( key === 52 ) {
      tbe.loadDoc('docD');
    } else if ( key === 53 ) {
      tbe.loadDoc('docE');
    } else if ( key === 80 ) {
      conductor.playAll();
    } else if ( key === 83 ) {
      conductor.stopAll();
    } else if ( key === 88 ) {
      var cloneBlocks = [];
      tbe.forEachDiagramBlock( function(block) {
        if (block.isSelected()) {
          cloneBlocks.push(block);
        }
      });
      if (cloneBlocks.length !== 0) {
        var clone = tbe.replicateChunk(cloneBlocks[0], cloneBlocks[cloneBlocks.length - 1]);

        // TODO put it in a non-hardcoded place
        var dy = -140;
        if (clone.top < 140) {
          dy = 140;
        }
        tbe.animateMove(clone, clone.last, 0, dy, 20);
      }
    } else if ( key === 32 ) {
      tbe.clearAllBlocks();
    } else if (ctrl && key === 65) {
      var selected = null;
      tbe.forEachDiagramBlock( function(block) {
        if (block.isSelected()) {
          selected = block;
        }
      });

      tbe.clearStates();

      while(selected.next !== null) {
        selected.markSelected(true);
        selected = selected.next;
      }
      while(selected !== null) {
        selected.markSelected(true);
        selected = selected.prev;
      }
    }

},false);

// Attach these interactions properties based on the class property of the DOM elements
tbe.configInteractions = function configInteractions() {
  var thisTbe = tbe;

  // Most edit transaction start from code dispatched from this code.
  // Know it well and edit with caution. There are subtle interaction states
  // managed in these event handlers.
  interact('.drag-delete')
    .on('down', function () {
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      thisTbe.clearStates();
      thisTbe.deleteChunk(block, block.last);
    });

  interact('.action-dot')
  .on('down', function (event) {
    event.currentTarget.classList.toggle('switch-bg');
  })
  .on('up', function (event) {
    var cmd = event.currentTarget.getAttribute('command');
    app.doCommand(cmd, event);
    event.currentTarget.classList.toggle('switch-bg');
  });

  interact('.dropdown-buttons')
    .on('hold', function (event) {
      var block = event.target;
      var command = block.getAttribute('command');
      var doc = '';
      switch (command) {
        case 'loadDocA':
          doc = 'docA';
          break;
        case 'loadDocB':
          doc = 'docB';
          break;
        case 'loadDocC':
           doc = 'docC';
          break;
        case 'loadDocD':
          doc = 'docD';
          break;
        case 'loadDocE':
          doc = 'docE';
          break;
        default:
          doc = 'docA';
          break;

      }
      app.fileOverlay.saveFile(doc, null);
      defaultFiles.default([doc]);
      tbe.clearDiagramBlocks();
      tbe.currentDoc = doc;
      var loadedDocText = app.fileOverlay.loadFile(doc);
      if (loadedDocText !== null) {
        teakText.textToBlocks(tbe, loadedDocText);
      }
    });

  // Pointer events to the background go here. Might make sure the event is not
  // right next to a block, e.g. allow some safe zones.
  interact('.editor-background')
    .on('down', function (event) {
      thisTbe.clearStates();
      teakselection.startSelectionBoxDrag(event);
    });

  // Event directed to function blocks (SVG objects with class 'drag-group')
  // These come in two main types: pointer events(mouse, track, and touch) and
  // drag events. Drag events start manually, if the semantics of the pointer
  // event indicate that makes sense. Note that the object at the root of the
  // drag event may differ from the object the pointer event came to.
  // For example, dragging may use the head of a flow block, not the tail that was
  // clicked on or that chain dragged might be a copy of the block clicked on.
  //
  // After making change test on FF, Safari, Chrome, desktop and tablet. Most
  // browser breaking behaviour differences have been in this code.

  interact('.drag-group')
    // Pointer events.
    .on('down', function (event) {
      tbe.pointerDownObject = event.target;
    })
    .on('tap', function(event) {
      var block = thisTbe.elementToBlock(event.target);
      if (block !== null && block.isPaletteBlock) {
        tbe.autoPlace(block);
      }  else {
        thisTbe.components.blockSettings.tap(block);
      }
    })
    .on('up', function(event) {
      var block = thisTbe.elementToBlock(event.target);
      if (block.rect.top > window.innerHeight - 100 && !block.isPaletteBlock) {
        event.interaction.stop();
        block.setDraggingState(false);
        if (block.isLoopHead()) {
          block.next.markSelected(true);
          block.markSelected(true);
          tbe.deleteChunk(block, block.last);
        } else if (block.isLoopTail()) {
          tbe.deleteChunk(block.flowHead, block.last);
        } else {
          tbe.deleteChunk(block, block.last);
        }
      }
    })
    .on( 'hold' , function(event) {
       var block = thisTbe.elementToBlock(event.target);
       event.interaction.stop();
       if (block.isPaletteBlock) {
         // Hold on palette item, any special behavior here?
         // not for now.
         return;
       }

       /*if (!block.isPaletteBlock) {
         if (!block.isCommented()) {
           block.svgRect.classList.add('commented');
         } else {
           block.svgRect.classList.remove('commented');
         }
       }*/
       // Bring up config; dont let drag start.
       //thisTbe.components.blockSettings.tap(block);
    })
    .on('move', function(event) {
      var interaction = event.interaction;
      var block = thisTbe.elementToBlock(event.target);
      if (block.name === 'tail') {
        block = block.flowHead;
      }
      // If the pointer was moved while being held down
      // and an interaction hasn't started yet...
      if (interaction.pointerIsDown && !interaction.interacting()) {
        if (tbe.pointerDownObject === event.target) {
          block = tbe.findChunkStart(block);
          var targetToDrag = block.svgGroup;
          var notIsolated = (block.next !== null && block.prev !== null);
          var next = block;
          var prev = block;
          var animationState = {};
          if (block.nesting > 0 && notIsolated && !block.isGroupSelected()) {
            next = block.next;
            prev = block.prev;
            block.next.prev = prev;
            block.prev.next = next;
            block.next = null;
            block.prev = null;
            if (next !== null) {
              tbe.animateMove(next, next.last, -block.width, 0, 10);
            }
          } else if (block.nesting > 0 && notIsolated && block.isGroupSelected()) {
            next = block;
            prev = block.prev;
            while(next.next !== null && next.next.isSelected()) {
              next = next.next;
            }
            var nextCopy = next.next;
            next.next.prev = prev;
            prev.next = next.next;
            next.next = null;
            block.prev = null;
            if (next !== null) {
              tbe.animateMove(nextCopy, nextCopy.last, -block.chainWidth, 0, 10);
            }
          }

          // If coming from palette, or if coming from shift drag...
          if (block.isPaletteBlock || event.shiftKey) {
            block = thisTbe.replicateChunk(block);
            targetToDrag = block.svgGroup;
          }

          // Start a drag interaction targeting the clone.
          block.setDraggingState(true);

          tbe.clearStates();
          interaction.start({ name: 'drag' },
                            event.interactable,
                            targetToDrag);
        }
      } else {
        tbe.pointerDownObject = null;
      }
    })
    .draggable({
      manualStart: true, // Drag wont start until initiated by code.
      restrict: {
          restriction: thisTbe.svg,
          endOnly: true,
          // Restrictions, by default, are for the point not the whole object
          // so R and B are 1.x to include the width and height of the object.
          // 'Coordinates' are percent of width and height.
          elementRect: { left: -0.2, top: -0.2, right: 1.2, bottom: 2.4 },
          // TODO bottom needs to exclude the palette.
        },
      inertia: {
        resistance: 20,
        minSpeed: 50,
        endSpeed: 1
      },
      max: Infinity,
      onstart: function() {
      },
      onend: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.dragging) {
          // If snap happens in coastin-move
          // the chain will no longer be dragging.
          block.moveToPossibleTarget();
          block.setDraggingState(false);
        }

        // Serialize after all moving has settled.
        // TODO clean this up, canoverlap next transaction
        setTimeout(thisTbe.diagramChanged(), 500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go.

        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;
        if (!block.dragging) {
          // If snap happens in coasting-move
          // the chain will no longer be dragging.
          return;
        }

        // Puts the blocks being dragged at the top
        var temp = block;
        while(temp !== null) {
          tbe.svg.appendChild(temp.svgGroup);
          temp = temp.next;
        }

        // Move the chain to the new location based on deltas.
        block.dmove(event.dx, event.dy, true);

        // Then see if there is a possible target, a place to snap to.
        var target = block.hilitePossibleTarget();

        // If there is a target and its in the coasting phase then redirect
        // the coasting to the target.
        if (target !== null) {
          var iStatus = event.interaction.inertiaStatus;
          if ((iStatus !== undefined && iStatus !== null) && iStatus.active) {
            // Its in the coasting state, just move it to the snapping place.
            block.moveToPossibleTarget();
            block.setDraggingState(false);
          }
        }
      }
    });
};

tbe.undoArray[0] = teakText.blocksToText(tbe.forEachDiagramChain);

tbe.diagramChanged = function diagramChanged() {
  var text = teakText.blocksToText(tbe.forEachDiagramChain);

  // Checks if the text to be added is the same as the last one added
  if (tbe.undoArray[tbe.currentUndoIndex] !== text) {
    tbe.currentUndoIndex += 1;
    tbe.undoArray[tbe.currentUndoIndex] = text;
    // Truncates the rest of the array if change is made before the end of the array
    if (tbe.currentUndoIndex < tbe.undoArray.length - 1) {

      var temp = [];
      for(var i = 0; i <= tbe.currentUndoIndex; i++) {
        temp[i] = tbe.undoArray[i];
      }
      tbe.undoArray = temp;
    }

  }

  // as long as the index is more than 0
  if (tbe.currentUndoIndex < 0) {
    tbe.currentUndoIndex = 0;
  }
};

tbe.blocksOnScreen = function() {
  var toReturn = false;
  tbe.forEachDiagramBlock( function(block) {
    if (block.isOnScreen()) {
      toReturn = true;
    }
  });
  if (Object.keys(tbe.diagramBlocks).length === 0) {
    return false;
  }
  return toReturn;
};

tbe.undoAction = function() {
  tbe.clearStates(undefined, false);

  if (tbe.currentUndoIndex > 0) {
    tbe.internalClearDiagramBlocks();
    tbe.currentUndoIndex -= 1;
  }

  if (tbe.undoArray[tbe.currentUndoIndex] !== undefined) {
    teakText.textToBlocks(tbe, tbe.undoArray[tbe.currentUndoIndex].toString());
  }
};

tbe.redoAction = function() {
  if (tbe.currentUndoIndex < tbe.undoArray.length - 1) {
    //tbe.clearStates();
    tbe.internalClearDiagramBlocks();
    tbe.currentUndoIndex += 1;
    if (tbe.undoArray[tbe.currentUndoIndex] !== undefined) {
      teakText.textToBlocks(tbe, tbe.undoArray[tbe.currentUndoIndex].toString());
    }
  }
};

tbe.buildSvgTabs = function buildSvgTabs() {
};

tbe.sizePaletteToWindow = function sizePaletteToWindow () {
  var w = window.innerWidth;
  var h = window.innerHeight;

  svgb.translateXY(tbe.dropAreaGroup, 0, (h - 100));
  svgb.resizeRect(tbe.dropArea, w, 100);
  svgb.resizeRect(tbe.background, w, h);

  tbe.windowRect = { left:0, top:0, right:w, bottom:h };
  var top = h - 90;

  tbe.forEachPalette(function(block) {
    block.dmove(0, top - block.top, true);
  });
};

tbe.initPaletteBox = function initPaletteBox() {
  document.body.onresize = this.sizePaletteToWindow;
  this.dropAreaGroup = svgb.createGroup("", 0, 0);
  this.dropArea = svgb.createRect('dropArea', 0, 0, window.innerWidth, 100, 0);
  this.dropAreaGroup.appendChild(this.dropArea);
  this.svg.appendChild(this.dropAreaGroup);

  this.tabs = [];
  this.sizePaletteToWindow();
};

tbe.updateScreenSizes = function() {
  // First resize palette and background then resize the action buttons
  tbe.sizePaletteToWindow();
  actionButtons.addActionButtons(tbe.actionButtons, tbe);
};

tbe.addPalette = function addPalette(palette) {

  this.tabs.push(palette);

  var indent = 10;
  var blocks = palette.blocks;
  var blockTop = window.innerHeight - 90;
  for (var key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      var block = this.addPaletteBlock(indent, blockTop, key);
      if (key === 'loop') {
        var blockTail = this.addPaletteBlock(block.right, blockTop, 'tail');
        block.next = blockTail;
        blockTail.prev = block;
        // A flow block set has direct pointers between the two end points.
        block.flowTail = blockTail;
        blockTail.flowHead = block;
        blockTail.fixupChainCrossBlockSvg();
      }
      indent += block.chainWidth + 10;
    }
  }
};

return tbe;
}();

},{"./actionButtons.js":12,"./appMain.js":14,"./conductor.js":33,"./defaultFiles.js":35,"./fblock-settings.js":36,"./log.js":38,"./overlays/cxnButton.js":39,"./svgbuilder.js":45,"./teak-forms.js":46,"./teakselection":48,"./teaktext.js":49,"./trashBlocks.js":50,"assert":52,"interact.js":7}],48:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function (){

var interact = require('interact.js');
var svgb = require('./svgbuilder.js');
var tbSelecton = {};

// The selection region has a minimum dimension so it can be seen when it is
// first created, especially on a touch based device.
var minDim = 20;
tbSelecton.selectionSvg = null;
tbSelecton.currentChain = null;

tbSelecton.init = function(tbe) {
  tbSelecton.tbe = tbe;
  tbSelecton.interactable = interact(".selection-rect")
    .draggable({
      manualStart: true,  // Drag won't start until initiated by code.
      max: Infinity,
      onstart: function(event) {
        // Move the selection rectangle to its initial location.
        tbSelecton.x0 = event.clientX;
        tbSelecton.y0 = event.clientY;
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
        tbSelecton.currentChain = null;
      },
      onend: function() {
        // Remove the selection rectangle
        if(tbSelecton.selectionSvg !== null){
          tbe.svg.removeChild(tbSelecton.selectionSvg);
          tbSelecton.selectionSvg = null;
          tbSelecton.currentChain = null;
        }
      },
      onmove: function (event) {
        // Determine the top left and the width height based on the pointer
        // location.
        var left = 0;
        var top = 0;
        var width = 0;
        var height = 0;
        if (event.clientX < tbSelecton.x0) {
          left = event.clientX;
          width = tbSelecton.x0 - event.clientX;
        } else {
          left = tbSelecton.x0;
          width = event.clientX - tbSelecton.x0;
        }
        if (event.clientY < tbSelecton.y0) {
          top = event.clientY;
          height = tbSelecton.y0 - event.clientY;
        } else {
          top = tbSelecton.y0;
          height = event.clientY - tbSelecton.y0;
        }
        width += minDim;
        height += minDim;
        // clientX, clientY reflect the current location.
        // clientX0, clientY0 reflect the initial location at start.
        svgb.translateXY(tbSelecton.selectionSvg, left, top);
        svgb.resizeRect(tbSelecton.selectionSvg, width, height);
        let rect = {
          left: left,
          top: top,
          right: left + width,
          bottom: top + height,
        };
        tbSelecton.checkForSelectedBlocks(rect, tbe);
      }
    });
};

tbSelecton.startSelectionBoxDrag = function(event) {

  // If a selection is already under way, ignore a second one. This can happen
  // on touch devices.
  if (tbSelecton.selectionSvg !== null)
    return;

  // Create a selection rectangle and give it a minimum width.
  // place it just above the background so it is behind all blocks.
  var offset = -minDim/2;
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', offset, offset, minDim, minDim, 5);
  tbSelecton.tbe.svg.insertBefore(tbSelecton.selectionSvg, tbSelecton.tbe.background.nextSibling);

  // Start interacting with the rectangle. This give the rectangle the focus
  // for all events until the pointer is let up.
  event.interaction.start({ name: 'drag'}, tbSelecton.interactable,
        tbSelecton.selectionSvg);
 };

 // Adds and removes the class for a selected block based on position and order of selection.
 tbSelecton.checkForSelectedBlocks = function(rect, tbe) {
   var intersecting = [];
      // Take all of the blocks in the selection area and push it to the array.
     tbe.forEachDiagramBlock( function(block) {
       if(tbe.intersectingArea(rect, block.rect) > 0){
         intersecting.push(block);
         var tempBlock = block;
         if(block.isLoopHead()){
           while(tempBlock !== null && !tempBlock.isLoopTail()){
             intersecting.push(tempBlock);
             tempBlock = tempBlock.next;
           }
         } else if(block.isLoopTail()){
           while(tempBlock !== null && !tempBlock.isLoopHead()){
             intersecting.push(tempBlock);
             tempBlock = tempBlock.prev;
           }
         }
       }
     });

     // If nothing is in the selection area, then clear the intersecting array.
     if(intersecting.length === 0){
       tbSelecton.currentChain = null;
       intersecting = [];
     } else if(tbSelecton.currentChain === null){ // If nothing is in currentChain, then put in the first selected block.
       tbSelecton.currentChain = tbe.findChunkStart(intersecting[0]);
     }
     // If the block is in intersecting array and it is in the currentChain, select it. Otherwise, deselect it.
     tbe.forEachDiagramBlock(function(block) {
       if(intersecting.includes(block) && tbSelecton.currentChain.chainContainsBlock(block)){
         block.markSelected(true); //tbe.intersectingArea(rect, block.rect) > 0
       } else if(block.flowHead !== null && !intersecting.includes(block.flowHead)){
         block.markSelected(false);
       } else if(block.flowHead === null){
         block.markSelected(false);
       }
     });
 };

return tbSelecton;
}();

},{"./svgbuilder.js":45,"interact.js":7}],49:[function(require,module,exports){
/*
Copyright (c) 2017 Paul Austin - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function (){
  var log = require('./log.js');
  var teak = require('teak');
  var teakText = {};

//------------------------------------------------------------------------------
teakText.blocksToText = function(blockChainIterator) {
  var text = '(\n';
  var indentText = '  ';
  blockChainIterator(function(block) {
    text += indentText + '(chain';
    text += ' x:' + block.left + ' y:' +  block.top + ' (\n';
    text += teakText.chunkToText(block, null, indentText + '  ');
    text += indentText + '))\n';
  });

  text += ')\n';
  return text;
};

teakText.chunkToText = function(chunkStart, chunkEnd, indentText) {
  var block = chunkStart;
  var text = '';
  while (block !== chunkEnd) {
    text += indentText + '(' + block.name;
    if (block.controllerSettings !== null) {
      text += ' ' + teakText.blockParamsToText(block.controllerSettings.data);
    }
    if (block.flowTail !== null) {
      // If it is nesting, then recurse with a bit of indentation.
      text += ' (\n';
      text += teakText.chunkToText(block.next, block.flowTail, indentText + '  ');
      block = block.flowTail;
      text += indentText + ')';
    }
    text += ')\n';
    block = block.next;
  }
  return text;
};

teakText.blockParamsToText = function blockParamsToText(params) {
  var text = '';
  var spaceSeparator = '';
  for(var propertyName in params) {
    var value = params[propertyName];
    text += spaceSeparator + propertyName + ':' + this.valueToText(value);
    spaceSeparator = ' ';
  }
  return text;
};

teakText.valueToText = function(value) {
  var text = '';
  if (value.constructor === Array) {
    var spaceSeparator = '';
    var index = 0;
    text = '(';
    for (index = 0; index < value.length; index += 1) {
      text += spaceSeparator + this.valueToText(value[index]);
      spaceSeparator = ' ';
    }
    text += ')';
  } else if (typeof value === 'string') {
    text = "'" + String(value) + "'";
  } else {
    text = String(value);
  }
  return text;
};

//------------------------------------------------------------------------------
teakText.textToBlocks = function(tbe, text) {
  log.trace('new loader');
  var state = {};
  // Visitor pattern may be better, a lot better.
  var teakJSO = teak.parse(text, state, function(name) { return name; });
  teakText.loadJsoTeak(tbe, teakJSO);
};

teakText.loadJsoTeak = function(tbe, jsoTeak) {
  log.trace(' loadJSO', jsoTeak);
  if (Array.isArray(jsoTeak)) {
    let i = 0;
    for (i = 0; i < jsoTeak.length; i++) {
      var jsoChain = jsoTeak[i];
      if (jsoChain._0 !== 'chain') {
        log.trace(' unrecognized chain section');
        return;
      } else {
        var x = jsoChain.x;
        var y = jsoChain.y;
        let jsoChainBlocks = jsoChain._3;
        log.trace(' TJDO', jsoChain, x, y);
        var chain = teakText.loadJsoTeakBlocks(tbe, jsoChainBlocks, x, y, null);

        // Refresh the graphics in each block in the chain.
        var block = chain;
        while (block !== null) {
          block.updateSvg();
          block = block.next;
        }
        chain.fixupChainCrossBlockSvg();
      }
    }
  } else {
    log.trace(' unrecognized teak file');
    return;
  }
};

teakText.loadJsoTeakBlocks = function(tbe, jsoBlocks, x, y, prev) {
  let i = 1;
  let firstBlock = null;
  for (i = 0; i < jsoBlocks.length; i++) {
    const blockName = jsoBlocks[i]._0;
    const block = tbe.addBlock(x, y, blockName);
    if (firstBlock === null) {
      firstBlock = block;
    }
    if (prev !== null) {
      prev.next = block;
      block.prev = prev;
    }
    // Load block specific settings, including sub blocks.
    if (blockName === 'loop') {
      prev = this.loadLoop(tbe, block, jsoBlocks[i]);
    } else {
      this.loadBlockDetails(block, jsoBlocks[i]);
      prev = block;
    }
    x = prev.right;
  }
  return firstBlock;
};

// Load a loop, TODO needs to be less hardcoded.
teakText.loadLoop = function (tbe, block, jsoBlock) {
  // Load the sub chunk of blocks
  const jsoChainBlocks = jsoBlock._2;
  var x = block.right;
  const y = block.top;
  var subChunk = teakText.loadJsoTeakBlocks(tbe, jsoChainBlocks, x, y, block);
  var preTail = null;
  if (subChunk !== null) {
    var subChunkEnd = subChunk.last;
    preTail = subChunkEnd;
  } else {
    preTail = block;
  }
  // The tail is not serialized, so if must be created and stiched into the list.
  x = preTail.right;
  var tail = tbe.addBlock(x, y, 'tail');
  preTail.next = tail;
  tail.prev = preTail;
  block.flowTail = tail;
  tail.flowHead = block;
  return tail;
};

teakText.loadBlockDetails = function (block, jsoBlock) {
  for (var key in jsoBlock) {
    if (jsoBlock.hasOwnProperty(key)) {
      if (key !== '_0') {
        block.controllerSettings.data[key] = jsoBlock[key];
      }
    }
  }
};

return teakText;
}();

},{"./log.js":38,"teak":10}],50:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function (){

  // Move block across the screen on frame at a time.
  function trashAnimate(block, editor) {
    if(block[0] === undefined) {
      var frame = block.animateState.frame;
      block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), block);
      block.animateState.count += 1;

      if (editor.blocksOnScreen() && frame > 0) {
        // Queue up next animation frame.
        block.animateState.frame = frame - 1;
        requestAnimationFrame(function() {
          trashAnimate(block, editor);
        });
      } else {
        // Animation is over, now delete the blocks..
        editor.clearDiagramBlocks();
      }
    }
  }

// Determine center of block chain, then have all blocks scatter.
function trashBlocks(editor) {

  // Calculate initial trajectory for blocks.
  editor.forEachDiagramBlock(function(block) {
      var frameCount = 100;
      var xPos = block.left - (window.innerWidth/2);
      var yPos = block.top - (window.innerHeight/2);
      // Need to find the hypotenuse then divide the xPos and yPos by it.
      var hyp = Math.sqrt((xPos * xPos) + (yPos * yPos));
      var getX = (xPos/hyp) * 8;
      var getY = (yPos/hyp) * 8;
      block.animateState = {
        adx: getX,
        ady: getY,
        frame: frameCount,
        count: 0
      };
    });

    // Play a sound and begin the animation.
    editor.audio.playSound(editor.audio.poof);
    editor.forEachDiagramBlock(function(block) {
      trashAnimate(block, editor);
    });
}

return trashBlocks;
}();

},{}],51:[function(require,module,exports){
/*
Copyright (c) 2018 Trashbots

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function (){
  var variables = {};

  variables.a = 0;
  variables.b = 0;
  variables.c = 0;

  variables.increment = function(variable, val) {
    if(variable === 'A'){
      variables.a += val;
    } else if(variable === 'B'){
      variables.b += val;
    } if(variable === 'C'){
      variables.c += val;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.decrement = function(variable, val) {
    if(variable === 'A'){
      variables.a -= val;
    } else if(variable === 'B'){
      variables.b -= val;
    } if(variable === 'C'){
      variables.c -= val;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.incdec = function (variable, incdec, val) {
    var num = Math.abs(parseInt(val, 10));
    if(incdec === '+'){
      variables.increment(variable, num);
    } else if(incdec === '-'){
      variables.decrement(variable, num);
    }
  };

  variables.setVal = function(variable, val) {
    var num = parseInt(val, 10);
    if(variable === 'A'){
      variables.a = num;
    } else if(variable === 'B'){
      variables.b = num;
    } if(variable === 'C'){
      variables.c = num;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.resetVars = function() {
    variables.a = 0;
    variables.b = 0;
    variables.c = 0;
  };

  return variables;

}();

},{}],52:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":56}],53:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],54:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],55:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],56:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":55,"_process":54,"inherits":53}]},{},[37]);
