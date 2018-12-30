
(function(window, document) {
	'use strict';

	@@include('./sizzle.min.js')

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
				if (this.length) {
					if (this[0] === window) context = document;
					else {
						this.map(function(index, el) {
							found = found.concat(Sizzle(selector, el));
						});
						return jr(found);
					}
				}
				found = Sizzle(selector, context);
			}
			if (this.length > 0) return jr(found);
			// populate 'this'
			for (i=0, il=found.length; i<il; i++) {
				Array.prototype.push.call(this, found[i]);
			}
			return this;
		},
		// todo
		map: function(callback) {
			this.toArray().map(function(el, index) {
				callback(index, el);
			});
			return this;
		},
		filter: function(callback) {
			var matches = this.toArray().filter(function(el, index) {
				return callback(index, el);
			});
			return jr(matches);
		},
		each: function(callback) {
			return this.map(callback);
		},
		toggleClass: function(name, state) {
			return this[state ? 'removeClass' : 'addClass'](name);
		},
		is: function(qualifier) {
			return this[0].matches(qualifier);
		},
		get: function(index) {
			var match = this.toArray();
			if (index !== undefined) {
				match = match[ index >= 0 ? index : match.length - index - 2 ];
			}
			return match;
		},
		toArray: function() {
			return [].slice.call( this );
		},
		width: function() {
			return this[0] === window ? this[0].innerWidth : this[0].offsetWidth;
		},
		height: function() {
			return this[0] === window ? this[0].innerHeight : this[0].offsetHeight;
		},
		eq: function(i) {
			return jr(this[i]);
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
				this[i].className = this[i].className.split(/\s+/).concat(names.split(/\s+/)).removeDuplicates().join(' ').trim();
			}
			return this;
		},
		removeClass: function(names) {
			for (var i=0, il=this.length; i<il; i++) {
				this[i].className = this[i].className.split(/\s+/).difference(names.split(/\s+/)).join(' ').trim();
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
		removeAttr: function (name, value) {
			var arr = this,
				key;
			for (var i=0, il=arr.length; i<il; i++) {
				arr[i].removeAttribute(name);
			}
			return this;
		},
		attr: function (name, value) {
			var arr = this,
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
			return this;
		},
		prop: function(name, value, el) {
			var fix = { 'class': 'className' },
				arr = (el) ? [el] : this,
				key;
			for (var i=0, il=arr.length; i<il; i++) {
				if (!value) {
					switch (typeof (name)) {
						case 'string':
							name = fix[name] || name;
							return arr[i][name];
						case 'object':
							for (key in name) {
								arr[i][key] = name[key];
							}
							break;
					}
				} else if (name && value) {
					name = fix[name] || name;
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
				match, el,
				isFirst = selector && selector.slice(-6) === ':first';

			selector = selector || '*';
			selector = isFirst ? selector.slice(0,-6) : selector;

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
			if (isFirst) found = found[0];
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
		nextAll: function(selector) {
			return this.nextPrev(selector, 'nextSibling');
		},
		prevAll: function(selector) {
			return this.nextPrev(selector, 'previousSibling');
		},
		on: function (types, selector, callback) {
			callback = (typeof selector === 'function') ? selector : callback;
			selector = (typeof selector === 'string') ? selector : false;
			for (var i=0, il=this.length; i<il; i++) {
				system.eventManager.addEvent(this[i], types, callback, selector);
			}
			return this;
		},
		off: function(types, selector, callback) {
			callback = (typeof selector === 'function') ? selector : callback;
			selector = (typeof selector === 'string') ? selector : false;
			for (var i=0, il=this.length; i<il; i++) {
				system.eventManager.removeEvent(this[i], types, callback, selector);
			}
			return this;
		},
		bind: function (types, callback) {
			return this.on(types, false, callback);
		},
		unbind: function(types, callback) {
			return this.off(types, false, callback);
		},
		scrollTop: function(y) {
			return this.scrollTo(0, y);
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

	// wait stack
	var wait_stack = [];
	var wait_interval = 500;
	var wait_timeout = false;

	var jr = function() {
			var new_junior = new Junior();
			return new_junior.find.apply(new_junior, arguments);
		};

	// junior auxiliary
	var auxiliary = {
		ajax: function(opt) {
			var xhr = new XMLHttpRequest(),
				type = opt.type || 'GET',
				callback = opt.success || opt.complete,
				data = '',
				query = '',
				abort = function () {
					xhr.isAborted = true;
					xhr.abort();
				};

			switch (true) {
				case (opt.dataType === 'json'):
					break;
				case (opt.dataType === 'script'):
					return auxiliary.getScript(opt.url, callback);
				case (type === 'POST'):
					data = JSON.stringify(opt.data);
					break;
				case (type === 'GET'):
					query = '?'+ this.history.serialize(opt.data);
					break;
			}

			xhr.open(type, opt.url + query, true);
			if (opt.withCredentials) {
				xhr.withCredentials = true;
			}
			//xhr.setRequestHeader("Cache-Control", "max-age=0");
			//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xhr.onreadystatechange = function () {
				if (this.isAborted || this.readyState != 4) return;
				var data = this.responseXML || this.responseText,
					contentType = this.getResponseHeader('Content-Type');
				
				if (contentType && contentType.indexOf('application/json') > -1) {
					data = JSON.parse(data);
				}
				callback.call(this, data);
			};
			xhr.send(data);

			return { abort: abort };
		},
		getScript: function(url, callback) {
			var script = document.createElement('script'),
				head = document.head || document.documentElement;
			script.async = true;
			script.src = url;
			script.onload = script.onreadystatechange = function() {
				if (!script.readyState || /loaded|complete/.test(script.readyState)) {
					callback();
				}
			};
			head.insertBefore(script, head.firstChild);
		},
		getJSON: function(url, callback) {
			this.ajax({
				dataType: 'json',
				url: url,
				success: callback
			});
		},
		grep: function(list, callback) {
			var matches = [];
			list.toArray().map(function(el, index) {
				if (callback(el, index)) matches.push(el);
			});
			return matches;
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
		// wait for element or variable
		wait_for: function(what, callback) {
			wait_stack.push({
				type: what.slice(0,7) === 'window.' ? 'variable' : 'selector',
				require: what,
				callback: callback
			});
			wait_flush();
		},
		cookie: {
			remove: function(name) {
				this.set(name, '', -1);
			},
			get: function(name) {
				var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
				return v ? v[2] : null;
			},
			set: function(name, value, days) {
				var d = new Date;
				d.setTime(d.getTime() + 24*60*60*1000*(days || 1));
				document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
			}
		},
		history: {
			doPush: true,
			pop: function(state) {
				this.doPush = false;
				//emit event
      			TUI.emit('Tui.Event.History.Pop', state);
				this.doPush = true;
			},
			push: function(state) {
				if (!this.doPush || JSON.stringify(state) === JSON.stringify(history.state)) return;
				var qryString = poc.history.serialize(state),
					url = document.location.pathname;
				if (qryString) url += '?'+ qryString;
				history.pushState(state, null, url);
			},
			serialize: function(obj) {
				var str = [];
				for (var p in obj) {
					if (obj.hasOwnProperty(p)) {
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
				}
				return str.join("&");
			},
			unserialize: function(url) {
				var str = url.indexOf('?') === 0 ? url.slice(1) : url,
					params = str.split('&'),
					i = 0, il = params.length,
					ret = {},
					parts,
					val;

				for (; i<il; i++) {
					parts = params[i].split('=');
					if (!parts[0]) continue;
					val = decodeURIComponent(parts[1]);

					switch (val) {
						case ('true' || 'false'):
							val = val === 'true';
							break;
						default:
							if (val === (+val).toString()) val = +val;
					}

					ret[decodeURIComponent(parts[0])] = val;
				}
				return JSON.stringify(ret) === '{}' ? false : ret;
		  }
		}
	};

	// wait for mechanism
	function wait_flush() {
		var item,
			search,
			callback,
			i = 0,
			il = wait_stack.length,
			parts, j, jl;
		for (; i<il; i++) {
			if (wait_stack[i]) {
				switch (wait_stack[i].type) {
					case 'selector':
						item = document.querySelectorAll(wait_stack[i].require);
						if (!item.length) continue;
						break;
					case 'variable':
						search = window;
						parts = wait_stack[i].require.split('.');
						for (j=1, jl=parts.length; j<jl; j++) {
							if (!search[parts[j]]) {
								search = false;
								break;
							}
							search = search[parts[j]];
						}
						item = search;
						if (!search) continue;
						break;
				}
				callback = wait_stack[i].callback;
			}
			wait_stack.splice(i-1, 1);
			callback(item);
		}
		clearTimeout(wait_timeout);
		if (wait_stack.length && wait_stack.length < 10) {
			wait_timeout = setTimeout(wait_flush, wait_interval);
		}
	};

	// private system stuff
	var system = {
		id: 'tui-'+ Date.now(),
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
									'touchstart touchmove touchend '+
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
	// extending Array
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
	// extending String
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}
	
	for (var fn in auxiliary) {
		jr[fn] = auxiliary[fn];
	}

	return jr;

})(window, document);