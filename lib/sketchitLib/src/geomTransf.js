(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	geomTransf;

	lib=window.sketchitLib;
	geomTransf = Ext.extend(lib.Undoable, {
		defaults:{
			type:"PDelta" //["Linear","PDelta","Corotational"]
		},
		
		toTcl:function(){
			return "geomTransf "+this.data.id+" "+this.data.type;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.geomTransf=geomTransf;
})();