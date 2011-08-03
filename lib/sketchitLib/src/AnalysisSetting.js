(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, AnalysisSetting;
	lib = window.sketchitLib;
	
	AnalysisSetting= Ext.extend(lib.Undoable, {
		defaults : {
			type : "load",//["load", "sp"]
		},
		toTcl : function() {
			return this.data.type + " " + this.data.nodeTag + " " + this.data.X + " " + this.data.Y + " " + this.data.RZ;
		}
	});
	

	lib.AnalysisSetting=AnalysisSetting;

})();

