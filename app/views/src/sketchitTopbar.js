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
			ui:"light",
			defaults: {
				iconMask:true,
				ui:"plain",
				//ui:"light",
			},
			scroll : {
				direction : 'horizontal',
				useIndicators : false
			},
			items: [{
				xtype:'segmentedbutton',
				allowMultiple:true,
				items:[{
					text: 'Size'
				},{
					text: '#Node'
				},{
					text: 'Grid',
					pressed:true
				},{
					text: 'AutoRun',
					pressed:true
				},{
					text: 'Deformation',
					pressed:true
				},{
					text: 'Moment',
					pressed:true
				}
				]
			}]
		});
		sketchit.views.Topbar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitTopbar', sketchit.views.Topbar);