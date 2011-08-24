(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Renderer;

	//untility functions for private use:

	function distance(p1, p2) {
		var dx = p2.X - p1.X;
		var dy = p2.Y - p1.Y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	lib = window.sketchitLib;
	ut = lib.ut;
	Renderer = ut.extend(ut.ObjectArrayStore, {
		Canvas : undefined,
		ctx : undefined,
		width : 0,
		height : 0,
		theShapes : new ut.ObjectArrayStore({
			model : ut.Shape
		}),
		options : {
			NodeShape : lib.NodeShape,
			ElasticBeamColumnShape : lib.ElasticBeamColumnShape,
			//ElasticBeamColumnShape

			inputStokeStyle : "rgb(0,0,255)",
			inputStrokeWidth : 2,
			lineWidthUppeLimit : 5,
			nodeSize : 2,
			nodeColor : "rgb(255,0,0)",
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
				dl : 10,                    //dash line interval
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
			grid : 20,
			gridWidth : 1,
			gridColor : "rgba(0,0,0,0.3)",

			pointSnapThreshold : 30,
			lineSnapThreshold : 10,

			SPCColor : 'rgb(0,0,0)',
			SPCLineWidth : 2,
			SPCTriangleSize : 20,
			SPCGroundLength : 40,
			SPCGroundThickness : 8,
			SPCGroundN : 10,
			SPCPinRadius : 5,
			SPCRollerRadius : 3,
			SPCSnapToNodeThreshold : 50

		},

		model2CanvasTransform : function() {
			this.ctx.transform(this.options.modelScale.sx, 0, 0, this.options.modelScale.sy, this.options.canvasOrigin.x, this.options.canvasOrigin.y)
		},
		applyGridStyle : function() {
			this.ctx.lineWidth = this.options.gridWidth / this.options.modelScale.sx / this.options.scale.sx;
			this.ctx.strokeStyle = this.options.gridColor;
		},
		/*
		 applyLineElementStyle: function(){
		 this.ctx.lineWidth=this.options.lineElementWidth/this.options.modelScale.sx/this.options.scale.sx;
		 this.ctx.strokeStyle=this.options.lineElementColor;
		 },
		 applyNodeStyle: function(){
		 this.ctx.fillStyle=this.options.nodeColor;
		 },
		 applyGridStyle: function(){
		 this.ctx.lineWidth=this.options.gridWidth/this.options.modelScale.sx/this.options.scale.sx;
		 this.ctx.strokeStyle=this.options.gridColor;
		 },
		 applySPCStyle: function(){
		 this.ctx.lineWidth=this.options.SPCLineWidth/this.options.modelScale.sx/this.options.scale.sx;
		 this.ctx.strokeStyle=this.options.SPCColor;
		 },*/

		/*

		 drawLineElements : function() {
		 var i, r, el;
		 r = this.Root;
		 this.ctx.save();
		 this.applyLineElementStyle();
		 this.model2CanvasTransform();

		 Ext.each(r.data.elements.data, function(el, i, ar) {
		 if(Ext.isDefined(el)) {
		 this.drawASingleStroke(el.findTarget("from").data, el.findTarget("to").data);
		 }
		 }, this)
		 this.ctx.restore();

		 },
		 drawNodes : function() {
		 var i, r, n, dx;
		 r = this.Root;
		 dx = this.options.nodeSize / this.options.modelScale.sx / this.options.scale.sx;
		 this.ctx.save();
		 this.applyNodeStyle();
		 this.model2CanvasTransform();

		 Ext.each(r.data.nodes.data, function(node, i, ar) {
		 if(Ext.isDefined(node)) {
		 this.ctx.fillRect(node.data.X - dx, node.data.Y - dx, 2 * dx, 2 * dx)
		 }
		 }, this)
		 this.ctx.restore();

		 },
		 drawSPC : function() {
		 var k, R, spc, edge, t, w, s, rpin, rroller;
		 R = this.Root;
		 edge = this.options.SPCTriangleSize / this.options.modelScale.sx//this.options.scale.sx;
		 t = this.options.SPCGroundThickness / this.options.modelScale.sx//this.options.scale.sx;
		 w = this.options.SPCGroundLength / this.options.modelScale.sx//this.options.scale.sx;
		 s = w / this.options.SPCGroundN;
		 rpin = this.options.SPCPinRadius / this.options.modelScale.sx//this.options.scale.sx;
		 rroller = this.options.SPCRollerRadius / this.options.modelScale.sx//this.options.scale.sx;

		 this.ctx.save();
		 this.applySPCStyle();
		 this.model2CanvasTransform();

		 Ext.each(R.data.SPConstraints.data, function(spc, i, ar) {
		 if(Ext.isDefined(spc)) {
		 this.ctx.save();
		 this.ctx.translate(spc.data.node.data.X, spc.data.node.data.Y);
		 this.ctx.rotate(spc.data.angle);
		 this.ctx.beginPath();
		 if(spc.data.RZ === 0) {
		 this.ctx.arc(0, 0, rpin, 0, Math.PI * 2, true);
		 this.ctx.moveTo(rpin * Math.cos(Math.PI / 6), rpin * Math.sin(Math.PI / 6));
		 this.ctx.lineTo(edge, edge * 0.5);
		 this.ctx.lineTo(edge, -edge * 0.5);
		 this.ctx.lineTo(rpin * Math.cos(Math.PI / 6), -rpin * Math.sin(Math.PI / 6));
		 } else {
		 this.ctx.moveTo(0, 0);
		 this.ctx.lineTo(edge, edge * 0.5);
		 this.ctx.lineTo(edge, -edge * 0.5);
		 this.ctx.lineTo(0, 0);
		 }

		 if(spc.data.X === 0 || spc.data.Y === 0) {
		 this.ctx.moveTo(edge + 2 * rroller, edge * 0.5 - rroller);
		 this.ctx.arc(edge + rroller, edge * 0.5 - rroller, rroller, 0, Math.PI * 2, true);
		 this.ctx.moveTo(edge + 2 * rroller, -edge * 0.5 + rroller);
		 this.ctx.arc(edge + rroller, -edge * 0.5 + rroller, rroller, 0, Math.PI * 2, true);
		 this.ctx.translate(edge + 2 * rroller, 0);
		 } else {
		 this.ctx.translate(edge, 0);
		 }

		 this.ctx.moveTo(0, -w * 0.5);
		 this.ctx.lineTo(0, w * 0.5);
		 k = -w * 0.5;

		 while(k < w * 0.5) {
		 this.ctx.moveTo(0, k);
		 this.ctx.lineTo(s, k + s);
		 k += s;
		 }

		 this.ctx.stroke();
		 this.ctx.restore();

		 }
		 }, this)
		 this.ctx.restore();

		 },*/
		drawGrid : function() {
			var l, grid = this.options.grid;
			l = grid;
			this.ctx.save();
			//TODO: this.height and width need to be transformed to viewport coordinates
			this.applyGridStyle();
			this.ctx.beginPath();
			while(l < this.width) {
				this.ctx.moveTo(l, 0);
				this.ctx.lineTo(l, this.height);
				l += grid;
			}
			l = grid;
			while(l < this.height) {
				this.ctx.moveTo(0, l);
				this.ctx.lineTo(this.width, l);
				l += grid;
			}
			this.ctx.stroke();
			this.ctx.restore();

		},
		/*
		 //TODO: drawASingleStroke and drawContinous sucks, optimize them

		 drawASingleStroke : function(p1, p2, style) {

		 this.ctx.save();
		 if(!Ext.isDefined(style)) {
		 var style = {
		 strokeStyle : this.options.lineElementColor
		 }
		 }

		 if(!Ext.isDefined(style.dashStyle)) {
		 this.ctx.beginPath();
		 this.ctx.moveTo(p1.X, p1.Y);
		 this.ctx.lineTo(p2.X, p2.Y);
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
		 },*/
		drawStroke : function(pts, width, style) {
			var i, len;
			this.ctx.save();
			this.ctx.lineWidth = width;
			this.ctx.strokeStyle = style;
			this.ctx.beginPath();
			this.ctx.moveTo(pts[0].X, pts[0].Y);
			for( i = 0, len = pts.length; i < len - 1; i++) {
				this.ctx.lineTo(pts[i+1].X, pts[i+1].Y);
			}
			this.ctx.stroke();
			this.ctx.restore();
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
			this.ctx.save();
			this.initTransform();
			this.ctx.fillStyle = this.options.backgroundColor;
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.ctx.restore();
		},
		render : function() {
			//this.initTransform();
			this.ctx.save();
			this.model2CanvasTransform();
			var i, len;
			for( i = 0, len = this.theShapes.max + 1; i < len; i++) {
				if(ut.isDefined(this.theShapes[i])) {
					//console.log("shape i",i)
					this.theShapes[i].display();
				}
			}
			this.ctx.restore();
			if (this.options.showGrid){
				this.drawGrid();
			}

			//this.ctx.moveTo(0,0);
			//this.ctx.lineTo(100,100);
			//this.ctx.stroke()

			//this.drawLineElements();
			//this.drawNodes();
			//this.drawSPC();
			//this.drawGrid();

		},
		refresh : function() {
			this.clear();
			this.render();
		},
		//draw
	});

	lib.Renderer = Renderer;
})();