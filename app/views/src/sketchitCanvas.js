/**
 * @class sketchit.Canvas
 * @extends Ext.Component
 * container of sketchit renderer
 *
 */
sketchit.views.Canvas = Ext.extend(Ext.Panel, {

	layout: 'fit',
	Renderer:undefined,
	
	style: {
		"background-color":"white"
	},
	
});

Ext.reg('sketchitCanvas', sketchit.views.Canvas);