(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, ObjectHasDefault, ArrayHasDefault, BasicMove, Batch, RunableObject, UndoableObject;
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

	ut.clone = clone;
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

	ObjetcHasDefault = ut.extend(Object, {
		constructor : function(config) {
			ut.apply(this, config, this.defaults);
		},
	});
	ArrayHasDefault = ut.extend(Array, {
		constructor : function(config) {
			ut.apply(this, config, this.defaults);
		}
	});
	ArrayWithStrongType = ut.extend(ArrayHasDefault, {
		checkItemType : function(item) {
			return ( item instanceof this.model)
		}
	});
	BasicMove = ut.extend(Object, {
		constructor : function(name, args) {
			//validations
			if(name !== "set" && name !== "remove") {
				console.log("invalid name!!");
				return false;
			}
			if(!ut.isDefined(args) || (!ut.isObject(args.addr) && !ut.isArray(args.addr)) || (!ut.isString(args.key) && !ut.isNumber(args.key))) {
				console.log("invalid arguments!!");
				return false;
			}
			this.name = name;
			this.args = args;

		},
		remove : function() {
			var value = this.args.addr[this.args.key];
			delete
			this.args.addr[this.args.key];
			return value;
		},
		set : function() {
			var value = this.args.addr[this.args.key];
			this.args.addr[this.args.key] = this.args.value;
			return value;
		},
		execute : function() {
			return this[this.name]();
		},
		revert : function() {
			var r, value = ut.clone(this.args.addr[this.args.key]);
			if(this.args.name === "set") {
				if(ut.isDefined(this.args.addr[this.args.key])) {
					r = new ut.BasicMove("set", {
						addr : this.args.addr,
						key : this.args.key,
						value : value
					});
				} else {
					r = new ut.BasicMove("remove", {
						addr : this.args.addr,
						key : this.args.key
					});
				}

			} else {
				r = new ut.BasicMove("set", {
					addr : this.args.addr,
					key : this.args.key,
					value : value
				});

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
			var len = this.length, i, r = ut.Batch();
			i = len - 1;
			while(i > -1 && this.checkItemType(this[i])) {
				r.push(this[i].revert());
				i--;
			}
			return r;
		}
	});
	RunableObject = ut.extend(ObjetcHasDefault, {
		run : function(command) {
			if(ut.isDefined(this.commands[command.name])) {
				return this.commands[command.name].call(this, command.args);
			} else {
				//console.log("command not found!");
				return false;
			}
		}
	});
	UndoableObject = ut.extend(RunableObject, {
		undoStack : [],
		redoStack : [],
		run : function(command) {
			if(!UndoableObject.superclass.constructor.call(this, command)) {
				if(ut.isDefined(this.batchCommands[command.name])) {
					var result;
					result = this.commands.batchCommands[command.name].call(this, command.args);
					if(result != false) {
						if(!ut.isDefined(command.undo) || command.undo === true) {
							this.undoStack.push(result.batch.revert());
							this.redoStack = [];
						}
						result.batch.execute();
					}
					return result;
				}
			}
		},
		undo : function() {
			var batch;
			batch = this.undoStack.pop()
			this.redoStack.push(batch.revert());
			batch.execute();
		},
		redo : function() {
			var batch;
			batch = this.redoStack.pop()
			this.undoStack.push(batch.revert());
			batch.execute();
		},
		//TODO:implementation
		goBackTo : function(stepIndex) {

		},
	})

	ut.Undoable = {
		undoStack : [],
		redoStack : [],
		undo : function() {
			var batch;
			batch = this.undoStack.pop()
			this.redoStack.push(batch.revert());
			batch.execute();
		},
		redo : function() {
			var batch;
			batch = this.redoStack.pop()
			this.undoStack.push(batch.revert());
			batch.execute();
		},
	};

	ut.StrongTypeCollection = ut.extend(Array, {
		checkModel : function(obj) {

			return ( obj instanceof this.model)// && ( obj instanceof ut.Cmpnt);

		},
		pickIndex : function() {
			var i;
			for( i = 0; i < this.length; i++) {
				if(!ut.isDefined(this[i])) {
					return i;
				}
			}
			return i;

		},
		batchAdd : function(item) {

			if(!this.checkModel(item)) {
				console.log("model class not match");
				return false;
			}
			var bm, key;
			key = this.pickIndex();
			if(key === this.length) {
				this.length++;
			}
			item.data.id = key + 1;
			bm = new ut.BasicMove("set", {
				addr : this,
				key : key,
				value : item
			});
			console.log("key ", key)

			return {
				batch : bm,
				id : item.data.id
			}
		},
		batchRemoveAt : function(index) {
			if(!ut.isDefined(this[index])) {
				return false;
			}
			var value, bm;
			value = this[index];
			bm = new ut.BasicMove("remove", {
				addr : this,
				key : index
			});
			return {
				batch : bm,
				item : value
			}
		},
		batchRemoveById : function(id) {
			return this.batchRemoveAt(this.getIndexById(id));
		},
		batchEmpty : function() {
			var i = 0, len = this.length, batch = [];
			while(i < len) {
				if(ut.isDefined(this[i])) {
					batch.push(this.batchRemoveAt(i).batch);
				}
				i++;
			}
			if(!ut.isEmpty(batch)) {
				return {
					batch : batch
				}
			} else {
				return false;
			}

		},
		getIndexById : function(id) {
			var index;
			for( index = 0; index < this.length; index++) {
				if(ut.isDefined(this[index])) {
					if(this[index].data.id == id) {
						return index;
					}
				}
			}
			return -1;
		},
		getIndexByProp : function(prop, value) {
			var index;
			for( index = 0; index < this.length; index++) {
				if(ut.isDefined(this[index])) {
					if(this[index].data[prop] == value) {
						return index;
					}
				}
			}
			return -1;
		}
	})
	ut.override(ut.Collection, ut.Undoable);
	ut.override(ut.Collection, {
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
			batchGenerator : {
				"add" : function(args) {

					if(ut.isDefined(args)) {

						//console.log("batch ",this.batchAdd(args.item));
						return this.batchAdd(args.item);
					}
					return false;

				},
				"delete" : function(args) {
					if(ut.isDefined(args)) {
						if(ut.isDefined(args.index)) {
							return this.batchRemoveAt(args.index);
						} else if(ut.isDefined(args.id)) {
							return this.batchRemoveById(args.id);
						}
					}
					return false;
				}
			}

		}

	});

	/*

	 window.xx = new ut.Collection(ut.hasDefault);
	 window.yy1 = new ut.hasDefault({
	 x : 1,
	 y : 2,
	 z : 3
	 });
	 window.yy2 = new ut.hasDefault({
	 x : 2,
	 y : 5,
	 z : 23
	 });
	 window.yy3 = {
	 x : 4,
	 y : 7,
	 z : 38
	 };

	 xx.doHandler({
	 name : "add",
	 args : {
	 item : yy1
	 }
	 })
	 xx.doHandler({
	 name : "add",
	 args : {
	 item : yy2
	 }
	 })
	 xx.doHandler({
	 name : "add",
	 args : {
	 item : yy3
	 }
	 })
	 console.log("xx ", xx);*/

	ut.ObjectHasDefault = ObjectHasDefault;
	ut.ArrayHasDefault = ArrayHasDefault;
	ut.BasicMove = BasicMove;
	ut.Batch = Batch;
	ut.BatchRunnable = BatchRunnable;
	ut.Undoable = Undoable;
	lib.ut = ut;
})();
