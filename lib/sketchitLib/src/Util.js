(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, ut;
	lib = window.sketchitLib;
	ut = {};
	if(window.Ext) {
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

	//name: string: "set" or "remove" ; args:{addr:object, key: string, value: Mixed};
	ut.BasicMove = function(name, args) {
		//validations
		if(name !== "set" && name !== "remove") {
			console.log("invalid name!!");
			return false;
		}
		if(!ut.isDefined(args) || (!ut.isObject(args.addr) && !ut.isArray(args.addr)) || (!ut.isString(args.key) && !ut.isNumber(args.key))) {
			console.log("invalid arguments!!");
			return false;
		}
		if(ut.isObject(args.addr[args.key]) || ut.isObject(args.value)) {
			console.log("warning, set object value may lead to bugs!!");
		}
		this.name = name;
		this.args = args;
	}
	ut.BasicMove.prototype.remove = function() {
		var value = this.args.addr[this.args.key];
		delete
		this.args.addr[this.args.key];
		return value;
	};
	ut.BasicMove.prototype.set = function() {
		var value = this.args.addr[this.args.key];
		this.args.addr[this.args.key] = this.args.value;
		return value;
	};
	ut.BasicMove.prototype.execute = function() {
		return this[this.name]();
	};
	ut.BasicMove.prototype.revert = function() {
		var r;
		if(this.args.name === "set") {
			if(ut.isDefined(this.args.addr[this.args.key])) {
				r = new ut.BasicMove("set", {
					addr : this.args.addr,
					key : this.args.key,
					value : this.args.addr[this.args.key]
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
				value : this.args.addr[this.args.key]
			});

		}
		return r;
	};
	ut.Batch = ut.extend(Object, {
		constructor : function(mvs) {
			this.moves = [];
			if(ut.isDefined(mvs)) {
				if(ut.isArray(mvs)) {
					this.moves = mvs;
				} else if( mvs instanceof ut.BasicMove) {
					this.moves.push(mvs)
				}
			}
		},
		execute : function() {
			var i = 0, len = this.moves.length;
			while(i < len) {
				this.moves[i].execute();
				i++;
			}
		},
		revert : function() {
			var len = this.moves.length, i, r = [];
			i = len - 1;
			while(i > -1) {
				r.push(this.moves[i].revert());
				i--;
			}
			return new ut.Batch(r);
		}
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
		//TODO:implementation
		goBackTo : function(stepIndex) {

		},
	};

	ut.Cmpnt = ut.extend(Object, {
		constructor : function(data) {
			if(ut.isDefined(data)) {
				this.data = data;
			}
			this.loadDefault();

		},
		data : {},
		systemDefault : function() {
			console.log("no implementation for method:defaults");
		},
		defaults : function() {
			console.log("no implementation for method:defaults");
		},
		loadDefault : function() {
			ut.applyIf(this.data, this.defaults);
		}
	})

	ut.Collection = ut.extend(Array, {
		setModel : function(m) {
			this.model = m;
		},
		checkModel : function(obj) {
			if(ut.isDefined(this.model)) {
				return ( obj instanceof this.model);
			} else {
				return ( obj instanceof ut.Cmpnt);
			}
		},
		indexHoles : [],
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
			var bm,key;
			key = this.pickIndex();
			if (key===this.length){
				this.length++;
			}
			item.data.id = key+1;
			bm=new ut.BasicMove("set", {
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
					this.redoStack=[];
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

	window.xx = new ut.Collection();
	window.yy1 = new ut.Cmpnt({
		x : 1,
		y : 2,
		z : 3
	});
	window.yy2 = new ut.Cmpnt({
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
	console.log("xx ", xx);

	lib.ut = ut;
})();
