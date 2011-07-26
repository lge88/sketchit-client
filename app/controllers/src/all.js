sketchit.controllers.sketchitController = Ext.regController("sketchitController", {
	initAll : function(options) {
		//set options
		this.setOptions(options);

		//init views
		this.mainView = this.render({
			xtype : 'sketchitMain'
		}, Ext.getBody());

		this.canvas = this.mainView.getComponent(0);

		this.topBar = this.mainView.getDockedItems()[0];

		this.bottomBar = this.mainView.getDockedItems()[1];

		//init model Root
		this.Root = new sketchitLib.Root({});

		//init Renderer
		this.Renderer = new sketchitLib.Renderer({
			Root : this.Root,
			Canvas : document.getElementById('workspace')
		})

		//init input stroke array
		this.inputStrokes = [];

		//init shape recognizer
		this.shapeRecognizer = new DollarRecognizer();

		//init command recognizer
		//this.commandGenerator = new sketchitLib.commandGenerator();

		//init event handlers
		this.initHandlers();

	},
	setOptions : function(options) {
		Ext.apply(this.options, options);
	},
	options : {
		inputStokeStyle : "rgb(0,0,255)",
		origin : {
			X : 0,
			Y : 0
		},
		shift : {
			dx : 0,
			dy : 0
		},
		scale : {
			sx : 1,
			sy : 1
		},
		scaleCenter : {
			X : 0,
			Y : 0
		}
	},

	initHandlers : function() {

		//init main view event

		this.mainView.on({
			orientationchange : this.onOrientationchange,
			scope : this
		})
		this.onOrientationchange.call(this);

		// init canvas handlers
		this.canvas.mon(this.canvas.el, {
			doubletap : this.onDoubleTap,
			touchmove : this.onTouchMove,
			touchstart : this.onTouchStart,
			touchend : this.onTouchEnd,
			//tapcancel: function(){alert("touch cancle")},
			pinchstart : this.onPinchStart,
			pinch : this.onPinch,
			pinchend : this.onPinchEnd,
			scope : this
		});

		//this.initMenuHandlers();

	},
	onOrientationchange : function() {
		//alert("double tab")
		this.resetCanvasPosition();
	},
	onDoubleTap : function(e, el, obj) {
		//alert("double tab")
		//html.style.webkitTransform = 'scale(1)';
		this.resetViewPort();
	},
	onTouchStart : function(e, el, obj) {
		//console.log("touches: " + e.touches.length)

		//this.howManyTouches = e.touches.length;
		//if(this.howManyTouches === 1) {
		//this.ctx.strokeStyle = "rgb(0,0,255)";
		//this.ctx.fillStyle = "rgb(255,255,255)";
		//this.ctx.fillRect(0, 0, this.canvasPanel.canvasWidth, this.canvasPanel.canvasHeight);
		this.inputStrokes = [];

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));
		//} else {

		//}

	},
	onTouchMove : function(event, html, obj) {
		//var p=c.getCanvasXY(x,y);

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : event.touches[0].pageX,
			Y : event.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		//console.log("stroke len: ", l)
		this.Renderer.drawASingleStroke(this.inputStrokes[ l - 1], this.inputStrokes[ l - 2], this.options.inputStokeStyle);

	},
	onTouchEnd : function(event, html, obj) {
		var result = this.shapeRecognizer.Recognize(this.inputStrokes, false);
		//console.log("input strokes", this.Renderer.inputStrokes)
		//console.log("this.inputStrokes.slice()", this.inputStrokes.slice())
		this.Renderer.inputStrokes = this.Renderer.inputStrokes.concat(this.inputStrokes.slice());
		//console.log("renderer ", this.Renderer.inputStrokes)
		delete this.inputStrokes;
		this.Renderer.refresh();

		//console.log("renderer ", this.Renderer)

	},
	onPinchStart : function(e, el, obj) {
		//alert("pinch! "+e.touches.length)
		var first = this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}), second = this.pagePoint2CanvasPoint({
			X : e.touches[1].pageX,
			Y : e.touches[1].pageY
		});
		this.pinchTranslate0 = {
			X : 0.5 * (first.X + second.X),
			Y : 0.5 * (first.Y + second.Y)
		};
		this.pinchScale = {
			sx : 1.0,
			sy : 1.0
		};

	},
	onPinch : function(e, el, obj) {
		//e.preventDefault();

		var first = this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}), second = this.pagePoint2CanvasPoint({
			X : e.touches[1].pageX,
			Y : e.touches[1].pageY
		}), m11, m12, m21, m22, cx, cy, dx, dy;

		//console.log("scale "+e.scale)
		//this.pinchScale=e.scale;
		this.pinchTranslate1 = {
			X : 0.5 * (first.X + second.X),
			Y : 0.5 * (first.Y + second.Y)
		};
		this.pinchScale = {
			sx : e.scale,
			sy : e.scale
		};

		//this.Renderer.ctx.save();
		m11 = e.scale * this.options.scale.sx;
		m12 = 0;
		m21 = 0;
		m22 = e.scale * this.options.scale.sy;
		cx = this.pinchTranslate1.X - this.pinchTranslate1.X * e.scale * this.options.scale.sx;
		cy = this.pinchTranslate1.Y - this.pinchTranslate1.Y * e.scale * this.options.scale.sy;
		dx = (this.pinchTranslate1.X - this.pinchTranslate0.X) * e.scale * this.options.scale.sx;
		dy = (this.pinchTranslate1.Y - this.pinchTranslate0.Y) * e.scale * this.options.scale.sy;

		this.Renderer.ctx.setTransform(m11, m12, m21, m22, cx + dx, cy + dy);
		this.pinchScale = {
			sx : m11,
			sy : m22
		};
		this.pinchShift={
			dx:cx+dx,
			dy:cy+dy
		}

		this.Renderer.refresh();
	},
	onPinchEnd : function() {
		this.options.scale={
			sx:this.pinchScale.sx,
			sy:this.pinchScale.sy
		}
		this.options.shift={
			dx:this.pinchShift.dx,
			dy:this.pinchShift.dy
		}
		
		this.Renderer.ctx.setTransform(this.options.scale.sx, 0, 0, this.options.scale.sy, this.options.shift.dx, this.options.shift.dy);
		
		this.Renderer.refresh();
	},
	pagePoint2CanvasPoint : function(p) {
		var result;
		result= {
			X : p.X - this.canvasUpLeftX,
			Y : p.Y - this.canvasUpleftY
		};
		result={
			X:(result.X-this.options.shift.dx)/this.options.scale.sx,			
			Y:(result.Y-this.options.shift.dy)/this.options.scale.sy
		}
		//console.log("x: "+result.X)
		return result;
	},
	resetCanvasPosition : function(width, height, upleftX, upleftY) {
		var w = width || this.mainView.getWidth(), h = height ||           this.mainView.getHeight() -            this.topBar.getHeight() -            this.bottomBar.getHeight(), x = upleftX || 0, y = upleftY || this.topBar.getHeight();
		this.canvasWidth = w;
		this.canvasHeight = h;
		this.canvasUpLeftX = x;
		this.canvasUpleftY = y;
		this.Renderer.width = this.canvasWidth;
		this.Renderer.height = this.canvasHeight;
	},
	resetViewPort : function() {
		console.log("reset view port")
		this.options.scale = {
			x : 1.0,
			y : 1.0
		};
		this.options.shift = {
			x : 0,
			y : 0
		};

		//this.options.
		this.Renderer.ctx.setTransform(this.options.scale.sx, 0, 0, this.options.scale.sy, this.options.shift.dx, this.options.shift.dy);
		
		this.Renderer.refresh();

		//this.Renderer.refresh();
	},
	refreshCanvas : function(scale, scaleCenter, shift) {
		if(!Ext.isDefined(scale)) {
			var scale = this.options.scale;
		}
		if(!Ext.isDefined(scaleCenter)) {
			var scale = this.options.scaleCenter;
		}
		if(!Ext.isDefined(shift)) {
			var scale = this.options.shift;
		}

		this.Renderer.ctx.save();
		this.Renderer.ctx.scale(scale.sx, scale.sy);
		this.Renderer.ctx.translate(scaleCenter.X / scale.sx - scaleCenter.X, scaleCenter.Y / scale.sy - scaleCenter.Y);
		this.Renderer.ctx.translate(shift.dx, shift.dy)

		this.Renderer.refresh();
		this.Renderer.ctx.restore();

	},
	coordTranslate : function(p, x, y) {
		if(Ext.isArray(p)) {
			var i;
			for( i = 0; i < p.length; i++) {
				this.coordTranslate(p[i], x, y);
			}
		} else {
			p.X += x;
			p.Y += y;
		}
	},
	coordScale : function(p, x, y) {
		if(Ext.isArray(p)) {
			var i;
			for( i = 0; i < p.length; i++) {
				this.coordScale(p[i], x, y);
			}
		} else {
			p.X *= x;
			p.Y *= y;
		}
	}
})