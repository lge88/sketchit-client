(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Root;
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
		if(result.index) {
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
		if(result.index) {
			return result;
		} else {
			return false;
		}
	};

	function findPerFoot(n, e) {
		var p = n.data, l = {
			from : {
				X : e.data.from.data.X,
				Y : e.data.from.data.Y
			},
			to : {
				X : e.data.to.data.X,
				Y : e.data.to.data.Y
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
					Y : (l.from.Y + l.to.Y) / 2
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
	ut = lib.ut;
	Root = ut.extend(ut.Cmpnt, {
		options : undefined, //will defined in controller
		defaults : {
			modelBuilder : new lib.ModelBuilder(),
			nodes : new ut.Collection(),
			masses : new ut.Collection(),
			SPConstraints : new ut.Collection(),
			geomTransforms : new ut.Collection(),
			materials : new ut.Collection(),
			sections : new ut.Collection(),
			elements : new ut.Collection(),
			patterns : new ut.Collection(),
			analysisSettings : new ut.Collection(),
		},
		systemDefaults : {
			modelBuilder : {
				type : "basic",
				ndm : 2,
				ndf : 3
			},
			options : {
				snapToNode : true,
				pointSnapThreshold : 15,
				snapToLine : true,
				lineSnapThreshold : 5,
				snapToGrid : true,
				grid : 10,
				SPCSnapToDirection : true,
				SPCSnapToDirectionThreshold : 0.2,
				SPCTriangleSize : 10,
				SPCSnapToNodeThreshold : 25,
				autoMergeNodeOnLine : true,
				autoMergeNodeOnLineThreshold : 1
			},
			nodes : new ut.Collection(),
			masses : new ut.Collection(),
			SPConstraints : new ut.Collection(),
			geomTransforms : new ut.Collection(),
			materials : new ut.Collection(),
			sections : new ut.Collection(),
			elements : new ut.Collection(),
			patterns : new ut.Collection(),
			analysisSettings : new ut.Collection(),
		},
		loadDefault : function() {
			Root.superclass.constructor.call(this);
			this.data.modelBuilder

		}
	});
	ut.override(Root, ut.Undoable);
	ut.override(Root, {
		doHandler : function(command) {
			if(!ut.isDefined(this.commands.batchGenerator[command.name])) {
				if(!ut.isDefined(this.commands[command.name])) {
					console.log("command :" + command.name + " does not exist")
					return false;
				} else {
					return this.commands[command.name].call(this, command.args);
				}
			}

			var result;
			result = this.commands.batchGenerator[command.name].call(this, command.args);
			if(result != false) {
				if(!ut.isDefined(command.undo) || command.undo === true) {
					this.undoStack.push(result.batch.revert());
					this.redoStack = [];
				}
				result.batch.execute();
			}

		},
		commands : {
			//TODO: haven't implement yet
			toPlainObject : function() {
				var result = {};

				return result;
			},
			batchGenerator : {
				//add a node to the system
				//args: {x: number, y: number, }
				//TODO: haven't tested yet
				addANode : function(args) {
					
					if(ut.isDefined(args)) {
						return this.data.nodes.batchAdd(args.item);
					}
					return false;
					
				},
				//edit the property of a node
				//args: {index: number, config: {property1:   ,property2:   ,...}}
				//TODO: haven't tested yet
				editANode : function(args) {
					var batch, prop;
					batch = [];
					for(prop in args.config) {
						if(args.config.hasOwnProperty(prop)) {
							batch.push(this.data.nodes[args.index].batchEdit(prop,args.config[prop]));
						}
					}
					return {
						batch : batch,
						node : this.data.nodes[args.index]
					};
				},
				//delete a node
				//args: {index: number}
				//TODO: haven't tested yet
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
							from : args.node,
							to : args.element.data.to
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
				//args: {x1: number, y1: number, x2: number, y2: number}}
				addALineElement : function(args) {
					var batch, p, l, np, nl, v, newFlag, pfFlag, i, temp;
					batch = [];
					p = [];
					v = [];
					nl = [];
					temp = [];
					newFlag = [true, true];
					pfFlag = [false, false];
					p.push(new lib.Node({
						data : {
							X : args.x1,
							Y : args.y1
						}
					}));
					p.push(new lib.Node({
						data : {
							X : args.x2,
							Y : args.y2
						}
					}));

					//node snap check
					if(this.options.snapToNode) {
						for( i = 0; i < 2; i++) {
							np = findNearestNode(p[i], this.data.nodes);
							//console.log("np ", np)
							if(np.d < this.options.pointSnapThreshold) {
								p[i] = this.data.nodes.data[np.index];
								newFlag[i] = false;
							}
						}
					}

					//line snap check
					if(this.options.snapToLine) {
						for( i = 0; i < 2; i++) {
							if(newFlag[i]) {

								nl[i] = findNearestLineElement(p[i], this.data.elements);
								//console.log("nl ", nl)
								if(nl[i].d < this.options.lineSnapThreshold) {

									if(i === 1 && Ext.isDefined(v[0])) {
										if(nl[1].index === nl[0].index) {
											alert("herererere")
											return {
												batch : []
											}
										}
									}
									v[i] = findPerFoot(p[i], this.data.elements.data[nl[i].index]);
									if(v[i].online) {
										p[i] = new lib.Node({
											data : v[i].pf
										});
										pfFlag[i] = true;
										temp[i] = this.commands.batchGenerator.splitLineElement.call(this,{
										node:p[i],
										element:this.data.elements.data[nl[i].index]
										}).batch;
									}

								}
							}
						}
					}

					//grid snap check
					if(this.options.snapToGrid) {
						if(Ext.isNumber(this.options.grid) && this.options.grid > 1) {
							for( i = 0; i < 2; i++) {
								if(newFlag[i]) {
									p[i].data.X = Math.round(p[i].data.X / this.options.grid) * this.options.grid;
									p[i].data.Y = Math.round(p[i].data.Y / this.options.grid) * this.options.grid;

								}
							}

						} else if(Ext.isObject(this.options.grid) && Ext.isDefined(this.options.grid.dx) && Ext.isDefined(this.options.grid.dy)) {
							for( i = 0; i < 2; i++) {
								if(newFlag[i]) {
									p[i].data.X = Math.round(p[i].data.X / this.options.grid.dx) * this.options.grid.dx;
									p[i].data.Y = Math.round(p[i].data.Y / this.options.grid.dy) * this.options.grid.dy;
								}
							}

						}
						console.log("p ", p)
					}
					l = new lib.Element({
						data : {
							from : p[0],
							to : p[1]
						}
					})

					for( i = 0; i < 2; i++) {
						if(newFlag[i]) {
							batch.push({
								action : "append",
								selector : "nodes",
								args : {
									value : p[i]
								}
							})
							if(Ext.isDefined(temp[i])) {
								batch = batch.concat(temp[i]);
							}
						}
					}

					batch.push({
						action : "append",
						selector : "elements",
						args : {
							value : l
						}

					})

					//check the existing nodes, if any is on the new line elements, merge it to the line element
					if(this.options.autoMergeNodeOnLine) {
						for(i in this.data.nodes.data) {
							if(this.data.nodes.data.hasOwnProperty(i)) {
								if(distance(this.data.nodes.data[i].data, p[0].data) < 0.5 || distance(this.data.nodes.data[i].data, p[1].data) < 0.5) {
									continue;
								}
								if(dotLineLength(this.data.nodes.data[i].data.X, this.data.nodes.data[i].data.Y, p[0].data.X, p[0].data.Y, p[1].data.X, p[1].data.Y, true) < this.options.autoMergeNodeOnLineThreshold) {
									batch = batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
									node:this.data.nodes.data[i],
									element:l
									}).batch)
								}
							}
						}

					}

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
				//TODO: haven't tested yet
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
				//TODO: haven't tested yet
				deleteALineElementWithNodes : function(args) {
					var batch;
					batch = this.batchGenerator.deleteALineElement(args);

					return {
						batch : batch
					};
				},
				//add a single point constraint to the system
				//args:{x:number, y:number, angle:number, show:boolean}
				addASPConstraint : function(args) {
					var batch, p, np, newFlag, spc, angle, dir, n, i;
					batch = [];
					newFlag = true;
					p = new lib.Node({
						data : {
							X : args.x,
							Y : args.y
						}
					});
					np = findNearestNode(p, this.data.nodes);
					console.log("thres " + this.options.SPCSnapToNodeThreshold)
					if(np.d < this.options.SPCSnapToNodeThreshold) {
						p = this.data.nodes.data[np.index];
						newFlag = false;
					}

					if(this.options.snapToGrid && newFlag) {
						//alert("here")
						if(Ext.isNumber(this.options.grid) && this.options.grid > 1) {

							p.data.X = Math.round(p.data.X / this.options.grid) * this.options.grid;
							p.data.Y = Math.round(p.data.Y / this.options.grid) * this.options.grid;

						} else if(Ext.isObject(this.options.grid) && Ext.isDefined(this.options.grid.dx) && Ext.isDefined(this.options.grid.dy)) {

							p.data.X = Math.round(p.data.X / this.options.grid.dx) * this.options.grid.dx;
							p.data.Y = Math.round(p.data.Y / this.options.grid.dy) * this.options.grid.dy;

						}

					}
					for(i in this.data.SPConstraints.data) {
						if(this.data.SPConstraints.data.hasOwnProperty(i)) {
							if(distance(this.data.SPConstraints.data[i].data.node.data, p.data) < 0.5) {
								return {
									batch : []
								}
							}
						}
					}

					if(newFlag) {
						batch.push({
							action : "append",
							selector : "nodes",
							args : {
								value : p
							}
						})
					}
					angle = args.angle;
					dir = "oblique";
					if(this.options.SPCSnapToDirection) {
						//console.log(Math.abs(args.angle - Math.round(args.angle / (Math.PI / 2)) * (Math.PI / 2)) / (Math.PI / 2))
						n = Math.round(args.angle / (Math.PI / 2));
						if(Math.abs(args.angle - n * (Math.PI / 2)) / (Math.PI / 2) < this.options.SPCSnapToDirectionThreshold) {
							angle = n * (Math.PI / 2);
							switch ((n+4)%4) {
								case 0:
									dir = "left";
									break;
								case 1:
									dir = "down";
									break;
								case 2:
									dir = "right";
									break;
								case 3:
									dir = "up";
									break;
								default:
									break;

							}

						}

						//angle=Math.round(args.angle/(Math.PI/2));

					}
					console.log("angle ", angle)
					spc = new lib.SPConstraint({
						data : {
							node : p,
							angle : angle,
							show : args.show,
							direction : dir
							//RZ:0,
							//X:0
						}
					});
					//spc.loadDefault();
					batch.push({
						action : "append",
						selector : "SPConstraints",
						args : {
							value : spc
						}
					})

					return {
						batch : batch,
						spc : spc
					}

				},
				//release a single point constraint to the system
				//args:{x:number, y:number}
				releaseConstraint : function(args) {
					var batch, p, top, bottom, d, pin, flag, s;
					batch = [];
					p = {
						X : args.x,
						Y : args.y
					};
					newFlag = true;
					flag = true;
					Ext.each(this.data.SPConstraints.data, function(spc, i, ar) {
						if(!flag) {
							return;
						}
						top = spc.data.node.data;
						bottom = {
							X : top.X + this.options.SPCTriangleSize * Math.cos(spc.data.angle),
							Y : top.Y + this.options.SPCTriangleSize * Math.sin(spc.data.angle)
						};
						if(distance(top, p) < distance(bottom, p)) {
							d = distance(top, p);
							pin = true;
						} else {
							d = distance(bottom, p);
							pin = false;
						}

						if(d < this.options.pointSnapThreshold) {
							if(pin) {
								if(spc.data.RZ !== 0) {
									batch.push({
										action : "set",
										selector : ["SPConstraints", i],
										args : {
											key : "RZ",
											value : 0
										}
									})
								}

							} else {
								if(spc.data.direction === "up" || spc.data.direction === "down") {
									if(spc.data.X !== 0) {
										batch.push({
											action : "set",
											selector : ["SPConstraints", i],
											args : {
												key : "X",
												value : 0
											}
										})
									}

								} else if(spc.data.direction === "left" || spc.data.direction === "right") {
									if(spc.data.Y !== 0) {
										batch.push({
											action : "set",
											selector : ["SPConstraints", i],
											args : {
												key : "Y",
												value : 0
											}
										})
									}

								}

							}
							flag = false;
							s = spc;
						}

					}, this);
					return {
						batch : batch,
						spc : s
					}
				},
				//add a node load
				//args: {x1: number, y1: number, x2: number, y2: number}}
				addANodeLoad : function(args) {
					var batch, p, l, np, nl, v, newFlag, pfFlag, i, temp;
					batch = [];
					p = [];
					v = [];
					nl = [];
					temp = [];
					newFlag = [true, true];
					pfFlag = [false, false];
					p.push(new lib.Node({
						data : {
							X : args.x1,
							Y : args.y1
						}
					}));
					p.push(new lib.Node({
						data : {
							X : args.x2,
							Y : args.y2
						}
					}));

					//node snap check
					if(this.options.snapToNode) {
						for( i = 0; i < 2; i++) {
							np = findNearestNode(p[i], this.data.nodes);
							//console.log("np ", np)
							if(np.d < this.options.pointSnapThreshold) {
								p[i] = this.data.nodes.data[np.index];
								newFlag[i] = false;
							}
						}
					}

					//line snap check
					if(this.options.snapToLine) {
						for( i = 0; i < 2; i++) {
							if(newFlag[i]) {

								nl[i] = findNearestLineElement(p[i], this.data.elements);
								//console.log("nl ", nl)
								if(nl[i].d < this.options.lineSnapThreshold) {

									if(i === 1 && Ext.isDefined(v[0])) {
										if(nl[1].index === nl[0].index) {
											alert("herererere")
											return {
												batch : []
											}
										}
									}
									v[i] = findPerFoot(p[i], this.data.elements.data[nl[i].index]);
									if(v[i].online) {
										p[i] = new lib.Node({
											data : v[i].pf
										});
										pfFlag[i] = true;
										temp[i] = this.commands.batchGenerator.splitLineElement.call(this,{
										node:p[i],
										element:this.data.elements.data[nl[i].index]
										}).batch;
									}

								}
							}
						}
					}

					//grid snap check
					if(this.options.snapToGrid) {
						if(Ext.isNumber(this.options.grid) && this.options.grid > 1) {
							for( i = 0; i < 2; i++) {
								if(newFlag[i]) {
									p[i].data.X = Math.round(p[i].data.X / this.options.grid) * this.options.grid;
									p[i].data.Y = Math.round(p[i].data.Y / this.options.grid) * this.options.grid;

								}
							}

						} else if(Ext.isObject(this.options.grid) && Ext.isDefined(this.options.grid.dx) && Ext.isDefined(this.options.grid.dy)) {
							for( i = 0; i < 2; i++) {
								if(newFlag[i]) {
									p[i].data.X = Math.round(p[i].data.X / this.options.grid.dx) * this.options.grid.dx;
									p[i].data.Y = Math.round(p[i].data.Y / this.options.grid.dy) * this.options.grid.dy;
								}
							}

						}
						console.log("p ", p)
					}
					l = new lib.Element({
						data : {
							from : p[0],
							to : p[1]
						}
					})

					for( i = 0; i < 2; i++) {
						if(newFlag[i]) {
							batch.push({
								action : "append",
								selector : "nodes",
								args : {
									value : p[i]
								}
							})
							if(Ext.isDefined(temp[i])) {
								batch = batch.concat(temp[i]);
							}
						}
					}

					batch.push({
						action : "append",
						selector : "elements",
						args : {
							value : l
						}

					})

					//check the existing nodes, if any is on the new line elements, merge it to the line element
					if(this.options.autoMergeNodeOnLine) {
						for(i in this.data.nodes.data) {
							if(this.data.nodes.data.hasOwnProperty(i)) {
								if(distance(this.data.nodes.data[i].data, p[0].data) < 0.5 || distance(this.data.nodes.data[i].data, p[1].data) < 0.5) {
									continue;
								}
								if(dotLineLength(this.data.nodes.data[i].data.X, this.data.nodes.data[i].data.Y, p[0].data.X, p[0].data.Y, p[1].data.X, p[1].data.Y, true) < this.options.autoMergeNodeOnLineThreshold) {
									batch = batch.concat(this.commands.batchGenerator.splitLineElement.call(this,{
									node:this.data.nodes.data[i],
									element:l
									}).batch)
								}
							}
						}

					}

					return {
						batch : batch,
						element : l
					};

				},
				//clear all objects in root data
				//args:{key:"all" or array}
				clear : function(args) {
					var range, batch, key, obj, i, ar;
					batch = [];
					if(args.key === "all") {
						range = ["elements", "nodes", "patterns", "SPConstraints", "masses"]
					} else {
						range = args.key;
					}
					for(key in range) {
						if(range.hasOwnProperty(key)) {
							Ext.each(this.data[range[key]].data, function(obj, i, ar) {
								if(!Ext.isDefined(obj)) {
									return;
								}
								batch.push({
									action : "remove",
									selector : range[key],
									args : {
										key : 0
									}
								});
							}, this)
						}

					}
					return {
						batch : batch
					}
				}
			},

		},

	});

	lib.Root = Root;
})();
