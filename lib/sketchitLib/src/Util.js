(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Base, ObjectHasDefault, ArrayHasDefault,                     //
	BasicMove, Batch,                     //
	Runable, BatchRunable, Undoable,                    //
	ObjectArrayStore;
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

	function array2rgba(arr) {
		return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + arr[3] / 255 + ")";
	}

	ut.clone = clone;
	ut.merge = merge;
	ut.inherit = inherit;
	ut.array2rgba = array2rgba;
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
		defaults : {
			isSelected : false
		},
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
	BasicMove = ut.extend(Object, {
		constructor : function(addr, key, value, oldValue) {
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
			if(ut.isDefined(oldValue)) {
				this.valueBackup = oldValue;
			} else {
				this.valueBackup = addr[key];
			}
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
		run : function() {
			if(arguments.length === 1) {
				var command = arguments[0];
				if(ut.isString(command)) {
					if(ut.isDefined(this.commands[command])) {
						return this.commands[command].call(this);
					} else if(ut.isDefined(this.batchCommands[command])) {
						return this.batchCommands[command].apply(this);
					}
				}
				if(ut.isDefined(this.commands[command.name])) {
					return this.commands[command.name].call(this, command.args);
				} else if(ut.isDefined(this.batchCommands[command.name])) {
					return this.batchCommands[command].apply(this, command.args);
				}
			} else if(arguments.length > 1) {
				var command = arguments[0], args = Array.prototype.slice.call(arguments, 1), i;
				if(ut.isDefined(this.commands[command])) {
					return this.commands[command].apply(this, args);
				} else if(ut.isDefined(this.batchCommands[command])) {
					return this.batchCommands[command].apply(this, args);
				}
			}
			return false;

		}
	});
	scriptRunnable = ut.extend(Runnable, {
		//TODO
		run : function() {

		}
	});
	Undoable = ut.extend(Runnable, {
		constructor : function() {
			Undoable.superclass.constructor.apply(this, arguments);
			this.undoStack = [];
			this.redoStack = [];
			this.unsavedRuns = [];
		},
		runsave : function() {
			//console.log("runsave args ", arguments)
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
			return this;
		},
		undo : function() {
			var batch = this.undoStack.pop();
			if(batch) {
				this.redoStack.push(batch.revert());
				batch.execute();
			}
			return this;

		},
		redo : function() {
			var batch = this.redoStack.pop();
			if(batch) {
				this.undoStack.push(batch.revert());
				batch.execute();
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
		batchCommands : {
			"set" : function() {
				var addr, key, value, oldValue;
				if(arguments.length === 1 && ut.isObject(arguments[0])) {
					addr = arguments[0].addr;
					key = arguments[0].key;
					value = arguments[0].value;
					oldValue = arguments[0].oldValue;
				} else if(arguments.length > 1) {
					addr = arguments[0];
					key = arguments[1];
					value = arguments[2];
					oldValue = arguments[3];
				} else {
					return false;
				}

				var b = new Batch();
				b.push(new BasicMove(addr, key, value, oldValue));
				b.execute();
				this.unsavedRuns.push({
					id : addr[key].id,
					batch : b
				});
				return true;
			}
		}
	});
	ObjectArrayStore = ut.inherit(ArrayWithStrongType, Undoable, {

		constructor : function() {
			Undoable.apply(this, arguments);
			ut.apply(this.batchCommands, {
				"add" : function() {
					var item;
					if(arguments.length === 1 && ut.isObject(arguments[0])) {
						item = arguments[0];
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

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
					bm.push(new ut.BasicMove(this, "count", count + 1));
					bm.execute();
					this.unsavedRuns.push({
						batch : bm,
						item : item
					})
					return true;
				},
				"remove" : function(id) {
					var id;
					if(arguments.length === 1) {
						id = parseInt(arguments[0]);
						if(isNaN(id)) {
							return false;
						}
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

					if(id == -1) {
						return this.run("removeAt", -1);
					} else {
						return this.run("removeAt", this.getIndexById(id));
					}
				},
				"removeAt" : function() {
					var index;
					if(arguments.length === 1) {
						index = parseInt(arguments[0]);
						if(isNaN(index)) {
							return false;
						}
					} else if(arguments.length > 1) {
						return false;
					} else {
						return false;
					}

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
					bm.push(new ut.BasicMove(this, "count", count - 1));
					bm.execute();
					this.unsavedRuns.push({
						batch : bm,
						item : value
					})
					return true;
				},
				"wipe" : function() {
					var count = this.count;
					while(count > 0) {
						this.run("remove", -1);
						count--;
					}
					return true;
				},
			})
		},
		count : 0,
		max : -1,
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
			for( index = 0; index < this.max + 1; index++) {
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
	});

	ut.ObjectHasDefault = ObjectHasDefault;
	ut.ArrayHasDefault = ArrayHasDefault;
	ut.BasicMove = BasicMove;
	ut.Batch = Batch;
	ut.Runnable = Runnable;
	//ut.BatchRunnable = BatchRunnable;
	ut.Undoable = Undoable;
	ut.ObjectArrayStore = ObjectArrayStore;
	//ut.OPS_Component = OPS_Component;
	//ut.Renderable = Renderable;
	//ut.Shape = Shape;
	//ut.stroke = stroke;
	//ut.strokeGroup = strokeGroup;
	//ut.filled = filled;
	//ut.dashLine = dashLine;
	//ut.RenderableObjectArrayStore = RenderableObjectArrayStore;
	ut.Selectable = Selectable

	lib.ut = ut;

	window.ut = ut;
	/*
	window.xxx = new ObjectArrayStore();

	xxx.run("add", (new Batch()));
	console.log("this unsavedRuns",xxx.unsavedRuns.length)
	console.log("this unsavedRuns",xxx.unsavedRuns)

	//xxx.save();
	xxx.run("add", (new Batch()));
	console.log("this unsavedRuns",xxx.unsavedRuns.length)
	console.log("this unsavedRuns",xxx.unsavedRuns)

	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();
	xxx.run("add", (new Batch()));
	xxx.save();

	console.log("xxx ", xxx)
	xxx.run("remove", 2);
	console.log("this unsavedRuns",xxx.unsavedRuns.length)
	console.log("this unsavedRuns",xxx.unsavedRuns)

	/*xxx.save();

	xxx.run("remove", 3);
	xxx.save();
	xxx.run("add", (new Batch()));*/
	//xxx.save();

})();
