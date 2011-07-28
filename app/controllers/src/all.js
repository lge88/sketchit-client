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
		this.Root = new sketchitLib.Root({
			options : this.modelOptions
		});
		this.Root.initList();
		

		//init Renderer
		this.Renderer = new sketchitLib.Renderer({
			Root : this.Root,
			Canvas : document.getElementById('workspace'),
			options : this.viewOptions
		})

		this.onOrientationchange.call(this);

		//init input stroke array
		this.inputStrokes = [];

		//init shape recognizer
		this.shapeRecognizer = new DollarRecognizer();

		//init command recognizer
		//this.commandGen = {};

		//init event handlers
		this.initHandlers();

		//init canvas transform

		this.Renderer.initTransform();

	},
	setOptions : function(options) {
		Ext.apply(this.options, options);
	},
	mode : 'draw',
	modelOptions : {
		//isSnap:true,
		pointSnapThreshold : 10,
		lineSnapThreshold : 10,
		snapToGrid : true,
		grid_Dx : 20,
		grid_Dy : 20

	},
	viewOptions : {
		inputStokeStyle : "rgb(0,0,255)",
		inputStrokeWidth : 1,
		lineWidthUppeLimit:5,
		shift : {
			dx : 0,
			dy : 0
		},
		scale : {
			sx : 1,
			sy : 1
		},
		backgroundColor : 'rgb(255,255,255)',
		lineElementColor : 'rgb(0,0,255)',
		lineElementWidth : 2,
		dashStyle : {
			dl : 10,         //dash line interval
			r : 0.5  //the rate of solid line length to dash line interval
		},

		modelScale : { //how many pixels per model length
			sx : 2,
			sy : 2
		},
		canvasOrigin : {
			x : 0,
			y : 0
		},
		showNodeId : false,
		showElementId : false,
		showMarks : false,
		showGrid : true

	},

	initHandlers : function() {

		//init main view event

		this.mainView.on({
			orientationchange : this.onOrientationchange,
			scope : this
		})

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
		//clear button
		this.bottomBar.getComponent(2).setHandler(this.clearAll, this);
		//undo button
		this.bottomBar.getComponent(5).setHandler(this.undo, this);
		this.bottomBar.getComponent(5).setDisabled(true);
		//redo button
		this.bottomBar.getComponent(6).setHandler(this.redo, this);
		this.bottomBar.getComponent(6).setDisabled(true);

	},
	onOrientationchange : function() {
		//alert("double tab")
		this.resetCanvasPosition();
	},
	onDoubleTap : function(e, el, obj) {
		//alert("double tab")
		//html.style.webkitTransform = 'scale(1)';
		this.Renderer.resetViewPort();
		this.Renderer.refresh();
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

		this.applyInputStrokeStyle();
		//} else {

		//}

	},
	onTouchMove : function(e, el, obj) {
		//var p=c.getCanvasXY(x,y);

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		//console.log("stroke len: ", l)
		this.Renderer.drawASingleStroke(this.inputStrokes[ l - 1], this.inputStrokes[ l - 2]);
		//inputStrokeWidth

	},
	onTouchEnd : function(e, el, obj) {
		var p = this.canvasPoint2ModelPoint(this.pagePoint2CanvasPoint({
			X : e.changedTouches[0].pageX,
			Y : e.changedTouches[0].pageY
		}))
		console.log("touch end! touches: " + p.X + "," + p.Y)//changedT
		if(e.touches.length === 0) {
			var result = this.shapeRecognizer.Recognize(this.inputStrokes, false),cmd;
			console.log("result ",result);
			result.data.modelOptions = this.modelOptions;
			cmd=this.commandGen(result.name, this.mode, result.data);
			console.log("cmd ",cmd);
			if (cmd){
				this.Root.doHandler(cmd);
				if (cmd.undo){
					this.bottomBar.getComponent(5).setDisabled(false);
				}
				
				console.log("root ",this.Root);
				//this.Renderer.refresh();
			}
			
			/*
			this.Root.doHandler(cmd)*/
			//canvasPoint2ModelPoint

		}

		//command=this.commandGen(result,this.modelControl);
		//console.log("input strokes", this.Renderer.inputStrokes)
		//console.log("this.inputStrokes.slice()", this.inputStrokes.slice())
		//this.Renderer.inputStrokes = this.Renderer.inputStrokes.concat(this.inputStrokes.slice());
		//this.Renderer.inputStrokes = this.inputStrokes;
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
		//this.Renderer.ctx.save();

	},
	onPinch : function(e, el, obj) {
		//e.preventDefault();
		if(!Ext.isDefined(e.touches[0]) || !Ext.isDefined(e.touches[1])) {
			return;
		}

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
		m11 = e.scale //* this.options.scale.sx;
		m12 = 0;
		m21 = 0;
		m22 = e.scale //* this.options.scale.sy;
		cx = this.pinchTranslate1.X - this.pinchTranslate1.X * e.scale //* this.options.scale.sx;
		cy = this.pinchTranslate1.Y - this.pinchTranslate1.Y * e.scale //* this.options.scale.sy;
		dx = (this.pinchTranslate1.X - this.pinchTranslate0.X) * e.scale //* this.options.scale.sx;
		dy = (this.pinchTranslate1.Y - this.pinchTranslate0.Y) * e.scale //* this.options.scale.sy;
		this.Renderer.ctx.save();

		//this.Renderer.ctx.setTransform(m11, m12, m21, m22, cx + dx, cy + dy);
		this.Renderer.ctx.transform(m11, m12, m21, m22, cx + dx, cy + dy);

		this.pinchScale = {
			sx : m11,
			sy : m22
		};
		this.pinchShift = {
			dx : cx + dx,
			dy : cy + dy
		}

		//this.Renderer.ctx.lineWidth = this.Renderer.ctx.lineWidth / m11;

		this.Renderer.refresh();
		this.Renderer.ctx.restore();
	},
	onPinchEnd : function() {
		this.viewOptions.shift = {
			dx : this.viewOptions.scale.sx * this.pinchShift.dx + this.viewOptions.shift.dx,
			dy : this.viewOptions.scale.sy * this.pinchShift.dy + this.viewOptions.shift.dy
		};
		this.viewOptions.scale = {
			sx : this.pinchScale.sx * this.viewOptions.scale.sx,
			sy : this.pinchScale.sy * this.viewOptions.scale.sy
		};

		this.Renderer.initTransform();
		//this.Renderer.ctx.restore();
		//this.Renderer.ctx.save();
		this.Renderer.ctx.transform(this.viewOptions.scale.sx, 0, 0, this.viewOptions.scale.sy, this.viewOptions.shift.dx, this.viewOptions.shift.dy);

		//this.Renderer.ctx.setTransform(this.viewOptions.scale.sx, 0, 0, this.viewOptions.scale.sy, this.viewOptions.shift.dx, this.viewOptions.shift.dy);
		//this.Renderer.ctx.lineWidth = 1 / this.viewOptions.scale.sx;
		//this.applyInputStrokeStyle();
		this.Renderer.ctx.lineWidth = this.viewOptions.inputStokeWidth / this.viewOptions.scale.sx;
		this.Renderer.refresh();
		//this.Renderer.ctx.restore();
	},
	pagePoint2CanvasPoint : function(p) {
		return {
			X : (p.X - this.canvasUpLeftX - this.viewOptions.shift.dx) / this.viewOptions.scale.sx,
			Y : (this.canvasHeight - p.Y + this.canvasUpleftY - this.viewOptions.shift.dy) / this.viewOptions.scale.sy
		}
	},
	canvasPoint2ModelPoint : function(p) {
		return {
			X : p.X / this.viewOptions.modelScale.sx,
			Y : p.Y / this.viewOptions.modelScale.sy
		}
	},
	applyInputStrokeStyle : function() {

		this.Renderer.ctx.strokeStyle = this.viewOptions.inputStokeStyle;
		this.Renderer.ctx.lineWidth = this.viewOptions.inputStokeWidth;
	},
	resetCanvasPosition : function(width, height, upleftX, upleftY) {
		var w = width || this.mainView.getWidth(), h = height ||              this.mainView.getHeight() -               this.topBar.getHeight() -               this.bottomBar.getHeight(), x = upleftX || 0, y = upleftY || this.topBar.getHeight();
		this.canvasWidth = w;
		this.canvasHeight = h;
		this.canvasUpLeftX = x;
		this.canvasUpleftY = y;
		this.Renderer.width = this.canvasWidth;
		this.Renderer.height = this.canvasHeight;
	},
	clearAll:function(){
		this.Renderer.clear();
	},
	undo:function(){
		this.Root.undo();
		this.Renderer.refresh();
		this.bottomBar.getComponent(6).setDisabled(false);
		if (this.Root.undoStack.length===0){
			this.bottomBar.getComponent(5).setDisabled(true);
		}
		
	},
	redo:function(){
		this.Root.redo();
		this.Renderer.refresh();
		this.bottomBar.getComponent(5).setDisabled(false);
		if (this.Root.redoStack.length===0){
			this.bottomBar.getComponent(6).setDisabled(true);
		}
	},
	/*
	 initTransform : function() {
	 this.Renderer.ctx.setTransform(1, 0, 0, -1, 0, this.canvasHeight);
	 },

	 resetViewPort : function() {
	 this.initTransform();
	 this.viewOptions.scale = {
	 sx : 1.0,
	 sy : 1.0
	 };
	 this.viewOptions.shift = {
	 dx : 0,
	 dy : 0
	 };
	 //this.Renderer.ctx.setTransform(this.viewOptions.scale.sx, 0, 0, this.viewOptions.scale.sy, this.viewOptions.shift.dx, this.viewOptions.shift.dy);
	 this.Renderer.ctx.transform(this.viewOptions.scale.sx, 0, 0, this.viewOptions.scale.sy, this.viewOptions.shift.dx, this.viewOptions.shift.dy);
	 this.Renderer.ctx.lineWidth = this.viewOptions.inputStrokeWidth / this.viewOptions.scale.sx;
	 this.Renderer.refresh();
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
	 },*/
	vocabulary : {
		"draw" : {
			"line" : "addALineElement"
		},
		"select" : {

		},
		"load" : {

		}

	},
	argsGen : {
		"addALineElement" : function(data) {
			var args,fr,to;
			fr= this.canvasPoint2ModelPoint(data.from);
			to= this.canvasPoint2ModelPoint(data.to);
			args={
				x1:fr.X,
				y1:fr.Y,
				x2:to.X,
				y2:to.Y,
			}
			return args;
		},
	},
	Undoable : {
		"addALineElement" : true

	},

	commandGen : function(shapeName, mode, data) {
		if (shapeName==="poor match"){
			return false;
		}
		var cmd={};
		console.log("input:",arguments," voc",this.vocabulary[mode][shapeName])
		cmd.name = this.vocabulary[mode][shapeName];
		cmd.args = this.argsGen[cmd.name].call(this,data);
		cmd.undo =this.Undoable[cmd.name];
		
		return cmd;

	}
})