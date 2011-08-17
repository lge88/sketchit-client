(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Element, LineElement,  //
	LineElementShape, selectedLineElementShape,ElasticBeamColumnShape, //
	ElasticBeamColumn, Truss, NoneLinearBeamColumn, BeamWithHinges, //
	ElementsStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	Element = ut.inherit(ut.OPS_Component, ut.Renderable, {
		ComponetName : "Element",

	});
	LineElementShape = ut.extend(ut.stroke, {
		model : undefined,
		lineWidth : 3,
		strokeStyle : [0, 0, 255, 255],
		constructor:function(){
			LineElementShape.superclass.constructor.apply(this, arguments);
			this.ctx=this.model.renderer.ctx;
			this.lineWidth=this.lineWidth/this.model.renderer.options.modelScale.sx;
			this.vertice = [this.model.from.X,this.model.from.Y,this.model.to.X,this.model.to.Y]	
		}
	});
	ElasticBeamColumnShape = ut.extend(LineElementShape, {});
	selectedLineElementShape = ut.extend(ut.dashLine, {});
	LineElement = ut.extend(Element, {
		from : undefined,
		to : undefined,
		selectedShapeConstructor : selectedLineElementShape,
		normalShapeConstructor : LineElementShape,
		shapeConstructor : LineElementShape,
		select : function() {
			ut.OPS_Component.select.apply(this);
			this.shapeConstructor = this.selectedShapeConstructor;
			this.createShape();
		},
		unselect : function() {
			ut.OPS_Component.unselect.apply(this);
			this.shapeConstructor = this.normalShapeConstructor;
			this.createShape();
		},
		constructor : function() {
			ut.ObjectHasDefault.apply(this, arguments);
			this.createShape();
		}
	});
	ElasticBeamColumn = ut.extend(LineElement, {
		ComponetName:"ElasticBeamColumn",
		A : 100,
		E : 29000,
		I : 833.3333,
		toTcl : function() {
			return "element elasticBeamColumn " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});
	ElementsStore = ut.extend(ut.ObjectArrayStore, {
		model : Element,
	});

	lib.Element = Element;
	lib.LineElementShape = LineElementShape;
	lib.selectedLineElementShape = selectedLineElementShape;
	lib.LineElement = LineElement;
	lib.ElasticBeamColumn = ElasticBeamColumn;
	lib.ElasticBeamColumnShape=ElasticBeamColumnShape
	lib.Truss = Truss;
	lib.NoneLinearBeamColumn = NoneLinearBeamColumn;
	lib.BeamWithHinges = BeamWithHinges;
	lib.ElementsStore = ElementsStore;
})();
