
(function() {

var world = {
	el: {},
	camera: {
		mode: 'zoom',
		distance: -500,
		angleX: 0,
		angleY: 0,
		posX: 200,
		posY: 200
	},
	init: function() {
		this.el.world    = jr('.world');
		this.el.viewport = jr('.viewport');
		this.el.info     = jr('.info');
		this.update();

		jr(document).bind('mousedown', this.doEvent);
		jr('a').bind('click', this.doEvent);
	},
	doEvent: function(event) {
		var _w   = world,
			el   = event.target,
			cmd  = event.type,
			xDiff,
			yDiff;
		if (cmd === 'click' && el.nodeName === 'A') {
			event.preventDefault();
			cmd = el.getAttribute('href');
		}
		switch (cmd) {
			case '/mode-rotate/':
			case '/mode-pan/':
			case '/mode-zoom/':
				jr(el.parentNode).find('a').removeClass('active');
				_w.camera.mode = cmd.slice(6,-1);
				jr(el).addClass('active');
				break;
			case 'mousedown':
				event.preventDefault();

				_w.mDown = {
					winH: window.innerHeight,
					winW: window.innerWidth,
					posX: _w.camera.posX,
					posY: _w.camera.posY,
					dist: _w.camera.distance,
					clientY: event.clientY,
					clientX: event.clientX,
					rY: -((_w.camera.angleX / 180) - .5) * window.innerHeight,
					rX: ((_w.camera.angleY / 180) + .5) * window.innerWidth
				};

				jr(document).bind('mousemove mouseup', _w.doEvent);
				break;
			case 'mousemove':
				if (!_w.mDown) return;
				xDiff = event.clientX - _w.mDown.clientX;
				yDiff = event.clientY - _w.mDown.clientY;
				switch (_w.camera.mode) {
					case 'zoom':
						_w.camera.distance = _w.mDown.dist - yDiff;
						break;
					case 'pan':
						_w.camera.posX = xDiff + _w.mDown.posX;
						_w.camera.posY = yDiff + _w.mDown.posY;
						break;
					case 'rotate':
						_w.camera.angleY = -((.5 - ((xDiff + _w.mDown.rX) / _w.mDown.winW)) * 180);
						_w.camera.angleX = ((.5 - ((yDiff + _w.mDown.rY) / _w.mDown.winH)) * 180);
						break;
				}
				_w.update();
				break;
			case 'mouseup':
				_w.mDown = false;
				jr(document).unbind('mousemove mouseup', _w.doEvent);
				break;
		}
	},
	update: function() {
		var el = world.el,
			cam = world.camera,
			t = 'translateX( ' + cam.posX + 'px ) '+
				'translateY( ' + cam.posY + 'px ) '+
				'translateZ( ' + cam.distance + 'px ) '+
				'rotateX( ' + cam.angleX + 'deg) '+
				'rotateY( ' + cam.angleY + 'deg)';
		el.world[0].style.webkitTransform = t;
		el.world[0].style.MozTransform = t;
		el.world[0].style.oTransform = t;

		el.info.html( t.replace(/\)/g, ')<br/>') );
	}
};

window.onload = world.init.bind(world);
window.world = world;

})();
