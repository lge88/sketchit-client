(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Node;

	lib=window.sketchitLib;
	Node = Ext.extend(lib.Undoable, {
		toTcl:function(){
			return "node "+this.data.id+" "+this.data.X+" "+this.data.Y;
		}		
	});
	
	
	
	
	
	
	
	
	
	lib.Node=Node;
})();