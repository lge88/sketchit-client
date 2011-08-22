(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut,TimeSeries, ConstantTimeSeries,PathTimeSeries,//
	PlainPattern, UniformExcitationLoad, Pattern,PatternStore;
	lib = window.sketchitLib;
	ut=lib.ut;
	
	Pattern = ut.extend(ut.Selectable, {});
	
	PlainPattern=ut.extend(Pattern, {
		defaults:{
			ComponetName : "PlainPattern",
		},
		toTcl:function(){
			var result="";
			result+="pattern Plain "+this.id+" "+this.TimeSeries.id+" {;\n";
			result+=this.Loads.toTcl();
			result+="}"
			return result;	
		}
		
		
		
	})
	
	UniformExcitationPattern=ut.extend(Pattern, {
		defaults:{
			ComponetName : "UniformExcitationPattern",
			direction:1
		},
		toTcl:function(){
			return "pattern UniformExcitation "+this.id+" "+this.direction+" -accel "+this.TimeSeries.id;			
		}
		
		
		
	})
	
	PatternStore = ut.extend(ut.ObjectArrayStore, {
		model : Pattern,
	});
	
	lib.Pattern = Pattern;
	lib.PlainPattern = PlainPattern;
	lib.UniformExcitationPattern = UniformExcitationPattern;
	lib.PatternStore = PatternStore;

})();
