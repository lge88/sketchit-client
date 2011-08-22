(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var distance, dotLineLength, fineNearestNode, findNearestLineElement, findPerFoot,                                                   //utility functions
	lib, ut, Root;

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
		for( i = 0; i < nodes.max + 1; i++) {
			if(ut.isDefined(nodes[i])) {
				if(distance(n, nodes[i]) < result.d) {
					result.index = i;
					result.d = distance(n, nodes[i]);
				}

			}
		}
		if(ut.isDefined(result.index)) {
			return result;
		} else {
			return false;
		}

	};

	function findNearestLineElement(n, lelements) {
		var i, d, temp, result = {};
		result.d = Number.MAX_VALUE;
		for( i = 0; i < lelements.max + 1; i++) {
			if(ut.isDefined(lelements[i])) {
				temp = dotLineLength(n.X, n.Y, lelements[i].from.X, lelements[i].from.Y, lelements[i].to.X, lelements[i].to.Y, true);
				if(temp < result.d) {
					result.index = i;
					result.d = temp;
				}

			}
		}
		if(ut.isDefined(result.index)) {
			return result;
		} else {
			return false;
		}
	};

	function findPerFoot(n, e) {
		if( typeof n === "undefined" || typeof e === "undefined") {
			alert("point or line undefined");
			return false;
		}
		var flag = false;
		if(!(e.from.X - e.to.X)) {
			if((n.Y - e.from.Y) * (n.Y - e.to.Y) <= 0) {
				flag = true;
			}
			return {
				pf : {
					X : (e.from.X + e.to.X) / 2,
					Y : n.Y
				},
				dir : "vertical",
				online : flag
			}
		} else if(!(e.from.Y - e.to.Y)) {
			if((n.X - e.from.X) * (n.X - e.to.X) <= 0) {
				flag = true;
			}
			return {
				pf : {
					X : n.X,
					Y : (e.from.Y + e.to.Y) / 2
				},
				dir : "horizontal",
				online : flag
			}
		} else {
			//var x1 = e.from.X, y1 = e.from.Y,
			var dx = e.to.X - e.from.X, dy = e.to.Y - e.from.Y, y = (dx * dx * e.from.Y + n.X * dx * dy - e.from.X * dx * dy + n.Y * dy * dy) / (dx * dx + dy * dy), x = e.from.X + dx * ( y - e.from.Y) / dy, r = ( x - e.from.X) / dx;
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

	function snapToNode(Node, threshold, nodes) {
		var np = findNearestNode(Node, nodes), result = {};
		result.capture = false;
		if(np.d < threshold) {
			result.Node = nodes[np.index];
			result.capture = true;
		}
		return result;
	};

	function snapToLine(Node, threshold, lelements) {
		var nl = findNearestLineElement(Node, lelements), result = {}, v;
		result.capture = false;
		if(nl.d < threshold) {
			v = findPerFoot(Node, lelements[nl.index]);
			if(v.online) {
				result.Node = new Node.constructor({
					X : v.pf.X,
					Y : v.pf.Y
				});

				result.Line = lelements[nl.index];
				result.capture = true;
			}

		}
		return result;
	};

	function snapToGrid(Node, dx, dy) {
		var result = {};
		result.Node = new Node.constructor({
			X : Math.round(Node.X / dx) * dx,
			Y : Math.round(Node.Y / dy) * dy
		});
		result.capture = true;
		return result;
	};

	function snapTo4Direction(angle, threshold) {
		var result = {}, n;
		n = Math.round(angle / (Math.PI / 2));
		result.angle = n * (Math.PI / 2);
		result.capture = false;
		if(Math.abs( angle - n * (Math.PI / 2)) / (Math.PI / 2) < threshold) {
			result.capture = true;
			switch ((n+4)%4) {
				case 0:
					result.dir = "left";
					break;
				case 1:
					result.dir = "down";
					break;
				case 2:
					result.dir = "right";
					break;
				case 3:
					result.dir = "up";
					break;
				default:
					break;
			}
		}
		return result;
	};

	function snapToSPC(Node, threshold, SPCs) {
		var i, nodes = [], result = {}, temp;
		nodes.max = 0;
		for( i = 0; i < SPCs.max + 1; i++) {
			if(ut.isDefined(SPCs[i])) {
				nodes.push(SPCs[i].node);
				nodes.push(SPCs[i].getBottomCenter());
				nodes.max = nodes.max + 2;
			}
		}
		temp = snapToNode(Node, threshold, nodes);
		if(result.capture = temp.capture) {
			result.SPC = temp.Node.SPC;
			if(temp.Node.bottom === true) {
				result.bottom = true;
			} else {
				result.bottom = false;
			}
		};
		return result;
	};

	lib = window.sketchitLib;
	ut = lib.ut;
	Root = ut.extend(ut.Undoable, {

		modelScale : 2.0,

		constructor : function() {
			Root.superclass.constructor.apply(this, arguments);

			var nodes, elements, spcs, geoms,patterns;
			nodes = new lib.NodesStore();
			elements = new lib.ElementsStore();
			spcs = new lib.SPConstraintStore();
			geoms = new lib.GeomTransfStore();
			patterns=new lib.PatternStore();

			geoms.run("add", new lib.GeomTransf({
				type : "Linear"
			}))
			geoms.run("add", new lib.GeomTransf({
				type : "PDelta"
			}))
			geoms.run("add", new lib.GeomTransf({
				type : "Corotational"
			}))
			geoms.discard();
			
			patterns.run("add", new lib.PlainPattern({
				Loads : new lib.LoadStore()
			}))
			patterns.run("add", new lib.UniformExcitationPattern({
				Loads : new lib.LoadStore()
			}))
			patterns.discard();		

			ut.apply(this, {
				theNodes : nodes,
				theElements : elements,
				theSPCs : spcs,
				theGeomTransfs : geoms,
				thePatterns:patterns

			});

			ut.apply(this.batchCommands, {
				"addAComponent" : function() {
					var item, store, i, len;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						item = arguments[0].item;
						store = arguments[0].store;
					} else if(arguments.length > 1) {
						item = arguments[0];
						store = arguments[1];
					} else {
						return false;
					}
					store.run("add", item);

					for( i = 0, len = store.unsavedRuns.length; i < len; i++) {
						this.unsavedRuns.push(store.unsavedRuns[i]);
					}

					//this.unsavedRuns = this.unsavedRuns.concat(store.unsavedRuns);
					store.discard();
					return true;
				},
				"removeAComponentAt" : function() {
					var index, store;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						index = parseInt(arguments[0].index);
						store = arguments[0].store;
					} else if(arguments.length > 1) {
						index = parseInt(arguments[0]);
						store = arguments[1];
					} else {
						return false;
					}
					if(isNaN(index)) {
						return false;
					}

					store.run("removeAt", index);
					this.unsavedRuns = this.unsavedRuns.concat(store.unsavedRuns);
					store.discard();
					return true;
				},
				"removeAComponent" : function() {
					var id, store;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						id = parseInt(arguments[0].id);
						store = arguments[0].store;
					} else if(arguments.length > 1) {
						id = parseInt(arguments[0]);
						store = arguments[1];
					} else {
						return false;
					}
					if(isNaN(id)) {
						return false;
					} else {
						if(id == -1) {
							return this.run("removeAComponentAt", -1, store);
						} else {
							return this.run("removeAComponentAt", store.getIndexById(id), store);
						}
					}
				},
				"wipeStore" : function() {
					var store;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						store = arguments[0];
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					store.run("wipe");
					this.unsavedRuns = this.unsavedRuns.concat(store.unsavedRuns);
					store.discard();
					return true;
				},
				"splitLineElement" : function() {
					var node, element;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						node = arguments[0].node;
						element = arguments[0].element;
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					var Element = element.constructor, ne;
					//, batch;
					ne = new Element({
						from : node,
						to : element.to
					});

					this.run("set", element, "to", node);
					element.changed = true;
					this.run("addAComponent", ne, this.theElements);
					return true;

				},
				//add a line element to the system
				//args: {type:String, x1: number, y1: number, x2: number, y2: number,
				//       snapToNodeThreshold:number, snapToLineThreshold:number, grid:number
				//      autoMergeThreshlod: number,geomTransfId:number}
				"addALineElement" : function() {
					console.log("addALineElement, arguments:", arguments);
					var x1, x2, y1, y2, type, nT, lT, aT, grid, gid;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						x1 = arguments[0].x1;
						y1 = arguments[0].y1;
						x2 = arguments[0].x2;
						y2 = arguments[0].y2;
						type = arguments[0].type;
						nT = arguments[0].snapToNodeThreshold;
						lT = arguments[0].snapToLineThreshold;
						grid = arguments[0].grid;
						gid = arguments[0].geomTransfId;
						//aT = arguments[0].autoMergeNodeOnLineThreshold; bugy
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					var Node, Element, Geom, n, l, nid, lid, i, temp, splitOperation = [];
					Node = lib.Node;
					Element = type;
					Geom = this.theGeomTransfs.getObjectById(gid);
					n = [];
					n.push(new Node({
						X : x1,
						Y : y1
					}));
					n.push(new Node({
						X : x2,
						Y : y2
					}));
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//node snap check
					nid = [-1, -1];
					temp = [];
					if(ut.isDefined(nT)) {
						for( i = 0; i < 2; i++) {
							temp[i] = snapToNode(n[i], nT, this.theNodes);
							if(temp[i].capture) {
								n[i] = temp[i].Node;
								nid[i] = n[i].id;
							}
						}
						if(ut.isDefined(temp[0].Node) && ut.isDefined(temp[1].Node) && nid[0] == nid[1]) {
							return false;
						}
					}
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//line snap check
					temp = [];
					lid = [-1, -1];
					if(ut.isDefined(lT)) {
						for( i = 0; i < 2; i++) {
							if(nid[i] == -1) {
								temp[i] = snapToLine(n[i], lT, this.theElements);
								if(temp[i].capture) {
									n[i] = temp[i].Node;
									lid[i] = temp[i].Line.id;
									//TODO:splitLineElement command
									splitOperation.push({
										node : n[i],
										element : temp[i].Line
									})

								}
							}
						}
						if((ut.isDefined(temp[0]) && ut.isDefined(temp[0].Line)) && (ut.isDefined(temp[1]) && ut.isDefined(temp[1].Line)) && lid[0] == lid[1]) {
							return false;
						}
						for( i = 0; i < splitOperation.length; i++) {
							this.run("splitLineElement", splitOperation[i]);
						}
					}

					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//grid snap check
					if(ut.isDefined(grid)) {
						for( i = 0; i < 2; i++) {
							if(nid[i] == -1 && lid[i] == -1) {
								n[i] = snapToGrid(n[i],grid,grid).Node;
							}
						}
					}
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)
					l = new Element({
						from : n[0],
						to : n[1],
						geomTransf : Geom
					});

					this.run("addAComponent", l, this.theElements);

					for( i = 0; i < 2; i++) {
						if(nid[i] == -1) {
							this.run("addAComponent", n[i], this.theNodes);
						}
					}

					//check the existing nodes, if any is on the new line elements, merge it to the line element
					if(ut.isDefined(aT)) {
						for( i = 0; i < this.theNodes.max + 1; i++) {
							if(ut.isDefined(this.theNodes[i])) {
								if(this.theNodes[i].id != l.from.id && this.theNodes[i].id != l.to.id) {
									if(dotLineLength(this.theNodes[i].X, this.theNodes[i].Y, n[0].X, n[0].Y, n[1].X, n[1].Y, true) < aT) {
										//TODO:
										console.log("split!! nid:", this.theNodes[i].id, " lfrom ", l.from.id, " lto ", l.to.id)
										this.run("splitLineElement", {
											node : this.theNodes[i],
											element : l
										});
									}
								}

							}

						}
					}
					return true;

				},
				//add a single point constraint to the system
				//args:{topX:number, topY:number, angle:number, show:boolean,
				//      dT:number,nT:number, grid:number}
				"addASPC" : function() {
					console.log("addASPC, arguments:", arguments);
					var topX, topY, angle, show, dT, nT, grid;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						topX = arguments[0].topX;
						topY = arguments[0].topY;
						angle = arguments[0].angle;
						show = arguments[0].show;
						dT = arguments[0].dT;
						nT = arguments[0].nT;
						grid = arguments[0].grid;
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					var Node, SPC, temp, n, spc, nid = -1, direction;
					Node = lib.Node;
					SPC = lib.SPConstraint;
					n = new Node({
						X : topX,
						Y : topY
					});

					if(ut.isDefined(nT)) {
						temp = snapToNode(n, nT, this.theNodes);
						if(temp.capture) {
							n = temp.Node;
							nid = n.id;
						}
					}
					if(ut.isDefined(grid)) {
						if(nid == -1) {
							n = snapToGrid(n,grid,grid).Node;
						}
					}
					if(nid == -1) {
						this.run("addAComponent", n, this.theNodes);
					}

					if(!ut.isDefined(n.SPC)) {
						temp = snapTo4Direction(angle, dT);
						if(temp.capture) {
							angle = temp.angle;
							direction = temp.direction;
						}
						temp = {
							node : n,
							angle : angle,
							show : show
						};
						if(ut.isDefined(direction)) {
							temp.direction = direction;
						}
						spc = new SPC(temp);
						this.run("addAComponent", spc, this.theSPCs);
						this.run("set", n, "SPC", spc);

					}

					return true;

				},
				//release a single point constraint to the system
				//args:{cenX:number, cenY:number, t:number}
				"releaseASPC" : function() {
					console.log("releaseASPC, arguments:", arguments);
					var cenX, cenY, t;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						cenX = arguments[0].cenX;
						cenY = arguments[0].cenY;
						t = arguments[0].t;
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					var n, spc, temp;
					n = {
						X : cenX,
						Y : cenY
					}
					if(ut.isDefined(t)) {
						temp = snapToSPC(n, t, this.theSPCs);
						if(temp.capture) {
							spc = temp.SPC;
							if(!temp.bottom) {
								if(spc.RZ == 1) {
									this.run("set", spc, "RZ", 0);
								}
							} else {
								if(spc.direction === "up" || spc.direction === "down") {
									if(spc.X == 1) {
										this.run("set", spc, "X", 0);
									}
								} else if(spc.direction === "left" || spc.direction === "right") {
									if(spc.Y == 1) {
										this.run("set", spc, "Y", 0);
									}
								}
							}
						}
					}
					return true;
				},
				//add a node load
				//args: {x1: number, y1: number, x2: number, y2: number,
				//       nT:number, lT:number, grid:number}
				"addALoad" : function() {
					console.log("addALoad, arguments:", arguments);

					var x1, x2, y1, y2, nT, lT, grid;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						x1 = arguments[0].x1;
						y1 = arguments[0].y1;
						x2 = arguments[0].x2;
						y2 = arguments[0].y2;
						nT = arguments[0].nT;
						lT = arguments[0].lT;
						grid = arguments[0].grid;
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					var Node,nLoad, uLoad, n, l, nid, lid, i, temp, splitOperation = [];
					Node = lib.Node;
					//Element = type;
					nLoad = lib.NodeLoad;
					uLoad = lib.UniformExcitationLoad;
					n = [];
					n.push(new Node({
						X : x1,
						Y : y1
					}));
					n.push(new Node({
						X : x2,
						Y : y2
					}));
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//node snap check
					nid = [-1, -1];
					temp = [];
					if(ut.isDefined(nT)) {
						for( i = 0; i < 2; i++) {
							temp[i] = snapToNode(n[i], nT, this.theNodes);
							if(temp[i].capture) {
								n[i] = temp[i].Node;
								nid[i] = n[i].id;
							}
						}
						if(ut.isDefined(temp[0].Node) && ut.isDefined(temp[1].Node) && nid[0] == nid[1]) {
							return false;
						}
						// prefer snap to end
						if(nid[1] != -1) {
							nid[0] = -1;
						}
					}
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//line snap check
					temp = [];
					lid = [-1, -1];
					if(nid[0] == -1 && nid[1] == -1) {
						
						if(ut.isDefined(lT)) {
							for( i = 0; i < 2; i++) {
								if(nid[i] == -1) {
									temp[i] = snapToLine(n[i], lT, this.theElements);
									//console.log("haerae,temp ",temp[i])
									if(temp[i].capture) {
										n[i] = temp[i].Node;
										lid[i] = temp[i].Line.id;
										//TODO:splitLineElement command
										splitOperation.push({
											node : n[i],
											element : temp[i].Line,
											i:i
										})

									}
								}
							}
							if((ut.isDefined(temp[0]) && ut.isDefined(temp[0].Line)) && (ut.isDefined(temp[1]) && ut.isDefined(temp[1].Line)) && lid[0] == lid[1]) {
								return false;
							}
							// prefer snap to end
							if(lid[1] != -1) {
								lid[0] = -1;
							}
							for( i = 0; i < splitOperation.length; i++) {
								if(lid[splitOperation[i].i] != -1) {
									this.run("addAComponent",n[splitOperation[i].i],this.theNodes)
									this.run("splitLineElement", splitOperation[i]);
									
								}
							}
						}
					}

					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					//grid snap check
					if(ut.isDefined(grid)) {
						for( i = 0; i < 2; i++) {
							if(nid[i] == -1 && lid[i] == -1) {
								n[i] = snapToGrid(n[i],grid,grid).Node;
							}
						}
					}
					//console.log("n[0]:", n[0].X, n[0].Y)
					//console.log("n[1]:", n[1].X, n[1].Y)

					if(nid[0] == -1 && nid[1] == -1 && lid[0] == -1 && lid[1] == -1) {
						//uniform load
						console.log("uniform load")
						
						

					} else {
						//node load
						console.log("node load")
						console.log("n0,n1 ",n[0],n[1])
						console.log("angle ",Math.acos((n[1].X-n[0].X)/distance(n[0],n[1])));
						var aA,aL;
						aL=distance(n[0],n[1]);
						aA=Math.acos((n[1].X-n[0].X)/aL);
						if (n[1].Y<n[0].Y){
							aA=-aA;
						}
						l = new nLoad({
							node : nid[0] == -1 ? n[1] : n[0],
							nodeAtArrowEnd : nid[0] == -1 ?true:false,
							arrowLength : aL,
							arrowAngle : aA,

							X : n[1].X-n[0].X,
							Y : n[1].Y-n[0].Y,
							RZ : 0
						});
						this.run("addAComponent", l, this.thePatterns[0].Loads);

					}


					return true;

				},
				//clear all objects in root data
				//args:{key:"all" or array}
				"clearAll" : function() {
					console.log("clear All")
					this.run("wipeStore", this.theNodes);
					this.run("wipeStore", this.theElements);
					this.run("wipeStore", this.theSPCs);
					return true;
				}
			});

			ut.apply(this.commands, {
				toTcl : function(scale) {
					var result = "";

					return result;
				}
			});

			//this.initOPS_Components();
			//this.initObjectStores();

		},
	});

	lib.Root = Root;

})();
