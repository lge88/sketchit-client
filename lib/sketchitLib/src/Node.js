(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Node, NodeShape, NodesStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	
	NodeShape = ut.extend(ut.filled, {
		node : undefined,
		nodeSize : 2,
		normalFillStyle : [255, 0, 0, 255],
		selectedFillStyle : [255, 0, 0, 255],
		fillStyle : [255, 0, 0, 255],
		showEdge : false,
		edgeLineWidth : 1,
		edgeStrokeStyle : [255, 0, 0, 255],
		constructor : function() {
			NodeShape.superclass.constructor.apply(this, arguments);
			this.vertice = [this.node.X - this.nodeSize, this.node.Y - this.nodeSize, this.node.X - this.nodeSize, this.node.Y + this.nodeSize, this.node.X + this.nodeSize, this.node.Y - this.nodeSize, this.node.X + this.nodeSize, this.node.Y + this.nodeSize];
		}
	});
	Node = ut.inherit(ut.OPS_Component, ut.Renderable, {
		ComponetName : "Node",

		X : undefined,
		Y : undefined,
		shapeConstructor : NodeShape,
		select : function() {
			ut.OPS_Component.select.apply(this);
			this.shape.fillStyle = this.shape.selectedFillStyle;
		},
		unselect : function() {
			ut.OPS_Component.unselect.apply(this);
			this.shape.fillStyle = this.shape.normalFillStyle;
		},
		constructor : function() {
			Node.superclass.constructor.apply(this, arguments);
			this.shapes = [new this.shapeConstructor({
				node : this
			})];
		},
		toTcl : function() {
			return "node " + this.id + " " + this.X + " " + this.Y;
		},
	});
	NodesStore = ut.extend(ut.ObjectArrayStore, {
		model : Node,
		batchAdd : function() {
			var item;
			if(arguments.length === 1) {
				if(ut.isObject(arguments[0])) {
					item = arguments[0];
				}
			} else if(arguments.length == 2) {
				item = new this.model({
					X : arguments[0],
					Y : arguments[1]
				});
			} else {
				return false;
			}
			return ut.ObjectArrayStore.batchAdd.call(this, item);
		},
	});

	lib.Node = Node;
	lib.NodeShape = NodeShape;
	lib.NodesStore = NodesStore;

})();
