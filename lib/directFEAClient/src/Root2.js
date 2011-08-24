(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var distance, dotLineLength, fineNearestNode, findNearestLineElement, findPerFoot,                                 //utility functions
	lib, ut, Root,                                //
	myNode, myElement,                                //
	myNodeOutLook, myElementOutLook,                               //
	myNodesStore, myElementsStore;

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
		/*var p = n.data, l = {
		 from : {
		 X : e.data.from.data.X,
		 Y : e.data.from.data.Y
		 },
		 to : {
		 X : e.data.to.data.X,
		 Y : e.data.to.data.Y
		 }
		 };*/
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

	lib = window.sketchitLib;
	ut = lib.ut;

	/*myNodeShape = ut.extend(ut.NodeShape, {});
	 myNode = ut.extend(ut.Node, {
	 shapeConstructor : myNodeShape

	 });
	 myNodesStore = ut.extend(ut.NodesStore, {
	 model : myNode
	 });
	 //myElement = ut.extend(ut.Element,{});
	 //myDefaultLineElementType = ut.ElasticBeamColumn;
	 //myElasticBeamColumnShape = ut.extend(ut.ElementShape, {});
	 myElasticBeamColumn = ut.extend(ut.ElasticBeamColumn, {
	 shapeConstructor : ut.extend(ut.ElementShape, {});
	 });
	 myElementsStore = ut.extend(ut.ElementsStore, {
	 model : ut.Element,
	 defaultLineElementType : myElasticBeamColumn
	 });*/
	Root = ut.extend(ut.Undoable, {
		//options : undefined,            //will defined in controller

		//Element : myElement,
		renderer : undefined,
		modelScale : 2.0,
		getModelCoordFromCanvas:function(p){
			return {
				X:p.X/this.modelScale,
				Y:p.Y/this.modelScale
			}
		},
		//modelOriginX : 0.0,
		//modelOriginY : 0.0,
		constructor : function() {
			Root.superclass.constructor.apply(this, arguments);
			//this.initOPS_Components();
			//this.initObjectStores();

		},
		initOPS_Components : function() {
			ut.apply(this.options, {
				//ModelBuilder : ut.extent(ut.ModelBuilder, {}),
				Node : ut.extend(lib.Node, {
					shapeConstructor : this.renderer.options.NodeShape
				}),
				defaultLineElementType : "ElasticBeamColumn",
				ElasticBeamColumn : ut.extend(lib.ElasticBeamColumn, {
					shapeConstructor : this.renderer.options.ElasticBeamColumnShape
				}),

			})
		},
		initObjectStores : function() {
			ut.apply(this, {
				nodes : new lib.NodesStore({
					renderer : this.renderer
				}),
				elements : new lib.ElementsStore({
					renderer : this.renderer
				})

			})
		},
		options : {

			snapToNode : true,
			snapToNodeThreshold : 15,
			snapToLine : true,
			snapToLineThreshold : 5,
			snapToGrid : true,
			grid : 10,
			SPCSnapToDirection : true,
			SPCSnapToDirectionThreshold : 0.2,
			SPCTriangleSize : 10,
			SPCSnapToNodeThreshold : 25,
			autoMergeNodeOnLine : true,
			autoMergeNodeOnLineThreshold : 1
		},

		//nodes : undefined,
		/*
		SPConstraints : new ut.ObjectArrayStore({
		model : lib.SPConstraint
		}),
		geomTransforms : new ut.ObjectArrayStore({
		model : lib.GeomTransform
		}),
		materials : new ut.ObjectArrayStore({
		model : lib.Material
		}),
		sections : new ut.ObjectArrayStore({
		model : lib.Section
		}),*/
		//elements : undefined,
		/*
		patterns : new ut.ObjectArrayStore({
		model : lib.Pattern
		}),
		analysisSettings : new ut.ObjectArrayStore({
		model : lib.AnalysisSetting
		}),*/

		// internal functions:

		snapToNode : function(Node, threshold, nodes) {
			var np = findNearestNode(Node, nodes), result = {};
			/*result.Node = new this.options.Node({
			 X : Node.X,
			 Y : Node.Y
			 });*/
			result.capture = false;
			if(!ut.isDefined(nodes)) {
				nodes = this.nodes;
			}
			if(np.d < threshold) {
				result.Node = nodes[np.index];
				result.capture = true;
				//return true;
			}
			return result;
		},
		snapToLine : function(Node, threshold, lelements) {
			var nl = findNearestLineElement(Node, lelements), result = {}, v;
			//console.log("nl ", nl)
			/*result.Node = new this.options.Node({
			 X : Node.X,
			 Y : Node.Y
			 });*/
			result.capture = false;
			if(nl.d < threshold) {
				v = findPerFoot(Node, lelements[nl.index]);
				if(v.online) {
					//result.Node.X = v.pf.X;
					//result.Node.Y = v.pf.Y;
					result.Node = new this.options.Node({
						X : v.pf.X,
						Y : v.pf.Y,
						renderer:this.renderer
					});

					result.Line = lelements[nl.index];
					result.capture = true;
				}

			}
			return result;

		},
		snapToGrid : function(Node, dx, dy) {
			var result = {};
			result.Node = new this.options.Node({
				X : Math.round(Node.X / dx) * dx,
				Y : Math.round(Node.Y / dy) * dy,
				renderer:this.renderer
			});
			result.capture = true;
			return result;
		},
		//split a line element with existing node
		//args: {node: Node, element: Element}

		splitLineElement : function(args) {
			var Element = args.element.constructor, ne;
			//, batch;
			ne = new Element({
				from : args.node,
				to : args.element.to,
				renderer : this.renderer
			});

			this.run("set", args.element, to, args.node);
			args.element.changed = true;
			//this.run("set",args.element,"changed",true);
			this.elements.run("add", ne);
			this.elements.exportUnsavedRuns(this.unsavedRuns)
			this.elements.discard();
			//batch = new ut.Batch();
			//batch.push(new ut.BasicMove(args.element, to, args.node));
			//args.element.createShape();
			//batch = batch.concat(this.elements.batchAdd(ne).batch);
			//batch.push(new ut.BasicMove(,));
			//batch.push();
			return false;

		},
		//add a line element to the system
		//args: {type:String, x1: number, y1: number, x2: number, y2: number,
		//       snapToNodeThreshold:number, snapToLineThreshold:number, gridDx:number, gridDy:number
		//      autoMergeThreshlod: number}
		batchAddALineElement : function(args) {

			var Node, Element, batch, n, l, nid, lid, i, temp;
			Node = this.options.Node;
			Element = ut.isDefined(args.type) ? this.options[args.type] : this.options[this.options.defaultLineElementType];
			batch = new ut.Batch();
			//console.log("ele",Element)
			/*
			 console.log("new ele",new Element({
			 from:1,
			 to:2
			 }))*/

			n = [];
			temp = [];
			nid = [-1, -1];
			lid = [-1, -1];
			n.push(new Node({
				X : args.x1,
				Y : args.y1
			}));
			n.push(new Node({
				X : args.x2,
				Y : args.y2
			}));
			console.log("n[0]:", n[0].X, n[0].Y)
			console.log("n[1]:", n[1].X, n[1].Y)

			//node snap check
			if(ut.isDefined(args.snapToNodeThreshold)) {
				for( i = 0; i < 2; i++) {
					temp[i] = this.snapToNode(n[i], args.snapToNodeThreshold, this.nodes);
					if(temp[i].capture) {
						n[i] = temp[i].Node;
						nid[i] = n[i].id;
					}
				}
				if(ut.isDefined(temp[0].Node) && ut.isDefined(temp[1].Node) && nid[0] == nid[1]) {
					return false;
				}
			}

			console.log("n[0]:", n[0].X, n[0].Y)
			console.log("n[1]:", n[1].X, n[1].Y)

			//line snap check
			temp = [];
			if(ut.isDefined(args.snapToLineThreshold)) {
				for( i = 0; i < 2; i++) {
					if(nid[i] == -1) {
						temp[i] = this.snapToLine(n[i], args.snapToLineThreshold, this.elements);
						if(temp[i].capture) {
							n[i] = temp[i].Node;
							lid[i] = temp[i].Line.id;
							this.splitLineElement({
								node : n[i],
								element : temp[i].Line
							});
						}
					}
				}
				if(ut.isDefined(temp[0].Line) && ut.isDefined(temp[1].Line) && lid[0] == lid[1]) {
					return false;
				}
			}

			console.log("n[0]:", n[0].X, n[0].Y)
			console.log("n[1]:", n[1].X, n[1].Y)

			//grid snap check
			if(ut.isDefined(args.gridDx) || ut.isDefined(args.gridDy) || ut.isDefined(args.grid)) {
				var dx, dy;
				dx = args.gridDx || args.grid || args.gridDy;
				dy = args.gridDy || args.grid || args.gridDy;
				for( i = 0; i < 2; i++) {
					if(nid[i] == -1 && lid[i] == -1) {
						n[i] = this.snapToGrid(n[i],dx,dy).Node;
					}
				}
				//console.log("n ", n)
			}

			console.log("n[0]:", n[0].X, n[0].Y)
			console.log("n[1]:", n[1].X, n[1].Y)
			l = new Element({
				from : n[0],
				to : n[1]
			});

			for( i = 0; i < 2; i++) {
				if(nid[i] == -1) {
					//batch = batch.concat(this.nodes.batchAdd(n[i]).batch);
					//batch = batch.concat(this.nodes.batchAdd(n[i]).batch);
					this.nodes.run("add", n[i]);
					this.nodes.exportUnsavedRuns(this.unsavedRuns)
					this.nodes.discard();

				}
			}
			//batch = batch.concat(this.elements.batchAdd(l).batch);
			this.elements.run("add", l);
			this.elements.exportUnsavedRuns(this.unsavedRuns)
			this.elements.discard();

			//check the existing nodes, if any is on the new line elements, merge it to the line element
			if(ut.isDefined(args.autoMergeThreshold)) {
				for( i = 0; i < this.nodes.max + 1; i++) {
					if(ut.isDefined(this.nodes[i])) {
						if(this.nodes[i].id != nid[0] && this.nodes[i].id != nid[1]) {
							if(dotLineLength(this.nodes[i].X, this.nodes[i].Y, n[0].X, n[0].Y, n[1].X, n[1].Y, true) < args.autoMergeThreshold) {
								/*batch = batch.concat(this.batchSplitLineElement({
								 node : this.nodes[i],
								 element : l
								 }));*/
								this.splitLineElement({
									node : this.nodes[i],
									element : l
								})

							}
						}

					}

				}
			}

			//console.log("l ",l)

			//console.log("batch ",batch);
			return false;
			/*

			 return {
			 batch : batch,
			 element : l
			 };*/
		},
		commands : {
			//TODO: haven't implement yet
			toPlainObject : function() {
				var result = {};

				return result;
			},
		},
		batchCommands : {
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
			"addARenderableComponent" : function() {
				var item, store, renderStore, i;
				if(arguments.length === 1 && ut.isObject(arguments[0])) {
					item = arguments[0].item;
					store = arguments[0].store;
					renderStore = arguments[0].renderStore;
				} else if(arguments.length > 1) {
					item = arguments[0];
					store = arguments[1];
					renderStore = arguments[2];
				} else {
					return false;
				}
				this.run("addAComponent", item, store);

				for( i = 0; i < item.shapes.length; i++) {
					renderStore.run("add", item.shapes[i]);
					this.unsavedRuns.push(renderStore.unsavedRuns[i]);
				}
				renderStore.discard();
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
			"removeARenderableComponentAt" : function() {
				var index, store, renderStore, i, item;
				if(arguments.length === 1 && ut.isObject(arguments[0])) {
					index = parseInt(arguments[0].index);
					store = arguments[0].store;
					renderStore = arguments[0].renderStore;
				} else if(arguments.length > 1) {
					index = parseInt(arguments[0]);
					store = arguments[1];
					renderStore = arguments[2];
				} else {
					return false;
				}
				if(isNaN(index)) {
					return false;
				}
				if(index == -1) {
					index = store.max;
				}
				item = store[index];

				if(ut.isDefined(item)) {
					for( i = 0; i < item.shapes.length; i++) {
						renderStore.run("remove", item.shapes[i].id);
					}
					this.unsavedRuns = this.unsavedRuns.concat(renderStore.unsavedRuns);
					renderStore.discard();
				}
				this.run("removeAComponentAt", index, store);
				return true;
			},
			"removeARenderableComponent" : function() {
				var id, store, renderStore;
				if(arguments.length === 1 && ut.isObject(arguments[0])) {
					id = parseInt(arguments[0].id);
					store = arguments[0].store;
					renderStore = arguments[0].renderStore;

				} else if(arguments.length > 1) {
					id = parseInt(arguments[0]);
					store = arguments[1];
					renderStore = arguments[2];

				} else {
					return false;
				}
				if(isNaN(id)) {
					return false;
				} else {
					if(id == -1) {
						return this.run("removeARenderableComponentAt", -1, store, renderStore);
					} else {
						return this.run("removeARenderableComponentAt", store.getIndexById(id), store, renderStore);
					}
				}
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
					to : element.to,
					renderer : this.renderer
				});

				this.run("set", element, "to", node);
				element.changed = true;
				//this.run("set",args.element,"changed",true);
				this.run("addARenderableComponent",ne,this.elements,this.renderer.theShapes);
				/*
				this.elements.run("add", ne);
				this.elements.exportUnsavedRuns(this.unsavedRuns)
				this.elements.discard();*/
				//batch = new ut.Batch();
				//batch.push(new ut.BasicMove(args.element, to, args.node));
				//args.element.createShape();
				//batch = batch.concat(this.elements.batchAdd(ne).batch);
				//batch.push(new ut.BasicMove(,));
				//batch.push();
				return true;

			},
			//add a line element to the system
			//args: {type:String, x1: number, y1: number, x2: number, y2: number,
			//       snapToNodeThreshold:number, snapToLineThreshold:number, gridDx:number, gridDy:number
			//      autoMergeThreshlod: number}
			//TODO: haven't tested yet
			"addALineElement" : function() {

				var x1, x2, y1, y2, type, nT, lT, aT, args = arguments[0];
				if(arguments.length === 1 && ut.isObject(arguments[0])) {
					x1 = arguments[0].x1;
					y1 = arguments[0].y1;
					x2 = arguments[0].x2;
					y2 = arguments[0].y2;
					type = arguments[0].type;
					nT = arguments[0].snapToNodeThreshold;
					lT = arguments[0].snapToLineThreshold;
					aT = arguments[0].autoMergeNodeOnLineThreshold;
				} else if(arguments.length > 1) {
					return false;
				} else {
					return false;
				}

				var Node, Element, n, l, nid, lid, i, temp, splitOperation = [];
				Node = this.options.Node;
				Element = ut.isDefined(type) ? this.options[type] : this.options[this.options.defaultLineElementType];
				//batch = new ut.Batch();
				//console.log("ele",Element)
				/*
				 console.log("new ele",new Element({
				 from:1,
				 to:2
				 }))*/

				n = [];
				n.push(new Node({
					X : x1,
					Y : y1,
					renderer : this.renderer
				}));
				n.push(new Node({
					X : x2,
					Y : y2,
					renderer : this.renderer
				}));
				console.log("n[0]:", n[0].X, n[0].Y)
				console.log("n[1]:", n[1].X, n[1].Y)

				//node snap check
				nid = [-1, -1];
				temp = [];
				if(ut.isDefined(nT)) {
					for( i = 0; i < 2; i++) {
						temp[i] = this.snapToNode(n[i], nT, this.nodes);
						if(temp[i].capture) {
							n[i] = temp[i].Node;
							nid[i] = n[i].id;
						}
					}
					if(ut.isDefined(temp[0].Node) && ut.isDefined(temp[1].Node) && nid[0] == nid[1]) {
						return false;
					}
				}
				console.log("n[0]:", n[0].X, n[0].Y)
				console.log("n[1]:", n[1].X, n[1].Y)

				//line snap check
				temp = [];
				lid = [-1, -1];
				if(ut.isDefined(lT)) {
					for( i = 0; i < 2; i++) {
						if(nid[i] == -1) {
							temp[i] = this.snapToLine(n[i], lT, this.elements);
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
						this.run("splitLineElement",splitOperation[i]);
					}
				}

				console.log("n[0]:", n[0].X, n[0].Y)
				console.log("n[1]:", n[1].X, n[1].Y)

				//grid snap check
				if(ut.isDefined(args.gridDx) || ut.isDefined(args.gridDy) || ut.isDefined(args.grid)) {
					var dx, dy;
					dx = args.gridDx || args.grid || args.gridDy;
					dy = args.gridDy || args.grid || args.gridDy;
					for( i = 0; i < 2; i++) {
						if(nid[i] == -1 && lid[i] == -1) {
							n[i] = this.snapToGrid(n[i],dx,dy).Node;
						}
					}
					//console.log("n ", n)
				}
				console.log("n[0]:", n[0].X, n[0].Y)
				console.log("n[1]:", n[1].X, n[1].Y)
				l = new Element({
					from : n[0],
					to : n[1],
					renderer:this.renderer
				});
				this.run("addARenderableComponent", l, this.elements, this.renderer.theShapes);

				for( i = 0; i < 2; i++) {
					if(nid[i] == -1) {
						this.run("addARenderableComponent", n[i], this.nodes, this.renderer.theShapes);
					}
				}
				//batch = batch.concat(this.elements.batchAdd(l).batch);
				

				//check the existing nodes, if any is on the new line elements, merge it to the line element
				console.log("at",aT)
				if(ut.isDefined(aT)) {
					for( i = 0; i < this.nodes.max + 1; i++) {
						if(ut.isDefined(this.nodes[i])) {
							if(this.nodes[i].id != l.from.id && this.nodes[i].id != l.to.id) {
								if(dotLineLength(this.nodes[i].X, this.nodes[i].Y, n[0].X, n[0].Y, n[1].X, n[1].Y, true) < aT) {
									//TODO:
									this.run("splitLineElement",{
										node : this.nodes[i],
										element : l
									});
								}
							}

						}

					}
				}
				return true;

				//console.log("l ",l)

				//console.log("batch ",batch);
				//return false;

				//console.log("argu ",arguments)
				//if(arguments.length === 1 && ut.isObject(arguments[0])) {
				//return this.batchAddALineElement.apply(this, arguments);
				//}
			},
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
						batch.push(this.data.nodes[args.index].batchEdit(prop, args.config[prop]));
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
			/*
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

			},*/
			//add a line element to the system
			//args: {x1: number, y1: number, x2: number, y2: number}}
			/*
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
			},*/
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

	});

	lib.Root = Root;

})();