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
					text: 'Structure',
					// disabled:true,
					pressed:true,
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
				},{
					text: 'Nodes',
					pressed:true
				},{
					text: 'Loads',
					pressed:true
				},{
					text: 'Constraints',
					pressed:true
				},{
					text: 'Dynamics',
					pressed:false
				}
				]
			}, {
				text : 'rescale',
			}]
		});
		sketchit.views.Topbar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitTopbar', sketchit.views.Topbar);