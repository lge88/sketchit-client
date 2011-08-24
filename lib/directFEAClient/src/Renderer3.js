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

		canvas : undefined,
		ctx : undefined,

		initTransform : function() {
			this.setTransform(1, 0, 0, -1, 0, this.height);
			return this;
		},
		setTransform : function() {
			this.ctx.setTransform.apply(this.ctx, arguments);
			return this;
		},
		transform : function() {
			this.ctx.transform.apply(this.ctx, arguments);
			return this;
		},
		translate : function() {
			this.ctx.translate.apply(this.ctx, arguments);
			return this;
		},
		rotate : function() {
			this.ctx.rotate.apply(this.ctx, arguments);
			return this;
		},
		scale : function() {
			this.ctx.scale.apply(this.ctx, arguments);
			return this;
		},
		save : function() {
			this.ctx.save();
			return this;
		},
		restore : function() {
			this.ctx.restore();
			return this;
		},
		/*

		 model2Canvas : function() {
		 this.transform(this.modelScale, 0, 0, this.modelScale, this.modelOriginX, this.modelOriginY);
		 return this;
		 },
		 canvas2ViewPort : function() {
		 this.initTransform();
		 this.transform(this.viewPortScale, 0, 0, this.viewPortScale, this.viewPortShiftX, this.viewPortShiftY);
		 },*/
		drawLine : function(from, to) {
			this.ctx.beginPath();
			this.ctx.moveTo(from.X, from.Y);
			this.ctx.lineTo(to.X, to.Y);
			this.ctx.stroke();
			return this;
		},
		drawLineStrip : function(vertice) {
			var i, len;
			len = vertice.length;
			if(len < 2) {
				return this;
			}
			this.ctx.beginPath();
			this.ctx.moveTo(vertice[0].X, vertice[0].Y);
			for( i = 1; i < len; i++) {
				this.ctx.lineTo(vertice[i].X, vertice[i].Y);
			}
			this.ctx.stroke();
			return this;
		},
		drawLineLoop : function(vertice) {
			var i, len;
			len = vertice.length;
			if(len < 3) {
				return this;
			}
			this.ctx.beginPath();
			this.ctx.moveTo(vertice[0].X, vertice[0].Y);
			for( i = 1; i < len; i++) {
				this.ctx.lineTo(vertice[i].X, vertice[i].Y);
			}
			this.ctx.closePath();
			this.ctx.stroke();
			return this;
		},
		//mode=  0:stroke, 1:filled, 2:stroke and filled
		drawSquare : function(center, halfEdgeLength, mode) {
			this.ctx.beginPath();
			this.ctx.moveTo(center.X - halfEdgeLength, center.Y - halfEdgeLength);
			this.ctx.lineTo(center.X + halfEdgeLength, center.Y - halfEdgeLength);
			this.ctx.lineTo(center.X + halfEdgeLength, center.Y + halfEdgeLength);
			this.ctx.lineTo(center.X - halfEdgeLength, center.Y + halfEdgeLength);
			this.ctx.closePath();
			if(mode == 0) {
				this.ctx.stroke();
			} else if(mode == 1) {
				this.ctx.fill();
			}
			return this;
		},
		drawGrid : function(gridx, gridy, left, right, bottom, top) {
			var l = Math.round(left / gridx) * gridx;
			this.ctx.beginPath();
			while(l < right) {
				this.ctx.moveTo(l, bottom);
				this.ctx.lineTo(l, top);
				l += gridx;
			}
			l = Math.round(bottom / gridy) * gridy;
			while(l < top) {
				this.ctx.moveTo(left, l);
				this.ctx.lineTo(right, l);
				l += gridy;
			}
			this.ctx.stroke();
			return this;
		},
		drawArrow : function(start, len, dir, arrowSize, halfArrowAngle) {
			this.translate(start.X, start.Y);
			this.rotate(dir);
			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			this.ctx.lineTo(len, 0);
			this.ctx.moveTo( len - arrowSize * Math.cos(halfArrowAngle), arrowSize * Math.sin(halfArrowAngle));
			this.ctx.lineTo(len, 0);
			this.ctx.lineTo( len - arrowSize * Math.cos(halfArrowAngle), -arrowSize * Math.sin(halfArrowAngle));
			this.ctx.stroke();
			return this;
		},
		drawFilledPolygon : function(vertice) {
			var i, len;
			len = vertice.length;
			if(len < 3) {
				return this;
			}
			this.ctx.beginPath();
			this.ctx.moveTo(vertice[0].X, vertice[0].Y);
			for( i = 1; i < len; i++) {
				this.ctx.lineTo(vertice[i].X, vertice[i].Y);
			}
			this.ctx.closePath();
			this.ctx.fill();
			return this;

		}
	});

	lib.Renderer = Renderer;
})();
