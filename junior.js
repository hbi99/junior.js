/* 
 * junior.js v0.1.3 
 * https://github.com/hbi99/junior 
 */
(function(window, document) {
    'use strict';

// a slim jQuery like object
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
            i, il;
        context = context || document;

        if (selector.constructor === Array) {
            found = selector;
        } else if (selector.nodeType || selector === window) {
            found = [selector];
        } else {
            if (this.length) context = this[0];
            found = new Sizzle(selector, context);
        }
        if (this.length > 0) return jr(found);
        // populate 'this'
        for (i=0, il=found.length; i<il; i++) {
            Array.prototype.push.call(this, found[i]);
        }
        return this;
    },
    nth: function(i) {
        return jr(this[i]);
    },
    index: function() {
        var i=0, el;
        if (!this.length || this[0].nodeType === 3) return;
        el = this[0];
        while (el.previousSibling) {
            el = el.previousSibling;
            if (el.nodeType !== 3) i += 1;
        }
        return i;
    },
    hasClass: function(name) {
        return this.length ? this[0].matches('.'+ name) : false;
    },
    addClass: function(names) {
        for (var i=0, il=this.length; i<il; i++) {
            this[i].className = this[i].className.split(/\s+/).concat(names.split(/\s+/)).removeDuplicates().join(' ');
        }
        return this;
    },
    removeClass: function(names) {
        for (var i=0, il=this.length; i<il; i++) {
            this[i].className = this[i].className.split(/\s+/).difference(names.split(/\s+/)).join(' ');
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
    val: function (str, el) {
        if (!str && str !== '') {
            return this.length ? this[0].value : '';
        }
        for (var i = 0, il = this.length; i < il; i++) {
            this[i].value = str;
        }
        return this;
    },
    text: function (str, el) {
        if (!str && str !== '') {
            return this.length ? this[0].textContent : '';
        }
        for (var i = 0, il = this.length; i < il; i++) {
            this[i].textContent = str;
        }
        return this;
    },
    html: function (str, el) {
        if (!str && str !== '') {
            return this.length ? this[0].innerHTML : '';
        }
        for (var i = 0, il = this.length; i < il; i++) {
            this[i].innerHTML = str;
        }
        return this;
    },
    removeAttr: function (name, value, el) {
        var arr = (el) ? [el] : this,
            key;
        for (var i=0, il=arr.length; i<il; i++) {
            arr[i].removeAttribute(name);
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
    props: function(name, value, el) {
        var arr = (el) ? [el] : this,
            key;
        for (var i=0, il=arr.length; i<il; i++) {
            if (!value) {
                switch (typeof (name)) {
                    case 'string':
                        return arr[i][name];
                    case 'object':
                        for (key in name) {
                            arr[i][key] = name[key];
                        }
                        break;
                }
            } else if (name && value) {
                arr[i][name] = value;
            }
        }
        return arr;
    },
    nodeName: function () {
        return this.length ? this[0].nodeName.toLowerCase() : undefined;
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
                if (el.matches(selector)) {
                    found.push(el);
                    break;
                }
                el = el.parentNode;
            }
        }
        return jr(found);
    },
    clone: function (deep) {
        return this.length ? this[0].cloneNode(deep) : false;
    },
    insert: function(type, source, el) {
        var arr = (el)? [el] : this,
            new_arr = [],
            isStr = typeof(source) === 'string',
            div = document.createElement('div'),
            moveEl,
            movedEl,
            moveAccNr;
        if (isStr) div.innerHTML = source;
        else {
            source = (source.nodeType)? source : source[0];
            div.appendChild(div.cloneNode(false));
        }
        for (var i=0, il=arr.length; i<il; i++) {
            for (var j=0, jl=div.childNodes.length; j<jl; j++) {
                moveEl = isStr ? div.childNodes[j].cloneNode(true) : source ;
                moveAccNr = moveEl[system.id];
                switch (type) {
                    case 'before':
                        if (isAdjacentSibling(arr[i], moveEl) === -1) continue;
                        movedEl = arr[i].parentNode.insertBefore(moveEl, arr[i]);
                        break;
                    case 'after':
                        if (isAdjacentSibling(arr[i], moveEl) === 1) continue;
                        movedEl = arr[i].parentNode.insertBefore(moveEl, arr[i].nextSibling);
                        break;
                    case 'append':
                        movedEl = arr[i].appendChild(moveEl);
                        break;
                    case 'prepend':
                        movedEl = arr[i].insertBefore(moveEl, arr[i].firstChild);
                        break;
                }
                movedEl[system.id] = moveAccNr;
                new_arr.push(movedEl);
            }
        }
        //important to return new instance of junior along with appended element
        return jr(new_arr);
    },
    before: function(str, el) {
        return this.insert('before', str, el);
    },
    after: function(str, el) {
        return this.insert('after', str, el);
    },
    prepend: function(str, el) {
        return this.insert('prepend', str, el);
    },
    append: function(str, el) {
        return this.insert('append', str, el);
    },
    focus: function () {
        this[0].focus();
        return this;
    },
    select: function () {
        this[0].focus();
        this[0].select();
        return this;
    },
    remove: function(el) {
        var arr = (el)? [el] : this;
        for (var i=0, il=arr.length; i<il; i++) {
            arr[i].parentNode.removeChild(arr[i]);
        }
        return this;
    },
    nextPrev: function(selector, direction) {
        var found = [],
            el;
        selector = selector || '*';
        for (var i=0, il=this.length; i<il; i++) {
            el = this[i];
            while (el) {
                el = el[direction];
                if (!el) break;
                if (el.nodeType === 1 && el.matches(selector)) {
                    found.push(el);
                }
            }
        }
        return jr(found);
    },
    next: function(selector) {
        return this.nextPrev(selector, 'nextSibling');
    },
    prev: function(selector) {
        return this.nextPrev(selector, 'previousSibling');
    },
    on: function (types, selector, callback) {
        for (var i=0, il=this.length; i<il; i++) {
            system.eventManager.addEvent(this[i], types, callback, selector);
        }
        return this;
    },
    bind: function (types, callback) {
        return this.on(types, false, callback);
    },
    unbind: function(types, callback) {
        return this.off(types, false, callback);
    },
    off: function(types, selector, callback) {
        for (var i=0, il=this.length; i<il; i++) {
            system.eventManager.removeEvent(this[i], types, callback, selector);
        }
        return this;
    },
    scrollTo: function(x, y) {
        for (var i=0, il=this.length; i<il; i++) {
            this[i].scrollLeft = x;
            this[i].scrollTop = y;
        }
        return this;
    },
    trigger: function(types, el) {
        var arr = (el)? [el] : this,
            type = types.split(/\s+/),
            i=0, il=arr.length,
            j=0, jl=type.length,
            isNative, isStyle, event, listener;

        for (; j<jl; j++) {
            isNative = system.eventManager.nativeEvents.indexOf(type[j]) > -1;
            isStyle = type[j].indexOf('style.') > -1;
            if (isNative) {
                event = document.createEvent('MouseEvents');
                event.initEvent(type[j], true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            } else {
                event = document.createEvent('Event');
                event.initEvent(type[j], true, true);
            }
            for (; i<il; i++) {
                el = arr[i];
                if (isNative) {
                    el.dispatchEvent(event);
                } else {
                    while (el.nodeType === 1) {
                        listener = el['on'+ type[j]];
                        if (typeof(listener) === 'function') {
                            if (isStyle) event.run73 = {target: el};
                            listener.call(el, event);
                            if (event.isBubblingCanceled) {
                                break;
                            }
                        }
                        if (isStyle) return this;
                        el = el.parentNode;
                    }
                }
            }
        }
        return this;
    }
};

var jr = function() {
        var new_junior = new Junior();
        return new_junior.find.apply(new_junior, arguments);
    };
// publish junior to global scope
window.jr = jr;

// junior auxiliary
var auxiliary = {
    ajax: function(opt) {
        var xhr = new XMLHttpRequest(),
            type = opt.type || 'GET',
            data = (opt.data) ? JSON.stringify(opt.data) : '';

        xhr.open(type, opt.url +'?'+ Date.now(), true);
        if (opt.withCredentials) {
            xhr.withCredentials = 'true';
        }
        //xhr.setRequestHeader("Cache-Control", "max-age=0");
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            var data = this.responseXML || this.responseText;
            if (this.getResponseHeader('Content-Type') === 'application/json') {
                data = JSON.parse(data);
            }
            opt.complete.call(this, data);
        };
        xhr.send(data);
    },
    xmlFromString: function(str) {
        var parser = new DOMParser(),
            doc;
        doc = parser.parseFromString(str, 'text/xml');
        return doc;
    },
    extend: function(safe, deposit) {
        var content;
        for (content in deposit) {
            if (!safe[content] || typeof(deposit[content]) !== 'object') {
                safe[content] = deposit[content];
            } else {
                this.extend(safe[content], deposit[content]);
            }
        }
        return safe;
    },
    prettyPrint: function(node) {
        var decl   = '<?xml version="1.0" encoding="utf-8"?>',
            ser    = new XMLSerializer(),
            xstr   = ser.serializeToString(node),
            str    = xstr.trim().replace(/(>)\s*(<)(\/*)/g, '$1\n$2$3'),
            lines  = str.split('\n'),
            indent = -1,
            tabs   = 4,
            i      = 0,
            il     = lines.length,
            start,
            end;
        for (; i<il; i++) {
            if (i === 0 && lines[i].toLowerCase() === decl) continue;
            start = lines[i].match(/<[A-Za-z_\:]+.*?>/g) !== null;
            //start = lines[i].match(/<[^\/]+>/g) !== null;
            end   = lines[i].match(/<\/[\w\:]+>/g) !== null;
            if (lines[i].match(/<.*?\/>/g) !== null) start = end = true;
            if (start) indent++;
            lines[i] = String().fill(indent, '\t') + lines[i];
            if (start && end) indent--;
            if (!start && end) indent--;
        }
        return lines.join('\n').replace(/\t/g, String().fill(tabs, ' '));
    }
};


// private stuff
var system = {
    id: 'absolut-'+ Date.now(),
    init: function() {
        this.eventManager.init();
    },
    bank: {
        guid: 0,
        vault: {},
        dispose: function () {},
        flushAll: function (el) {
            if (!el) return;
            var id = el[system.id];
            delete this.vault[id];
            delete el[system.id];
        },
        empty: function (el, name, selector) {
            var id = el[system.id],
                safe = this.vault[id],
                content = safe ? safe[name] : el.dataset[name];
            if (safe) {
                delete safe[name];
            }
            el.removeAttribute('data-' + name);
            return content;
        },
        balance: function (el, name) {
            var id = el[system.id],
                safe = this.vault[id];
            return safe ? safe[name] : {};
        },
        deposit: function (el, name, value) {
            var id = el[system.id] = el[system.id] || ++this.guid,
                safe = this.vault[id] = this.vault[id] || {}, content, key;
            if (typeof (name) === 'object') {
                system.extend(safe, name);
            } else {
                safe[name] = value;
            }
        }
    },
    eventManager: {
        init: function () {
            this.guid = 1;
            this.nativeEvents = 'blur focus focusin focusout load resize scroll unload click dblclick '+
                                'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
                                'change select submit keydown keypress keyup error contextmenu'.split(' ');
        },
        dispose: function () {
            this.flushHandlers(document);
        },
        flushHandlers: function (e) {
            var elem = (e.nodeType) ? e : e.target;
            if (!elem.getElementsByTagName) return;
            var children = elem.getElementsByTagName('*'),
                sysId = system.id,
                i = 0,
                il = children.length;
            for (; i < il; i++) {
                this.removeEvent(children[i]);
                system.bank.flushAll(children[i]);
                delete children[i][sysId];
            }
            system.bank.flushAll(elem[sysId]);
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
            system.bank.deposit(elem, {
                events: obj
            });
            for (i=0; i<il; i++) {
                if (elem['on' + type[i]] && elem['on' + type[i]] !== this.handleEvent) {
                    obj[type[i]][0] = {
                        handler: elem['on' + type[i]]
                    };
                    system.bank.deposit(elem, {
                        events: obj
                    });
                }
                elem['on' + type[i]] = this.handleEvent;
            }
        },
        removeEvent: function(elem, types, handler, selector) {
            if (arguments.length === 1) {
                system.bank.flushAll(elem);
                return;
            }
            var type = types.split(/\s+/),
                i = 0,
                il = type.length,
                vault = system.bank.vault,
                shelf,
                safe,
                key,
                content;

            if (types.indexOf('DOM') > -1 && elem.removeEventListener) {
                elem.removeEventListener(types, handler, false);
            } else if (types && handler) {
                shelf = vault[elem[system.id]];
                for (; i<il; i++) {
                    safe = shelf.events[type[i]];
                    for (key in safe) {
                        content = safe[key];
                        if (content.handler._guid === handler._guid && content.selector === selector) {
                            delete safe[key];
                            break;
                        }
                    }
                }
                //delete vault[elem[system.id]];
            }
        },
        handleEvent: function(event) {
            var returnValue = true,
                type = event.type,
                target = event.target,
                handlers = system.bank.balance(this, 'events'),
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
                    if (_handleSelector && target.matches(_handleSelector)) {
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
            return returnValue;
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
// auxillary functions
getParent = function(el, selector) {
    selector = selector || '*';
    var match = false;
    while (!match && el.nodeType !== 9) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentNode;
    }
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
isAdjacentSibling = function(el1, el2) {
    var currParentEl = el1.parentNode,
        currEl = el1,
        isAdjacent = false;
    if (!currParentEl || !el2.parentNode) return isAdjacent;
    while (!isAdjacent && currEl && currParentEl.firstChild !== currEl) {
        currEl = currEl.previousSibling;
        if (currEl.nodeType === 3) continue;
        if (currEl === el2) isAdjacent = -1;
        break;
    }
    currEl = el1;
    while (!isAdjacent && currEl && currParentEl.lastChild !== currEl) {
        currEl = currEl.nextSibling;
        if (currEl.nodeType === 3) continue;
        if (currEl === el2) isAdjacent = 1;
        break;
    }
    return isAdjacent;
};

if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}

// inititate system object
system.init();

// extending Object (backwards compatibility)
if (typeof Object.create !== 'function') {
    Object.create = function(o, props) {
        function F() {}
        F.prototype = o;
        if (typeof(props) === 'object') {
            for (var prop in props) {
                if (props.hasOwnProperty((prop))) {
                    F[prop] = props[prop];
                }
            }
        }
        return new F();
    };
}
// extending ARRAY with useful methods
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
if (!Array.prototype.hasOwnProperty('difference')) {
    Array.prototype.difference = function(a) {
        return this.filter(function(i) {return (a.indexOf(i) === -1);});
    };
}
// extending STRING
if (!String.prototype.fill) {
    String.prototype.fill = function(i,c) {
        var str = this;
        c = c || ' ';
        for (; str.length<i; str+=c){}
        return str;
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/gm, '');
    };
}
if (!String.prototype.sprintf) {
    String.prototype.sprintf = function () {
        var args = Array.prototype.slice.call(arguments);
        return this.replace(/%s/g, function() { return args.shift();});
    };
}
// extending DATE
if (!Date.stamp) {
    Date.stamp = function (s) {
        var fn = function(i) {return i < 10 ? '0'+ i : i;},
            d = s ? new Date(s) : new Date();
        return d.getFullYear() +'-'+ fn(d.getMonth() + 1) +'-'+ fn(d.getDate()) +' '+ fn(d.getHours()) +':'+ fn(d.getMinutes()) +':'+ fn(d.getSeconds());
    };
}
// extending the XML object
Document.prototype.selectNodes = function(xpath, xnode) {
    if (!xnode) xnode = this;
    var ns = this.createNSResolver(this.documentElement),
        qI = this.evaluate(xpath, xnode, ns, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
        res = [],
        len = qI.snapshotLength;
    while (len--) res[len] = qI.snapshotItem(len);
    return res;
};
Document.prototype.selectSingleNode = function(xpath, xnode) {
    if(!xnode) xnode = this;
    var xI = this.selectNodes(xpath, xnode);
    return (xI.length > 0)? xI[0] : null ;
};
Element.prototype.selectNodes = function(xpath) {
    return this.ownerDocument.selectNodes(xpath, this);
};
Element.prototype.selectSingleNode = function(xpath) {
    return this.ownerDocument.selectSingleNode(xpath, this);
};
Node.prototype.__defineGetter__('xml', function() {
    var ser    = new XMLSerializer(),
        xstr   = ser.serializeToString(this),
        str    = xstr.trim().replace(/(>)\s*(<)(\/*)/g, '$1\n$2$3'),
        lines  = str.split('\n'),
        indent = -1,
        i      = 0,
        il     = lines.length,
        start,
        end;
    for (; i<il; i++) {
        if (i === 0 && lines[i].toLowerCase() === '<?xml version="1.0" encoding="utf-8"?>') continue;
        start = lines[i].match(/<[A-Za-z_\:]+.*?>/g) !== null;
        end   = lines[i].match(/<\/[\w\:]+>/g) !== null;
        if (lines[i].match(/<.*?\/>/g) !== null) start = end = true;
        if (start) indent++;
        lines[i] = String().fill(indent, '\t') + lines[i];
        if (start && end) indent--;
        if (!start && end) indent--;
    }
    return lines.join('\n').replace(/\t/g, String().fill(4, ' '));
});

for (var fn in auxiliary) {
    jr[fn] = auxiliary[fn];
}

})(window, document);
