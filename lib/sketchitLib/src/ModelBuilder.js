(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,ut,ModelBuilder;

	lib=window.sketchitLib;
	ut=lib.ut;
	ModelBuilder = ut.extend(ut.Selectable, {
		defaults:{
			type:"basic",
			ndm:2,
			ndf:3
		},
		toTcl:function(){
			return "model "+this.type+" -ndm "+this.ndm+" -ndf "+this.ndf;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.ModelBuilder=ModelBuilder;
})();