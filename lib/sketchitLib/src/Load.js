(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut,      //
	Load, PlainLoad, NodeLoad, PointElementLoad, UniformElementLoad,     // UniformExcitationLoad, //
	LoadStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	Load = ut.extend(ut.Selectable, {
		//Pattern:undefined
	});
	PlainLoad = ut.extend(Load, {});
	NodeLoad = ut.extend(PlainLoad, {
		//node:undefined
		//type: "load" or "sp"
		//X:
		//Y:
		//RZ:
		defaults : {
			ComponetName : "NodeLoad",
			type : "load",
			node : undefined,
			nodeAtArrowEnd : true,
			arrowLength : undefined,
			arrowAngle : undefined,

			X : undefined,
			Y : undefined,
			RZ : undefined,

			isSelected : false,
			isShow : true,
		},

		lineWidth : 3,
		normalStrokeStyle : [0, 0, 0, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		arrowHeadSize : 20,
		halfArrowAngle : Math.PI / 6,

		display : function(renderer, scale) {
			if(!this.isShow) {
				return false;
			} else {
				renderer.ctx.lineWidth = this.lineWidth / scale;
				if(this.isSelected) {
					renderer.ctx.strokeStyle = ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle = ut.array2rgba(this.normalStrokeStyle);
				}
				var start = this.nodeAtArrowEnd ? {
					X : this.node.X - this.arrowLength * Math.cos(this.arrowAngle),
					Y : this.node.Y - this.arrowLength * Math.sin(this.arrowAngle)
				} : this.node;

				renderer.save();
				renderer.drawArrow(start, this.arrowLength, this.arrowAngle, this.arrowHeadSize, this.halfArrowAngle);
				renderer.restore();
				return true;
			}
		},
		toTcl : function() {
			return this.type + " " + this.node.id + " " + this.X + " " + this.Y + " " + this.RZ;
		}
	});
	PointElementLoad = ut.extend(PlainLoad, {
		lineWidth : 3,
		normalStrokeStyle : [0, 0, 0, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		arrowHeadSize : 20,
		halfArrowAngle : Math.PI / 6,

		defaults : {
			ComponetName : "PointElementLoad",
			element : undefined,
			Pz : undefined,
			xL : undefined,
			Px : undefined,

			elementAtArrowEnd : true,
			arrowLength : undefined,
			arrowAngle : undefined,

			isSelected : false,
			isShow : true,
		},
		toTcl : function() {
			return "eleLoad -ele " + this.element.id + " -type -beamPoint " + this.Pz + " " + this.xL + (ut.isDefined(this.Px) ? " " + this.Px : "");
		},
		getPointOnElememt : function() {
			return {
				X : this.element.from.X + this.xL * (this.element.to.X - this.element.from.X),
				Y : this.element.from.Y + this.xL * (this.element.to.Y - this.element.from.Y)
			}
		},
		display : function(renderer, scale) {
			if(!this.isShow) {
				return false;
			} else {
				renderer.ctx.lineWidth = this.lineWidth / scale;
				if(this.isSelected) {
					renderer.ctx.strokeStyle = ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle = ut.array2rgba(this.normalStrokeStyle);
				}
				var node = this.getPointOnElememt(), start = this.elementAtArrowEnd ? {
					X : node.X - this.arrowLength * Math.cos(this.arrowAngle),
					Y : node.Y - this.arrowLength * Math.sin(this.arrowAngle)
				} : node;

				renderer.save();
				renderer.drawArrow(start, this.arrowLength, this.arrowAngle, this.arrowHeadSize, this.halfArrowAngle);
				renderer.restore();
				return true;
			}
		},
		//element:undefined
		//TODO:
		//X:
		//Y:
		//RZ:
		//toTcl:

	});
	UniformElementLoad = ut.extend(PlainLoad, {
		lineWidth : 1,
		normalStrokeStyle : [0, 0, 0, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		arrowHeadSize : 10,
		halfArrowAngle : Math.PI / 6,
		arrowSpace : 20,

		defaults : {
			ComponetName : "UniformElementLoad",
			element : undefined,
			Wz : undefined,
			Wx : undefined,

			elementAtArrowEnd : true,
			arrowLength : undefined,

			isSelected : false,
			isShow : true,
		},
		toTcl : function() {
			return "eleLoad -ele " + this.element.id + " -type -beamUniform " + this.Wz + (ut.isDefined(this.Wx) ? " " + this.Wx : "");
		},
		display : function(renderer, scale) {
			if(!this.isShow) {
				return false;
			} else {
				var l, n, dx, dy, node, dangle, dArrowLenX, dArrowLenY, start;
				renderer.ctx.lineWidth = this.lineWidth / scale;
				if(this.isSelected) {
					renderer.ctx.strokeStyle = ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle = ut.array2rgba(this.normalStrokeStyle);
				}
				l = this.element.getLength();
				n = Math.round(l / arrowSpace * scale);
				dx = this.element.getDx() / n;
				dy = this.element.getDy() / n;
				node = {
					X : this.element.from.X,
					Y : this.element.to.Y
				};
				dangle = this.Wz > 0 ? Math.PI / 2 : -Math.PI / 2;
				dArrowLenX = this.arrowLength * Math.cos(this.element.getAngle() + dangle);
				dArrowLenY = this.arrowLength * Math.sin(this.element.getAngle() + dangle);
				start = this.elementAtArrowEnd ? {
					X : node.X - dArrowLenX,
					Y : node.Y - dArrowLenY
				} : node;
				renderer.save();
				renderer.drawArrow(start, this.arrowLength, this.element.getAngle() + dangle, this.arrowHeadSize, this.halfArrowAngle);
				renderer.restore();

				while(node.X < this.element.to.X) {
					node.X += dx;
					node.Y += dy;
					start = this.elementAtArrowEnd ? {
						X : node.X - dArrowLenX,
						Y : node.Y - dArrowLenY
					} : node;
					renderer.save();
					renderer.drawArrow(start, this.arrowLength, this.element.getAngle() + dangle, this.arrowHeadSize, this.halfArrowAngle);
					renderer.restore();
				}
				return true;
			}
		},
		//element:undefined
		//TODO:
		//X:
		//Y:
		//RZ:
		//toTcl:

	});

	/*
	 UniformExcitationLoad = ut.extend(Load, {
	 defaults:{
	 direction:1
	 }
	 });*/

	LoadStore = ut.extend(ut.ObjectArrayStore, {
		model : Load,
		/*
		 drawAll:function(renderer,scale){
		 var i;
		 for (i=0;i<this.max+1;i++){
		 if (ut.isDefined(this[i])){
		 this[i].display(renderer,scale);
		 }
		 }
		 },
		 toTcl:function(){
		 var i,result="";
		 for (i=0;i<this.max+1;i++){
		 result+=this[i].toTcl()+";\n";
		 }

		 }*/
	});

	lib.Load = Load;
	lib.PlainLoad = PlainLoad;
	lib.NodeLoad = NodeLoad;
	lib.PointElementLoad = PointElementLoad;
	lib.UniformElementLoad = UniformElementLoad;
	//lib.UniformExcitationLoad = UniformExcitationLoad;

	lib.LoadStore = LoadStore;

})();
