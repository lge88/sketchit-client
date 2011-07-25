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
			this.strokes = [];
			this.filledPolygons = [];

			this.ctx = this.Canvas.getContext("2d");
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.strokeStyle = this.options.lineElementColor;

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
				dl : 10,   //dash line interval
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
			
			p= {
				X: p.X+this.options.viewPortTranslate.x,
				Y: p.Y+this.options.viewPortTranslate.y				
			};
			
			// recover model scale and translate:

			return {
				X : (p.X - this.options.canvasOrigin.x) / this.options.modelScale.x,
				Y : -(p.Y - this.options.canvasOrigin.y) / this.options.modelScale.y
			}
		},
		viewPortTransform : function() {
			this.ctx.translate(this.options.viewPortTranslate.x, this.options.viewPortTranslate.y);
			this.ctx.scale(this.options.viewPortScale.x, this.options.viewPortScale.y);
		},
		drawASingleStroke : function(p1, p2, style, dashStyle) {

			this.ctx.save();
			if(Ext.isDefined(style)) {
				this.ctx.strokeStyle = style;
			}

			if(!Ext.isDefined(dashStyle)) {
				this.ctx.beginPath();
				this.ctx.moveTo(p1.X, p1.Y);
				this.ctx.lineTo(p2.X, p2.Y);
				this.ctx.stroke();
			} else {
				var i, d = distance(p1, p2), n = Math.round(d / dashStyle.dl), dx = (p2.X - p1.X) / n, dy = (p2.Y - p1.Y) / n;
				this.ctx.beginPath();
				for( i = 0; i < n; i++) {
					this.ctx.moveTo(p1.X + n * dx, p1.Y + n * dy);
					this.ctx.lineTo(p2.X + n + 1 * dx + dashStyle.r * dx, p2.Y + dashStyle.r * dy);
				}
				this.ctx.stroke();
			}
			this.ctx.restore();
		},
		clear : function() {

			this.ctx.save();
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.ctx.restore();

		},
		render : function() {
			this.ctx.save();
			this.viewPortTransform();
			this.drawModel();
			this.drawNodeId();
			this.drawMarks();
			this.drawGrid();
			this.ctx.restore();
		},
		refresh : function() {
			this.clear();
			this.render();
		}
	});

	lib.Renderer = Renderer;
})();
