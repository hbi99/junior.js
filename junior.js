/* 
 * junior.js v0.1.0 
 * https://github.com/hbi99/junior 
 */
(function(root, document) {
    'use strict';

    if (typeof Object.create !== 'function') {
        Object.create = function(o, props) {
            function F() {}
            F.prototype = o;
            if (typeof(props) === "object") {
                for (prop in props) {
                    if (props.hasOwnProperty((prop))) {
                        F[prop] = props[prop];
                    }
                }
            }
            return new F();
        };
    }

    var Junior = function() {
        var coll = Object.create(Array.prototype);
        for (var prop in Junior.prototype) {
            if (Junior.prototype.hasOwnProperty(prop)) {
                coll[prop] = Junior.prototype[prop];
            }
        }
        return coll;
    };
    Junior.prototype = {
        find: function(selector, context) {
            var found = [],
                sval,
                type,
                bdown,
                i, il;
            context = context || document;
            if (selector.constructor === Array || (selector.item && selector.item.constructor === Function)) {
                found = selector;
            } else if (selector.nodeType || selector === window) {
                found = [selector];
            } else if (!arguments[1] && this.length > 0) {
                for (i=0, il=this.length; i<il; i++) {
                    found = found.concat(Array.prototype.slice.call(this.find(selector, this[i]), 0));
                }
            } else {
                if (!!document.querySelectorAll) {
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
                        default:
                            type = 'nodeName';
                            sval = selector;
                    }
                    found = get_children(context, type, sval);
                }
            }
            if (this.length > 0) return jr(found);
            for (i=0, il=found.length; i<il; i++) {
                Array.prototype.push.call(this, found[i]);
            }
            return this;
        },
        toArray: function () {
            return Array.prototype.slice.call(this, 0);
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
        },
        attr: function (name, value, el) {
            var arr = (el) ? [el] : this,
                key;
            for (var i=0, il=arr.length; i<il; i++) {
                if (!value) {
                    switch (typeof (name)) {
                        case 'string':
                            return arr[i].getAttribute(name);
                        case 'object':
                            for (key in name) {
                                arr[i].setAttribute(key, name[key]);
                            }
                            break;
                    }
                } else if (name && value) {
                    arr[i].setAttribute(name, value);
                }
            }
            return arr;
        },
        parent: function () {
            return this.parents();
        },
        parents: function (selector) {
            var found = [],
                match, el;
            selector = selector || '*';
            for (var i=0, il=this.length; i<il; i++) {
                el = this[i].parentNode;
                match = false;
                while (!match && el.nodeType !== 9) {
                    if (matchesSelector(el, selector)) {
                        found.push(el);
                        break;
                    }
                    el = el.parentNode;
                }
            }
            return jr(found);
        },
        select: function (types, callback) {
            this[0].focus();
            this[0].select();
            return this;
        },
        on: function (types, selector, callback) {
            for (var i=0, il=this.length; i<il; i++) {
                sys.eventManager.addEvent(this[i], types, callback, selector);
            }
            return this;
        },
        bind: function (types, callback) {
            return this.on(types, false, callback);
        }
    };

    // private stuff
    var sys = {
            bank: {
                guid: 0,
                vault: {},
                dispose: function () {},
                flushAll: function (el) {
                    if (!el) return;
                    var id = el[sys.id];
                    delete this.vault[id];
                    delete el[sys.id];
                },
                empty: function (el, name, selector) {
                    var id = el[sys.id],
                        safe = this.vault[id],
                        content = safe ? safe[name] : el.dataset[name];
                    if (safe) {
                        delete safe[name];
                    }
                    el.removeAttribute('data-' + name);
                    return content;
                },
                balance: function (el, name) {
                    var id = el[sys.id],
                        safe = this.vault[id],
                        content = safe ? safe[name] : el.dataset[name];
                    return content || {};
                },
                deposit: function (el, name, value) {
                    var id = el[sys.id] = el[sys.id] || ++this.guid,
                        safe = this.vault[id] = this.vault[id] || {}, content, key;
                    if (typeof (name) === 'object') {
                        sys.extend(safe, name);
                    } else {
                        safe[name] = value;
                    }
                }
            },
            eventManager: {
                init: function () {
                    this.guid = 1;
                },
                dispose: function () {
                    this.flushHandlers(document);
                },
                flushHandlers: function (e) {
                    var elem = (e.nodeType) ? e : e.target;
                    if (!elem.getElementsByTagName) return;
                    var children = elem.getElementsByTagName('*'),
                        sysId = sys.id,
                        i = 0,
                        il = children.length;
                    for (; i < il; i++) {
                        this.removeEvent(children[i]);
                        sys.bank.flushAll(children[i]);
                        delete children[i][sysId];
                    }
                    sys.bank.flushAll(elem[sysId]);
                    delete elem[sysId];
                    this.removeEvent(elem);
                },
                addEvent: function (elem, types, handler, selector) {
                    var type = types.split(/\s+/),
                        i = 0,
                        il = type.length,
                        obj, guid;
                    
                    handler._guid = handler._guid || ++this.guid;
                    obj = {};
                    for (; i < il; i++) {
                        guid = ++this.guid;
                        obj[type[i]] = {};
                        obj[type[i]][guid] = {
                            guid: guid,
                            handler: handler,
                            selector: selector
                        };
                    }
                    sys.bank.deposit(elem, {
                        events: obj
                    });
                    for (i=0; i<il; i++) {
                        if (elem['on' + type[i]] && elem['on' + type[i]] !== this.handleEvent) {
                            obj[type[i]][0] = {
                                handler: elem['on' + type[i]]
                            };
                            sys.bank.deposit(elem, {
                                events: obj
                            });
                        }
                        elem['on' + type[i]] = this.handleEvent;
                    }
                },
                handleEvent: function (event) {
                    var returnValue = true,
                        type = event.type,
                        target = event.target,
                        handlers = sys.bank.balance(this, 'events'),
                        _handlers,
                        _name,
                        _eventHandler,
                        _handleSelector;
                    if (!handlers) return returnValue;
                    _handlers = handlers[type];
                    event.stopPropagation = function () {
                        this.isBubblingCanceled = true;
                    };
                    while (target !== null && target !== this) {
                        for (_name in _handlers) {
                            _eventHandler = _handlers[_name];
                            _handleSelector = _eventHandler.selector;
                            if (_handleSelector && matchesSelector(target, _handleSelector)) {
                                if (_eventHandler.handler.call(target, event) === false) {
                                    returnValue = false;
                                }
                                if (event.isBubblingCanceled) {
                                    return returnValue;
                                }
                            }
                        }
                        target = target.parentNode;
                    }
                    if (!event.isBubblingCanceled) {
                        for (_name in _handlers) {
                            _eventHandler = _handlers[_name];
                            if (_eventHandler.selector) continue;
                            if (_eventHandler.handler.call(this, event) === false) {
                                returnValue = false;
                            }
                        }
                    }
                }
            },
            extend: function (safe, deposit) {
                for (var content in deposit) {
                    if (!safe[content] || typeof (deposit[content]) !== 'object') {
                        safe[content] = deposit[content];
                    } else {
                        this.extend(safe[content], deposit[content]);
                    }
                }
                return safe;
            }
        },
        get_children = function(el, attr, val) {
            if (!el) return;
            if (attr==='nodeName') val = val.toUpperCase();
            var ar = [],
                ac = el.getElementsByTagName('*');
            for (var c=0, cl=ac.length; c<cl; c++) {
                if ((val && attr==='nodeName' && ac[c].nodeName.indexOf(':') > -1 && ac[c].nodeName.split(':')[1].toLowerCase() === val.toLowerCase()) ||
                    (attr === 'className' && ac[c].className.split(' ').indexOf(val) > -1)) {
                    ar.push(ac[c]);
                } else if (val? (ac[c][attr] === val || ac[c].getAttribute(attr) === val) : (ac[c][attr] || ac[c].getAttribute(attr))) {
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
        var njr = new Junior();
        return njr.find.apply(njr, arguments);
    };

})(window, document);