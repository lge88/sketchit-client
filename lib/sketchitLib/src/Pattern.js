(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib,timeSeries,Path,nodeLoad,uniformExcitationLoad,Pattern;
	lib = window.sketchitLib;
	timeSeries = Ext.extend(lib.Undoable, {
		defaults:{
			type:"Constant",
			factor:1.0
		},
		toTcl: function(){
			return "timeSeries "+this.data.type+" "+this.data.id+ " -factor "+this.data.factor;
		}		
	});
	
	Path = Ext.extend(timeSeries, {
		defaults:{
			type:"Path",
			factor:1.0,
			dt:0.02,
			filePath:"cm2.txt"
		},
		toTcl: function(){
			return "timeSeries "+this.data.type+" "+this.data.id+" -dt "+this.data.dt+" -filePath "+this.data.filePath+ " -factor "+this.data.factor;
		}		
	});
	
	nodeLoad = Ext.extend(lib.Undoable, {
		defaults:{
			type:"load",//["load", "sp"]
		},
		toTcl: function(){
			return this.data.type+" "+this.data.nodeTag+" "+this.data.X+" "+this.data.Y+" "+this.data.RZ;
		}		
	});
	
	
	
	Pattern = Ext.extend(lib.Undoable, {
		defaults:{
			type:"Plain",
			timeSeries:new timeSeries({
				type:"Constant",
				factor:1
			})
		},
		toTcl:function(){
			return ;
		}		
	});

	lib.timeSeries = timeSeries;
	lib.Path = Path;
	lib.nodeLoad = nodeLoad;
	//lib.uniformExcitationLoad = uniformExcitationLoad;
	lib.Pattern = Pattern;
	
})();
