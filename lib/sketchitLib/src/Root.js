(function() {
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
		doHandler: function(command) {
			if (!Ext.isDefined(this.commands.batchGenerator[command.name])) {
				if (!Ext.isDefined(this.commands[command.name])) {
					throw "command :"+command.name+" does not exist"
					return false;
				} else {
					return this.commands[command.name].call(this,command.args);
				}

			}

			var batch,reverseBatch;
			batch=this.commands.batchGenerator[command.name].call(this,command.args);

			if(this.validateBatch(batch)) {

				reverseBatch=this.executeBatch(batch);
				if (!Ext.isDefined(command.undo) || command.undo===true) {
					this.undoStack.push(reverseBatch);

					if (!Ext.isEmpty(this.redoStack)) {
						delete this.redoStack;
						this.redoStack=[];
					}
				}

				this.fireEvent("do",this.messageGenerator(batch),batch);
				return true
			} else {
				throw "invalid command args for command "+command.name
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
})();