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
					text: 'Size',
					disabled:true
				},{
					text: 'NodeId',
					pressed:true
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
				},{
					text: 'SnapToGrid',
					pressed:true
				},{
					text: 'SnapToNode',
					pressed:true
				},{
					text: 'SnapToLine',
					pressed:true
				},{
					text: 'ElementDirection',
					pressed:false
				},{
					text: 'ElementId',
					pressed:false
				}
				]
			}]
		});
		sketchit.views.Topbar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitTopbar', sketchit.views.Topbar);