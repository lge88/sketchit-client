(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Renderer;

	//untility functions for private use:

	/**
	 * flip Y coordinate of a point
	 */
	/*function flipY(p) {
	 return {
	 X : p.X,
	 Y : -p.Y
	 }
	 };*/

	function distance(p1, p2) {
		var dx = p2.X - p1.X;
		var dy = p2.Y - p1.Y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	lib = window.sketchitLib;
	Renderer = Ext.extend(Object, {
		constructor : function(config) {
			Ext.apply(this, config);

			//this.inputStrokes = [];
			this.inputStrokes = [];
			//this.filledPolygons = [];

			this.ctx = this.Canvas.getContext("2d");
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.strokeStyle = this.options.lineElementColor;
			//console.log("renderer ",this)

		},
		Root : undefined,
		Canvas : undefined,
		ctx : undefined,
		width : 0,
		height : 0,

		options : {
			backgroundColor : 'rgb(255,255,255)',
			lineElementColor : 'rgb(0,0,255)',
			dashStyle : {
				dl : 10,       //dash line interval
				r : 0.5  //the rate of solid line length to dash line interval
			},

			modelScale : { //how many pixels per model length
				x : 2,
				y : 2
			},
			canvasOrigin : {
				x : 0,
				y : 0
			},
			viewPortScale : {
				x : 1.0,
				y : 1.0
			},
			viewPortTranslate : {
				x : 0.0,
				y : 0.0
			},
			//inputStrokeStyle: "rgb(0,0,255)",
			showNodeId : false,
			showElementId : false,
			showMarks : false,
			showGrid : true

		},
		modelPoint2CanvasPoint : function(p) {
			return {
				X : p.X * this.options.modelScale.x + this.options.canvasOrigin.x,
				Y : -p.Y * this.options.modelScale.y + this.options.canvasOrigin.y
			}
		},
		canvasPoint2ModelPoint : function(p) {
			// recover viewport transform:

			p = {
				X : p.X / this.options.viewPortScale.x,
				Y : p.Y / this.options.viewPortScale.y
			};
			p = {
				X : p.X + this.options.viewPortTranslate.x,
				Y : p.Y + this.options.viewPortTranslate.y
			};

			// recover model scale and translate:

			return {
				X : (p.X - this.options.canvasOrigin.x) / this.options.modelScale.x,
				Y : -(p.Y - this.options.canvasOrigin.y) / this.options.modelScale.y
			}
		},
		/*
		viewPortTransform : function() {
			this.ctx.translate(this.options.viewPortTranslate.x, this.options.viewPortTranslate.y);
			this.ctx.scale(this.options.viewPortScale.x, this.options.viewPortScale.y);
		},*/
		coordTranslate : function(p, x, y) {
			if(Ext.isArray(p)) {
				var i,result=[];
				for( i = 0; i < p.length; i++) {
					result.push(this.coordTranslate(p[i], x, y));
				}
				return result;
			} else {
				return {
					X:p.X+x,
					Y:p.Y+y
				}
			}
		},
		coordScale : function(p, x, y,center) {
			if (!Ext.isDefined(center)){
				var center={
					X:0,
					Y:0
				}
			}
			if(Ext.isArray(p)) {
				var i,result=[];
				for( i = 0; i < p.length; i++) {
					result.push(this.coordScale(p[i], x, y,center));
				}
			} else {
				return {
					X:center.X+(p.X-center.X)*x,
					Y:center.Y+(p.Y-center.Y)*y					
				}
			}
		},
		pointTranslate : function() {

		},
		drawASingleStroke : function(p1, p2, style) {
			this.ctx.save();
			if(!Ext.isDefined(style)) {
				var style = {
					strokeStyle : this.options.lineElementColor
				}
			}

			//if(Ext.isDefined(style.strokeStyle)) {
			this.ctx.strokeStyle = style.strokeStyle;
			//}

			if(!Ext.isDefined(style.dashStyle)) {
				this.ctx.beginPath();
				//this.ctx.translate(p1.X,p1.Y);
				this.ctx.moveTo(p1.X, p1.Y);
				this.ctx.lineTo(p2.X, p2.Y);
				//this.ctx.lineTo(6,6);
				this.ctx.stroke();
			} else {
				var i, d = distance(p1, p2), n = Math.round(d / style.dashStyle.dl), dx = (p2.X - p1.X) / n, dy = (p2.Y - p1.Y) / n;
				this.ctx.beginPath();
				for( i = 0; i < n; i++) {
					this.ctx.moveTo(p1.X + n * dx, p1.Y + n * dy);
					this.ctx.lineTo(p2.X + n + 1 * dx + style.dashStyle.r * dx, p2.Y + dashStyle.r * dy);
				}
				this.ctx.stroke();
			}
			this.ctx.restore();
		},
		drawContinous : function(pts, style) {
			var i, len;
			if(Ext.isArray(style)) {
				for( i = 0, len = pts.length; i < len - 1; i++) {
					this.drawASingleStroke(pts[i], pts[i + 1], style[i]);
				}
			} else {
				for( i = 0, len = pts.length; i < len - 1; i++) {
					this.drawASingleStroke(pts[i], pts[i + 1], style);
				}

			}
		},
		clear : function() {

			this.ctx.save();
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.fillRect(-100000, -100000, 200000, 200000);
			this.ctx.restore();

		},
		render : function() {
			//this.ctx.save();
			//this.viewPortTransform();
			this.drawContinous(this.inputStrokes);
			//this.drawModel();
			//this.drawNodeId();
			//this.drawMarks();
			//this.drawGrid();
			//this.ctx.restore();
		},
		refresh : function() {
			this.clear();
			this.render();
		},
		//draw
	});

	lib.Renderer = Renderer;
})();
