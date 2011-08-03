(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	ModelBuilder;

	lib=window.sketchitLib;
	ModelBuilder = Ext.extend(lib.Undoable, {
		defaults:{
			type:"basic",
			ndm:2,
			ndf:3
		},
		toTcl:function(){
			return "model "+this.data.type+" -ndm "+this.data.ndm+" -ndf "+this.data.ndf;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.ModelBuilder=ModelBuilder;
})();