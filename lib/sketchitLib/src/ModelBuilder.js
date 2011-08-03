(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,ut,ModelBuilder;

	lib=window.sketchitLib;
	ut=lib.ut;
	ModelBuilder = ut.extend(ut.Cmpnt, {
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