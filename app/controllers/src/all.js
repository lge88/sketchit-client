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
			//pinchstart : this.onPinchStart,
			pinch : this.onPinch,
			//pinchend : this.onPinchEnd,
			scope : this
		});

		//this.initMenuHandlers();

	},
	onOrientationchange : function() {
		this.resetCanvasPosition();
	},
	onDoubleTap : function(e, el, obj) {
		//alert("double tab")
		//html.style.webkitTransform = 'scale(1)';
		this.resetViewPort();
	},
	onTouchStart : function(e, el, obj) {
		console.log("touches: " + e.touches.length)

		this.howManyTouches = e.touches.length;
		if(this.howManyTouches === 1) {
			//this.ctx.strokeStyle = "rgb(0,0,255)";
			//this.ctx.fillStyle = "rgb(255,255,255)";
			//this.ctx.fillRect(0, 0, this.canvasPanel.canvasWidth, this.canvasPanel.canvasHeight);
			this.inputStrokes = [];

			this.inputStrokes.push(this.pagePoint2CanvasPoint({
				X : e.touches[0].pageX,
				Y : e.touches[0].pageY
			}));
		} else {

		}

	},
	onTouchMove : function(event, html, obj) {
		//var p=c.getCanvasXY(x,y);

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : event.touches[0].pageX,
			Y : event.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		//console.log("stroke len: ",l)
		this.Renderer.drawASingleStroke(this.inputStrokes[ l - 1], this.inputStrokes[ l - 2], this.options.inputStokeStyle);

	},
	onTouchEnd : function(event, html, obj) {
		var result = this.shapeRecognizer.Recognize(this.inputStrokes, false); delete this.inputStrokes;
		console.log("result ", result)

	},
	onPinchStart : function(e, el, obj) {

	},
	onPinch : function(e, el, obj) {
		//e.preventDefault();
		var first = this.pagePoint2CanvasPoint({
			X : event.touches[0].pageX,
			Y : event.touches[0].pageY
		}), second = this.pagePoint2CanvasPoint({
			X : event.touches[1].pageX,
			Y : event.touches[1].pageY
		});
		el.style["-webkit-transform-origin"] = 0.5 * (first.X + second.X) + ' ' + 0.5 * (first.Y + second.Y)

		el.style.webkitTransform = 'scale(' + e.scale + ')';
		console.log("e touches " + e.touches[0].pageX);

	},
	pagePoint2CanvasPoint : function(p) {
		return {
			X : p.X - this.canvasUpLeftX,
			Y : p.Y - this.canvasUpleftY
		}
	},
	resetCanvasPosition : function(width, height, upleftX, upleftY) {
		var w = width || this.mainView.getWidth(), h = height ||    this.mainView.getHeight() -     this.topBar.getHeight() -     this.bottomBar.getHeight(), x = upleftX || 0, y = upleftY || this.topBar.getHeight();
		this.canvasWidth = w;
		this.canvasHeight = h;
		this.canvasUpLeftX = x;
		this.canvasUpleftY = y;
		this.Renderer.width = this.canvasWidth;
		this.Renderer.height = this.canvasHeight;
	},
	resetViewPort : function() {
		this.Renderer.options.viewPortScale = {
			x : 1.0,
			y : 1.0
		};
		this.Renderer.options.viewPortTranslate = {
			x : 0,
			y : 0
		};
	}
})