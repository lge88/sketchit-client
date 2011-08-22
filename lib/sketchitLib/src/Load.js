(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, //
	Load, PlainLoad, NodeLoad, ElememtLoad,// UniformExcitationLoad, //
	LoadStore;
	lib = window.sketchitLib;
	ut = lib.ut;
	Load = ut.extend(ut.Selectable, {
		//Pattern:undefined
	});
	PlainLoad = ut.extend(Load,{});
	NodeLoad = ut.extend(PlainLoad, {
		//node:undefined
		//type: "load" or "sp"
		//X:
		//Y:
		//RZ:
		defaults:{
			ComponetName:"NodeLoad",
			type:"load",
			node : undefined,
			nodeAtArrowEnd:true,
			arrowLength:undefined,
			arrowAngle:undefined,
			
			X : undefined,				
			Y:undefined,
			RZ:undefined,
			
			isSelected:false,
			isShow:true,
		},
		
		lineWidth : 3,
		normalStrokeStyle : [0, 0, 0, 255],
		selectedStrokeStyle : [255, 0, 255, 255],
		arrowHeadSize:20,
		halfArrowAngle:Math.PI/6,
		
		
		display:function(renderer,scale){
			if (!this.isShow){
				return false;
			} else {				
				renderer.ctx.lineWidth=this.lineWidth/scale;
				if (this.isSelected){					
					renderer.ctx.strokeStyle=ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle=ut.array2rgba(this.normalStrokeStyle);
				}
				
				renderer.save();
				renderer.translate(this.node.X, this.node.Y);
				renderer.rotate(this.arrowAngle);
				renderer.ctx.beginPath();			
				if (this.nodeAtArrowEnd===true){
					renderer.ctx.moveTo(-this.arrowHeadSize/scale*Math.cos(this.halfArrowAngle),this.arrowHeadSize/scale*Math.sin(this.halfArrowAngle));
					renderer.ctx.lineTo(0,0);
					renderer.ctx.lineTo(-this.arrowHeadSize/scale*Math.cos(this.halfArrowAngle),-this.arrowHeadSize/scale*Math.sin(this.halfArrowAngle));
					renderer.ctx.moveTo(0,0);
					renderer.ctx.lineTo(-this.arrowLength/scale,0);					
				} else {
					renderer.ctx.moveTo(this.arrowLength/scale-this.arrowHeadSize/scale*Math.cos(this.halfArrowAngle),this.arrowHeadSize/scale*Math.sin(this.halfArrowAngle));
					renderer.ctx.lineTo(this.arrowLength/scale,0);
					renderer.ctx.lineTo(this.arrowLength/scale-this.arrowHeadSize/scale*Math.cos(this.halfArrowAngle),-this.arrowHeadSize/scale*Math.sin(this.halfArrowAngle));	
					renderer.ctx.moveTo(this.arrowLength/scale,0);
					renderer.ctx.lineTo(0,0);
				}	
				renderer.ctx.stroke();
				renderer.restore();
				return true;								
			}	
		},
		
		toTcl:function(){
			return this.type+" "+this.node.id+" "+ this.X + " " + this.Y + " " + this.RZ;
		}

	});
	
	ElementLoad = ut.extend(PlainLoad, {
		//element:undefined
		//TODO:
		//X:
		//Y:
		//RZ:
		//toTcl:

	});
		
	/*	
	UniformExcitationLoad = ut.extend(Load, {
		defaults:{
			direction:1
		}
	});*/
	
	LoadStore = ut.extend(ut.ObjectArrayStore, {
		model : Load,
		/*
		drawAll:function(renderer,scale){
			var i;
			for (i=0;i<this.max+1;i++){
				if (ut.isDefined(this[i])){
					this[i].display(renderer,scale);
				}
			}
		},
		toTcl:function(){
			var i,result="";
			for (i=0;i<this.max+1;i++){
				result+=this[i].toTcl()+";\n";
			}
			
		}*/
	});
	
	lib.Load = Load;
	lib.PlainLoad = PlainLoad;
	lib.NodeLoad = NodeLoad;
	lib.ElementLoad = ElementLoad;
	//lib.UniformExcitationLoad = UniformExcitationLoad;

	lib.LoadStore = LoadStore;

})();
