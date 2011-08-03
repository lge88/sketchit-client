(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, timeSeries, Path, nodeLoad, uniformExcitationLoad, Pattern;
	lib = window.sketchitLib;
	
	// abstract class
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
	});
	
	Pattern = Ext.extend(lib.Undoable, {
		defaults : {
			type : "Plain",
			Plain : {
				timeSeries : {
					type : "Constant",
					factor : 1.0
				},
				analysisSetting: {

				}
			},
			UniformExcitation : {
				timeSeries : {
					type : "Path",
					factor : 1.0,
					dt : 0.02,
					filePath : "cm2.txt"
				},
				direction : 1,
				analysisSetting : {

				}
			}
		},
		loadDefault : function() {

			//Pattern.superclass.loadDefault.call(this);
			Ext.applyIf(this.data,{type:this.defaults.type})
			if(this.data.type === "Plain") {
				//Ext.applyIf(this.data,this.defaults.Plain)
				Ext.applyIf(this.data, {
					timeSeries : new lib[this.defaults.Plain.timeSeries.type]({
						data : this.defaults.Plain.timeSeries
					}),
					nodeLoads : new lib.UndoableList({
						model : "NodeLoad",
						name : "nodeLoads",
						data : []
					}),
					analysisSettings:new AnalysisSetting({
						data : this.defaults.Plain.analysisSetting
					})

				})
			} else if(this.data.type === "UniformExcitation") {
				Ext.applyIf(this.data, {
					timeSeries : new lib[this.defaults.UniformExcitation.timeSeries.type]({
						data : this.defaults.UniformExcitation.timeSeries
					}),
					direction : this.defaults.UniformExcitation.direction,
					analysisSettings:new AnalysisSetting({
						data : this.defaults.UniformExcitation.analysisSetting
					})
				})
			}

		},
		toTcl : function() {
			return;
		}
	});

	lib.TimeSeries = TimeSeries;
	lib.Constant=Constant;
	lib.Path = Path;
	
	
	lib.Load = Load;
	lib.NodeLoad = NodeLoad;
	lib.SPLoad = SPLoad;
	lib.ElementLoad = ElementLoad;

	//lib.AnalysisSetting=AnalysisSetting;
	lib.Pattern = Pattern;

})();
