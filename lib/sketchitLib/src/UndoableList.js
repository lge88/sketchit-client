(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	
	var lib,
	UndoableList;
	
	lib=window.sketchitLib;
	
	UndoableList = Ext.extend(lib.Undoable, {
		constructor: function(config) {
			if (Ext.isString(config.model) || Ext.isObject(config.model)) {
				this.model = config.model;
			}
			this.name=config.name;
			UndoableList.superclass.constructor.call(this, config)
		},
		checkModel: function(item) {
			if (Ext.isString(this.model)) {
				if (typeof item !== this.model && !(item instanceof lib[this.model]) ) {
					return false;
				}
			} else if (Ext.isObject(this.model)) {
				if (!(item instanceof this.model)) {
					return false
				}
			}
			return true;
		},
		getLength: function() {
			return this.data.length;
		},
		autoId: function(start,end) {
			if (arguments.length>2) {
				throw "autoId: invalid arguments"
				return false
			} else {
				var i;
				if (arguments.length===0) {
					var start=0,end=this.getLength()-1;
				} else if (arguments.length===1) {
					var end=this.getLength()-1;
				}
				for(i=start;i<=end;i++) {
					this.data[i].data.id=i+1;
				}
			}
		},
		//append to a collection, target should be a sketchitCollection
		//args: {value: mixed}
		append: function(args) {
			this.data.push(args.value);
			this.autoId(this.getLength()-1);
		},
		//insert into a collection, target should be a element in a sketchitCollection
		//args: {key: int   , value: obj/mixed  }
		insert: function(args) {
			this.data.splice(args.key,0,args.value);
			this.autoId(args.key);
		},
		//remove an element from the array
		//args: {key: int}
		remove: function(args) {
			this.data.splice(args.key,1);
			this.autoId(args.key);
		},
		//replcae an array element
		//args: {key: int, value: mixed}
		set: function(args) {
			this.data[args.key]=value;
		},
		validateOperation: function(operation) {
			//console.log("operation ",operation)
			if (!Ext.isDefined(operation)) {
				return false;
			}
			if (operation.action==="set") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				Ext.isObject(this.data[operation.args.key])||
				!Ext.isNumber(operation.args.key) ||
				!Ext.isDefined(operation.args.value) ||
				Ext.isObject(this.data[operation.args.value]) ||
				!this.checkModel(operation.args.value) ||
				operation.args.key<0 ||
				operation.args.key>=this.data.length) {
					return false
				} else {
					return true
				}

			} else if (operation.action==="remove") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!Ext.isNumber(operation.args.key) ||
				operation.args.key<0 ||
				operation.args.key>=this.data.length) {
					return false
				} else {
					return true
				}
			} else if (operation.action==="append") {
				//console.log("check model: ",this.checkModel(operation.args.value))
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.value) ||
				!this.checkModel(operation.args.value)) {
					return false
				} else {
					return true
				}
			} else if (operation.action==="insert") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!Ext.isNumber(operation.args.key) ||
				!Ext.isDefined(operation.args.value) ||
				!this.checkModel(operation.args.value) ||
				operation.args.key<0) {
					return false
				} else {
					return true
				}
			}
			return false;
		},
		getReverseOperation: function(operation) {
			var target=operation.selector?this.findTarget(operation.selector):this;
			if(!target) {
				return {
					action:"dummy"
				}
			}

			if (target===this) {
				if (operation.action==="set") {
					return {
						action:"set",
						args: {
							key:operation.args.key,
							value:this.data[operation.args.key]
						}
					}

				} else if (operation.action==="remove") {
					return {
						//action:"insert",
						action:"append",
						args: {
							//key:operation.args.key,
							value:this.data[operation.args.key]
						}
					}
				} else if (operation.action==="append") {
					return {
						action:"remove",
						args: {
							key:this.data.length,
						}
					}
				} else if (operation.action==="insert") {
					return {
						action:"remove",
						args: {
							key:operation.args.key,
						}
					}
				}
			} else {
				return Ext.apply({
					selector:operation.selector
				},target.getReverseOperation({
					action:operation.action,
					args:operation.args
				}))

			}
		},
	});

	lib.UndoableList=UndoableList;

})();