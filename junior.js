// Junior - simple jQuery like traversers and useful functions
(function(root, document) {
    'use strict';

    var Jr = function() {
        var coll = Object.create(Array.prototype);
        for (var prop in Jr.prototype) {
            if (Jr.prototype.hasOwnProperty(prop)) {
                coll[prop] = Jr.prototype[prop];
            }
        }
        coll.supports_querySelectorAll = !!document.querySelectorAll;
        return coll;
    };
    Jr.prototype = {
        find: function(selector, context) {
            var sval,
                type,
                bdown,
                found;
            context = context || document;
            if (Array.isArray(selector)) {
                found = selector;
            } else if (selector.nodeType || selector === window) {
                found = [selector];
            } else if (this.supports_querySelectorAll1) {
                found = context.querySelectorAll(selector);
            } else {
                bdown = selector.match(/^./);
                if (bdown !== null) bdown = bdown[0];
                switch (bdown) {
                    case '[':
                        bdown = selector.match( (selector.indexOf('=') > -1) ? /\[([\w-:]+)=(.*?)\]/ : /\[([\w-:]+)\]/ );
                        type = bdown[1];
                        if (bdown.length > 2) sval = bdown[2].replace(/"/g, '');
                        break;
                    case '#': sval = selector.slice(1); type = 'id'; break;
                    case '.': sval = selector.slice(1); type = 'className'; break;
                    default: type = 'nodeName';
                }
                found = get_children(context, type, sval);
            }
            for (var i=0, il=found.length; i<il; i++) {
                Array.prototype.push.call(this, found[i]);
            }
            return this;
        },
        hasClass: function(name) {
            return this.length ? matchesSelector(this[0], '.'+ name) : false;
        },
        addClass: function(names) {
            for (var i=0, il=this.length; i<il; i++) {
                this[i].className = this[i].className.split(/\s+/).concat(names.split(/\s+/)).removeDuplicates().join(' ');
            }
            return this;
        },
        css: function (name, value) {
            for (var i=0, il=this.length, fixedName; i<il; i++) {
                if (value) {
                    fixedName = fixStyleName(name);
                } else {
                    switch (typeof (name)) {
                        case 'string':
                            return getStyle(this[i], name);
                        case 'object':
                            for (var key in name) {
                                fixedName = fixStyleName(key);
                                this[i].style[fixedName] = name[key];
                            }
                            break;
                    }
                }
            }
            return this;
        },
        html: function (str, el) {
            if (!str && str !== '') {
                return this[0].innerHTML;
            }
            for (var i = 0, il = this.length; i < il; i++) {
                this[i].innerHTML = str;
            }
            return this;
        }
    };

    // private stuff
    var get_children = function(el, a, v) {
            if (!el) return;
            if (a==='nodeName') v = v.toUpperCase();
            var ar = [],
                ac = el.getElementsByTagName('*');
            for (var c=0, cl=ac.length; c<cl; c++) {
                if ((v && a==='nodeName' && ac[c].nodeName.indexOf(':') > -1 && ac[c].nodeName.split(':')[1].toLowerCase() === v.toLowerCase()) ||
                    (a==='className' && ac[c].className.indexOf(v) > -1)) {
                    ar.push(ac[c]);
                } else if (v? (ac[c][a] === v || ac[c].getAttribute(a) === v) : (ac[c][a] || ac[c].getAttribute(a))) {
                    ar.push(ac[c]);
                }
            }
            return ar;
        },
        get_parent = function(el, a, v) {
            if (a==='nodeName') v = v.toUpperCase();
            try {
                while ((v && a=='nodeName' && el.nodeName && el.nodeName.indexOf(':') > -1)?
                    (el.nodeName.toLowerCase().indexOf(':'+ v.toLowerCase()) === -1) :
                    (v? (el && el[a] !== v && el.getAttribute(a) !== v) : (el && !el[a] && !el.getAttribute(a)))) {
                    if (el === document.body.parentNode) return null;
                    el = el.parentNode;
                }
            } catch (e) {
                el = null;
            }
            return el;
        },
        getStyle = function (el, name) {
            name = name.replace(/([A-Z]|^ms)/g, "-$1").toLowerCase();
            var value = document.defaultView.getComputedStyle(el, null).getPropertyValue(name);
            if (name === 'opacity') {
                if (getStyle(el, 'display') === 'none') {
                    el.style.display = 'block';
                    el.style.opacity = '0';
                    value = '0';
                }
            }
            if (value === 'auto') {
                switch (name) {
                    case 'top':    value = el.offsetTop; break;
                    case 'left':   value = el.offsetLeft; break;
                    case 'width':  value = el.offsetWidth; break;
                    case 'height': value = el.offsetHeight; break;
                }
            }
            return value;
        },
        fixStyleName = function (name) {
            return name.replace(/-([a-z]|[0-9])/ig, function (m, letter) {
                return (letter + "").toUpperCase();
            });
        },
        matchesSelector = function (elem, selector) {
            var html = document.documentElement;
            return (html.matchesSelector || html.webkitMatchesSelector || html.mozMatchesSelector || html.msMatchesSelector).call(elem, selector);
        };
    // extending Array with useful methods
    if (!Array.prototype.hasOwnProperty('removeDuplicates')) {
        Array.prototype.removeDuplicates = function () {
            for (var i=0, il=this.length, unique=[]; i<il; i++) {
                if (unique.indexOf(this[i]) === -1) {
                    unique.push(this[i]);
                }
            }
            return unique;
        };
    }
    // export junior
    root.jr = function() {
        var njr = new Jr();
        return njr.find.apply(njr, arguments);
    };

})(window, document);