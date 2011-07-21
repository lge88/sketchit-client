Ext.regApplication({
	name         : "sketchit",
	glossOnIcon: false,

	/**
	 * This is called automatically when the page loads. Here we set up the main component on the page - the Viewport
	 */
	launch: function() {
		Ext.dispatch({
			controller: 'canvasController',
			action    : 'initController',		
		});
	}
});