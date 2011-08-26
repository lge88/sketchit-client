(function() {
	var Undoable;
	Undoable = function(obj) {
		if(obj && typeof obj === 'object') {
			for(var key in obj) {
				this[key] = obj[key];
			}
		}
		this._timeline = [];
		this._unCommitChanges = [];
		this._head = -1;

	};
	//get obj referrence or value
	Undoable.prototype.get = function(selector) {
		var arr, value, i, len;
		if( typeof selector === "string") {
			arr = selector.replace(/\s/g,"").split(".")
		} else if(Object.prototype.toString.apply(selector) === '[object Array]') {
			arr = selector;
		}
		value = this;
		i = 0;
		len = arr.length;
		while(i < len) {
			value = value[arr[i]];
			i += 1;
		}
		return value;
	};
	//stage the changes going to made before the change apply
	Undoable.prototype.stage = function(selector, arrOp) {
		var change;

		if( typeof selector === 'string') {
			selector = selector.replace(/\s/g,"").split(".");
		} else if(Object.prototype.toString.apply(selector) === '[object Array]') {
		} else {
			return this;
		}
		change = {};
		if(arrOp === "remove") {
			change.value = this.get(selector);
			change.key = parseInt(selector[selector.length - 1]);
			change.ref = selector.slice(0, selector.length - 1);
			change.arrOp = arrOp;
			//console.log("remvoe change",change)
		} else if(arrOp === "insert") {
			change.key = parseInt(selector[selector.length - 1]);
			change.ref = selector.slice(0, selector.length - 1);
			change.arrOp = arrOp;
		} else {
			change.value = this.get(selector);
			change.key = selector[selector.length - 1];
			change.ref = selector.slice(0, selector.length - 1);
		}
		
		this._unCommitChanges.push(change)
		return this;
	};
	//commit the changes to timeline
	Undoable.prototype.commit = function() {
		this._head += 1;
		if(this._timeline.length != this._head) {
			this._timeline.splice(this._head, this.length)
		}
		var i;
		for( i = 0; i < this._unCommitChanges.length; i++) {
			this._unCommitChanges[i].newValue = this.get(this._unCommitChanges[i].ref)[this._unCommitChanges[i].key];
		}
		this._timeline.push(this._unCommitChanges);
		this._unCommitChanges = [];

		return this;
	}
	//set obj key value, changes are staged
	Undoable.prototype.set = function(selector, value) {
		var target, i, len, key;
		if( typeof selector === "string") {
			selector = selector.replace(/\s/g,"").split(".")
		} else if(Object.prototype.toString.apply(selector) === '[object Array]') {
		}
		if(selector.length == 0) {
			return this;
		}
		target = this;
		i = 0;
		len = selector.length - 1;
		key = selector[len]
		while(i < len) {
			target = target[selector[i]];
			i += 1;
		}
		this.stage(selector);
		if( typeof value === "undefined") { delete (target[key]);
		} else {
			target[key] = value;
		}
		return this;
	};
	//push obj to a array, the first parameter is the selector of a array (not its elements)
	Undoable.prototype.pushTo = function(selector, value) {
		var target, i, len;
		if( typeof selector === "string") {
			selector = selector.replace(/\s/g,"").split(".")
		} else if(Object.prototype.toString.apply(selector) === '[object Array]') {
		}
		if(selector.length == 0) {
			return this;
		}
		target = this;
		//console.log("target", target)
		i = 0;
		len = selector.length;
		while(i < len) {
			target = target[selector[i]];
			//console.log("target",target)
			i += 1;
		}
		selector.push(target.length)
		this.stage(selector, "insert");

		target.push(value);
		return this;
	};
	//remove a obj from array by index,  the first parameter is the selector of the object to be deleted
	Undoable.prototype.removeAt = function(selector) {
		var target, i, len, index;
		if( typeof selector === "string") {
			selector = selector.replace(/\s/g,"").split(".")
		} else if(Object.prototype.toString.apply(selector) === '[object Array]') {
		}
		if(selector.length == 0) {
			return this;
		}
		target = this;
		i = 0;
		len = selector.length - 1;
		index = selector[len];
		while(i < len) {
			target = target[selector[i]];
			i += 1;
		}
		if(index < target.length && index > -2) {
			this.stage(selector, "remove");
			target.splice(index, 1);
		}

		return this;
	};
	Undoable.prototype.undo = function() {
		var changes, i;
		if(this._head > -1) {
			console.log("timeline",this._timeline)
			changes = this._timeline[this._head];
			console.log("changes",changes)
			i = changes.length;
			while(--i > -1) {
				console.log("arrOp", changes[i].arrOp)
				
				if(changes[i].arrOp === "remove") {
					console.log("remove undo !!!!!!")
					this.get(changes[i].ref).splice(changes[i].key, 0, changes[i].value);
				} else if(changes[i].arrOp === "insert") {
					console.log("insert undo !!!!!!")
					this.get(changes[i].ref).splice(changes[i].key, 1);
				} else {
					if( typeof changes[i].value === "undefined") { delete (this.get(changes[i].ref)[changes[i].key]);
					} else {
						this.get(changes[i].ref)[changes[i].key] = changes[i].value;
					}
				}
			}
			this._head -= 1;
		}
		return this;
	}
	Undoable.prototype.redo = function() {
		var changes, i;
		if(this._head < this._timeline.length - 1) {
			this._head += 1;
			changes = this._timeline[this._head];
			i = -1;
			while(++i < changes.length) {
				if(changes[i].arrOp === "remove") {
					this.get(changes[i].ref).splice(changes[i].key, 1);
				} else if(changes[i].arrOp === "insert") {
					this.get(changes[i].ref).splice(changes[i].key, 0, changes[i].newValue);
				} else {
					this.get(changes[i].ref)[changes[i].key] = changes[i].newValue;
				}
			}
		}
		return this;
	}
	Undoable.prototype.clearHistory = function() {
		this._timeline = [];
		this._unCommitChanges = [];
		this._head = -1;
		return this;
	}
	window.Undoable = Undoable;
})()