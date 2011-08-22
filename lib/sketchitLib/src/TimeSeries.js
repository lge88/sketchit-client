(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut,TimeSeries, ConstantTimeSeries,PathTimeSeries,//
	TimeSeriesStore;
	lib = window.sketchitLib;
	ut=lib.ut;
	
	// abstract class
	
	TimeSeries = ut.extend(ut.Selectable, {});
	
	ConstantTimeSeries = ut.extend(TimeSeries, {
		defaults : {
			factor : 1.0
		},
		toTcl:function(){
			return "timeSeries Constant "+this.id+" -factor " + this.factor;
		}
	});
	
	PathTimeSeries = ut.extend(TimeSeries, {

		defaults : {
			factor : 1.0,
			dt : 0.02,
			filePath : "cm2.txt"
		},
		toTcl : function() {
			return "timeSeries Path "+ this.id + " -dt " + this.dt + " -filePath " + this.filePath + " -factor " + this.factor;
		}
	});
	
	TimeSeriesStore = ut.extend(ut.ObjectArrayStore, {
		model : TimeSeries,
	});
	
	
	

	lib.TimeSeries = TimeSeries;
	lib.ConstantTimeSeries=ConstantTimeSeries;
	lib.PathTimeSeries = PathTimeSeries;
	lib.TimeSeriesStore = TimeSeriesStore;

})();
