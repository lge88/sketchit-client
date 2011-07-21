/**
 * @class sketchit.ComponentList
 * @extends Ext.Component
 * container of sketchit renderer
 *
 */
sketchit.views.ComponentList = Ext.extend(Ext.Panel, {

	//layout: 'fit',
	floating: true,
	//modal : true,
	centered : false,
	width : Ext.is.Phone ? 260 : 400,
	height : Ext.is.Phone ? 220 : 400,

	style: {
		"opacity":'0.5'
	}

	
});

Ext.reg('sketchitComponentList', sketchit.views.ComponentList);
/*
var overlay = new Ext.Panel({
	floating : true,
	modal : true,
	centered : false,
	width : Ext.is.Phone ? 260 : 400,
	height : Ext.is.Phone ? 220 : 400,
	styleHtmlContent : true,
	dockedItems : overlayTb,
	scroll : 'vertical',
	contentEl : 'lipsum',
	cls : 'htmlcontent'
});*/
