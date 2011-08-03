(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,ut;

	lib=window.sketchitLib;
	ut={};
	if (window.Ext){
		ut.applyIf=Ext.applyIf;
		ut.each=Ext.each;
		ut.extend=Ext.extend;
		ut.isArray=Ext.isArray;
		ut.isBoolean=Ext.isBoolean;
		ut.isDate=Ext.isDate;
		ut.isDefined=Ext.isDefined;
		ut.isElement=Ext.isElement;
		ut.isEmpty=Ext.isEmpty;
		ut.isFunction=Ext.isFunction;
		ut.isNumber=Ext.isNumber;
		ut.isObject=Ext.isObject;
		ut.isString=Ext.isString;
		ut.iterate=Ext.iterate;
		ut.override=Ext.override;	
	} else {
		alert("stand alone version have not develop yet. you have to include sencha-touch.js");
	}
	
	
	
	ut.Undoable = {

		findTarget: function(selector) {
			if(Ext.isString(selector) || Ext.isNumber(selector)) {
				return this.data[selector];
			} else if (Ext.isArray(selector)) {
				if (selector.length===1) {
					return this.data[selector[0]];
				} else if (selector.length>1) {
					if (this.data[selector[0]].findTarget) {
						return this.data[selector[0]].findTarget(selector.slice(1,selector.length));
					}
				}
			} else if (!Ext.isArray(selector) && Ext.isObject(selector)) {
				return selector;
			}
			throw "invalid selector"
			return null;
		},
		remove: function(args) {
			delete this.data[args.key];
		},
		set: function(args) {
			this.data[args.key]=args.value;
		},
		dummy: Ext.emptyFn,
		

		/**
		 * Execute a unit operation with given arguments
		 * @param {Object} The operation to execute: "set", "add", "remove","append"
		 * operation={
		 * 	selector:["",""] or "", if not specify, target will be this
		 * 	action:"",
		 * 	args:{
		 * 		key:"",
		 * 		value:""
		 *  }
		 * }
		 */
		execute: function(operation) {
			var target=Ext.isDefined(operation.selector)?this.findTarget(operation.selector):this;
			if (!target) {
				return false;
			}
			if (target===this) {
				//console.log("valid operation ",this.validateOperation(operation))
				this[operation.action](operation.args);
				return this;
			} else {
				return target.execute({
					action:operation.action,
					args:operation.args
				})
			}
		},
		validateOperation: function(operation) {

			if (!Ext.isDefined(operation)) {
				return false;
			}
			if (operation.action==="set") {
				if (
				!operation.args ||
				!Ext.isDefined(operation.args.key) ||
				//Ext.isObject(this.data[operation.args.key])||
				!Ext.isDefined(operation.args.value)
				//Ext.isObject(this.data[operation.args.value])
				) {
					return false
				} else {
					return true;
				}

			} else if (operation.action==="remove") {
				if (!Ext.isDefined(operation.args) ||
				!Ext.isDefined(operation.args.key) ||
				!this.data[operation.args.key]) {
					return false
				} else {
					return true
				}
			}
			return false;
		},
		getReverseOperation: function(operation) {
			var target=Ext.isDefined(operation.selector)?this.findTarget(operation.selector):this;
			if(!target) {
				return {
					action:"dummy"
				}
			}

			if (target===this) {
				if (operation.action==="set") {
					if (Ext.isDefined(this.data[operation.args.key])) {
						return {
							action:"set",
							args: {
								key:operation.args.key,
								value:this.data[operation.args.key]
							}
						}
					} else {
						return {
							action: "remove",
							args: {
								key:operation.args.key
							}

						}
					}
				} else if (operation.action==="remove") {
					if (Ext.isDefined(this.data[operation.args.key])) {
						return {
							action:"set",
							args: {
								key:operation.args.key,
								value:this.data[operation.args.key]
							}

						}
					} else {
						return {
							action:"dummy"
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
	};
	
	ut.Store= Ext.extend(Ext.util.Observable, {
		constructor: function(config) {
			//TODO: what if no arguments? 
			if (Ext.isDefined(config)){
				if(Ext.isDefined(config.data)){
					this.data=config.data;
				} else {
					this.data={};
				}
				this.listeners = config.listeners;
			} else {
				this.data={};
			}
			//this.data=config.data;
			
			Undoable.superclass.constructor.call(this, config)
			this.loadDefault();
			/*
			console.log("this undoable ",this)
			//var obj;
			if (this.isAbstract && Ext.isDefined(this.data.subclass)){
				return lib[this.data.subclass].prototype.constructor.call(this,config);
			}*/
		},
		setDefaults : function(config) {
			Ext.apply(this.defaults, config);
		},
		loadDefault:function(){
			//console.log("this.data",this.data)
			//console.log("this.data",this.defaults)
			Ext.applyIf(this.data,this.defaults);
			//console.log("this.data",this.data)
		},
		
	})
	
	
	
	
	
	
	
	
	
	lib.ut=ut;
})();