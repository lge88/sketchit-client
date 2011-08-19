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
	Renderer = ut.extend(ut.ObjectHasDefault, {
		
		ctx:undefined,
		height:0,
		width:0,
		
		modelScale : 2.0,
		modelOriginX : 0.0,
		modelOriginY : 0.0,
		viewPortScale : 1.0,
		viewPortShiftX : 0.0,
		viewPortShiftY : 0.0,
		
		initTransform : function() {
			this.ctx.setTransform(1, 0, 0, -1, 0, this.height);
			return this;
		},
		
		save:function(){
			this.ctx.save();
			return this;
		},
		
		restore:function(){
			this.ctx.restore();
			return this;
		},
		
		transform:function(){
			this.ctx.transform.apply(this.ctx,arguments);
			return this;
		},

		model2Canvas : function() {
			this.ctx.transform(this.modelScale, 0, 0, this.modelScale, this.modelOriginX, this.modelOriginY);
			return this;
		},
		
		drawLine : function(from, to) {
			this.ctx.beginPath();
			this.ctx.moveTo(from.X,from.Y);
			this.ctx.lineTo(to.X,to.Y);
			this.ctx.stroke();
			return this;
		},
		
		//mode=  0:stroke, 1:filled, 2:stroke and filled
		drawSquare: function(center,halfEdgeLength,mode){
			this.ctx.beginPath();
			this.ctx.moveTo(center.X-halfEdgeLength,center.Y-halfEdgeLength);
			this.ctx.lineTo(center.X+halfEdgeLength,center.Y-halfEdgeLength);
			this.ctx.lineTo(center.X+halfEdgeLength,center.Y+halfEdgeLength);
			this.ctx.lineTo(center.X-halfEdgeLength,center.Y+halfEdgeLength);
			this.ctx.closePath();
			if (mode==0){
				this.ctx.stroke();
			} else if (mode==1){
				this.ctx.fill();
			} else if (mode==2){
				this.ctx.stroke();
				this.ctx.fill();
			}
			return this;			
		}
		
		
	});

	lib.Renderer = Renderer;
})();
