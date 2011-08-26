(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Mass;

	lib=window.sketchitLib;
	Mass = Ext.extend(lib.Undoable, {
		toTcl:function(){
			return "mass "+this.data.node.data.id+" "+this.data.X+" "+this.data.Y+" "+this.data.RZ;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.Mass=Mass;
})();