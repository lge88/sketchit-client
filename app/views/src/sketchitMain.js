sketchit.views.Main = Ext.extend(Ext.Panel, {

	layout : 'fit',
	fullscreen : true,
	
	
	items : {
		xtype : 'sketchitCanvas',
		html : '<canvas id="workspace"  width="' + 1500 + '" height="' + 1500 + '">no canvas support</canvas>',
	},

	dockedItems : [{
		xtype : 'sketchitTopbar'
	}, {
		xtype : 'sketchitBottombar'
	}],
	
	/*

	listeners : {

		orientationchange : function(me) {
			me.resetCanvasSize();
			me.resetCanvasOrigin();
		}
	},

	resetCanvasSize : function() {
		var me = this, d = me.getDockedItems(), c = me.getComponent(0);
		c.Renderer.canvasWidth = me.getWidth();
		c.Renderer.canvasHeight = me.getHeight() - d[0].getHeight() - d[1].getHeight();
	},
	resetCanvasOrigin : function() {
		var me = this, d = me.getDockedItems(), c = me.getComponent(0);
		c.Renderer.canvasOriginX = 0;
		c.Renderer.canvasOriginY = d[0].getHeight();
	}*/
});

Ext.reg('sketchitMain', sketchit.views.Main);
