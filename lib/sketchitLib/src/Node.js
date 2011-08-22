(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Node, NodeShape, NodesStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	/*
	NodeShape = ut.extend(ut.filled, {
		model : undefined,
		nodeSize : 2,
		normalFillStyle : [255, 0, 0, 255],
		selectedFillStyle : [255, 0, 0, 255],
		fillStyle : [255, 0, 0, 255],
		showEdge : false,
		edgeLineWidth : 1,
		edgeStrokeStyle : [255, 0, 0, 255],
		constructor : function() {
			NodeShape.superclass.constructor.apply(this, arguments);
			this.ctx=this.model.renderer.ctx;
			this.nodeSize=this.nodeSize/this.model.renderer.options.modelScale.sx;
			this.vertice = [this.model.X - this.nodeSize, this.model.Y - this.nodeSize, this.model.X - this.nodeSize, this.model.Y + this.nodeSize, this.model.X + this.nodeSize, this.model.Y + this.nodeSize, this.model.X + this.nodeSize, this.model.Y - this.nodeSize];
		}
	});*/
	Node = ut.extend(ut.Selectable, {
		ComponetName : "Node",
		/*
		constructor:function(){
			
			
		},*/
		//renderer : undefined,
		X : undefined,
		Y : undefined,
		toTcl : function() {
			return "node " + this.id + " " + this.X + " " + this.Y;
		},
		
		isSelected:false,
		isShow:true,
		//isTagShow:false,
		nodeSize : 2,
		normalFillStyle : [255, 0, 0, 255],
		selectedFillStyle : [255, 0, 0, 255],
		showEdge : false,
		edgeLineWidth : 1,
		edgeStrokeStyle : [255, 255, 255, 255],
		
		display:function(renderer){
			if (!this.isShow){
				return false;
			} else {
				renderer.ctx.lineWidth=this.edgeLineWidth;
				renderer.ctx.strokeStyle=this.edgeStrokeStyle;
				if (this.isSelected){
					renderer.ctx.fillStyle=ut.array2rgba(this.selectedFillStyle);
				} else {
					renderer.ctx.fillStyle=ut.array2rgba(this.normalFillStyle);
				}		
				renderer.drawSquare(this,this.nodeSize,this.showEdge?2:1);
				return true;								
			}	
		}
		
		
		
		
		
		
		
		
	});
	NodesStore = ut.extend(ut.ObjectArrayStore, {
		model : Node,
		drawAll:function(renderer){
			var i;
			for (i=0;i<this.max+1;i++){
				if (ut.isDefined(this[i])){
					this[i].display(renderer);
				}
			}
		}

	});

	lib.Node = Node;
	lib.NodeShape = NodeShape;
	lib.NodesStore = NodesStore;


})();
