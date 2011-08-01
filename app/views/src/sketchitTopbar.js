/**
 * @class sketchit.Topbar
 * @extends Ext.Panel
 *
 */
sketchit.views.Topbar = Ext.extend(Ext.Toolbar, {
	initComponent: function() {
		Ext.apply(this, {
			dock:"top",
			layout:"hbox",
			//ui:"light",
			defaults: {
				iconMask:true,
				ui:"plain",
				//ui:"light",
			},
			items: [{
				xtype:'segmentedbutton',
				allowMultiple:true,
				items:[{
					text: 'Size'
				},{
					text: 'Number'
				},{
					text: 'Grid'
				},{
					text: 'RealTime'
				}
				]
			}]
		});
		sketchit.views.Topbar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitTopbar', sketchit.views.Topbar);