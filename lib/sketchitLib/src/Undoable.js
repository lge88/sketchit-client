(function() {
	window.sketchitLib=window.sketchitLib?window.sketchitLib : {};
	var lib,
	Undoable;
	
	lib=window.sketchitLib;
	
	Undoable = Ext.extend(Ext.util.Observable, {
		constructor: function(config) {
			this.data=config.data;
			this.listeners = config.listeners;
			Undoable.superclass.constructor.call(this, config)
		},
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
				console.log("valid operation ",this.validateOperation(operation))
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
	});

	lib.Undoable=Undoable;
})();