(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Element,
	lineElement,
	elasticBeamColumn,
	truss,
	noneLinearBeamColumn,
	beamWithHinges;

	lib=window.sketchitLib;
	Element = Ext.extend(lib.Undoable, {});
	lineElement = Ext.extend(Element, {});
	elasticBeamColumn = Ext.extend(lineElement, {
		defaults:{
			A:100,
			E:29000,
			I:833.3
		},				
		toTcl:function(){
			return "element elasticBeamColumn "+this.data.id+" "+this.data.from.data.id+" "+this.data.to.data.id+" "+this.data.A+" "+this.data.E+" "+this.data.I+" "+this.data.geomTransf.id;
		}
	});
	
	
	
	
	
	
	
	lib.Element=Element;
	lib.lineElement=lineElement;
	lib.elasticBeamColumn=elasticBeamColumn;
	lib.truss=truss;
	lib.noneLinearBeamColumn=noneLinearBeamColumn;
	lib.beamWithHinges=beamWithHinges;
})();