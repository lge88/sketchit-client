(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	GeomTransf;

	lib=window.sketchitLib;
	GeomTransf = Ext.extend(lib.Undoable, {
		defaults:{
			type:"PDelta" //["Linear","PDelta","Corotational"]
		},
		
		toTcl:function(){
			return "geomTransf "+this.data.id+" "+this.data.type;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.GeomTransf=GeomTransf;
})();