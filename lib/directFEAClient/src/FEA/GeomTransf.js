(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,ut,//
	GeomTransf,GeomTransfStore;

	lib=window.sketchitLib;
	ut=lib.ut;
	GeomTransf = ut.extend(ut.Selectable, {
		defaults:{
			type:"PDelta" //["Linear","PDelta","Corotational"]
		},		
		toTcl:function(){
			return "geomTransf "+this.type+" "+this.id;
		}		
	});
	
	GeomTransfStore = ut.extend(ut.ObjectArrayStore, {
		model : GeomTransf
	});

	lib.GeomTransf=GeomTransf;
	lib.GeomTransfStore=GeomTransfStore;
})();