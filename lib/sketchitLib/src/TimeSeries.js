(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut,TimeSeries, ConstantTimeSeries,PathTimeSeries,//
	lib = window.sketchitLib;
	ut=lib.ut;
	
	// abstract class
	
	TimeSeries = Ext.extend(ut.Selectable, {});
	
	ConstantTimeSeries = ut.extend(TimeSeries, {
		defaults : {
			type : "Constant",
			factor : 1.0
		},
	});
	
	PathTimeSeries = ut.extend(TimeSeries, {

		defaults : {
			type : "Path",
			factor : 1.0,
			dt : 0.02,
			filePath : "cm2.txt"
		},
		toTcl : function() {
			return "timeSeries " + this.data.type + " " + this.data.id + " -dt " + this.data.dt + " -filePath " + this.data.filePath + " -factor " + this.data.factor;
		}
	});
	
	
	

	lib.TimeSeries = TimeSeries;
	lib.ConstantTimeSeries=ConstantTimeSeries;
	lib.PathTimeSeries = PathTimeSeries;

})();
