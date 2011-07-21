(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Undoable;
	
	lib=window.sketchitLib;
	
	Undoable = Ext.extend(Ext.util.Observable, {
		constructor: function(config) {
			this.data=config.data;
			this.listeners = config.listeners;
			Undoable.superclass.constructor.call(this, config)
		},
		findTarget: function(selector) {
			if(Ext.isString(selector) || Ext.isNumber(selector)) {
				return this.data[selector];
			} else if (Ext.isArray(selector)) {
				if (selector.length===1) {
					return this.data[selector[0]];
				} else if (selector.length>1) {
					if (this.data[selector[0]].findTarget) {
						return this.data[selector[0]].findTarget(selector.slice(1,selector.length));
					}
				}
			} else if (!Ext.isArray(selector) && Ext.isObject(selector)) {
				return selector;
			}
			throw "invalid selector"
			return null;
		},
		remove: function(args) {
			delete this.data[args.key];
		},
		set: function(args) {
			this.data[args.key]=args.value;
		},
		dummy: Ext.emptyFn,

		/**
		 * Execute a unit operation with given arguments
		 * @param {Object} The operation to execute: "set", "add", "remove","append"
		 * operation={
		 * 	selector:["",""] or "", if not specify, target will be this
		 * 	action:"",
		 * 	args:{
		 * 		key:"",
		 * 		value:""
		 *  }
		 * }
		 */
		execute: function(operation) {
			var target=Ext.isDefined(operation.selector)?this.findTarget(operation.selector):this;
			if (!target) {
				return false;
			}
			if (target===this) {
				console.log("valid operation ",this.validateOperation(operation))
				this[operation.action](operation.args);
				return this;
			} else {
				return target.execute({
					action:operation.action,
					args:operation.args
				})
			}
		},
		validateOperation: function(operation) {

			if (!Ext.isDefined(operation)) {
				return false;
			}
			if (operation.action==="set") {
				if (
				!operation.args ||
				!Ext.isDefined(operation.args.key) ||
				//Ext.isObject(this.data[operation.args.key])||
				!Ext.isDefined(operation.args.value)
				//Ext.isObject(this.data[operation.args.value])
				) {
					return false
				} else {
					return true;
				}

			} else if (operation.action==="remove") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!this.data[operation.args.key]) {
					return false
				} else {
					return true
				}
			}
			return false;
		},
		getReverseOperation: function(operation) {
			var target=Ext.isDefined(operation.selector)?this.findTarget(operation.selector):this;
			if(!target) {
				return {
					action:"dummy"
				}
			}

			if (target===this) {
				if (operation.action==="set") {
					if (Ext.isDefined(this.data[operation.args.key])) {
						return {
							action:"set",
							args: {
								key:operation.args.key,
								value:this.data[operation.args.key]
							}
						}
					} else {
						return {
							action: "remove",
							args: {
								key:operation.args.key
							}

						}
					}
				} else if (operation.action==="remove") {
					if (Ext.isDefined(this.data[operation.args.key])) {
						return {
							action:"set",
							args: {
								key:operation.args.key,
								value:this.data[operation.args.key]
							}

						}
					} else {
						return {
							action:"dummy"
						}
					}
				}
			} else {
				return Ext.apply({
					selector:operation.selector
				},target.getReverseOperation({
					action:operation.action,
					args:operation.args
				}))

			}
		},
	});

	lib.Undoable=Undoable;
})();(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	
	var lib,
	UndoableList;
	
	lib=window.sketchitLib;
	
	UndoableList = Ext.extend(lib.Undoable, {
		constructor: function(config) {
			if (Ext.isString(config.model) || Ext.isObject(config.model)) {
				this.model = config.model;
			}
			this.name=config.name;
			UndoableList.superclass.constructor.call(this, config)
		},
		checkModel: function(item) {
			if (Ext.isString(this.model)) {
				if (typeof item !== this.model && !(item instanceof lib[this.model]) ) {
					return false;
				}
			} else if (Ext.isObject(this.model)) {
				if (!(item instanceof this.model)) {
					return false
				}
			}
			return true;
		},
		getLength: function() {
			return this.data.length;
		},
		autoId: function(start,end) {
			if (arguments.length>2) {
				throw "autoId: invalid arguments"
				return false
			} else {
				var i;
				if (arguments.length===0) {
					var start=0,end=this.getLength()-1;
				} else if (arguments.length===1) {
					var end=this.getLength()-1;
				}
				for(i=start;i<=end;i++) {
					this.data[i].data.id=i+1;
				}
			}
		},
		//append to a collection, target should be a sketchitCollection
		//args: {value: mixed}
		append: function(args) {
			this.data.push(args.value);
			this.autoId(this.getLength()-1);
		},
		//insert into a collection, target should be a element in a sketchitCollection
		//args: {key: int   , value: obj/mixed  }
		insert: function(args) {
			this.data.splice(args.key,0,args.value);
			this.autoId(args.key);
		},
		//remove an element from the array
		//args: {key: int}
		remove: function(args) {
			this.data.splice(args.key,1);
			this.autoId(args.key);
		},
		//replcae an array element
		//args: {key: int, value: mixed}
		set: function(args) {
			this.data[args.key]=value;
		},
		validateOperation: function(operation) {
			console.log("operation ",operation)
			if (!Ext.isDefined(operation)) {
				return false;
			}
			if (operation.action==="set") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				Ext.isObject(this.data[operation.args.key])||
				!Ext.isNumber(operation.args.key) ||
				!Ext.isDefined(operation.args.value) ||
				Ext.isObject(this.data[operation.args.value]) ||
				!this.checkModel(operation.args.value) ||
				operation.args.key<0 ||
				operation.args.key>=this.data.length) {
					return false
				} else {
					return true
				}

			} else if (operation.action==="remove") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!Ext.isNumber(operation.args.key) ||
				operation.args.key<0 ||
				operation.args.key>=this.data.length) {
					return false
				} else {
					return true
				}
			} else if (operation.action==="append") {
				//console.log("check model: ",this.checkModel(operation.args.value))
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.value) ||
				!this.checkModel(operation.args.value)) {
					return false
				} else {
					return true
				}
			} else if (operation.action==="insert") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!Ext.isNumber(operation.args.key) ||
				!Ext.isDefined(operation.args.value) ||
				!this.checkModel(operation.args.value) ||
				operation.args.key<0) {
					return false
				} else {
					return true
				}
			}
			return false;
		},
		getReverseOperation: function(operation) {
			var target=operation.selector?this.findTarget(operation.selector):this;
			if(!target) {
				return {
					action:"dummy"
				}
			}

			if (target===this) {
				if (operation.action==="set") {
					return {
						action:"set",
						args: {
							key:operation.args.key,
							value:this.data[operation.args.key]
						}
					}

				} else if (operation.action==="remove") {
					return {
						action:"insert",
						args: {
							key:operation.args.key,
							value:this.data[operation.args.key]
						}
					}
				} else if (operation.action==="append") {
					return {
						action:"remove",
						args: {
							key:this.data.length,
						}
					}
				} else if (operation.action==="insert") {
					return {
						action:"remove",
						args: {
							key:operation.args.key,
						}
					}
				}
			} else {
				return Ext.apply({
					selector:operation.selector
				},target.getReverseOperation({
					action:operation.action,
					args:operation.args
				}))

			}
		},
	});

	lib.UndoableList=UndoableList;

})();(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Element,
	lineElement,
	elasticBeamColumn,
	truss,
	noneLinearBeamColumn,
	beamWithHinges;

	lib=window.sketchitLib;
	Element = Ext.extend(lib.Undoable, {});
	
	
	
	
	
	
	
	
	
	lib.Element=Element;
	lib.lineElement=lineElement;
	lib.elasticBeamColumn=elasticBeamColumn;
	lib.truss=truss;
	lib.noneLinearBeamColumn=noneLinearBeamColumn;
	lib.beamWithHinges=beamWithHinges;
})();(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Node;

	lib=window.sketchitLib;
	Node = Ext.extend(lib.Undoable, {});
	
	
	
	
	
	
	
	
	
	lib.Node=Node;
})();(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Root;
	/**
	 * private utility functions
	 * 
	 */
	//function 
	
	lib=window.sketchitLib;

	Root= Ext.extend(lib.Undoable, {
		constructor: function(config) {
			this.addEvents({
				"do" : true,
				"undo" : true,
			});

			this.undoStack=[];
			this.redoStack=[];
			Root.superclass.constructor.call(this, config)
		},
		hardCodeDefault: {

		},
		customDefault: {

		},

		init: function() {

			this.data= {

				nodes:new lib.UndoableList({
					model:"Node",
					name:"nodes",
					data:[]
				}),
				elements:new lib.UndoableList({
					model:"Element",
					name:"elements",
					data:[]
				}),

			}

		},
		
		commands: {

			batchGenerator: {
				addHandler: function(target,args) {
					var key;
					for (key in this.batchGenerator.addAItemToList.override) {
						if (target.name===key) {
							return this.batchGenerator.addAItemToList.override[key](target,args);
						}
					}
					return this.batchGenerator.addAItemToList.base(target,args);

				},
				addAItemToList: {
					base: function(target,args) {

					},
					override: {

					}

				},

				//add a node to the system
				//args: {x: number, y: number}
				addANode: function(args) {
					var batch,p;
					batch=[];
					p=new lib.Node({
						data: {
							X:args.x,
							Y:args.y
						}
					})
					batch.push({
						action:"append",
						selector: "nodes",
						args: {
							value:p
						}
					})
					return batch;
				},
				//edit the property of a node
				//args: {index: number, config: {property1:   ,property2:   ,...}}
				editANode: function(args) {
					var batch,prop;
					batch=[];
					for (prop in args.config) {
						if (args.config.hasOwnProperty(prop)) {
							batch.push({
								action:"set",
								selector: ["nodes",args.index],
								args: {
									key:prop,
									value:args.config[prop]
								}

							})
						}
					}
					return batch;
				},
				//delete a node
				//args: {index: number}
				deleteANode: function(args) {
					var batch;
					batch=[];
					batch.push({
						action:"remove",
						selector:"nodes",
						args: {
							key:args.index
						}
					})
					return batch;
				},
				//add a line element to the system
				//args: {x1: number, y1: number, x2: number, y2: number}
				addALineElement: function(args) {
					var batch,p1,p2,l;
					batch=[];
					p1=new lib.Node({
						data: {
							X:args.x1,
							Y:args.y1
						}
					});
					p2=new lib.Node({
						data: {
							X:args.x2,
							Y:args.y2
						}
					});
					l=new lib.Element({
						data: {
							from:p1,
							to:p2
						}
					})

					batch.push({
						action:"append",
						selector: this.data.nodes,
						args: {
							value:p1
						}
					})
					batch.push({
						action:"append",
						selector: "nodes",
						args: {
							value:p2
						}
					})

					batch.push({
						action:"append",
						selector: "elements",
						args: {
							value:l
						}

					})
					return batch;
				},
				//edit the property of a line element
				//args: {index: number, config: {property1:   ,property2:   ,...}}
				editALineElement: function(args) {
					var batch,prop;
					batch=[];
					for (prop in args.config) {
						if (args.config.hasOwnProperty(prop)) {
							batch.push({
								action:"set",
								selector: ["elements",args.index],
								args: {
									key:prop,
									value:args.config[prop]
								}

							})
						}
					}
					return batch;
				},
				//delete a line element
				//args: {index: number}
				deleteALineElement: function(args) {
					var batch;
					batch=[];
					batch.push({
						action:"remove",
						selector:"elements",
						args: {
							key:args.index
						}
					})
					return batch;
				},
				//delete a line element, then check its start node and end node
				//if no other elements reference them, delete them
				//args: {index: number}
				deleteALineElementWithNodes: function(args) {
					var batch;
					batch=this.batchGenerator.deleteALineElement(args);

					return batch;
				},
				addASPConstraint: function(args) {

				},
			},

		},

		messageGenerator: function (batch) {

		},
		doHandler: function(command,args,undo) {
			if (!Ext.isDefined(this.commands.batchGenerator[command])) {
				if (!Ext.isDefined(this.commands[command])) {
					throw "command :"+command+" does not exist"
					return false;
				} else {
					return this.commands[command].call(this,args);
				}

			}

			var batch,reverseBatch;
			batch=this.commands.batchGenerator[command].call(this,args);

			if(this.validateBatch(batch)) {

				reverseBatch=this.executeBatch(batch);
				if (!Ext.isDefined(undo) || undo===true) {
					this.undoStack.push(reverseBatch);

					if (!Ext.isEmpty(this.redoStack)) {
						delete this.redoStack;
						this.redoStack=[];
					}
				}

				this.fireEvent("do",this.messageGenerator(batch),batch);
				return true
			} else {
				throw "invalid command args for command "+command
				return false;
			}

		},
		undo: function() {
			var batch,reverseBatch;
			batch=this.undoStack.pop()
			if(this.validateBatch(batch)) {
				reverseBatch=this.executeBatch(batch);
				this.redoStack.push(reverseBatch);
				this.fireEvent("undo",this.messageGenerator(batch),batch);
			} else {
				throw "invalid command args for command "+command
				return false;
			}
		},
		redo: function() {
			var batch,reverseBatch;
			batch=this.redoStack.pop()
			if(this.validateBatch(batch)) {
				reverseBatch=this.executeBatch(batch);
				this.undoStack.push(reverseBatch);
				this.fireEvent("redo",this.messageGenerator(batch),batch);
			} else {
				throw "invalid command args for command "+command
				return false;
			}
		},
		goBackTo: function(stepIndex) {

		},
		//batch is a array consist of operations
		validateBatch: function(batch) {
			if(!Ext.isArray(batch)) {
				return false;
			} else {
				if (batch.length===0) {
					return false;
				}
			}
			var i,len,target;
			for (i=0,len=batch.length;i<len;i++) {
				target=Ext.isDefined(batch[i].selector)?this.findTarget(batch[i].selector):this;
				console.log("target ", target)
				if (!target) {

					return false;
				} else {
					if(!target.validateOperation(batch[i])) {
						console.log("target valid", target.validateOperation(batch[i]))
						return false;
					}
				}
			}
			return true;
		},
		getReverseBatch: function(batch) {
			var i,len,reverseBatch;
			reverseBatch=[];
			for (i=0,len=batch.length;i<len;i++) {
				reverseBatch.unshift(this.getReverseOperation(batch[i]));
			}
			return reverseBatch;
		},
		executeBatch: function(batch) {
			var i,len,reverseBatch;
			reverseBatch=[];
			for (i=0,len=batch.length;i<len;i++) {
				reverseBatch.unshift(this.getReverseOperation(batch[i]));
				this.execute(batch[i]);
			}
			return reverseBatch;
		}
	});
	lib.Root=Root;
})();(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Renderer;

	//untility functions for private use:

	/**
	 * flip Y coordinate of a point
	 */
	function flipY(p) {
		return {
			X : p.X,
			Y : -p.Y
		}
	};

	lib = window.sketchitLib;
	Renderer = Ext.extend(Object, {
		constructor : function(config) {
			Ext.apply(this, config);

			//this.inputStrokes = [];
			this.strokes = [];
			this.filledPolygons = [];

			this.ctx = this.Canvas.getContext("2d");

		},
		setOptions : function(options) {
			Ext.apply(this.options, options);
		},
		Root : undefined,
		Canvas : undefined,
		ctx : undefined,

		options : {
			modelScale : {
				x : 2,
				y : 2
			},
			canvasOrigin : {
				x : 0,
				y : 0
			},
			viewPortScale : {
				x : 1.0,
				y : 1.0
			},
			viewPortTranslate : {
				x : 0.0,
				y : 0.0
			},
			//inputStrokeStyle: "rgb(0,0,255)",
			showNodeId : false,
			showElementId : false,
			showMarks : false,

		},
		drawASingleStroke : function(p1,p2,style) {
			
			this.ctx.save();
			if(Ext.isDefined(style)){
				this.ctx.strokeStyle = style;
			}
			
			this.ctx.beginPath();
			this.ctx.moveTo(p1.X, p1.Y);
			this.ctx.lineTo(p2.X, p2.Y);
			this.ctx.stroke();
			
			this.ctx.restore();
		},
		render : function() {

		}
	});

	lib.Renderer = Renderer;
})();
