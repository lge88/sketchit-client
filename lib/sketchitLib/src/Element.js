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
	
	
	
	
	
	
	
	
	
	lib.Element=Element;
	lib.lineElement=lineElement;
	lib.elasticBeamColumn=elasticBeamColumn;
	lib.truss=truss;
	lib.noneLinearBeamColumn=noneLinearBeamColumn;
	lib.beamWithHinges=beamWithHinges;
})();