sketchit.controllers.sketchitController = Ext.regController("sketchitController", {
	initAll : function(options) {
		//set options
		//this.setOptions(options);

		//init views
		this.mainView = this.render({
			xtype : 'sketchitMain'
		}, Ext.getBody());

		this.canvas = this.mainView.getComponent(0);

		this.topBar = this.mainView.getDockedItems()[0];

		this.bottomBar = this.mainView.getDockedItems()[1];

		//init model Root
		this.Root = new sketchitLib.Root();
		window.Root = this.Root;

		//init Renderer
		this.Renderer = new sketchitLib.Renderer({
			canvas : document.getElementById('workspace'),
			ctx : document.getElementById('workspace').getContext("2d"),
		})
		window.Renderer = this.Renderer;

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

		//this.Renderer.initTransform();

		// first render
		this.refresh();

		//window.Root = Root;
		/*

		 window.xxx = {};
		 window.xxx.rt = this.Root;
		 window.xxx.rr = this.Renderer;
		 lib=sketchitLib;

		 xxx.rt.run("addARenderableComponent", new lib.Node({
		 X : 100,
		 Y : 100,
		 renderer:xxx.rr
		 }), xxx.rt.nodes, xxx.rr.theShapes);
		 console.log("xxx unsaveruns ", xxx.rt.unsavedRuns);
		 this.Renderer.refresh();*/
		/*
		 xxx.rt.save();
		 xxx.rt.run("addARenderableComponent", new lib.Node({
		 X : 200,
		 Y : 200
		 }), xxx.rt.nodes, xxx.rr.theShapes);
		 xxx.rt.save();
		 xxx.rt.run("addARenderableComponent", new lib.Node({
		 X : 200,
		 Y : 200
		 }), xxx.rt.nodes, xxx.rr.theShapes);
		 xxx.rt.save();
		 //xxx.run("add", (new Batch()));
		 //xxx.save();

		 console.log("xxx ", xxx);*/

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
		//run button
		this.bottomBar.getComponent(0).getComponent(3).setHandler(function() {
			var tcl = this.Root.run("runStaticConstant");
			ut.Ajax.request({
				url : '/cgi-bin/lge/sketchit/run.ops',
				params : tcl,
				method : 'POST',
				scope : this,
				success : function(result) {
					//console.log(result)
					
					this.Root.run("loadResultData", result.responseText);
					this.Root.runsave("set", this.Root, "deformationAvailable", true);
					//this.deformationAvailable = true;
					//this.autoSetDeformationScale(this.settings.maxDeformationOnScreen);
					this.refresh();
				}
			});

		}, this);
		//clear button
		this.bottomBar.getComponent(2).setHandler(this.clearAll, this);
		//undo button
		this.bottomBar.getComponent(5).setHandler(this.undo, this);
		this.bottomBar.getComponent(5).setDisabled(true);
		//redo button
		this.bottomBar.getComponent(6).setHandler(this.redo, this);
		this.bottomBar.getComponent(6).setDisabled(true);
		//save button
		this.bottomBar.getComponent(7).setHandler(this.save, this);

		//mode toggle button
		this.bottomBar.getComponent(11).on({
			toggle : function() {
				this.settings.mode = this.bottomBar.getComponent(11).getPressed().text;
			},
			scope : this
		});

	},
	/*
	 setOptions : function(options) {
	 Ext.apply(this.options, options);
	 },*/
	canvasUpLeftX : undefined,
	canvasUpLeftY : undefined,
	canvasHeight : undefined,
	canvasWidth : undefined,

	mouseX : undefined,
	mouseY : undefined,

	settings : {
		mode : 'draw',

		modelScale : 2.0,
		loadScale : 1.0,
		viewPortScale : 1.0,
		viewPortShiftX : 0.0,
		viewPortShiftY : 0.0,

		showDeformation : true,
		deformationScale : 2000,
		maxDeformationOnScreen : 40,
		deformationResolution: 20,

		snapToNode : true,
		snapToNodeThreshold : 15,

		snapToLine : true,
		snapToLineThreshold : 5,

		snapToGrid : true,
		grid : 20,
		gridLineWidth : 1,
		gridLineStyle : "rgba(0,0,0,0.5)",

		SPCSnapToDirection : true,
		SPCSnapToDirectionThreshold : 0.2,

		SPCSnapToNode : true,
		SPCSnapToNodeThreshold : 15,

		circleSnapToSPCThreshold : 25,

		LoadSnapToNodeThreshold : 15,
		LoadSnapToLineThreshold : 5,

		autoMergeNodeOnLine : true,
		autoMergeNodeOnLineThreshold : 1,

		showNodeId : false,
		showElementId : false,
		showMarks : false,
		showGrid : true,
		showSPC : true,

		canvasBgColor : "rgb(255,255,255)",
		inputStrokeStyle : "rgb(0,0,255)",
		inputStrokeWidth : 2,

		defaultLineELementType : sketchitLib.ElasticBeamColumn,
		defaultGeomTransfId : 2,
		defaultNodeLoadType : "load",

		UniformElementLoadDirectionThreshold : 0.3,
		UniformElementLoadSnapToLineThreshold : 15,
		
		

	},
	getCanvasCoordFromViewPort : function(p) {
		return {
			X : (p.X - this.settings.viewPortShiftX) / this.settings.viewPortScale,
			Y : (p.Y - this.settings.viewPortShiftY) / this.settings.viewPortScale
		}
	},
	getViewPortCoordFromCanvas : function(p) {
		return {
			X : p.X * this.settings.viewPortScale + this.settings.viewPortShiftX,
			Y : p.Y * this.settings.viewPortScale + this.settings.viewPortShiftY,
		}
	},
	getViewPortCoordFromPage : function(p) {
		return {
			X : p.X - this.canvasUpLeftX,
			Y : this.canvasHeight - p.Y + this.canvasUpleftY
		}
	},
	getCanvasCoordFromPage : function(p) {
		return {
			X : (p.X - this.canvasUpLeftX - this.settings.viewPortShiftX) / this.settings.viewPortScale,
			Y : (this.canvasHeight - p.Y + this.canvasUpleftY - this.settings.viewPortShiftY) / this.settings.viewPortScale
		}
	},
	resetCanvasPosition : function(width, height, upleftX, upleftY) {
		this.canvasWidth = width || this.mainView.getWidth();
		this.canvasHeight = height ||          this.mainView.getHeight() -          this.topBar.getHeight() -          this.bottomBar.getHeight();
		this.canvasUpLeftX = upleftX || 0;
		this.canvasUpleftY = upleftY || this.topBar.getHeight();
	},
	initCanvasTransform : function() {
		this.Renderer.setTransform(1.0, 0, 0, -1.0, 0, this.canvasHeight);
	},
	applyViewPortTransform : function() {
		this.Renderer.transform(this.settings.viewPortScale, 0, 0, this.settings.viewPortScale, this.settings.viewPortShiftX, this.settings.viewPortShiftY);
	},
	resetViewPort : function(scale, shiftX, shiftY) {
		this.settings.viewPortScale = scale || 1.0;
		this.settings.viewPortShiftX = shiftX || 0.0;
		this.settings.viewPortShiftY = shiftY || 0.0;
	},
	applyInputStrokeStyle : function(scale) {
		this.Renderer.ctx.strokeStyle = this.settings.inputStrokeStyle;
		this.Renderer.ctx.lineWidth = this.settings.inputStrokeWidth / scale;
		//console.log("scale",this.settings.inputStokeWidth / scale)
		//console.log("lineWidth",this.Renderer.ctx.lineWidth)
	},
	applyGridStyle : function(scale) {
		this.Renderer.ctx.strokeStyle = this.settings.gridLineStyle;
		this.Renderer.ctx.lineWidth = this.settings.gridLineWidth / scale;
	},
	autoSetDeformationScale : function(maxDispOnScreen) {
		var a = this.Root.theNodes.getAbsMax("dispX"), b = this.Root.theNodes.getAbsMax("dispY"), m = a > b ? a : b;
		this.settings.deformationScale = maxDispOnScreen / m;
	},
	clearScreen : function() {
		this.Renderer.save();
		this.initCanvasTransform();
		this.Renderer.ctx.fillStyle = this.settings.canvasBgColor;
		this.Renderer.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.Renderer.restore();
	},
	drawObjectStore : function(store, FcnName) {
		var i, args = Array.prototype.slice.call(arguments, 2);
		for( i = 0; i < store.max + 1; i++) {
			if(ut.isDefined(store[i])) {
				store[i][FcnName].apply(store[i], args);
			}
		}
	},
	drawAll : function() {

		if(this.settings.showGrid) {
			var c1 = this.getCanvasCoordFromViewPort({
				X : 0,
				Y : 0
			}), c2 = this.getCanvasCoordFromViewPort({
				X : this.canvasWidth,
				Y : this.canvasHeight
			});
			this.applyGridStyle(this.settings.viewPortScale);
			this.Renderer.drawGrid(this.settings.grid, this.settings.grid, c1.X, c2.X, c1.Y, c2.Y);
		}

		this.drawObjectStore(this.Root.theElements, "display", this.Renderer, this.settings.viewPortScale);
		this.drawObjectStore(this.Root.theSPCs, "display", this.Renderer, this.settings.viewPortScale);
		this.drawObjectStore(this.Root.thePatterns[0].Loads, "display", this.Renderer, this.settings.viewPortScale);
		this.drawObjectStore(this.Root.theNodes, "display", this.Renderer, this.settings.viewPortScale);
		if(this.Root.deformationAvailable && this.settings.showDeformation) {
			this.drawObjectStore(this.Root.theNodes, "displayDeformation", this.Renderer, this.settings.viewPortScale, this.settings.deformationScale);
			this.drawObjectStore(this.Root.theElements, "displayDeformation", this.Renderer, this.settings.viewPortScale, this.settings.deformationScale,this.settings.deformationResolution);
		}
	},
	refresh : function() {
		this.clearScreen();
		this.initCanvasTransform();
		this.applyViewPortTransform();
		this.drawAll();
	},
	save : function() {

		console.log("toTcl");

		console.log(this.Root.run("toTcl", this.settings.modelScale, this.settings.loadScale));

	},
	onOrientationchange : function() {
		this.resetCanvasPosition();
		this.resetViewPort();
		this.refresh();
	},
	onDoubleTap : function(e, el, obj) {
		this.resetViewPort();
		this.refresh();
	},
	onTouchStart : function(e, el, obj) {
		this.inputStrokes = [];
		this.inputStrokes.push(this.getCanvasCoordFromPage({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));
		//this.mouseX=e.touches[0].pageX;
		//this.mouseY=e.touches[0].pageY;
	},
	onTouchMove : function(e, el, obj) {

		this.inputStrokes.push(this.getCanvasCoordFromPage({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		this.applyInputStrokeStyle(this.settings.viewPortScale);
		this.Renderer.drawLine(this.inputStrokes[ l - 2], this.inputStrokes[ l - 1]);
	},
	onTouchEnd : function(e, el, obj) {
		/*
		 var p = this.canvasPoint2ModelPoint(this.pagePoint2CanvasPoint({
		 X : e.changedTouches[0].pageX,
		 Y : e.changedTouches[0].pageY
		 }))*/

		if(e.touches.length === 0 || e.touches.length === 1) {
			var result = this.shapeRecognizer.Recognize(this.inputStrokes, false);
			this.act(result, this.settings)
			this.refresh();
		}
		this.inputStrokes = [];

	},
	onPinchStart : function(e, el, obj) {
		var first = this.getCanvasCoordFromPage({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}), second = this.getCanvasCoordFromPage({
			X : e.touches[1].pageX,
			Y : e.touches[1].pageY
		});
		this.pinchTranslate0 = {
			X : 0.5 * (first.X + second.X),
			Y : 0.5 * (first.Y + second.Y)
		};
		/*
		this.pinchScale = {
		sx : 1.0,
		sy : 1.0
		};*/
		//this.pinchScale=1.0;
	},
	onPinch : function(e, el, obj) {
		if(!Ext.isDefined(e.touches[0]) || !Ext.isDefined(e.touches[1])) {
			return;
		}

		var first = this.getCanvasCoordFromPage({
			X : e.touches[0].pageX,
			Y : e.touches[0].pageY
		}), second = this.getCanvasCoordFromPage({
			X : e.touches[1].pageX,
			Y : e.touches[1].pageY
		}), m11, m12, m21, m22, cx, cy, dx, dy;
		this.pinchTranslate1 = {
			X : 0.5 * (first.X + second.X),
			Y : 0.5 * (first.Y + second.Y)
		};
		/*
		 this.pinchScale = {
		 sx : e.scale,
		 sy : e.scale
		 };*/

		m11 = e.scale;
		//* this.options.scale.sx;
		m12 = 0;
		m21 = 0;
		m22 = e.scale;
		//* this.options.scale.sy;
		cx = this.pinchTranslate1.X - this.pinchTranslate1.X * e.scale;
		//* this.options.scale.sx;
		cy = this.pinchTranslate1.Y - this.pinchTranslate1.Y * e.scale;
		//* this.options.scale.sy;
		dx = (this.pinchTranslate1.X - this.pinchTranslate0.X) * e.scale;
		//* this.options.scale.sx;
		dy = (this.pinchTranslate1.Y - this.pinchTranslate0.Y) * e.scale;
		//* this.options.scale.sy;
		this.Renderer.save();

		//this.Renderer.ctx.setTransform(m11, m12, m21, m22, cx + dx, cy + dy);
		this.Renderer.ctx.transform(m11, m12, m21, m22, cx + dx, cy + dy);
		/*

		 this.pinchScale = {
		 sx : m11,
		 sy : m22
		 };*/
		this.pinchScale = e.scale;
		this.pinchShiftX = cx + dx;
		this.pinchShiftY = cy + dy;
		/*
		this.pinchShift = {
		dx : cx + dx,
		dy : cy + dy
		}*/
		//this.rescaleModelOptions();

		this.clearScreen();
		this.drawAll();
		this.Renderer.restore();
	},
	onPinchEnd : function() {
		var scale, shiftX, shiftY;
		scale = this.settings.viewPortScale * this.pinchScale;
		shiftX = this.settings.viewPortScale * this.pinchShiftX + this.settings.viewPortShiftX;
		shiftY = this.settings.viewPortScale * this.pinchShiftY + this.settings.viewPortShiftY;
		this.resetViewPort(scale, shiftX, shiftY);
		this.refresh();
	},
	clearAll : function() {
		//alert("clear")
		//this.Root.run("clearAll");
		this.Root.runsave.call(this.Root, "clearAll");
		this.refresh();
	},
	undo : function() {
		this.Root.undo();
		this.refresh();
		this.bottomBar.getComponent(6).setDisabled(false);
		if(this.Root.undoStack.length === 0) {
			this.bottomBar.getComponent(5).setDisabled(true);
		}

	},
	redo : function() {
		this.Root.redo();
		this.refresh();
		this.bottomBar.getComponent(5).setDisabled(false);
		if(this.Root.redoStack.length === 0) {
			this.bottomBar.getComponent(6).setDisabled(true);
		}
	},
	vocabulary : {
		"draw" : {
			"line" : {
				command : "addALineElement",
				argsGen : function(data, settings) {
					var result = {};
					result.x1 = data.from.X;
					result.y1 = data.from.Y;
					result.x2 = data.to.X;
					result.y2 = data.to.Y;
					result.type = settings.defaultLineELementType;
					result.geomTransfId = settings.defaultGeomTransfId;

					if(settings.snapToNode) {
						result.snapToNodeThreshold = settings.snapToNodeThreshold;
					}
					if(settings.snapToLine) {
						result.snapToLineThreshold = settings.snapToLineThreshold;
					}
					if(settings.snapToGrid) {
						result.grid = settings.grid;
					}
					if(settings.autoMergeNodeOnLine) {
						result.autoMergeNodeOnLineThreshold = settings.autoMergeNodeOnLineThreshold;
					}
					return result;
				},
				undo : true
			},
			"triangle" : {
				command : "addASPC",
				argsGen : function(data, settings) {
					var result = {};
					result.topX = data.from.X;
					result.topY = data.from.Y;
					result.angle = data.IndicativeAngle;
					result.show = settings.showSPC;

					if(settings.SPCSnapToDirection) {
						result.dT = settings.SPCSnapToDirectionThreshold;
					}
					if(settings.SPCSnapToNode) {
						result.nT = settings.SPCSnapToNodeThreshold;
					}
					if(settings.snapToGrid) {
						result.grid = settings.grid;
					}
					return result;
				},
				undo : true
			},
			"circle" : {
				command : "releaseASPC",
				argsGen : function(data, settings) {
					var result = {};
					result.cenX = data.Centroid.X;
					result.cenY = data.Centroid.Y;
					result.t = settings.circleSnapToSPCThreshold;
					return result;
				},
				undo : true
			},
			"rectangle" : function() {
				return this.vocabulary["draw"]["circle"];
			},
		},
		"select" : {

		},
		"load" : {
			"line" : {
				command : "addALoad",
				argsGen : function(data, settings) {
					var result = {};
					result.x1 = data.from.X;
					result.y1 = data.from.Y;
					result.x2 = data.to.X;
					result.y2 = data.to.Y;
					result.nT = settings.LoadSnapToNodeThreshold;
					result.lT = settings.LoadSnapToLineThreshold;
					result.nLoadType = settings.defaultNodeLoadType;
					if(settings.snapToGrid) {
						result.grid = settings.grid;
					}
					return result;
				},
				undo : true
			},
			"squareBracket" : {
				command : "addUniformElementLoad",
				argsGen : function(data, settings) {
					var result = {};
					result.x1 = data.from.X;
					result.y1 = data.from.Y;
					result.x2 = data.to.X;
					result.y2 = data.to.Y;
					result.x3 = data.MidPoint.X;
					result.y3 = data.MidPoint.Y;
					result.aT = settings.UniformElementLoadDirectionThreshold;
					result.lT = settings.UniformElementLoadSnapToLineThreshold;
					return result;
				},
				undo : true
			},

		}

	},

	act : function(recognizeResult, settings) {
		var obj, args, undo;
		obj = this.vocabulary[settings.mode][recognizeResult.name];
		console.log("obj: ", obj, " recognize result ", recognizeResult);
		if(Ext.isFunction(obj)) {
			obj = obj.call(this);
		}
		if(Ext.isDefined(obj) && Ext.isObject(obj)) {
			args = obj.argsGen.call(this, recognizeResult.data, settings);
			if(!ut.isArray(args)) {
				args = [args];
			}
			args.unshift(obj.command);
			undo = obj.undo;
			if(undo) {
				this.Root.runsave.apply(this.Root, args);
				this.bottomBar.getComponent(5).setDisabled(false);
				this.bottomBar.getComponent(6).setDisabled(true);
			} else {
				this.Root.runnotsave.apply(this.Root, args);
			}
			return true;
		}

		return false;
	},
})
window.Controller = sketchit.controllers.sketchitController;
