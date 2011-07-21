(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Renderer;

	//untility functions for private use:

	/**
	 * flip Y coordinate of a point
	 */
	function flipY(p) {
		return {
			X : p.X,
			Y : -p.Y
		}
	};

	lib = window.sketchitLib;
	Renderer = Ext.extend(Object, {
		constructor : function(config) {
			Ext.apply(this, config);

			//this.inputStrokes = [];
			this.strokes = [];
			this.filledPolygons = [];

			this.ctx = this.Canvas.getContext("2d");

		},
		setOptions : function(options) {
			Ext.apply(this.options, options);
		},
		Root : undefined,
		Canvas : undefined,
		ctx : undefined,

		options : {
			modelScale : {
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

		},
		drawASingleStroke : function(p1,p2,style) {
			
			this.ctx.save();
			if(Ext.isDefined(style)){
				this.ctx.strokeStyle = style;
			}
			
			this.ctx.beginPath();
			this.ctx.moveTo(p1.X, p1.Y);
			this.ctx.lineTo(p2.X, p2.Y);
			this.ctx.stroke();
			
			this.ctx.restore();
		},
		render : function() {

		}
	});

	lib.Renderer = Renderer;
})();
