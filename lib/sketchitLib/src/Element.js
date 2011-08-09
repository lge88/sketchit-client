(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Element,LineElementShape,selectedLineElementShape,LineElement, //
	ElasticBeamColumn, Truss, NoneLinearBeamColumn, BeamWithHinges;
	
	lib = window.sketchitLib;
	ut = lib.ut;
	
	Element = ut.inherit(ut.OPS_Component, ut.Renderable, {
		ComponetName : "Element",
		
	});
	
	LineElementShape = ut.extend(ut.stroke, {
		element : undefined,
		lineWidth : 3,		
		strokeStyle : [0, 0, 255, 255]
	});
	
	selectedLineElementShape = ut.extend(ut.dashLine, {});

	
	
	LineElement = ut.extend(Element, {
		from : undefined,
		to : undefined,
		//normalLineElementShape:LineElementShape,
		selectedShapeConstructor:selectedLineElementShape,
		shapeConstructor : LineElementShape,
		select:function(){
			ut.OPS_Component.select.apply(this);
			
			this.shapes=[new this.selectedShapeConstructor({
				element:this
			})];
		},
		unselect:function(){
			ut.OPS_Component.unselect.apply(this);
			this.shapes=[new this.shapeConstructor({
				element:this
			})];
		},

		constructor : function() {
			Node.superclass.constructor.apply(this, arguments);
			this.shapes = [new this.shapeConstructor({
				element : this
			})];
		},
	});
	ElasticBeamColumn = ut.extend(LineElement, {
		A : 100,
		E : 29000,
		I : 833.3333,
		toTcl : function() {
			return "element elasticBeamColumn " + this.id + " " + this.from.id + " " + this.to.id + " " + this.A + " " + this.E + " " + this.I + " " + this.geomTransf.id;
		}
	});

	lib.Element = Element;
	lib.LineElementShape = LineElementShape;
	lib.selectedLineElementShape = selectedLineElementShape;
	lib.LineElement = LineElement;
	lib.ElasticBeamColumn = ElasticBeamColumn;
	lib.Truss = Truss;
	lib.NoneLinearBeamColumn = NoneLinearBeamColumn;
	lib.BeamWithHinges = BeamWithHinges;
})();
