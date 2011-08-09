(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Element, lineElement, elasticBeamColumn, truss, noneLinearBeamColumn, beamWithHinges;
	lib = window.sketchitLib;
	ut = lib.ut;
	
	Element = ut.inherit(ut.OPS_Component, ut.Renderable, {
		ComponetName : "Element",
		
	});
	
	LineElementOutLook = ut.extend(ut.stroke, {
		element : undefined,
		lineWidth : 3,		
		strokeStyle : [0, 0, 255, 255]
	});
	
	selectedLineElementOutLook = ut.extend(ut.dashLine, {});

	
	
	LineElement = ut.extend(Element, {
		from : undefined,
		to : undefined,
		canvasElementConstructor : LineElementOutLook,
		select:function(){
			ut.OPS_Component.select.apply(this);
			this.canvasElement.strokeStyle=this.canvasElement.selectedStrokeStyle;
		},
		unselect:function(){
			ut.OPS_Component.unselect.apply(this);
			this.canvasElement.strokeStyle=this.canvasElement.normalStrokeStyle;
		},

		constructor : function() {
			Node.superclass.constructor.apply(this, arguments);
			this.canvasElement = new this.canvasElementConstructor({
				node : this
			});
		},
	});
	ElasticBeamColumn = Ext.extend(LineElement, {
		A : 100,
		E : 29000,
		I : 833.3333,
		toTcl : function() {
			return "element elasticBeamColumn " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});

	lib.Element = Element;
	lib.lineElement = lineElement;
	lib.elasticBeamColumn = elasticBeamColumn;
	lib.truss = truss;
	lib.noneLinearBeamColumn = noneLinearBeamColumn;
	lib.beamWithHinges = beamWithHinges;
})();
