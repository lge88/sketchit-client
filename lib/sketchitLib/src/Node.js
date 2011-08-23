(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Node, NodesStore;
	lib = window.sketchitLib;
	ut = lib.ut;

	Node = ut.extend(ut.Selectable, {
		ComponetName : "Node",
		defaults:{
			X : undefined,
			Y : undefined,
			dispX:0.0,
			dispY:0.0,
			dispRZ:0.0,
			SPC:undefined,
			isSelected:false,
			isShow:true,
			showEdge : false,
			showDeformation:true,			
		},
		
		toTcl : function() {
			return "node " + this.id + " " + this.X + " " + this.Y;
		},
		
		
		nodeSize : 3,	
		normalFillStyle : [255, 0, 0, 255],
		selectedFillStyle : [255, 0, 0, 255],		
		edgeLineWidth : 1,
		edgeStrokeStyle : [255, 0, 255, 255],
		
		display:function(renderer,scale){
			if (!this.isShow){
				return false;
			} else {				
				//console.log(ut.array2rgba(this.selectedFillStyle));
				if (this.isSelected){					
					renderer.ctx.fillStyle=ut.array2rgba(this.selectedFillStyle);
				} else {
					renderer.ctx.fillStyle=ut.array2rgba(this.normalFillStyle);
				}		
				renderer.drawSquare(this,this.nodeSize/scale,1);
				if (this.showEdge===true){
					renderer.ctx.lineWidth=this.edgeLineWidth/scale;
					renderer.ctx.strokeStyle=ut.array2rgba(this.edgeStrokeStyle);
					renderer.drawSquare(this,this.nodeSize+1,0);
				}
				return true;								
			}	
		},
		
		deformedNodeSize : 3,	
		deformedFillStyle : [0,255 , 0, 255],
		
		displayDeformation:function(renderer,viewPortScale,deformScale){
			console.log("df",arguments)
			if (!this.showDeformation){
				return false;
			} else {				
				renderer.ctx.fillStyle=ut.array2rgba(this.deformedFillStyle);	
				renderer.drawSquare({
					X:this.X+this.dispX*deformScale,
					Y:this.Y+this.dispY*deformScale
				},this.deformedNodeSize/viewPortScale,1);
				return true;								
			}
			
		},
		move:function(dx,dy){
			this.X+=dx;
			this.Y+=dy;
		},	
		
	});
	NodesStore = ut.extend(ut.ObjectArrayStore, {
		model : Node,
		/*
		drawAll:function(renderer,scale){
			var i;
			for (i=0;i<this.max+1;i++){
				if (ut.isDefined(this[i])){
					this[i].display(renderer,scale);
				}
			}
		}*/

	});

	lib.Node = Node;
	lib.NodesStore = NodesStore;


})();
