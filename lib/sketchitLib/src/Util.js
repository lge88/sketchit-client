(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut, Base, ObjectHasDefault, ArrayHasDefault, BasicMove, Batch, Runable, BatchRunable, Undoable;
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

	//a function imlement multiple inheritance. first merge all the parent classes, then extend it with last object
	//

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
	};

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

	ObjetcHasDefault = ut.extend(Object, {
		constructor : function(config) {
			ut.apply(this, config, this.defaults);
			//ObjetcHasDefault.super
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
				this.valid = false;
			}
			if(!ut.isDefined(args) || (!ut.isObject(args.addr) && !ut.isArray(args.addr)) || (!ut.isString(args.key) && !ut.isNumber(args.key))) {
				console.log("invalid arguments!!");
				this.valid = false;
			}
			this.name = name;
			this.args = args;

		},
		remove : function() {
			var value = this.args.addr[this.args.key]; delete
			this.args.addr[this.args.key];
			return value;
		},
		set : function() {
			var value = this.args.addr[this.args.key];
			this.args.addr[this.args.key] = this.args.value;
			return value;
		},
		execute : function() {
			if(!this.valid) {
				return;
			}
			return this[this.name]();
		},
		revert : function() {
			if(!this.valid) {
				return;
			}
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
	Runnable = ut.extend(ObjetcHasDefault, {
		run : function(command) {
			if(ut.isDefined(this.commands[command.name])) {
				return this.commands[command.name].call(this, command.args);
			} else {
				return false;
			}
		}
	});
	BatchRunnable = ut.extend(Runnable, {
		run : function(command) {
			if(!UndoableObject.superclass.constructor.call(this, command)) {
				if(ut.isDefined(this.batchCommands[command.name])) {
					var result;
					result = this.commands.batchCommands[command.name].call(this, command.args);
					if(result != false) {
						result.batch.execute();
					}
					return result;
				}
			}
		}
	});
	Undoable = ut.extend(BatchRunnable, {
		undoStack : [],
		redoStack : [],
		run : function(command) {
			var result = UndoableObject.superclass.constructor.call(this, command);
			if(result != false) {
				if(!ut.isDefined(command.undo) || command.undo === true) {
					this.undoStack.push(result.batch.revert());
					this.redoStack = [];
				}
			}
			return result;
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

		}
	});

	//MapOfObjectStore

	ObjectArrayStore = ut.extend(Array, {
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
		commands:{
			
			
			
		},
		batchCommands:{
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
			
			
			
		},
		
	})
	
	
	

	ut.ObjectHasDefault = ObjectHasDefault;
	ut.ArrayHasDefault = ArrayHasDefault;
	ut.BasicMove = BasicMove;
	ut.Batch = Batch;
	ut.Runnable = Runnable;
	ut.BatchRunnable = BatchRunnable;
	ut.Undoable = Undoable;
	ut.ObjectArrayStore=ObjectArrayStore;
	
	
	

	lib.ut = ut;
	window.ut = ut;
	
	window.xxx=ut.inherit(ObjectArrayStore,BatchRunnable);
	
	
})();
