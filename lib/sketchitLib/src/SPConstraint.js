(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, SPConstraint;
	lib = window.sketchitLib;
	
	SPConstraint = Ext.extend(lib.Undoable, {
		defaults:{
			X:1,
			Y:1,
			RZ:1,
			show:true,
			angle:-Math.PI/2,
			direction:"up"
		},
		toTcl:function(){
			return "fix "+this.data.node.data.id+" "+this.data.X+" "+this.data.Y+" "+this.data.RZ;
		}		
	});

	lib.SPConstraint = SPConstraint;
})();
