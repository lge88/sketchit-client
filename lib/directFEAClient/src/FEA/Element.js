(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Element, LineElement,    //
	ElasticBeamColumn, Truss, NoneLinearBeamColumn, BeamWithHinges,   //
	ElementsStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	function vectorAngle(dx, dy) {
		var a = Math.acos(dx / Math.sqrt(dx * dx + dy * dy));
		if(dy < 0) {
			a = -a;
		}
		return a
	};
	Element = ut.extend(ut.Selectable, {
		ComponetName : "Element",
		constructor : function() {
			Element.superclass.constructor.apply(this, arguments);
			this.elementLoads = new lib.LoadStore();
		}
	});
	LineElement = ut.extend(Element, {
		from : undefined,
		to : undefined,
		isSelected : false,
		isShow : true,
		showDeformation : true,

		lineWidth : 5,
		normalStrokeStyle : [0, 0, 255, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		deformationStrokeStyle : [0, 0, 255, 128],

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
				renderer.drawLine(this.from, this.to);
				return true;
			}
		},
		//mode:1 linear, mode:2 quardratic, mode:3 cubic...
		getDeflection : function(xL,scale,mode) {
			console.log("deform scale",scale)
			var x1,x2,y1,y2,c,d,t1,t2,deltaY,w;
			
			x1=this.from.X+this.from.dispX*scale;
			x2=this.to.X+this.to.dispX*scale;
			y1=this.from.Y+this.from.dispY*scale;
			y2=this.to.Y+this.to.dispY*scale;
			console.log("y2 ",y2)
			
			c=Math.tan((this.to.dispRZ-this.from.dispRZ));
			d=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
			console.log("d ",d)
			t1=this.getAngle()+this.from.dispRZ;
			t2=vectorAngle(x2-x1,y2-y1);
			//console.log("t1",t1)
			
			switch (mode) {
				case 1:
					//d*Math.sin(t2-this.getAngle())
					return d*Math.sin(t2-this.getAngle())*xL;					
					break;
				case 2:
					break;
				case 3:
					deltaY=Math.sin(t2-t1)*d;
					console.log("deltaY ",deltaY)
					return (c*d-2*deltaY)*xL*xL*xL+(3*deltaY-c*d)*xL*xL				
					break;
				default:
					break;

			}

		},
		
		displayDeformation : function(renderer,viewPortScale, deformScale, delta) {
			
			if(!this.showDeformation) {
				return false;
			} else {
				var n = Math.round(this.getLength() / delta);
				renderer.save();
				renderer.ctx.strokeStyle = ut.array2rgba(this.deformationStrokeStyle);
				renderer.ctx.beginPath();
				renderer.translate(this.from.X+this.from.dispX*deformScale, this.from.Y+this.from.dispY*deformScale);
				renderer.rotate(this.getAngle()+this.from.dispRZ);
				renderer.ctx.moveTo(0,this.getDeflection(0,deformScale,3));
				for( i = 1; i < n + 1; i++) {
					//
					console.log("df",this.getDeflection(i/n,deformScale,3))
					renderer.ctx.lineTo(i/n*this.getLength(), this.getDeflection(i/n,deformScale,3));
					//console.log(this.getDeflection(i/n,3))
				}
				renderer.ctx.stroke();
				renderer.restore();
				return true;
			}

		},
		move : function(dx, dy) {
			this.from.move(dx, dy);
			this.to.move(dx, dy);
		},
		getDx : function() {
			return this.to.X - this.from.X;
		},
		getDy : function() {
			return this.to.Y - this.from.Y;
		},
		getLength : function() {
			return Math.sqrt((this.from.X - this.to.X) * (this.from.X - this.to.X) + (this.from.Y - this.to.Y) * (this.from.Y - this.to.Y));
		},
		getAngle : function() {
			var a = Math.acos(this.getDx() / this.getLength());
			if(this.getDy() < 0) {
				a = -a;
			}
			return a
		}
	});
	ElasticBeamColumn = ut.extend(LineElement, {
		acceptEleLoad : true,
		interporlationMode : 3,
		defaults : {
			ComponetName : "ElasticBeamColumn",
			from : undefined,
			to : undefined,
			A : 100,
			E : 29000,
			I : 833.3333,
			geomTransf : undefined,

			isSelected : false,
			isShow : true,
		},
		toTcl : function() {
			return "element elasticBeamColumn " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});
	Truss = ut.extend(LineElement, {
		acceptEleLoad : false,
		defaults : {
			ComponetName : "Truss",
			A : 100,
			E : 29000,
			I : 833.3333,
		},
		toTcl : function() {
			return "element truss " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});
	ElementsStore = ut.extend(ut.ObjectArrayStore, {
		model : Element,
		/*
		 drawAll:function(renderer,scale){
		 var i;
		 for (i=0;i<this.max+1;i++){
		 if (ut.isDefined(this[i])){
		 this[i].display(renderer,scale);
		 }
		 }
		 }*/
	});

	lib.Element = Element;
	lib.LineElement = LineElement;

	lib.ElasticBeamColumn = ElasticBeamColumn;
	lib.Truss = Truss;
	lib.NoneLinearBeamColumn = NoneLinearBeamColumn;
	lib.BeamWithHinges = BeamWithHinges;

	lib.ElementsStore = ElementsStore;
})();
