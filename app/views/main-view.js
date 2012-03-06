sketchit.views.Bottombar = Ext.extend(Ext.Toolbar, {
	initComponent : function() {
		Ext.apply(this, {
			dock : "bottom",
			ui : "light",
			defaults : {
				iconMask : true,
				iconAlign : 'top',

				//ui : "plain"
			},
			scroll : {
				direction : 'horizontal',
				useIndicators : false
			},
			items : [{
				xtype : 'segmentedbutton',
				//allowMultiple : true,
				defaults : {
					iconMask : true,
					iconAlign : 'top',
					width: 45
					//ui : "plain"
				},
				items : [{
					//text: 'List'
					//iconMask:true,
					//ui:'plain',
					iconCls : 'doc_list',
					text : 'list',
					style : {
						"font-size" : "80%"
					},

				}, {
					text : 'setting',
					iconCls : 'settings3',
					style : {
						"font-size" : "80%"
					}
				}, {
					text : 'run',
					iconCls : 'run',
					// text : 'rescale',
					// iconCls : 'contract',
					style : {
						"font-size" : "80%"
					}
				}
				// ,{
					// text: 'mesh',
					// iconCls: 'mesh',
					// style : {
						// "font-size" : "80%"
					// }
				// }
				]

			}, {
				xtype : 'spacer',
				//width:10
			}, {
				//text : 'Refresh',
				ui : "plain",
				iconCls : 'refresh5',
			}, {
				//text : 'Unselect',
				ui : "plain",
				iconCls : 'unselect'
			}, {
				iconCls : 'trash',
				ui : "plain",
				//text : 'Delete',
				//iconCls: 'trash'
			}, {
				//text : 'Undo',
				ui : "plain",
				iconCls : 'undo',
			}, {
				//text : 'Redo',
				ui : "plain",
				iconCls : 'redo',
			}, {
				//text : 'Save',
				ui : "plain",
				iconCls : 'save'
			}, {
				//text : 'Open',
				ui : "plain",
				iconCls : 'open',
			}, {
				//text : 'Log',
				iconCls : 'log',
				ui : "plain",
			}, {
				// text : 'mesh',
				iconCls : 'mesh',
				ui : "plain"
				// style : {
					// "font-size" : "80%"
				// }
			},{
				xtype : 'spacer',
				//width:10
			}, {
				xtype : 'segmentedbutton',
				defaults : {
					iconMask : true,
					iconAlign : 'top',
					width:45,
					style : {
						"font-size" : "80%"
					}
					//ui : "plain"
				},
				items : [{
					text : 'draw',
					iconCls : 'draw',
					pressed : true,
					// style : {
						// "font-size" : "80%"
					// }
				}, {
					text : 'select',
					iconCls : 'select',
					// style : {
						// "font-size" : "80%"
					// }
				}, {
					text : 'load',
					iconCls : 'load',
					// style : {
						// "font-size" : "80%"
					// }
				}, {
					text : 'move',
					iconCls : 'move',
					// style : {
						// "font-size" : "80%"
					// }
				}]
			}]
		});

		sketchit.views.Bottombar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitBottombar', sketchit.views.Bottombar);


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
			},{
				text : 'more',
			}]
		});
		sketchit.views.Topbar.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('sketchitTopbar', sketchit.views.Topbar);

sketchit.views.Canvas = Ext.extend(Ext.Panel, {

	layout: 'fit',
	Renderer:undefined,
	
	style: {
		"background-color":"white"
	},
	
});

Ext.reg('sketchitCanvas', sketchit.views.Canvas);

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
});
sketchitMainView = sketchit.views.Main;
// console.log("herer")
Ext.reg('sketchitMain', sketchit.views.Main);

