(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Element, LineElement,  //
	ElasticBeamColumn, Truss, NoneLinearBeamColumn, BeamWithHinges, //
	ElementsStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	Element = ut.extend(ut.Selectable, {
		ComponetName : "Element",

	});

	LineElement = ut.extend(Element, {
		from : undefined,
		to : undefined,	
		isSelected:false,
		isShow:true,
		
		lineWidth : 5,
		normalStrokeStyle : [0, 0, 255, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		
		display:function(renderer,scale){
			if (!this.isShow){
				return false;
			} else {				
				renderer.ctx.lineWidth=this.lineWidth/scale;
				if (this.isSelected){					
					renderer.ctx.strokeStyle=ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle=ut.array2rgba(this.normalStrokeStyle);
				}		
				renderer.drawLine(this.from,this.to);
				return true;								
			}	
		},
		move:function(dx,dy){
			this.from.move(dx,dy);
			this.to.move(dx,dy);
		}
	});
	ElasticBeamColumn = ut.extend(LineElement, {
		defaults:{
			ComponetName:"ElasticBeamColumn",
			from : undefined,
			to : undefined,				
			A : 100,
			E : 29000,
			I : 833.3333,
			geomTransf:undefined,
			
			isSelected:false,
			isShow:true,
		},	
		toTcl : function() {
			return "element elasticBeamColumn " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});
	Truss = ut.extend(LineElement, {
		defaults:{
			ComponetName:"Truss",
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
		drawAll:function(renderer,scale){
			var i;
			for (i=0;i<this.max+1;i++){
				if (ut.isDefined(this[i])){
					this[i].display(renderer,scale);
				}
			}
		}
	});

	lib.Element = Element;
	lib.LineElement = LineElement;
	
	lib.ElasticBeamColumn = ElasticBeamColumn;
	lib.Truss = Truss;
	lib.NoneLinearBeamColumn = NoneLinearBeamColumn;
	lib.BeamWithHinges = BeamWithHinges;
	
	lib.ElementsStore = ElementsStore;
})();
