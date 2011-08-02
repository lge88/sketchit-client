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
		
		// first render
		this.Renderer.refresh();

	},
	setOptions : function(options) {
		Ext.apply(this.options, options);
	},
	mode : 'draw',
	modelOptions : {
		snapToNode:true,
		pointSnapThreshold : 15,
		snapToLine:true,		
		lineSnapThreshold : 5,
		snapToGrid : true,
		grid:10,
		SPCSnapToDirection:true,
		SPCSnapThreshold:0.2,
		SPCTriangleSize:10,

	},
	viewOptions : {
		inputStokeStyle : "rgb(0,0,255)",
		inputStrokeWidth : 2,
		lineWidthUppeLimit:5,
		nodeSize:2,
		nodeColor:"rgb(255,0,0)",
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
		lineElementWidth : 4,
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
		
		showGrid : true,	
		grid:20,
		gridWidth:1,
		gridColor: "rgba(0,0,0,0.3)",
		
		pointSnapThreshold : 30,
		lineSnapThreshold : 10,
		
		SPCColor:'rgb(0,0,0)',
		SPCLineWidth:2,
		SPCTriangleSize:20,
		SPCGroundLength:40,
		SPCGroundThickness:8,
		SPCGroundN:10,	
		SPCPinRadius:5,
		SPCRollerRadius:3,
		
	

	},
	rescaleModelOptions:function(){
		this.modelOptions.pointSnapThreshold=this.viewOptions.pointSnapThreshold/this.viewOptions.modelScale.sx//this.viewOptions.scale.sx;
		this.modelOptions.lineSnapThreshold=this.viewOptions.lineSnapThreshold/this.viewOptions.modelScale.sx//this.viewOptions.scale.sx;
		this.modelOptions.grid=this.viewOptions.grid/this.viewOptions.modelScale.sx;
		this.modelOptions.SPCTriangleSize=this.viewOptions.SPCTriangleSize/this.viewOptions.modelScale.sx;
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

		//this.init Menu Handlers;
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
		this.Renderer.resetViewPort();
		this.Renderer.refresh();
	},
	onDoubleTap : function(e, el, obj) {
		this.Renderer.resetViewPort();
		this.Renderer.refresh();
	},
	onTouchStart : function(e, el, obj) {
		this.inputStrokes = [];

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));

		this.applyInputStrokeStyle();

	},
	onTouchMove : function(e, el, obj) {
		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		this.Renderer.drawASingleStroke(this.inputStrokes[ l - 1], this.inputStrokes[ l - 2]);
	},
	onTouchEnd : function(e, el, obj) {
		var p = this.canvasPoint2ModelPoint(this.pagePoint2CanvasPoint({
			X : e.changedTouches[0].pageX,
			Y : e.changedTouches[0].pageY
		}))

		if(e.touches.length === 0 || e.touches.length === 1) {
			var result = this.shapeRecognizer.Recognize(this.inputStrokes, false),cmd;
			result.data.modelOptions = this.modelOptions;
			cmd=this.commandGen(result.name, this.mode, result.data);
			if (cmd){
				this.Root.doHandler(cmd);
				if (cmd.undo){
					this.bottomBar.getComponent(5).setDisabled(false);
					this.bottomBar.getComponent(6).setDisabled(true);
				}
			}
		}
		delete this.inputStrokes;
		this.Renderer.refresh();
	},
	onPinchStart : function(e, el, obj) {
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
		this.pinchTranslate1 = {
			X : 0.5 * (first.X + second.X),
			Y : 0.5 * (first.Y + second.Y)
		};
		this.pinchScale = {
			sx : e.scale,
			sy : e.scale
		};

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
		this.rescaleModelOptions();

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
		this.Renderer.ctx.transform(this.viewOptions.scale.sx, 0, 0, this.viewOptions.scale.sy, this.viewOptions.shift.dx, this.viewOptions.shift.dy);
		this.Renderer.ctx.lineWidth = this.viewOptions.inputStokeWidth / this.viewOptions.scale.sx;
		this.rescaleModelOptions();
		this.Renderer.refresh();
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
		//TODO: this.Root.doHandler({name:"clear"});
		
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
	vocabulary : {
		"draw" : {
			"line" : "addALineElement",
			"triangle":"addASPConstraint",
			"circle":"releaseConstraint",
			"rectangle":"releaseConstraint",
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
		"addASPConstraint" : function(data) {
			
			var args,fr;
			fr= this.canvasPoint2ModelPoint(data.from);
			args={
				x:fr.X,
				y:fr.Y,
				angle:data.IndicativeAngle,
				show:true		
			}
			
			return args;
		},
		"releaseConstraint" : function(data) {		
			var args,fr;
			fr= this.canvasPoint2ModelPoint(data.from);
			args={
				x:fr.X,
				y:fr.Y,		
			}			
			return args;
		},
	},
	Undoable : {
		"addALineElement" : true,
		"addASPConstraint":true,
		"releaseConstraint":true,
	},

	commandGen : function(shapeName, mode, data) {
		if (shapeName==="poor match"){
			return false;
		}
		var cmd={};
		console.log("data ",data," name ",shapeName)
		cmd.name = this.vocabulary[mode][shapeName];
		cmd.args = this.argsGen[cmd.name].call(this,data);
		cmd.undo =this.Undoable[cmd.name];
		
		return cmd;

	}
})