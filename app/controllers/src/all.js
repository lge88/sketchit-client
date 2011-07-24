sketchit.controllers.sketchitController = Ext.regController("sketchitController", {
	initAll : function() {

		//init views
		this.buildViews();

		//init model Root
		this.Root = new sketchitLib.Root({});

		//init Renderer
		this.Renderer = new sketchitLib.Renderer({
			Root : this.Root,
			Canvas : document.getElementById('workspace')
		})

		//init event handlers
		this.initHandlers();
		
		//init input stroke array
		this.inputStrokes = [];

		//init shape recognizer
		this.shapeRecognizer = new DollarRecognizer();

		//init command recognizer
		//this.commandGenerator = new sketchitLib.commandGenerator();
	},
	buildViews : function() {
		this.mainView = this.render({
			xtype : 'sketchitMain'
		}, Ext.getBody());

		this.canvas = this.mainView.getComponent(0);

		this.topBar = this.mainView.getDockedItems()[0];

		this.bottomBar = this.mainView.getDockedItems()[1];

	},
	
	initHandlers : function() {

		//init main view event
		var onOrientationchange = function() {
			this.resetCanvasPosition()
		};
		this.mainView.on({
			orientationchange : onOrientationchange,
			scope : this
		})
		onOrientationchange.call(this);

		this.initCanvasHandlers();

		this.initMenuHandlers();

	},
	resetCanvasPosition : function(width, height, upleftX, upleftY) {
		var w = width || this.mainView.getWidth(), h = height ||  this.mainView.getHeight() -   this.topBar.getHeight() -   this.bottomBar.getHeight(), x = upleftX || 0, y = upleftY || this.topBar.getHeight();
		this.canvasWidth = w;
		this.canvasHeight = h;
		this.canvasUpLeftX = x;
		this.canvasUpleftY = y;
	},
})