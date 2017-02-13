// page init
bindReady(function(){
    initTabs();
    initMobileNav();
});

// popups init
function initMobileNav() {
    window.lib.each(window.lib.queryElementsBySelector('[data-directive=mobile-nav]'), function(){
        new MobileNav({
            opener: this
        });
    });
}

// popups init
function initTabs() {
    window.lib.each(window.lib.queryElementsBySelector('[data-directive=tabs]'), function(){
       new window.Tabs(this);
    });
}

/*
 * Popups module
 */
function MobileNav(opt) {
    this.options = window.lib.extend({
        opener: null,
        holder: 'body',
        clickEvent: 'click',
        openClass: 'menu-open',
        hideOnClickOutside: true,
        delay: 50
    }, opt);
    if(this.options.opener) {
        this.opener = this.options.opener;
        this.init();
    }
}
MobileNav.prototype = {
    init: function() {
        this.findElements();
        this.attachEvents();
    },
    findElements: function() {
        this.slide = document.getElementById(this.opener.getAttribute('href').replace('#', ''));
        this.holder = window.lib.queryElementsBySelector(this.options.holder)[0];
    },
    attachEvents: function() {
        // handle popup openers
        var self = this;

        // handle click mode
       window.lib.event.add(this.opener, this.options.clickEvent, function(e) {
            if(window.lib.hasClass(self.holder, self.options.openClass)) {
               self.hidePopup();
            } else {
                self.showPopup();
            }
            e.preventDefault();
        });

        // prepare outside click handler
        this.outsideClickHandler = window.lib.bind(this.outsideClickHandler, this);
    },
    outsideClickHandler: function(e) {
        // hide popup if clicked outside
        var currentNode = (e.changedTouches ? e.changedTouches[0] : e).target,
            foundFlag = false;

        var matchNodes = function(target, list) {
            var result = false;
            window.lib.each(list, function(index, tmpNode) {
                if(target === tmpNode) {
                    result = true;
                }
            });
            return result;
        };

        while(currentNode.parentNode) {
            foundFlag = matchNodes(currentNode, [this.slide]);
            foundFlag |= matchNodes(currentNode, [this.opener]);
            if(foundFlag) {
                return;
            }
            currentNode = currentNode.parentNode;
        }
        this.hidePopup();
    },
    showPopup: function() {
        // reveal popup
        window.lib.addClass(this.holder, this.options.openClass);

        // outside click handler
        if(this.options.hideOnClickOutside && !this.outsideHandlerActive) {
            this.outsideHandlerActive = true;
            window.lib.event.add(document, 'click', this.outsideClickHandler);
            window.lib.event.add(document, 'touchstart', this.outsideClickHandler);
        }
    },
    hidePopup: function() {
        // hide popup
        window.lib.removeClass(this.holder, this.options.openClass);

        // outside click handler
        if(this.options.hideOnClickOutside && this.outsideHandlerActive) {
            this.outsideHandlerActive = false;
            window.lib.event.remove(document, 'click', this.outsideClickHandler);
            window.lib.event.remove(document, 'touchstart', this.outsideClickHandler);
        }
    }
};

(function (name, context, definition) {
    if (typeof define === 'function' && define.amd) {
        define(definition);
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    }
    else {
        context[name] = definition();
    }
})('Tabs', this, function() {

    'use strict';

    /**
     * Tabs
     * @constructor
     * @param {HTMLElement} element
     */
    function Tabs(element) {
        var i, len;

        this.target = element;
        this.tabs = element.querySelectorAll('[data-behaviour=tab]');
        this.panels = [];

        for (i = 0, len = this.tabs.length; i < len; i++) {
            this.panels.push( document.getElementById(this.tabs[i].hash.replace('#', '')) );
        }

        if (this.selectedIndex === undefined) {
            this._init();
        }
    }

    /**
     * Init
     * @private
     */
    Tabs.prototype._init = function() {
        var i;
        var self = this;

        this.target.setAttribute('role', 'tablist');

        for (i = this.tabs.length - 1; i >= 0; i--) {
            var tab = this.tabs[i];
            var panel = this.panels[i];
            var preSelected = tab.className.match(/\bactive\b/);
            var selected = i === 0 || preSelected || window.location.hash.replace('#', '') == panel.id;

            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', selected);
            tab.setAttribute('aria-controls', tab.hash.replace('#', ''));

            panel.setAttribute('role', 'tabpanel');

            if (selected) {
                this.selectedIndex = i;

                if (!preSelected) {
                    tab.className+= ' active ';
                }
            }
            else {
                panel.style.display = 'none';
            }
        }

        this.clickHandler = function(e) {
            var target = e.srcElement || e.target;

            if (target.getAttribute('role') == 'tab') {

                if (e.preventDefault) {
                    e.preventDefault();
                }
                else {
                    e.returnValue = false;
                }

                self.toggle(target);
            }
        };

        this.keyHandler = function(e) {
            switch(e.keyCode) {
                case 37:
                    if (self.tabs[self.selectedIndex - 1]) {
                        self.toggle(self.tabs[self.selectedIndex - 1]);
                    }
                    break;

                case 39:
                    if (self.tabs[self.selectedIndex + 1]) {
                        self.toggle(self.tabs[self.selectedIndex + 1]);
                    }
                    break;
            }
        };

        if (this.target.addEventListener) {
            this.target.addEventListener('click', this.clickHandler, false);
            this.target.addEventListener('touchstart', this.clickHandler, false);
            this.target.addEventListener('keyup', this.keyHandler, false);
        }
        else {
            this.target.attachEvent('onclick', this.clickHandler);
            this.target.attachEvent('ontouchstart', this.clickHandler);
            this.target.attachEvent('onclick', this.keyHandler);
        }

    };

    /**
     * Toggle
     * @param {HTMLElement} tab
     */
    Tabs.prototype.toggle = function(tab) {
        var i, len;
        var panel = document.getElementById(tab.hash.replace('#', ''));

        tab.focus();

        this.tabs[this.selectedIndex].className = this.tabs[this.selectedIndex].className.replace('active', '');
        this.tabs[this.selectedIndex].setAttribute('aria-selected', false);

        this.panels[this.selectedIndex].style.display = 'none';

        tab.className+= ' active ';
        tab.setAttribute('aria-selected', true);

        panel.style.display = '';

        // Find tab index
        for (i = 0, len = this.tabs.length; i < len; i++) {
            if (tab == this.tabs[i]) {
                break;
            }
        }

        this.selectedIndex = i;
    };

    /**
     * Teardown
     */
    Tabs.prototype.teardown = function() {
        var i, len;

        this.target.removeAttribute('role');

        if (this.target.removeEventListener) {
            this.target.removeEventListener('click', this.clickHandler, false);
            this.target.removeEventListener('click', this.keyHandler, false);
        }
        else {
            // Presume legacy IE
            this.target.detachEvent('onclick', this.clickHandler);
            this.target.detachEvent('onclick', this.keyHandler);
        }

        for (i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            var panel = this.panels[i];

            tab.removeAttribute('role');
            tab.removeAttribute('aria-selected');
            tab.removeAttribute('aria-controls');

            panel.style.display = '';
            panel.removeAttribute('role');
        }

        delete this.selectedIndex;
    };

    return Tabs;

});

/*
 * Utility module
 */
window.lib = {
    hasClass: function(el,cls) {
        return el && el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
    },
    addClass: function(el,cls) {
        if (el && !this.hasClass(el,cls)) el.className += " "+cls;
    },
    removeClass: function(el,cls) {
        if (el && this.hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
    },
    extend: function(obj) {
        for(var i = 1; i < arguments.length; i++) {
            for(var p in arguments[i]) {
                if(arguments[i].hasOwnProperty(p)) {
                    obj[p] = arguments[i][p];
                }
            }
        }
        return obj;
    },
    each: function(obj, callback) {
        var property, len;
        if(typeof obj.length === 'number') {
            for(property = 0, len = obj.length; property < len; property++) {
                if(callback.call(obj[property], property, obj[property]) === false) {
                    break;
                }
            }
        } else {
            for(property in obj) {
                if(obj.hasOwnProperty(property)) {
                    if(callback.call(obj[property], property, obj[property]) === false) {
                        break;
                    }
                }
            }
        }
    },
    event: (function() {
        var fixEvent = function(e) {
            e = e || window.event;
            if(e.isFixed) return e; else e.isFixed = true;
            if(!e.target) e.target = e.srcElement;
            e.preventDefault = e.preventDefault || function() {this.returnValue = false;};
            e.stopPropagation = e.stopPropagation || function() {this.cancelBubble = true;};
            return e;
        };
        return {
            add: function(elem, event, handler) {
                if(!elem.events) {
                    elem.events = {};
                    elem.handle = function(e) {
                        var ret, handlers = elem.events[e.type];
                        e = fixEvent(e);
                        for(var i = 0, len = handlers.length; i < len; i++) {
                            if(handlers[i]) {
                                ret = handlers[i].call(elem, e);
                                if(ret === false) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }
                        }
                    };
                }
                if(!elem.events[event]) {
                    elem.events[event] = [];
                    if(elem.addEventListener) elem.addEventListener(event, elem.handle, false);
                    else if(elem.attachEvent) elem.attachEvent('on'+event, elem.handle);
                }
                elem.events[event].push(handler);
            },
            remove: function(elem, event, handler) {
                var handlers = elem.events[event];
                for(var i = handlers.length - 1; i >= 0; i--) {
                    if(handlers[i] === handler) {
                        handlers.splice(i,1);
                    }
                }
                if(!handlers.length) {
                    delete elem.events[event];
                    if(elem.removeEventListener) elem.removeEventListener(event, elem.handle, false);
                    else if(elem.detachEvent) elem.detachEvent('on'+event, elem.handle);
                }
            }
        };
    }()),
    queryElementsBySelector: function(selector, scope) {
        scope = scope || document;
        if(!selector) return [];
        if(selector === '>*') return scope.children;
        if(typeof document.querySelectorAll === 'function') {
            return scope.querySelectorAll(selector);
        }
        var selectors = selector.split(',');
        var resultList = [];
        for(var s = 0; s < selectors.length; s++) {
            var currentContext = [scope || document];
            var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
            for (var i = 0; i < tokens.length; i++) {
                token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
                if (token.indexOf('#') > -1) {
                    var bits = token.split('#'), tagName = bits[0], id = bits[1];
                    var element = document.getElementById(id);
                    if (element && tagName && element.nodeName.toLowerCase() != tagName) {
                        return [];
                    }
                    currentContext = element ? [element] : [];
                    continue;
                }
                if (token.indexOf('.') > -1) {
                    var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
                    for (var h = 0; h < currentContext.length; h++) {
                        var elements;
                        if (tagName == '*') {
                            elements = currentContext[h].getElementsByTagName('*');
                        } else {
                            elements = currentContext[h].getElementsByTagName(tagName);
                        }
                        for (var j = 0; j < elements.length; j++) {
                            found[foundCount++] = elements[j];
                        }
                    }
                    currentContext = [];
                    var currentContextIndex = 0;
                    for (var k = 0; k < found.length; k++) {
                        if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
                            currentContext[currentContextIndex++] = found[k];
                        }
                    }
                    continue;
                }
                if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
                    var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
                    if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
                        attrName = 'htmlFor';
                    }
                    var found = [], foundCount = 0;
                    for (var h = 0; h < currentContext.length; h++) {
                        var elements;
                        if (tagName == '*') {
                            elements = currentContext[h].getElementsByTagName('*');
                        } else {
                            elements = currentContext[h].getElementsByTagName(tagName);
                        }
                        for (var j = 0; elements[j]; j++) {
                            found[foundCount++] = elements[j];
                        }
                    }
                    currentContext = [];
                    var currentContextIndex = 0, checkFunction;
                    switch (attrOperator) {
                        case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
                        case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
                        case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
                        case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
                        case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
                        case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
                        default : checkFunction = function(e) { return e.getAttribute(attrName) };
                    }
                    currentContext = [];
                    var currentContextIndex = 0;
                    for (var k = 0; k < found.length; k++) {
                        if (checkFunction(found[k])) {
                            currentContext[currentContextIndex++] = found[k];
                        }
                    }
                    continue;
                }
                tagName = token;
                var found = [], foundCount = 0;
                for (var h = 0; h < currentContext.length; h++) {
                    var elements = currentContext[h].getElementsByTagName(tagName);
                    for (var j = 0; j < elements.length; j++) {
                        found[foundCount++] = elements[j];
                    }
                }
                currentContext = found;
            }
            resultList = [].concat(resultList,currentContext);
        }
        return resultList;
    },
    trim: function (str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    bind: function(f, scope, forceArgs){
        return function() {return f.apply(scope, typeof forceArgs !== 'undefined' ? [forceArgs] : arguments);};
    }
};


// DOM ready handler
function bindReady(handler){
    var called = false;
    var ready = function() {
        if (called) return;
        called = true;
        handler();
    };
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false);
    } else if (document.attachEvent) {
        if (document.documentElement.doScroll && window == window.top) {
            var tryScroll = function(){
                if (called) return;
                if (!document.body) return;
                try {
                    document.documentElement.doScroll('left');
                    ready();
                } catch(e) {
                    setTimeout(tryScroll, 0);
                }
            };
            tryScroll();
        }
        document.attachEvent('onreadystatechange', function(){
            if (document.readyState === 'complete') {
                ready();
            }
        });
    }
    if (window.addEventListener) window.addEventListener('load', ready, false);
    else if (window.attachEvent) window.attachEvent('onload', ready);
}