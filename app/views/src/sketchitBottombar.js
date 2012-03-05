/**
 * @class sketchit.Bottombar
 * @extends Ext.Panel
 *
 */
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
				},{
					text: 'mesh',
					iconCls: 'mesh',
					style : {
						"font-size" : "80%"
					}
				}]

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
