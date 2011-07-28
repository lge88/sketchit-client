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
		options : undefined,
		ctx : undefined,
		width : 0,
		height : 0,
		model2CanvasTransform : function() {
			//this.ctx.lineWidth=this.ctx.lineWidth/this.options.modelScale.sx;
			this.ctx.transform(this.options.modelScale.sx,0,0,this.options.modelScale.sy,0,0)
		},
		applyLineElementStyle: function(){
			this.ctx.lineWidth=this.options.lineElementWidth/this.options.modelScale.sx/this.options.scale.sx;
			this.ctx.strokeStyle=this.options.lineElementColor;
		},
		applyNodeStyle: function(){
			//this.ctx.lineWidth=this.options.lineElementWidth/this.options.modelScale.sx/this.options.scale.sx;
			
			this.ctx.fillStyle=this.options.nodeColor;
		},
		
		drawLineElements: function(){
			var i,len,r,el;
			r=this.Root;
			this.ctx.save();
			this.applyLineElementStyle();
			this.model2CanvasTransform();

			for (i=0,len=r.findTarget("elements").getLength();i<len;i++){
				el=r.findTarget(["elements",i]);
				//console.log("from",el.findTarget("from").data)
				this.drawASingleStroke(el.findTarget("from").data,el.findTarget("to").data);
				
			}
			this.ctx.restore();
			
		},
		drawNodes:function(){
			var i,len,r,n,dx;
			r=this.Root;
			dx=this.options.nodeSize/this.options.modelScale.sx/this.options.scale.sx;
			this.ctx.save();
			this.applyNodeStyle();
			this.model2CanvasTransform();

			for (i=0,len=r.findTarget("nodes").getLength();i<len;i++){
				n=r.findTarget(["nodes",i]);
				//console.log("n",n.data)
				//this.drawASingleStroke(el.findTarget("from").data,el.findTarget("to").data);
				this.ctx.fillRect(n.data.X-dx,n.data.Y-dx,2*dx,2*dx)
				
			}
			this.ctx.restore();
			
			
		},
		
		
		drawASingleStroke : function(p1, p2, style) {
			//console.log("p1 ",p1," p2 ",p2)
			this.ctx.save();
			if(!Ext.isDefined(style)) {
				var style = {
					strokeStyle : this.options.lineElementColor
				}
			}

			//if(Ext.isDefined(style.strokeStyle)) {
			//this.ctx.strokeStyle = style.strokeStyle;
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
		initTransform : function() {
			this.ctx.setTransform(1, 0, 0, -1, 0, this.height);
		},
		
		resetViewPort : function() {
			this.initTransform();
			this.options.scale = {
				sx : 1.0,
				sy : 1.0
			};
			this.options.shift = {
				dx : 0,
				dy : 0
			};
			this.ctx.transform(this.options.scale.sx, 0, 0, this.options.scale.sy, this.options.shift.dx, this.options.shift.dy);
		},
		clear : function() {
			//delete this.inputStrokes;
			this.ctx.save();
			this.initTransform();
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.ctx.restore();
		},
		render : function() {
			//this.ctx.save();
			//this.viewPortTransform();
			//this.drawContinous(this.inputStrokes);
			this.drawLineElements();
			this.drawNodes();
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
