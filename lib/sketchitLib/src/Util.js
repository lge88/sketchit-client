(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Base, ObjectHasDefault, ArrayHasDefault,           //
	BasicMove, Batch,           //
	Runable, BatchRunable, Undoable,          //
	OPS_Component, Renderable, Shape, stroke, strokeGroup, filled, dashLine,          //
	ObjectArrayStore, RenderableObjectArrayStore;
	lib = window.sketchitLib;
	ut = {};

	function clone(obj) {
		if(null == obj || "object" != typeof obj) {
			return obj;
		}

		if( obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		if( obj instanceof Array) {
			var i, len, copy = [];
			for( i = 0, len = obj.length; i < len; ++i) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}
		if( obj instanceof Object) {
			var attr, copy = {};
			for(attr in obj) {
				if(obj.hasOwnProperty(attr)) {
					copy[attr] = clone(obj[attr]);
				}

			}
			copy.__proto__ = obj.__proto__;
			return copy;
		}
		throw new Error("Unable to copy obj! Its type isn't supported.");
	};

	//merge objects to the first one recursively. The letter one overrides first one's value.

	function merge(object, config) {
		if(object && config && typeof config === 'object') {
			for(var key in config) {
				if(ut.isObject(config[key]) || ut.isArray(config[key])) {

					if(object[key].constructor != config[key].constructor) {
						object[key] = config[key].constructor.call(window)
					}
					merge(object[key], config[key])
				} else {
					object[key] = config[key];
				}

			}
		}
		return object;
	};

	function inherit() {
		var i, len, overrides, superclass;
		len = arguments.length - 1;
		overrides = arguments[len];
		superclass = arguments[0];
		//console.log("inherit ", arguments)
		if(len === 0) {
			return ut.extend(superclass, {});
		}
		for( i = 0; i < len; i++) {
			superclass = ut.extend(superclass, (new arguments[i]()));
		}
		if(ut.isFunction(overrides)) {
			return ut.extend(superclass, (new overrides()));
		} else if(ut.isObject(overrides)) {
			return ut.extend(superclass, overrides);
		} else {
			return ut.extend(superclass, {});
		}
	};

	//a function imlement multiple inheritance. first merge all the parent classes, then extend it with last object
	//

	/*

	 function inherit() {
	 var len = arguments.length - 1, i, overrides = arguments[len],superclass=arguments[0];
	 if (len===0){
	 return ut.extend(superclass,{});
	 }
	 for( i = 1; i < len; i++) {
	 //superclass=merge(superclass,new arguments[i]());
	 superclass=ut.extend(superclass,new arguments[i]());
	 }
	 //superclass=ut.extend(superclass,superclass);
	 if (ut.isFunction(overrides)){
	 return ut.extend(superclass,new overrides());
	 } else if (ut.isObject(overrides)){
	 return ut.extend(superclass,overrides);
	 } else {
	 return ut.extend(superclass,{});
	 }
	 };*/

	ut.clone = clone;
	ut.merge = merge;
	ut.inherit = inherit;
	//TODO: standalone version
	if(window.Ext) {
		ut.apply = Ext.apply;
		ut.applyIf = Ext.applyIf;
		ut.each = Ext.each;
		ut.extend = Ext.extend;
		ut.isArray = Ext.isArray;
		ut.isBoolean = Ext.isBoolean;
		ut.isDate = Ext.isDate;
		ut.isDefined = Ext.isDefined;
		ut.isElement = Ext.isElement;
		ut.isEmpty = Ext.isEmpty;
		ut.isFunction = Ext.isFunction;
		ut.isNumber = Ext.isNumber;
		ut.isObject = Ext.isObject;
		ut.isString = Ext.isString;
		ut.iterate = Ext.iterate;
		ut.override = Ext.override;

	} else {
		alert("stand alone version have not develop yet. you have to include sencha-touch.js");
	}

	//abstract class for components that have defaut configuration

	ObjectHasDefault = ut.extend(Object, {
		constructor : function(config) {
			ut.apply(this, config, this.defaults);
		},
		configure : function(config) {
			ut.merge(this, config);
			return this
		}
	});
	ArrayHasDefault = ut.extend(Array, {
		constructor : function(config) {
			ut.apply(this, config, this.defaults);
		},
		configure : function(config) {
			ut.merge(this, config);
			return this
		}
	});
	ArrayWithStrongType = ut.extend(ArrayHasDefault, {
		checkItemType : function(item) {
			if(!this.model) {
				return true;
			}
			return ( item instanceof this.model)
		}
	});
	Selectable = ut.extend(ObjectHasDefault, {
		isSelected : false,
		select : function() {
			this.isSelected = true;
		},
		unselect : function() {
			this.isSelected = false;
		},
		toggle : function() {
			if(this.isSelected) {
				this.unselect();
			} else {
				this.select();
			}
		}
	});
	OPS_Component = ut.extend(Selectable, {
		id : -1,
		ComponetName : undefined,
		toTcl : function() {

		}
	});
	Renderable = ut.extend(ObjectHasDefault, {
		//renderIndice : undefined,
		shapeConstructor : undefined,
		shapes : undefined,
		changed : false,
		createShape : function() {
			this.shapes = [];

			this.shapes.push(new this.shapeConstructor({
				model : this
			}));
			/*
			 this.shape.runsave("add", (new this.shapeConstructor({
			 model : this
			 })))*/

		},
		/*
		 constructor : function() {
		 ObjectHasDefault.constructor.apply(this, arguments);
		 this.renderIndice = new ObjectArrayStore();
		 this.shapes = new ObjectArrayStore({
		 model : Shape
		 });

		 }*/
	});
	Shape = ut.extend(ObjectHasDefault, {
		ctx : undefined,
		transform : [1, 0, 0, 1, 0, 0],
		vertice : [],
		display : function() {

		}
	});
	stroke = ut.extend(Shape, {
		lineWidth : 1,
		strokeStyle : [0, 0, 255, 255],
		display : function() {
			this.ctx.save();
			this.ctx.transform.apply(this, this.transform);
			this.ctx.lineWidth = this.lineWidth;
			this.ctx.strokeStyle = "rgba(" + this.strokeStyle[0] + "," + this.strokeStyle[1] + "," + this.strokeStyle[2] + "," + this.strokeStyle[3] + ")";
			this.ctx.beginPath();
			this.ctx.moveTo(this.vertice[0], this.vertice[1]);
			this.ctx.lineTo(this.vertice[2], this.vertice[3]);
			this.ctx.stroke();
			this.ctx.restore();
		}
	});
	strokeGroup = ut.extend(Shape, {
		lineWidth : 1,
		strokeStyle : [0, 0, 255, 255],
		display : function() {
			var i, len = this.vertice.length / 4;
			this.ctx.save();
			this.ctx.transform.apply(this, this.transform);
			this.ctx.lineWidth = this.lineWidth;
			this.ctx.strokeStyle = "rgba(" + this.strokeStyle[0] + "," + this.strokeStyle[1] + "," + this.strokeStyle[2] + "," + this.strokeStyle[3] + ")";
			this.ctx.beginPath();
			for( i = 0; i < len; i++) {
				this.ctx.moveTo(this.vertice[4 * i], this.vertice[4 * i + 1]);
				this.ctx.lineTo(this.vertice[4 * i + 2], this.vertice[4 * i + 3]);
			}
			this.ctx.stroke();
			this.ctx.restore();
		}
	});
	dashLine = ut.extend(strokeGroup, {
		numberOfSegments : 10,
		solidRatio : 0.5,
		constructor : function() {
			dashLine.superclass.constructor.apply(this, arguments);
			//TODO:

		},
	});
	filled = ut.extend(Shape, {

		fillStyle : [255, 0, 0, 255],
		showEdge : false,
		edgeLineWidth : 1,
		edgeStrokeStyle : [0, 0, 255, 255],
		display : function() {
			var i, len = this.vertice.length / 2;
			this.ctx.save();
			this.ctx.transform.apply(this, this.transform);
			this.ctx.lineWidth = this.edgeLineWidth;
			this.ctx.strokeStyle = "rgba(" + this.edgeStrokeStyle[0] + "," + this.edgeStrokeStyle[1] + "," + this.edgeStrokeStyle[2] + "," + this.edgeStrokeStyle[3] + ")";
			this.ctx.fillStyle = "rgba(" + this.fillStyle[0] + "," + this.fillStyle[1] + "," + this.fillStyle[2] + "," + this.fillStyle[3] + ")";

			this.ctx.beginPath();
			for( i = 0; i < len - 1; i++) {
				this.ctx.moveTo(this.vertice[2 * i], this.vertice[2 * i + 1]);
				this.ctx.lineTo(this.vertice[2 * i + 2], this.vertice[2 * i + 3]);
			}
			this.ctx.closePath();
			if(this.showEdge) {
				this.ctx.stroke();
			}
			this.fill();
			this.ctx.restore(); s
		}
	});
	BasicMove = ut.extend(Object, {
		constructor : function(addr, key, value) {
			this.addr = addr;
			this.key = key;
			this.value = value;

			if(ut.isDefined(value)) {
				this.remove = false;
			} else {
				this.remove = true;
			}

			if(ut.isDefined(addr[key])) {
				this.add = false;
			} else {
				this.add = true;
			}
			this.valueBackup = addr[key];

		},
		execute : function() {
			if(this.remove) {
				if(!this.add) { delete (this.addr[this.key]);
				}
			} else {
				this.addr[this.key] = this.value;
			}
			return this;
		},
		revert : function() {
			var r;
			r = new BasicMove(this.addr, this.key, this.valueBackup);
			r.valueBackup = this.value;
			if(this.remove) {
				r.add = true;
			} else {
				r.add = false;
			}

			if(this.add) {
				r.remove = true;
			} else {
				r.remove = false;
			}

			return r;

		}
	});
	Batch = ut.extend(ArrayWithStrongType, {
		defaults : {
			model : BasicMove
		},
		execute : function() {
			var i = 0, len = this.length;
			while(i < len && this.checkItemType(this[i])) {
				this[i].execute();
				i++;
			}
		},
		revert : function() {
			var len = this.length, i, r = new ut.Batch();
			i = len - 1;
			while(i > -1 && this.checkItemType(this[i])) {
				r.push(this[i].revert());
				i--;
			}
			return r;
		}
	});
	Runnable = ut.extend(ObjectHasDefault, {
		run : function(command) {
			if(ut.isDefined(this.commands[command.name])) {
				return this.commands[command.name].call(this, command.args);
			} else {
				return false;
			}
		}
	});
	BatchRunnable = ut.extend(Runnable, {
		run : function() {
			console.log("runs args ", arguments)
			var temp, inlineRun;
			inlineRun = function() {
				var command = arguments[0], args = Array.prototype.slice.call(arguments, 1), i;
				if(ut.isDefined(this.commands[command])) {
					this.commands[command].apply(this, args);
				} else if(ut.isDefined(this.batchCommands[command])) {
					var result;
					result = this.batchCommands[command].apply(this, args);
					if(result !== false) {
						this.unsavedRuns.push(result);
						result.batch.execute();
					}
				}

			}
			if(arguments.length === 1 && ut.isObject(arguments[0])) {
				if(ut.isString(this, arguments[0].command) && ut.isArray(arguments[0].args)) {
					inlineRun.apply(this, arguments[0].command, arguments[0].args)
				}
			} else if(arguments.length === 1 && ut.isString(arguments[0])) {
				temp = arguments[0].trim().split(";*\n");
				if(temp.length === 1) {
					inlineRun.apply(this, temp[0].replace(/[^a-zA-Z0-9.-\s]/g,"").trim().split(/\s+/));
				} else {
					for( i = 0; i < temp.length; i++) {
						this.run(temp[i]);
					}

				}

			} else if(arguments.length > 1) {
				if(ut.isString(arguments[0])) {
					inlineRun.apply(this, arguments)
				}
			}

			return this;

		},
		batchSet : function(addr, key, value) {
			var b = new Batch();
			b.push(new BasicMove(addr, key, value));
			return {
				id : addr[key].id,
				batch : b
			}
		},
		batchCommands : {
			"set" : function() {
				return this.batchSet.apply(this, arguments);

			}
		}
	});
	Undoable = ut.extend(BatchRunnable, {
		undoStack : [],
		redoStack : [],
		unsavedRuns : new Batch(),
		runsave : function() {
			//alert("hehre")
			console.log("runsave args ", arguments)
			this.run.apply(this, arguments);
			this.save();
			return this;

		},
		runnotsave : function() {
			this.run.apply(this, arguments);
			this.discard();
			return this;
		},
		save : function() {
			var i, j, len1, len2, temp = new Batch();

			for( i = 0, len1 = this.unsavedRuns.length; i < len1; i++) {
				for( j = 0, len2 = this.unsavedRuns[i].batch.length; j < len2; j++) {
					temp.push(this.unsavedRuns[i].batch[j]);
				}
				//temp=temp.concat(this.unsavedRuns[i].batch);
			}

			if(temp.length > 0) {
				this.undoStack.push(temp.revert());
				this.redoStack = [];
				this.unsavedRuns = [];

			}

			return this;
		},
		discard : function() {
			this.unsavedRuns = [];
		},
		exportUnsavedRuns : function(target) {
			target=target.concat(this.unsavedRuns);
			/*
			for( i = 0, len1 = this.unsavedRuns.length; i < len1; i++) {
				target.push()
			}*/

		},
		undo : function() {
			var batch = this.undoStack.pop();
			if(batch) {
				this.redoStack.push(batch.revert());
				batch.execute();
				//this.unsavedRuns = batch;
			}
			return this;

		},
		redo : function() {
			var batch = this.redoStack.pop();
			if(batch) {
				this.undoStack.push(batch.revert());
				batch.execute();
				//this.unsavedRuns = batch;
			}
			return this;

		},
		//TODO:implementation
		goBackTo : function(stepIndex) {
			return this;

		},
		commands : {
			"save" : function() {
				this.save();
			},
			"undo" : function() {
				this.undo();
			},
			"redo" : function() {
				this.redo();
			},
		},
	});
	ObjectArrayStore = ut.inherit(ArrayWithStrongType, Undoable, {

		constructor : function() {
			BatchRunnable.superclass.constructor.apply(this, arguments);
			ut.apply(this.batchCommands, {
				"add" : function(item) {
					return this.batchAdd.apply(this, arguments);
					//return this.batchAdd(item);
				},
				"remove" : function(id) {
					return this.batchRemoveById.apply(this, arguments);
					//console.log(" parseInt(id)==-1 ", parseInt(id) == -1)
					/*
					 if(parseInt(id) == -1) {
					 return this.batchRemoveAt(-1);
					 }
					 return this.batchRemoveById(id);*/
				},
				"removeAt" : function(index) {
					return this.batchRemoveAt.apply(this, arguments);
					//console.log(" parseInt(id)==-1 ", parseInt(id) == -1)
					/*
					 if(parseInt(index) == -1) {
					 return this.batchRemoveAt(-1);
					 }
					 return this.batchRemoveAt(index);*/
				},
				"wipe" : function() {
					return this.batchWipe.apply(this, arguments);
				},
			})
		},
		count : 0,
		max : -1,
		lastModifiedIndex : 0,
		startId : 0,

		pickIndex : function() {
			var i = 0;
			for(; i < this.max + 1; i++) {
				if(!ut.isDefined(this[i])) {
					return i;
				}
			}
			return i;
		},
		getObject : function(index) {
			return this[index];
		},
		getObjectById : function(id) {
			return this[this.getIndexById(id)];
		},
		getIndexById : function(id) {

			var id = parseInt(id), index = id - 1 - this.startId;

			if(ut.isDefined(this[index])) {
				if(this[index].id == id) {
					return index;
				}
			}
			for( index = 0; index < this.length; index++) {
				if(ut.isDefined(this[index])) {
					if(this[index].id == id) {
						return index;
					}
				}
			}
			return false;
		},
		getIndexByProp : function(prop, value) {
			var index;
			if(prop === "id") {
				return this.getIndexById(value)
			}
			for( index = 0; index < this.length; index++) {
				if(ut.isDefined(this[index])) {
					if(this[index][prop] == value) {
						return index;
					}
				}
			}
			return -1;
		},
		batchAdd : function(item) {

			if(!this.checkItemType(item)) {
				console.log("model class not match");
				return false;
			}
			var bm = new Batch(), key, max = this.max, count = this.count, startId = this.startId;
			key = this.pickIndex();
			if(key > max) {
				bm.push(new ut.BasicMove(this, "max", key));
			}
			bm.push(new ut.BasicMove(item, "id", startId + key + 1));
			bm.push(new ut.BasicMove(this, key, item));
			bm.push(new ut.BasicMove(this, "lastModifiedIndex", key));
			bm.push(new ut.BasicMove(this, "count", count + 1));
			return {
				batch : bm,
				id : item.id
			}
		},
		batchRemoveAt : function(index) {

			var value, bm, count, max = this.max;
			if(index == -1) {
				index = max;
			}
			if(index === false || !ut.isDefined(this[index])) {
				return false;
			}
			bm = new Batch();
			count = this.count;
			value = this[index];
			if(index === max) {
				max--;
				while(!ut.isDefined(this[max]) && max > -1) {
					max--;
				}

				bm.push(new ut.BasicMove(this, "max", max));
			}

			bm.push(new ut.BasicMove(this, index));
			bm.push(new ut.BasicMove(this, "lastModifiedIndex", index));
			bm.push(new ut.BasicMove(this, "count", count - 1));
			//console.log("batch ",bm);
			return {
				batch : bm,
				item : value
			}
		},
		batchRemoveById : function(id) {
			var id = parseInt(id), index;
			if(id == -1) {
				return this.batchRemoveAt(-1);
			} else {
				index = this.getIndexById(id)
				if(index != -1) {
					return this.batchRemoveAt(index);
				} else {
					return false;
				}
			}
		},
		batchWipe : function() {
			var count = this.count;
			while(count > 0) {
				this.run("remove", -1);
				count--;
			}
			//this.save();
			return false;
		},
		/*
		 batchCommands : {
		 "set" : function() {
		 return Ba

		 },
		 "add" : function(item) {
		 return this.batchAdd.apply(this, arguments);
		 //return this.batchAdd(item);
		 },ß
		 "remove" : function(id) {
		 return this.batchRemoveById.apply(this, arguments);
		 //console.log(" parseInt(id)==-1 ", parseInt(id) == -1)

		 },
		 "removeAt" : function(index) {
		 return this.batchRemoveAt.apply(this, arguments);
		 //console.log(" parseInt(id)==-1 ", parseInt(id) == -1)

		 },
		 "wipe" : function() {
		 return this.batchWipe.apply(this, arguments);
		 },
		 },*/

	})
	RenderableObjectArrayStore = ut.extend(ObjectArrayStore, {
		renderer : undefined,
		constructor : function() {
			RenderableObjectArrayStore.superclass.constructor.apply(this, arguments);
			var _batchAdd, _batchRemoveAt;
			_batchAdd = this.batchAdd;
			_batchRemoveAt = this.batchRemoveAt;
			//_batchSet=this.batch
			ut.apply(this, {
				batchAdd : function(item) {
					var result, i,len1,j,len2,temp;
					result = _batchAdd.call(this, item);
					if(result) {
						//console.log("itemshapes",item.shapes)
						for(i=0,len1=item.shapes.length;i<len1;i++) {
							
							
							temp = this.renderer.batchAdd(item.shapes[i]).batch;
							console.log("temp ",temp)
							for (j=0,len2=temp.length;j<len2;j++){
								result.batch.push(temp[i]);
							}
						}
					}
					console.log("result ",result);
					return result;
				},
				batchRemoveAt : function(index) {
					var result, i,j,len1,len2;
					result = _batchRemoveAt.call(this, index);
					if(result) {
						for(i=0,len1=result.item.shapes.length;i<len1;i++) {							
							
							temp = this.renderer.batchRemoveById(result.item.shapes[i].id).batch;
							for (j=0,len2=temp.length;j<len2;j++){
								result.batch.push(temp[i]);
							}
						}
						
						
						//for(i in result.item.shapes) {
							//result.batch = result.batch.concat(this.renderer.batchRemoveById(item.shapes[i].id));
						//}
					}
					console.log("result ",result);
					return result;
				}
			})

		},
	})

	ut.ObjectHasDefault = ObjectHasDefault;
	ut.ArrayHasDefault = ArrayHasDefault;
	ut.BasicMove = BasicMove;
	ut.Batch = Batch;
	ut.Runnable = Runnable;
	ut.BatchRunnable = BatchRunnable;
	ut.Undoable = Undoable;
	ut.ObjectArrayStore = ObjectArrayStore;
	ut.OPS_Component = OPS_Component;
	ut.Renderable = Renderable;
	ut.Shape = Shape;
	ut.stroke = stroke;
	ut.strokeGroup = strokeGroup;
	ut.filled = filled;
	ut.dashLine = dashLine;
	ut.RenderableObjectArrayStore = RenderableObjectArrayStore;

	lib.ut = ut;

	window.ut = ut;

	window.xxx = new ObjectArrayStore();

	xxx.run("add", (new Batch()));
	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();

	console.log("xxx ", xxx)
	xxx.run("remove", 2);
	xxx.save();

	xxx.run("remove", 3);
	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();

})();
