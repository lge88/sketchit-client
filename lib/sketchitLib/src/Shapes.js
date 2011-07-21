(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Shape;
	lib = window.sketchitLib;
	Shape = Ext.extend(Object, {
		constructor : function() {
			this.strokes=[];

		},
		configure : function(config) {
			Ext.apply(this, config);
		},
		modelRoot : undefined,
		modelScale : {
			x : 2,
			y : 2
		},
		modelOrigin : {
			x : 0,
			y : 0
		},
		flip : function(a) {
			return -a;
		},
		

	});

	lib.Renderer = Renderer;
})();
