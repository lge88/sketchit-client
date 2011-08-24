(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, AnalysisSetting, AnalysisSettingStore, //
	Constraints, Numberer, System, Test, Algorithm, Integrator, Analysis;
	lib = window.sketchitLib;
	ut = lib.ut;

	/*
	 constraints Plain;
	 numberer Plain;
	 system BandGeneral;
	 test NormDispIncr 1.0e-8 6;
	 algorithm Newton;
	 integrator LoadControl 0.1;
	 analysis Static;
	 analyze 5;    */

	Constraints = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "Plain"
		},
		toTcl : function() {
			return "constraints " + this.type;
		}
	});
	Numberer = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "Plain"
		},
		toTcl : function() {
			return "numberer " + this.type;
		}
	});
	System = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "BandGeneral"
		},
		toTcl : function() {
			return "system " + this.type;
		}
	});
	Test = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "NormDispIncr",
			tol : 1.0e-8,
			iter : 15
		},
		toTcl : function() {
			return "test " + this.type + " " + this.tol + " " + this.iter;
		}
	});
	Algorithm = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "Newton",
		},
		toTcl : function() {
			return "algorithm " + this.type;
		}
	});
	Integrator = ut.extend(ut.ObjectHasDefault, {});
	StaticIntegrator = ut.extend(Integrator, {
		defaults : {
			type : "LoadControl",
			lambda : 0.1
		},
		toTcl : function() {
			return "integrator " + this.type + " " + this.lambda;
		}
	});
	TransientIntegrator = ut.extend(Integrator, {
		defaults : {
			type : "Newmark",
			gamma : 0.5,
			beta : 0.25
		},
		toTcl : function() {
			return "integrator " + this.type + " " + this.lambda;
		}
	});
	Analysis = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			type : "Static",
		},
		toTcl : function() {
			return "analysis " + this.type;
		}
	});
	Eigen = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			numEigenvalues : 1,
			type : "",
			solver : ""
		},
		toTcl : function() {
			return "eigen " + this.numEigenvalues;
		}
	});
	Analyze = ut.extend(ut.ObjectHasDefault, {
		defaults : {
			numIncr : 1,
			dt : 0.1
		},
		toTcl : function() {
			return "analyze " + this.numIncr + " " + this.dt;
		}
	});
	AnalysisSetting = ut.extend(ut.ObjectHasDefault, {
		toTcl : function() {
			var result = "";
			result += this.theConstraints.toTcl() + ";\n";
			result += this.theNumberer.toTcl() + ";\n";
			result += this.theSystem.toTcl() + ";\n";
			result += this.theTest.toTcl() + ";\n";
			result += this.theAlgorithm.toTcl() + ";\n";
			result += this.theIntegrator.toTcl() + ";\n";
			result += this.theAnalysis.toTcl() + ";\n";
			return result;
		}
	});
	AnalysisSettingStore = ut.extend(ut.ObjectArrayStore, {
		model : AnalysisSetting,
	});

	//Constraints,Numberer,System,Test,Algorithm,Integrator,Analysis
	lib.AnalysisSetting = AnalysisSetting;
	lib.AnalysisSettingStore = AnalysisSettingStore;
	lib.Constraints = Constraints;
	lib.Numberer = Numberer;
	lib.System = System;
	lib.Test = Test;
	lib.Algorithm = Algorithm;
	lib.Integrator = Integrator;
	lib.StaticIntegrator = StaticIntegrator;
	lib.TransientIntegrator = TransientIntegrator;
	lib.Analysis = Analysis;

})();
