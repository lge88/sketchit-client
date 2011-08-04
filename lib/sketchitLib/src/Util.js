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

	function inherit() {
		var i, len, overrides, superclass;
		len = arguments.length - 1;
		overrides = arguments[len];
		superclass = arguments[0];
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
			if(!this.model) {
				return true;
			}
			return ( item instanceof this.model)
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
	/*
	 BasicMove = ut.extend(Object, {
	 constructor : function(name, args) {
	 //validations

	 this.name = name;
	 this.args = args;
	 this.addr = args.addr;
	 this.key = args.key;
	 this.value=args.value;

	 if (ut.isDefined(args.addr[args.key])){
	 this.removeFlag=false;
	 } else {
	 this.removeFlag=true;
	 }
	 this.valueBackup = args.addr[args.key];
	 },
	 remove : function() {
	 var value = this.addr[this.key];
	 delete
	 this.addr[this.key];
	 return value;
	 },
	 set : function() {
	 var value = this.addr[this.key];
	 this.addr[this.key] = this.value;
	 return value;
	 },
	 execute : function() {

	 return this[this.name]();
	 },
	 revert : function() {

	 var r, value = this.valueBackup;
	 //console.log("this.name ",this.name)
	 if(this.name === "set") {
	 //console.log("this.removeflag ",this.removeFlag)
	 if(!this.removeFlag) {
	 r = new ut.BasicMove("set", {
	 addr : this.addr,
	 key : this.key,
	 value : value
	 });

	 } else {
	 r = new ut.BasicMove("remove", {
	 addr : this.addr,
	 key : this.key
	 });
	 }

	 } else if (this.name==="remove"){
	 r = new ut.BasicMove("set", {
	 addr : this.addr,
	 key : this.key,
	 value : value
	 });
	 r.removeFlag=true;

	 }
	 r.valueBackup=this.value;
	 return r;
	 }
	 });*/
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
		run : function() {
			var temp, inlineRun;
			inlineRun = function() {
				var command = arguments[0], args = Array.prototype.slice.call(arguments, 1), i;
				if(ut.isDefined(this.commands[command])) {
					this.commands[command].apply(this, args);
				} else if(ut.isDefined(this.batchCommands[command])) {
					var result;
					result = this.batchCommands[command].apply(this, args);
					if(result !== false) {
						if(result.batch instanceof Batch) {
							for( i = 0; i < result.batch.length; i++) {
								this.lastBatch.push(result.batch[i]);
							}

						} else if(result.batch instanceof BasicMove) {
							this.lastBatch.push(result.batch);
						}
						result.batch.execute();
					}
				}

			}
			if(arguments.length === 1 && ut.isObject(arguments[0])) {
				if(ut.isString(this, arguments[0].command) && ut.isArray(arguments[0].args)) {
					inlineRun.apply(this, arguments[0].command, arguments[0].args)
				}
			} else if(arguments.length === 1 && ut.isString(arguments[0])) {
				temp = arguments[0].trim().split("\n");
				if(temp.length === 1) {
					inlineRun.apply(this, temp[0].replace(/[^a-zA-Z0-9.-\s]/g,"").trim().split(/\s+/));
				} else {
					for( i = 0; i < temp.length; i++) {
						//this.run(temp[i]);
						inlineRun.apply(this, temp[i]);
					}

				}

			} else if(arguments.length > 1) {
				if(ut.isString(arguments[0])) {
					inlineRun.apply(this, arguments)
				}
			}

			return this;

		}
	});
	Undoable = ut.extend(BatchRunnable, {
		undoStack : [],
		redoStack : [],
		lastBatch : new Batch(),	
		runsave : function() {
			this.run.apply(this, arguments);
			this.save();
			return this;

		},
		save : function() {

			this.undoStack.push(this.lastBatch.revert());
			this.redoStack = [];
			this.lastBatch = new Batch();
			return this;

		},
		undo : function() {
			var batch = this.undoStack.pop();
			if(batch) {
				this.redoStack.push(batch.revert());
				batch.execute();
				this.lastBatch = batch;
			}
			return this;

		},
		redo : function() {
			var batch = this.redoStack.pop();
			if(batch) {
				this.undoStack.push(batch.revert());
				batch.execute();
				this.lastBatch = batch;
			}
			return this;

		},
		//TODO:implementation
		goBackTo : function(stepIndex) {
			return this;

		},
		commands : {
			"save":function(){
				this.save();
			},
			"undo":function(){
				this.undo();
			},
			"redo":function(){
				this.redo();
			},

		},
	});

	//MapOfObjectStore
	ObjectArrayStore = ut.inherit(ArrayWithStrongType, Undoable, {
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
			bm.push(new ut.BasicMove(this, "count", count + 1));
			return {
				batch : bm,
				id : item.id
			}
		},
		batchRemoveAt : function(index) {
			
			var value, bm,count,max = this.max;
			if(index == -1) {
				index = max;
			}
			if(index===false || !ut.isDefined(this[index])) {
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
			//console.log("batch ",bm);
			return {
				batch : bm,
				item : value
			}
		},
		batchRemoveById : function(id) {
			return this.batchRemoveAt(this.getIndexById(id));
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
		
		batchCommands : {
			
			"add" : function(item) {
				return this.batchAdd(item);
			},
			"remove" : function(id) {
				console.log(" parseInt(id)==-1 ",parseInt(id)==-1 )
				if (parseInt(id)==-1){
					return this.batchRemoveAt(-1);
				}
				return this.batchRemoveById(id);
			},
			"wipe" : function() {
				return this.batchWipe();
			},
			
			
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

	lib.ut = ut;
	
	 window.ut = ut;

	 window.xxx = new ObjectArrayStore();
	 //xxx.run({name:"add",args:{item:new Batch}}).run({name:"add",args:{item: new Batch}}).run({name:"add",args:{item:new Batch}}).run({name:"add",args:{item:new Batch}});
	 //xxx.run({name:"add",args:{item:new Runnable()}});
	 //xxx.run({name:"add",args:{item:new Runnable()}});
	 //xxx.run("ndoe ad 0 8 3435.453 345.4 -ndf -ndm 14;\n#[]aasdf 3ggf sd -asnf 099204.234 1234 \n asf asdf asdf\n   ");
	 //xxx.run("")
	 xxx.run("add",(new Batch()));
	 xxx.save();
	 xxx.run("add",(new Batch()));
	 xxx.save();
	 xxx.run("add",(new Batch()));
	 xxx.save();
	 xxx.run("add",(new Batch()));
	 xxx.save();

	 console.log("xxx ", xxx)
	 xxx.run("remove",2);
	 xxx.save();

	 xxx.run("remove",3);
	 xxx.save();
	 xxx.run("add",(new Batch()));
	 xxx.save();
	 

})();
