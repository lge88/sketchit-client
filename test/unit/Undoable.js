module("undoable", {
	setup : function() {
		function Point(x, y) {
			this.X = x;
			this.Y = y
		};

		Point.prototype.move = function(dx, dy) {
			this.X += dx;
			this.Y += dy;
		};
		this.p1 = new Point(12, 3);
		this.p2 = new Point(3, 53);
		this.p3 = new Point(24, 4);
		this.obj = {
			mode : "draw",
			id : 20,
			settings : {
				bool : true,
				number : 200,
				text : "string",
				arr : [23, 43, 5, 6, 7, "ewr", "adsf"],
				obj : {
					X : 100,
					Y : 200,
					Z : {
						a : "hello",
						b : 20
					}
				},
				p : this.p2
			},
			store1 : [1, 2, 3, 43, 45, 5, 6],
			store2 : ["adf", "sdsf", "sf", "46hjf", "ooamdf"],
			store3 : [{
				a : 3,
				b : 5
			}, {
				c : 6,
				d : 7
			}, {
				e : 12,
				f : 5
			}],
			store4 : [this.p1, this.p2, this.p3]
		};

		this.U1 = new Undoable(this.obj);
	}
});

test("get method", function() {
	var U = this.U1;

	equals(U.get("mode"), "draw", "first layer string");
	equals(U.get("id"), 20, "first layer number");
	equals(U.get("settings.text"), "string", "second layer string");
	equals(U.get("settings.arr.2"), 5, "third layer number");
	equals(U.get("settings.obj.Z.a"), "hello", "fourth layer number");
	equals(U.get(["settings", "obj", "Z", "a"]), "hello", "fourth layer number,use array selector");
	equals(U.get("store4.1.Y"), 53, "third layer number");
});
test("plain Object operation", function() {
	var U = this.U1;
		
	equals(U.mode, "draw");//1
	equals(U.store4[1].Y, 53);//2
	equals(U.settings.obj.Z.a, "hello");//3
	equals(U.store1[3], 43);//4
	equals(U.store2[5], undefined);//5

	U.set("mode","select");	
	U.set("store4.1.Y",U.get("store4.1.Y")+20);
	U.set(["settings", "obj", "Z", "a"],"hello world");
	U.set("store1.3");
	U.set("store2.5","new Element");

	same(U._unCommitChanges, [{
		value : "draw",
		key : "mode",
		ref : []
	}, {
		value : 53,
		key : "Y",
		ref : ["store4", "1"]
	}, {
		value : "hello",
		key : "a",
		ref : ["settings", "obj", "Z"]
	}, {
		value : 43,
		key : "3",
		ref : ["store1"]
	}, {
		value : undefined,
		key : "5",
		ref : ["store2"]
	}], "_unCommitChanges correct");//6
	
	U.commit();
	
	equals(U._head, 0, "head at 0");//7
	same(U._unCommitChanges, [], "_unCommitChanges empty");//8
	equals(U.mode, "select");//9
	equals(U.store4[1].Y, 73);//10
	equals(U.settings.obj.Z.a, "hello world");//11
	equals(U.store1[3], undefined);//12
	equals(U.store2[5], "new Element");//13

	U.undo();
	equals(U.mode, "draw");//14
	equals(U.store4[1].Y, 53);//15
	equals(U.settings.obj.Z.a, "hello");//16
	equals(U.store1[3], 43);//17
	equals(U.store2[5], undefined);//18

	U.redo();
	equals(U.mode, "select");//19
	equals(U.store4[1].Y, 73);//20
	equals(U.settings.obj.Z.a, "hello world");//21
	equals(U.store1[3], undefined);//22
	equals(U.store2[5], "new Element");//23
	
	U.undo();
	equals(U.mode, "draw");//24
	equals(U.store4[1].Y, 53);//25
	equals(U.settings.obj.Z.a, "hello");//26
	equals(U.store1[3], 43);//27
	equals(U.store2[5], undefined);//28
	
	U.clearHistory();
	
	same(U._unCommitChanges, [], "_unCommitChanges empty");//29
	same(U._timeline, [], "timeline empty");//30
	equals(U._head, -1, "head -1");//31
	same(U,new Undoable(this.obj),"back to original state")//32
	
	U.set("mode","select");	
	U.commit();
	U.set("store4.1.Y",U.get("store4.1.Y")+20);
	U.commit();
	U.set(["settings", "obj", "Z", "a"],"hello world");
	U.commit();
	U.set("store1.3");
	U.commit();
	U.set("store2.5","new Element");
	U.commit();
	
	equals(U.mode, "select");//33
	equals(U.store4[1].Y, 73);//34
	equals(U.settings.obj.Z.a, "hello world");//35
	equals(U.store1[3], undefined);//36
	equals(U.store2[5], "new Element");//37
	
	U.undo();
	
	equals(U.mode, "select");//38
	equals(U.store4[1].Y, 73);//39
	equals(U.settings.obj.Z.a, "hello world");//40
	equals(U.store1[3], undefined);//41
	equals(U.store2[5], undefined);//42
	
	U.undo();
	
	equals(U.mode, "select");//43
	equals(U.store4[1].Y, 73);//44
	equals(U.settings.obj.Z.a, "hello world");//45
	equals(U.store1[3], 43);//46
	equals(U.store2[5], undefined);//47
	
	U.undo();
	
	equals(U.mode, "select");//48
	equals(U.store4[1].Y, 73);//49
	equals(U.settings.obj.Z.a, "hello");//50
	equals(U.store1[3], 43);//51
	equals(U.store2[5], undefined);//52
	
	U.undo();
	
	equals(U.mode, "select");//53
	equals(U.store4[1].Y, 53);//54
	equals(U.settings.obj.Z.a, "hello");//55
	equals(U.store1[3], 43);//56
	equals(U.store2[5], undefined);//57
	
	U.undo();
	
	equals(U.mode, "draw");//58
	equals(U.store4[1].Y, 53);//59
	equals(U.settings.obj.Z.a, "hello");//60
	equals(U.store1[3], 43);//61
	equals(U.store2[5], undefined);//62
	
	U.redo().redo().redo().redo().redo();
	U.undo().undo().redo().redo();	
	
	equals(U.mode, "select");//63
	equals(U.store4[1].Y, 73);//64
	equals(U.settings.obj.Z.a, "hello world");//65
	equals(U.store1[3], undefined);//66
	equals(U.store2[5], "new Element");//67
	
});

test("array operation", function() {
	var U = this.U1;
	
	
	
	same(U.store1,[1, 2, 3, 43, 45, 5, 6],"initial state")//1
	/*
	U.pushTo("store1",777);
	U.pushTo("store1",888);
	U.pushTo("store1",999);
	U.commit();
	
	console.log("U",U)
		
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888,999],"number array works")//2	
	U.undo();
		
	same(U.store1,[1, 2, 3, 43, 45, 5, 6],"back to initial state")//3	
	U.redo();
		
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888,999],"number array works")//4	
	U.undo();
	
	same(U.store1,[1, 2, 3, 43, 45, 5, 6],"back to initial state")//3	*/
	U.removeAt("store1.2");
	U.commit();		
	same(U.store1,[1, 2, 43, 45, 5, 6],"removeAT 2")//5		
	
	U.undo();
	same(U.store1,[1, 2, 3, 43, 45, 5, 6],"undo remove at 2")//3
	
	U.redo();
	same(U.store1,[1, 2, 43, 45, 5, 6],"redo remove at 2")
	
	U.pushTo("store1",777);
	U.commit();
	same(U.store1,[1, 2, 43, 45, 5, 6,777],"push 777")
	
	U.pushTo("store1",888);
	U.commit();
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888],"push 888")//2
	
	U.pushTo("store1",999);
	U.commit();	
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888,999],"push 999")//2	
	
	U.undo();		
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888],"undo push to")//3
		
	U.redo();		
	same(U.store1,[1, 2, 3, 43, 45, 5, 6,777,888,999],"redo push to")
	
	
	/*
	
	
	U.removeAt("store1.0");
	U.commit();
	
	same(U.store1,[2, 43, 45, 5, 6],"removeAT 0")//6	
	U.removeAt("store1.6");
	U.commit();
	
	same(U.store1,[2, 43, 45, 5,6],"removeAT 6, out of bound")//7	
	U.removeAt("store1.4");
	U.commit();
	
	
	
	same(U.store1,[2, 43, 45, 5],"removeAT 4")//7	
	U.undo();
	
	same(U.store1,[2, 43, 45, 5, 6],"removeAT undo check")//8	
	U.redo();
	
	same(U.store1,[2, 43, 45, 5],"removeAT redo check")//9	
	U.removeAt("store1.-1");
	U.commit();
	same(U.store1,[2, 43, 45],"removeAT -1")//10*/

});

