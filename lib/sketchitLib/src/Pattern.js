(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut,TimeSeries, ConstantTimeSeries,PathTimeSeries,//
	PlainPattern, UniformExcitationLoad, Pattern,PatternStore;
	lib = window.sketchitLib;
	ut=lib.ut;
	
	// abstract class
	/*
	TimeSeries = Ext.extend(lib.Undoable, {
		toTcl : function() {
			return "timeSeries " + this.data.type + " " + this.data.id + " -factor " + this.data.factor;
		}
	});
	
	Constant = Ext.extend(TimeSeries, {
		defaults : {
			type : "Constant",
			factor : 1.0
		},
	});
	
	Path = Ext.extend(TimeSeries, {

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
	
	Load = Ext.extend(lib.Undoable, {
		toTcl : function() {
			return this.data.type + " " + this.data.nodeTag + " " + this.data.X + " " + this.data.Y + " " + this.data.RZ;
		}
	});
	
	NodeLoad = Ext.extend(lib.Undoable, {
		defaults : {
			type : "load"
		},
	});
	
	SPLoad = Ext.extend(lib.Undoable, {
		defaults : {
			type : "sp"
		},
	});
	
	ElementLoad = Ext.extend(lib.Undoable, {
		defaults : {
			type : "eleLoad"
		},
	});*/
	
	Pattern = ut.extend(ut.Selectable, {
		
	});
	
	PlainPattern=ut.extend(Pattern, {
		defaults:{
			ComponetName : "PlainPattern",
		},
		
		
		
	})
	
	UniformExcitationPattern=ut.extend(Pattern, {
		defaults:{
			ComponetName : "UniformExcitationPattern",
		}
		
		
		
	})
	
	PatternStore = ut.extend(ut.ObjectArrayStore, {
		model : Pattern,
	});
	
	/*

	lib.TimeSeries = TimeSeries;
	lib.Constant=Constant;
	lib.Path = Path;
	
	
	lib.Load = Load;
	lib.NodeLoad = NodeLoad;
	lib.SPLoad = SPLoad;
	lib.ElementLoad = ElementLoad;*/

	//lib.AnalysisSetting=AnalysisSetting;
	lib.Pattern = Pattern;
	lib.PlainPattern = PlainPattern;
	lib.UniformExcitationPattern = UniformExcitationPattern;
	lib.PatternStore = PatternStore;

})();
