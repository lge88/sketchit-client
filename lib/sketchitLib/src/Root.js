(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, Root;
	/**
	 * private utility functions
	 *
	 */
	//function
	function distance(p1, p2) {
		var dx = p2.X - p1.X;
		var dy = p2.Y - p1.Y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	function dotLineLength(x, y, x0, y0, x1, y1, o) {
		function lineLength(x, y, x0, y0) {
			return Math.sqrt((x -= x0) * x + (y -= y0) * y);
		}

		if(o && !( o = function(x, y, x0, y0, x1, y1) {
			if(!( x1 - x0))
				return {
					x : x0,
					y : y
				};
			else if(!( y1 - y0))
				return {
					x : x,
					y : y0
				};
			var left, tg = -1 / (( y1 - y0) / ( x1 - x0));
			return {
				x : left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * ( x1 - x0) + y0 - y1),
				y : tg * left - tg * x + y
			};
		}(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))) {
			var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
			return l1 > l2 ? l2 : l1;
		} else {
			var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
			return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
		}
	};

	function findNearestNode(n, nodes) {
		var i, result = {};
		result.d = Number.MAX_VALUE;
		for(i in nodes.data) {
			if(nodes.data.hasOwnProperty(i)) {
				if(distance(n.data, nodes.data[i].data) < result.d) {
					result = {
						index : i,
						d : distance(n.data, nodes.data[i].data)
					}

				}

			}
		}
		if(result) {
			return result;
		} else {
			return false;
		}

	};

	function findNearestLineElement(n, lelements) {
		var i, d, p, temp, result = {};
		p = n.data;
		result.d = Number.MAX_VALUE;
		for(i in lelements.data) {
			if(lelements.data.hasOwnProperty(i)) {
				temp = dotLineLength(p.X, p.Y, lelements.data[i].data.from.data.X, lelements.data[i].data.from.data.Y, lelements.data[i].data.to.data.X, lelements.data[i].data.to.data.Y, true);
				if(temp < result.d) {
					result = {
						index : i,
						d : temp
					}

				}

			}
		}
		if(result) {
			return result;
		} else {
			return false;
		}
	};

	function findPerFoot(n, e) {
		var p=n.data,l={
			from:{
				X:e.data.from.data.X,
				Y:e.data.from.data.Y
			},
			to:{
				X:e.data.to.data.X,
				Y:e.data.to.data.Y	
			}			
		};
		if( typeof p === "undefined" || typeof l === "undefined") {
			alert("point or line undefined");
			return false;
		}
		var flag = false;
		if(!(l.from.X - l.to.X)) {
			if((p.Y - l.from.Y) * (p.Y - l.to.Y) <= 0) {
				flag = true;
			}
			return {
				pf : {
					X : (l.from.X + l.to.X) / 2,
					Y : p.Y
				},
				dir : "vertical",
				online : flag
			}
		} else if(!(l.from.Y - l.to.Y)) {
			if((p.X - l.from.X) * (p.X - l.to.X) <= 0) {
				flag = true;
			}
			return {
				pf : {
					X : p.X,
					Y : (l.from.X + l.to.X) / 2
				},
				dir : "horizontal",
				online : flag
			}
		} else {
			var x1 = l.from.X, y1 = l.from.Y, dx = l.to.X - l.from.X, dy = l.to.Y - l.from.Y, y = (dx * dx * l.from.Y + p.X * dx * dy - l.from.X * dx * dy + p.Y * dy * dy) / (dx * dx + dy * dy), x = l.from.X + dx * ( y - l.from.Y) / dy, r = ( x - l.from.X) / dx;
			if(r <= 1 && r >= 0) {
				flag = true;
			}
			return {
				pf : {
					X : x,
					Y : y
				},
				dir : "oblique",
				online : flag
			}
		}
	};

	lib = window.sketchitLib;
	Root = Ext.extend(lib.Undoable, {
		constructor : function(config) {
			this.addEvents({
				"do" : true,
				"undo" : true,
			});
			//this.initList();

			this.undoStack = [];
			this.redoStack = [];
			Root.superclass.constructor.call(this, config)
		},
		hardCodeDefault : {

		},
		customDefault : {

		},

		initList : function() {

			this.data = {

				nodes : new lib.UndoableList({
					model : "Node",
					name : "nodes",
					data : []
				}),
				elements : new lib.UndoableList({
					model : "Element",
					name : "elements",
					data : []
				}),
				masses: new lib.UndoableList({
					model : "Mass",
					name : "masses",
					data : []
				}),
				SPConstraints: new lib.UndoableList({
					model : "SPConstraint",
					name : "SPConstraints",
					data : []
				}),
				geomTransforms: new lib.UndoableList({
					model : "geomTransf",
					name : "geomTransforms",
					data : []
				}),
				uniaxialMaterials: new lib.UndoableList({
					model : "UniaxialMaterial",
					name : "uniaxialMaterials",
					data : []
				}),
				sections: new lib.UndoableList({
					model : "Section",
					name : "sections",
					data : []
				}),
				patterns: new lib.UndoableList({
					model : "Pattern",
					name : "patterns",
					data : []
				}),

			}

		},
		commands : {

			batchGenerator : {
				addHandler : function(target, args) {
					var key;
					for(key in this.batchGenerator.addAItemToList.override) {
						if(target.name === key) {
							return this.batchGenerator.addAItemToList.override[key](target, args);
						}
					}
					return this.batchGenerator.addAItemToList.base(target, args);

				},
				addAItemToList : {
					base : function(target, args) {

					},
					override : {

					}

				},

				//add a node to the system
				//args: {x: number, y: number, }
				addANode : function(args) {
					var batch, p;
					batch = [];
					p = new lib.Node({
						data : {
							X : args.x,
							Y : args.y
						}
					})
					batch.push({
						action : "append",
						selector : "nodes",
						args : {
							value : p
						}
					})
					return {
						batch : batch,
						node : p
					};
				},
				//edit the property of a node
				//args: {index: number, config: {property1:   ,property2:   ,...}}
				editANode : function(args) {
					var batch, prop;
					batch = [];
					for(prop in args.config) {
						if(args.config.hasOwnProperty(prop)) {
							batch.push({
								action : "set",
								selector : ["nodes", args.index],
								args : {
									key : prop,
									value : args.config[prop]
								}

							})
						}
					}
					return {
						batch : batch,
						node : p
					};
				},
				//delete a node
				//args: {index: number}
				deleteANode : function(args) {
					var batch;
					batch = [];
					batch.push({
						action : "remove",
						selector : "nodes",
						args : {
							key : args.index
						}
					})
					return {
						batch : batch,
						node : p
					};
				},
				//split a line element with existing node
				//args: {node: Node, element: Element}
				splitLineElement : function(args) {
					var ne = new lib.Element({
						data : {
							/*
							from : {
								X:args.node.X,
								Y:args.node.Y,
							},
							to :{
								X:args.element.data.to.X,
								Y:args.element.data.to.Y
								
							} */
							from:args.node,
							to:args.element.data.to
						}
					}), batch;
					batch = [];
					batch.push({
						action : "set",
						selector : args.element,
						args : {
							key : "to",
							value : args.node
						}

					});
					batch.push({
						action : "append",
						selector : "elements",
						args : {
							value : ne
						}
					});
					return {
						newElement : ne,
						batch : batch
					}

				},
				//add a line element to the system
				//args: {x1: number, y1: number, x2: number, y2: number}
				addALineElement : function(args) {
					var batch, p1, p2, l, d1, d2, v, f1, f2;
					batch = [];
					f1 = true;
					f2 = true;
					p1 = new lib.Node({
						data : {
							X : args.x1,
							Y : args.y1
						}
					});
					p2 = new lib.Node({
						data : {
							X : args.x2,
							Y : args.y2
						}
					});

					if(args.pointSnapThreshold > 0) {
						d1 = findNearestNode(p1, this.data.nodes);
						//console.log("d1 ", d1)
						if(d1.d < args.pointSnapThreshold) {
							p1 = this.data.nodes.data[d1.index];
							f1 = false;
						} else {
							if(args.lineSnapThreshold > 0) {
								d2 = findNearestLineElement(p1, this.data.elements);
								//console.log("d2 ", d2)
								if(d2.d < args.lineSnapThreshold) {
									v = findPerFoot(p1, this.data.elements.data[d2.index]);
									//console.log("v ",v)
									if(v.online) {
										p1 = new lib.Node({
											data : v.pf
										});
										batch=batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
										node:p1,
										element:this.data.elements.data[d2.index]
										}).batch)
									}
								}
							}

						}
					}

					if(args.pointSnapThreshold > 0) {
						d1 = findNearestNode(p2, this.data.nodes);
						//console.log("d11 ", d1)
						if(d1.d < args.pointSnapThreshold) {
							p2 = this.data.nodes.data[d1.index];
							f2 = false;
						} else {
							if(args.lineSnapThreshold > 0) {
								d2 = findNearestLineElement(p2, this.data.elements);
								//console.log("d21 ", d2)
								if(d2.d < args.lineSnapThreshold) {
									v = findPerFoot(p2, this.data.elements.data[d2.index]);
									//console.log("v ",v)
									if(v.online) {
										p2 = new lib.Node({
											data : v.pf
										});
										batch=batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
										node:p2,
										element:this.data.elements.data[d2.index]
										}).batch);
										//console.log("batch now ",batch)
									}
								}
							}

						}
					}

					/*
					 if(args.lineSnapThreshold > 0) {
					 r3 = findNearestLineElement(p1, this.data.elements);
					 r4 = findNearestLineElement(p2, this.data.elements);
					 }

					 if(r1 && !r3) {
					 if(r1.d < args.pointSnapThreshold) {
					 p1 = this.data.nodes[r1.index];
					 }
					 } else if(!r1 && r3) {
					 if(r3.d < args.lineSnapThreshold) {
					 v = findPerFoot(p1.data, this.data.elements[r3.index].data);
					 if(v.online) {
					 p1 = new lib.Node({
					 data : v.pf
					 });
					 batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
					 node:p1,
					 element:this.data.elements[r3.index]
					 }).batch)
					 }
					 //p1 = this.data.nodes[r3.index];
					 }

					 } else if(r1 && r3) {
					 if(r1.d <= r3.d) {
					 if(r1.d < args.pointSnapThreshold) {
					 p1 = this.data.nodes[r1.index];
					 }

					 } else {
					 if(r3.d < args.lineSnapThreshold) {
					 v = findPerFoot(p1.data, this.data.elements[r3.index].data);
					 if(v.online) {
					 p1 = new lib.Node({
					 data : v.pf
					 });
					 batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
					 node:p1,
					 element:this.data.elements[r3.index]
					 }).batch)
					 }
					 //p1 = this.data.nodes[r3.index];
					 }

					 }

					 }

					 if(r2 && !r4) {
					 if(r2.d < args.pointSnapThreshold) {
					 p2 = this.data.nodes[r2.index];
					 }
					 } else if(!r2 && r4) {
					 if(r4.d < args.lineSnapThreshold) {
					 v = findPerFoot(p2.data, this.data.elements[r4.index].data);
					 if(v.online) {
					 p2 = new lib.Node({
					 data : v.pf
					 });
					 batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
					 node:p2,
					 element:this.data.elements[r4.index]
					 }).batch)
					 }
					 //p1 = this.data.nodes[r3.index];
					 }

					 } else if(r2 && r4) {
					 if(r2.d <= r4.d) {
					 if(r2.d < args.pointSnapThreshold) {
					 p2 = this.data.nodes[r2.index];
					 }

					 } else {
					 if(r4.d < args.lineSnapThreshold) {
					 v = findPerFoot(p2.data, this.data.elements[r4.index].data);
					 if(v.online) {
					 p2 = new lib.Node({
					 data : v.pf
					 });
					 batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
					 node:p2,
					 element:this.data.elements[r4.index]
					 }).batch)
					 }
					 //p1 = this.data.nodes[r3.index];
					 }

					 }

					 }*/
					l = new lib.Element({
						data : {
							from : p1,
							to : p2
						}
					})
					if(f1) {
						batch.push({
							action : "append",
							selector : "nodes",
							args : {
								value : p1
							}
						})
					}
					if(f2) {
						batch.push({
							action : "append",
							selector : "nodes",
							args : {
								value : p2
							}
						})
					}

					batch.push({
						action : "append",
						selector : "elements",
						args : {
							value : l
						}

					})
					return {
						batch : batch,
						element : l
					};
				},
				//edit the property of a line element
				//args: {index: number, config: {property1:   ,property2:   ,...}}
				editALineElement : function(args) {
					var batch, prop;
					batch = [];
					for(prop in args.config) {
						if(args.config.hasOwnProperty(prop)) {
							batch.push({
								action : "set",
								selector : ["elements", args.index],
								args : {
									key : prop,
									value : args.config[prop]
								}

							})
						}
					}
					return {
						batch : batch,
						element : l
					};
				},
				//delete a line element
				//args: {index: number}
				deleteALineElement : function(args) {
					var batch;
					batch = [];
					batch.push({
						action : "remove",
						selector : "elements",
						args : {
							key : args.index
						}
					})
					return {
						batch : batch,
						element : l
					};
				},
				//delete a line element, then check its start node and end node
				//if no other elements reference them, delete them
				//args: {index: number}
				deleteALineElementWithNodes : function(args) {
					var batch;
					batch = this.batchGenerator.deleteALineElement(args);

					return {
						batch : batch
					};
				},
				addASPConstraint : function(args) {

				},
			},

		},

		messageGenerator : function(batch) {

		},
		doHandler : function(command) {
			if(!Ext.isDefined(this.commands.batchGenerator[command.name])) {
				if(!Ext.isDefined(this.commands[command.name])) {
					throw "command :" + command.name + " does not exist"
					return false;
				} else {
					return this.commands[command.name].call(this, command.args);
				}

			}

			var batch, reverseBatch;
			batch = this.commands.batchGenerator[command.name].call(this,command.args).batch;
			//console.log("batch ", batch)

			if(this.validateBatch(batch)) {
				reverseBatch = this.executeBatch(batch);
				if(!Ext.isDefined(command.undo) || command.undo === true) {
					this.undoStack.push(reverseBatch);

					if(!Ext.isEmpty(this.redoStack)) { delete this.redoStack;
						this.redoStack = [];
					}
				}

				this.fireEvent("do", this.messageGenerator(batch), batch);
				return true
			} else {
				throw "invalid command args for command " + command.name
				return false;
			}

		},
		undo : function() {
			var batch, reverseBatch;
			batch = this.undoStack.pop()
			if(this.validateBatch(batch)) {
				reverseBatch = this.executeBatch(batch);
				this.redoStack.push(reverseBatch);
				this.fireEvent("undo", this.messageGenerator(batch), batch);
			} else {
				throw "invalid command args for command " + command
				return false;
			}
		},
		redo : function() {
			var batch, reverseBatch;
			batch = this.redoStack.pop()
			if(this.validateBatch(batch)) {
				reverseBatch = this.executeBatch(batch);
				this.undoStack.push(reverseBatch);
				this.fireEvent("redo", this.messageGenerator(batch), batch);
			} else {
				throw "invalid command args for command " + command
				return false;
			}
		},
		goBackTo : function(stepIndex) {

		},
		//batch is a array consist of operations
		validateBatch : function(batch) {
			if(!Ext.isArray(batch)) {
				return false;
			} else {
				if(batch.length === 0) {
					return false;
				}
			}
			var i, len, target;
			for( i = 0, len = batch.length; i < len; i++) {
				target = Ext.isDefined(batch[i].selector) ? this.findTarget(batch[i].selector) : this;
				//console.log("target ", target)
				if(!target) {

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
		getReverseBatch : function(batch) {
			var i, len, reverseBatch;
			reverseBatch = [];
			for( i = 0, len = batch.length; i < len; i++) {
				reverseBatch.unshift(this.getReverseOperation(batch[i]));
			}
			return reverseBatch;
		},
		executeBatch : function(batch) {
			var i, len, reverseBatch;
			reverseBatch = [];
			for( i = 0, len = batch.length; i < len; i++) {
				reverseBatch.unshift(this.getReverseOperation(batch[i]));
				this.execute(batch[i]);
			}
			return reverseBatch;
		}
	});
	lib.Root = Root;
})();
