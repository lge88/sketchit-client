(function() {
	var $D = DirectFEA;
	Ext.regApplication({
		name : "sketchit",
		glossOnIcon : false,

		/**
		 * This is called automatically when the page loads. Here we set up the main component on the page - the Viewport
		 */
		launch : function() {

			sketchit.controllers.main = Ext.regController("main", {
				initAll : function(options) {
					//set options
					//this.setOptions(options);

					//init views
					this.mainView = this.render({
						xtype : 'sketchitMain'
					}, Ext.getBody());

					this.canvas = this.mainView.getComponent(0);

					this.topBar = this.mainView.getDockedItems()[0];

					this.bottomBar = this.mainView.getDockedItems()[1];

					//init model Domain
					this.Domain = new DirectFEA.Domain();
					window.Domain = this.Domain;

					//init Renderer
					this.Renderer = new DirectFEA.Renderer({
						canvas : document.getElementById('workspace'),
						ctx : document.getElementById('workspace').getContext("2d"),
					})
					window.Renderer = this.Renderer;

					this.settings = {};
					Ext.apply(this.settings, {
						mode : 'draw',
						moveActivated : false,
						fps : 10,
						// analysisMode : "auto", //auto or manual
						autoAnalysis : true,
						// this.Renderer.ctx.font = "bold 12px sans-serif";
						// this.Renderer.ctx.textBaseline = "bottom";
						// this.Renderer.ctx.fillStyle="rgb(0,0,0)";
						// this.Renderer.transform(1,0,0,-1,0,0);
						// this.Renderer.ctx.fillText(m,10,-10);
						showMessage : true,
						messageBoxPositionX : 10,
						messageBoxPositionY : 10,
						messageTextFont : "bold 12px sans-serif",
						messageTextFillStye : "rgb(0,0,0)",
						messageLastTime : 5,

						modelScale : 2.0,
						loadScale : 1.0,

						viewPortScale : 1.0,
						viewPortShiftX : 0.0,
						viewPortShiftY : 0.0,

						showDeformation : true,
						showMoment : true,

						deformationScale : 2000,
						momentScale : 0.01,
						autoDeformationScale : true,
						maxDeformationOnScreen : 40,
						deformationResolution : 20,
						autoMomentScale : true,
						maxMomentOnScreen : 80,
						momentResolution : 20,

						snapToNode : true,
						snapToNodeThreshold : 50,

						snapToLine : true,
						snapToLineThreshold : 25,

						snapToGrid : true,
						grid : 20,
						gridLineWidth : 1,
						gridLineStyle : "rgba(0,0,0,0.5)",

						SPCSnapToDirection : true,
						SPCSnapToDirectionThreshold : 0.2,

						SPCSnapToNode : true,
						SPCSnapToNodeThreshold : 15,

						circleSnapToSPCThreshold : 25,

						LoadSnapToNodeThreshold : 15,
						LoadSnapToLineThreshold : 5,

						autoMergeNodeOnLine : true,
						autoMergeNodeOnLineThreshold : 1,

						showNodeId : false,
						showElementId : false,
						showMarks : false,
						showGrid : true,
						showSPC : true,

						canvasBgColor : "rgb(255,255,255)",
						inputStrokeStyle : "rgb(0,0,255)",
						inputStrokeWidth : 2,

						defaultLineELementType : DirectFEA.ElasticBeamColumn,
						defaultGeomTransf : Domain.theGeomTransfs[2],
						defaultNodeLoadType : "load",

						UniformElementLoadDirectionThreshold : 0.3,
						UniformElementLoadSnapToLineThreshold : 15,

						circleSelectThreshold : 0.1,
						clickSelectThreshold : 10

					})

					//this.settings.defaultGeomTransf = Domain.theGeomTransfs[2];

					this.onOrientationchange.call(this);

					//init input stroke array
					this.inputStrokes = [];

					//init shape recognizer
					this.shapeRecognizer = new DollarRecognizer();

					//init command recognizer
					//this.commandGen = {};

					//init event handlers
					this.initHandlers();

					//init canvas transform

					//this.Renderer.initTransform();

					// first render
					this.refresh();
				},
				initHandlers : function() {

					//init main view event
					// document.addEventListener("DOMMouseScroll",function(){
					// alert("mouse wheel")
					// })
					// document.addEventListener("mousewheel",function(e){
					// console.log("e",e)
					// })

					this.mainView.on({
						orientationchange : this.onOrientationchange,

						scope : this
					})

					// init canvas handlers
					this.canvas.mon(this.canvas.el, {
						doubletap : this.onDoubleTap,
						touchmove : this.onTouchMove,
						touchstart : this.onTouchStart,
						touchend : this.onTouchEnd,
						mousewheel : function(e) {
							// alert("mouse wheelasfasdfs")
							console.log("e", e)
						},
						//tapcancel: function(){alert("touch cancle")},
						pinchstart : this.onPinchStart,
						pinch : this.onPinch,
						pinchend : this.onPinchEnd,
						scope : this
					});

					//this.init Menu Handlers;
					//run button
					this.bottomBar.getComponent(0).getComponent(3).setHandler(function() {
						this.reanalyze();
					}, this);
					//grid button
					this.topBar.getComponent(0).getComponent(2).setHandler(function() {
						this.settings.showGrid = !this.settings.showGrid;
						this.refresh();
					}, this);
					//deformation button
					this.topBar.getComponent(0).getComponent(4).setHandler(function() {
						this.settings.showDeformation = !this.settings.showDeformation;
						this.reanalyze(function() {
							this.refresh();
						});
					}, this);
					//moment button
					this.topBar.getComponent(0).getComponent(5).setHandler(function() {
						this.settings.showMoment = !this.settings.showMoment;
						// this.refresh();
						this.reanalyze(function() {
							this.refresh();
						})
					}, this);
					//real time button
					this.topBar.getComponent(0).getComponent(3).setHandler(function() {
						this.settings.autoAnalysis = !this.settings.autoAnalysis;
						if(this.settings.autoAnalysis === true) {
							this.reanalyze(function() {
								this.refresh();
							})
						}
						//this.refresh();
					}, this);
					//clear button
					this.bottomBar.getComponent(2).setHandler(this.clearAll, this);
					//unselect all button
					this.bottomBar.getComponent(3).setHandler(function() {
						if(!this.Domain["unselectAll"]()) {
							console.log("do nothing");
						}
						this.Domain.commit();
						this.refresh();
					}, this);
					//delete button
					this.bottomBar.getComponent(4).setHandler(function() {
						if(!this.Domain["removeSelectedElement"]()) {
							console.log("do nothing");
						}
						this.Domain.commit();
						if(this.settings.autoAnalysis) {
							this.reanalyze(function() {
								this.refresh();
							});
						} else {
							this.refresh();
						}
					}, this);
					//undo button
					this.bottomBar.getComponent(5).setHandler(this.undo, this);
					this.bottomBar.getComponent(5).setDisabled(true);
					//redo button
					this.bottomBar.getComponent(6).setHandler(this.redo, this);
					this.bottomBar.getComponent(6).setDisabled(true);
					//save button
					this.bottomBar.getComponent(7).setHandler(this.save, this);

					//mode toggle button
					this.bottomBar.getComponent(11).on({
						toggle : function() {
							this.settings.mode = this.bottomBar.getComponent(11).getPressed().text;
						},
						scope : this
					});

				},
				canvasUpLeftX : undefined,
				canvasUpLeftY : undefined,
				canvasHeight : undefined,
				canvasWidth : undefined,

				mouseX : undefined,
				mouseY : undefined,
				logs : [],

				getCanvasCoordFromViewPort : function(p) {
					return {
						X : (p.X - this.settings.viewPortShiftX) / this.settings.viewPortScale,
						Y : (p.Y - this.settings.viewPortShiftY) / this.settings.viewPortScale
					}
				},
				getViewPortCoordFromCanvas : function(p) {
					return {
						X : p.X * this.settings.viewPortScale + this.settings.viewPortShiftX,
						Y : p.Y * this.settings.viewPortScale + this.settings.viewPortShiftY,
					}
				},
				getViewPortCoordFromPage : function(p) {
					return {
						X : p.X - this.canvasUpLeftX,
						Y : this.canvasHeight - p.Y + this.canvasUpleftY
					}
				},
				getCanvasCoordFromPage : function(p) {
					return {
						X : (p.X - this.canvasUpLeftX - this.settings.viewPortShiftX) / this.settings.viewPortScale,
						Y : (this.canvasHeight - p.Y + this.canvasUpleftY - this.settings.viewPortShiftY) / this.settings.viewPortScale
					}
				},
				resetCanvasPosition : function(width, height, upleftX, upleftY) {
					this.canvasWidth = width || this.mainView.getWidth();
					this.canvasHeight = height || this.mainView.getHeight() - this.topBar.getHeight() - this.bottomBar.getHeight();
					this.canvasUpLeftX = upleftX || 0;
					this.canvasUpleftY = upleftY || this.topBar.getHeight();
				},
				initCanvasTransform : function() {
					this.Renderer.setTransform(1.0, 0, 0, -1.0, 0, this.canvasHeight);
				},
				applyViewPortTransform : function() {
					this.Renderer.transform(this.settings.viewPortScale, 0, 0, this.settings.viewPortScale, this.settings.viewPortShiftX, this.settings.viewPortShiftY);
				},
				resetViewPort : function(scale, shiftX, shiftY) {
					this.settings.viewPortScale = scale || 1.0;
					this.settings.viewPortShiftX = shiftX || 0.0;
					this.settings.viewPortShiftY = shiftY || 0.0;
				},
				applyInputStrokeStyle : function(scale) {
					this.Renderer.ctx.strokeStyle = this.settings.inputStrokeStyle;
					this.Renderer.ctx.lineWidth = this.settings.inputStrokeWidth / scale;
				},
				applyGridStyle : function(scale) {
					this.Renderer.ctx.strokeStyle = this.settings.gridLineStyle;
					this.Renderer.ctx.lineWidth = this.settings.gridLineWidth / scale;
				},
				getAutoDeformationScale : function(maxDispOnScreen) {
					var a = $D.getAbsMax(this.Domain.theNodes, "dispX"), b = $D.getAbsMax(this.Domain.theNodes, "dispY"), m = a > b ? a : b;
					return maxDispOnScreen / m;
				},
				getAutoMomentScale : function(maxDispOnScreen) {
					var a = $D.getAbsMax(this.Domain.theElements, "maxMoment");
					console.log("maxM", a)
					return maxDispOnScreen / a;
				},
				clearScreen : function() {
					this.Renderer.save();
					this.initCanvasTransform();
					this.Renderer.ctx.fillStyle = this.settings.canvasBgColor;
					this.Renderer.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
					this.Renderer.restore();
				},
				drawObjectStore : function(store, fn) {
					var i, args = Array.prototype.slice.call(arguments, 2);
					store.each(function(e) {
						e[fn].apply(e, args);
					});
				},
				drawMessage : function() {
					var C = this.Renderer.ctx, l = this.logs, len = l.length, S = this.settings;
					if(len > 0) {
						var m = l[len - 1]
						C.save();
						C.font = S.messageTextFont;
						C.fillStyle = S.messageTextFillStye;
						C.transform(1, 0, 0, -1, 0, 0);
						C.fillText(m, S.messageBoxPositionX, -S.messageBoxPositionY);
						C.restore();
					}
				},
				drawDomain : function() {
					var R, vps, dfs, dfr;
					R = this.Renderer;
					vps = this.settings.viewPortScale;
					dfs = this.settings.deformationScale;
					dfr = this.settings.deformationResolution;

					if(this.settings.showGrid) {
						var c1 = this.getCanvasCoordFromViewPort({
							X : 0,
							Y : 0
						}), c2 = this.getCanvasCoordFromViewPort({
							X : this.canvasWidth,
							Y : this.canvasHeight
						});
						this.applyGridStyle(this.settings.viewPortScale);
						R.drawGrid(this.settings.grid, this.settings.grid, c1.X, c2.X, c1.Y, c2.Y);
					}
					this.drawObjectStore(this.Domain.theElements, "display", this.Renderer, this.settings.viewPortScale);
					this.drawObjectStore(this.Domain.theSPCs, "display", this.Renderer, this.settings.viewPortScale);
					this.drawObjectStore(this.Domain.thePatterns[1].Loads, "display", this.Renderer, this.settings.viewPortScale);
					this.drawObjectStore(this.Domain.theNodes, "display", this.Renderer, this.settings.viewPortScale);

					if(this.Domain.deformationAvailable && this.settings.showDeformation) {
						this.drawObjectStore(this.Domain.theElements, "displayDeformation", this.Renderer, this.settings.viewPortScale, this.settings.deformationScale, this.settings.deformationResolution);
						this.drawObjectStore(this.Domain.theNodes, "displayDeformation", this.Renderer, this.settings.viewPortScale, this.settings.deformationScale);
					}
					if(this.Domain.deformationAvailable && this.settings.showMoment) {
						this.drawObjectStore(this.Domain.theElements, "displayMoment", this.Renderer, this.settings.viewPortScale, this.settings.momentScale, this.settings.momentResolution);
					}
				},
				refresh : function() {
					this.clearScreen();
					this.initCanvasTransform();
					this.drawMessage();
					this.applyViewPortTransform();
					this.drawDomain();
				},
				save : function() {
					alert(this.Domain.runStaticConstant(this.settings.modelScale, this.settings.loadScale));

				},
				onOrientationchange : function() {
					this.resetCanvasPosition();
					this.resetViewPort();
					this.refresh();
				},
				onDoubleTap : function(e, el, obj) {
					this.resetViewPort();
					this.refresh();
				},
				animate : function(condition, fn, dt) {
					setTimeout(function(scope) {
						fn.call(scope);
						if(condition.call(scope)) {
							scope.animate(condition, fn, dt)
						}
					}, dt, this);
				},
				onTouchStart : function(e, el, obj) {
					// this.logs.push("start!\nnextline");
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					this.mouseX = P.X;
					this.mouseY = P.Y;
					if(this.settings.mode === "move") {
						this.moveStartX = P.X;
						this.moveStartY = P.Y;
						this.settings.moveActivated = true;
						this.animate(function() {
							return this.settings.moveActivated;
						}, function() {
							if(this.settings.autoAnalysis) {
								this.reanalyze(function() {
									this.refresh();
								});
							} else {
								this.refresh();
							}
						}, 1000 / this.settings.fps)

					} else {
						this.inputStrokes = [];
						this.inputStrokes.push(P);
					}
				},
				onTouchMove : function(e, el, obj) {
					// console.log("move", e)
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					// var nowX, nowY, i, loop;
					// nowX = parseInt(e.touches[0].pageX);
					// nowY = parseInt(e.touches[0].pageY);
					if(this.settings.mode === "move" && this.settings.moveActivated === true) {
						this.Domain["moveSelectedNodes"]({
							"dx" : P.X - this.mouseX,
							"dy" : P.Y - this.mouseY
						});
					} else {
						var l;
						this.inputStrokes.push(P);
						l = this.inputStrokes.length;
						this.applyInputStrokeStyle(this.settings.viewPortScale);
						this.Renderer.drawLine(this.inputStrokes[l - 2], this.inputStrokes[l - 1]);
					}
					this.mouseX = P.X;
					this.mouseY = P.Y;

				},
				onTouchEnd : function(e, el, obj) {
					if(this.settings.mode === "move") {
						this.settings.moveActivated = false;
					}
					console.log("e", e)
					if(e.touches.length === 0 || e.touches.length === 1) {
						//var result = this.shapeRecognizer.Recognize(this.inputStrokes, false);
						// this.act(result, this.settings)
						this.oneStrokeHandler();
						//this.refresh();
					}
					this.inputStrokes = [];

				},
				onPinchStart : function(e, el, obj) {
					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					});
					this.pinchTranslate0 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
				},
				onPinch : function(e, el, obj) {
					if(!Ext.isDefined(e.touches[0]) || !Ext.isDefined(e.touches[1])) {
						return;
					}

					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					}), m11, m12, m21, m22, cx, cy, dx, dy;
					this.pinchTranslate1 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
					m11 = e.scale;
					m12 = 0;
					m21 = 0;
					m22 = e.scale;
					cx = this.pinchTranslate1.X - this.pinchTranslate1.X * e.scale;
					cy = this.pinchTranslate1.Y - this.pinchTranslate1.Y * e.scale;
					dx = (this.pinchTranslate1.X - this.pinchTranslate0.X) * e.scale;
					dy = (this.pinchTranslate1.Y - this.pinchTranslate0.Y) * e.scale;
					this.Renderer.save();
					this.Renderer.ctx.transform(m11, m12, m21, m22, cx + dx, cy + dy);
					this.pinchScale = e.scale;
					this.pinchShiftX = cx + dx;
					this.pinchShiftY = cy + dy;
					this.clearScreen();
					this.drawDomain();
					this.Renderer.restore();
				},
				onPinchEnd : function() {
					var scale, shiftX, shiftY;
					scale = this.settings.viewPortScale * this.pinchScale;
					shiftX = this.settings.viewPortScale * this.pinchShiftX + this.settings.viewPortShiftX;
					shiftY = this.settings.viewPortScale * this.pinchShiftY + this.settings.viewPortShiftY;
					this.resetViewPort(scale, shiftX, shiftY);
					this.refresh();
				},
				clearAll : function() {
					this.Domain.wipeAll();
					this.Domain.commit();
					this.refresh();
				},
				undo : function() {
					this.Domain.undo();
					this.bottomBar.getComponent(6).setDisabled(false);
					if(this.Domain._head === -1) {
						this.bottomBar.getComponent(5).setDisabled(true);
					}

					if(this.settings.autoAnalysis) {
						this.reanalyze(function() {
							this.refresh();
						});
					} else {
						this.refresh();
					}

				},
				redo : function() {
					this.Domain.redo();
					this.bottomBar.getComponent(5).setDisabled(false);
					if(this.Domain._head === this.Domain._timeline.length - 1) {
						this.bottomBar.getComponent(6).setDisabled(true);
					}

					if(this.settings.autoAnalysis) {
						this.reanalyze(function() {
							this.refresh();
						});
					} else {
						this.refresh();
					}
				},
				reanalyze : function(fn) {
					var args = Array.prototype.slice.call(arguments, 1), flag = false;
					if(this.Domain.isReadyToRun() /*&& this.Domain.changed*/) {
						if(this.settings.showMoment || this.settings.showDeformation) {
							$D.ajaxPost({
								url : "/cgi-bin/lge/sketchit-server/test/sketchit.ops",
								scope : this,
								data : this.Domain.runStaticConstant(this.settings.showDeformation, this.settings.showMoment),
								success : function(result) {
									// console.log("this", this)
									this.Domain.loadResultData(result.responseText);
									this.Domain.set("deformationAvailable", true);
									// this.Domain.commit();
									// this.Domain.deformationAvailable = true;
									if(this.settings.autoDeformationScale) {
										var ascale = this.getAutoDeformationScale(this.settings.maxDeformationOnScreen)
										if(isFinite(ascale)) {
											this.settings.deformationScale = ascale;
										}
									}

									if(this.settings.autoMomentScale) {
										var mscale = this.getAutoMomentScale(this.settings.maxMomentOnScreen);
										if(isFinite(mscale)) {
											this.settings.momentScale = mscale;
											this.settings.autoMomentScale = false;
										}
									}
									if($D.isDefined(fn)) {
										fn.apply(this, args);
									}

									// this.refresh();
								},
							});
							flag = true;
						}// else {
						// this.refresh();
						// }
					} else {
						// this.Domain.deformationAvailable = false;
						this.Domain.set("deformationAvailable", false);
						// this.Domain.resetResultData();
						// this.refresh();

					}
					if($D.isDefined(fn) && !flag) {
						fn.apply(this, args);
					}
				},
				// act : function(recognizeResult, settings) {
				// if(settings.mode === "draw" || settings.mode === "load") {
				// var obj, args, undo;
				// obj = this.vocabulary[settings.mode][recognizeResult.name];
				// console.log("obj: ", obj, " recognize result ", recognizeResult);
				// if(Ext.isFunction(obj)) {
				// obj = obj.call(this);
				// }
				//
				// if(Ext.isDefined(obj) && Ext.isObject(obj)) {
				// args = obj.argsGen.call(this, recognizeResult.data, settings);
				// undo = obj.undo;
				// this.Domain[obj.command](args);
				// if(undo) {
				// this.Domain.commit();
				// this.bottomBar.getComponent(5).setDisabled(false);
				// this.bottomBar.getComponent(6).setDisabled(true);
				// } else {
				// this.Domain.discard();
				// }
				// // alert("is ready to run? "+this.Domain.isReadyToRun());
				// if(this.settings.autoAnalysis) {
				// // if(this.settings.analysisMode === "auto") {
				// this.reanalyze();
				// } else {
				// this.refresh();
				// }
				// return true;
				// } else {
				// console.log("do nothing")
				// }
				// } else if(settings.mode === "select") {
				// if($D.distance(recognizeResult.data.from, recognizeResult.data.to) < settings.circleSelectThreshold) {
				// this.Domain["circleSelect"]({
				// "poly" : recognizeResult.data.ResamplePoints
				// });
				// } else {
				//
				// }
				// this.Domain.commit();
				// this.bottomBar.getComponent(5).setDisabled(false);
				// this.bottomBar.getComponent(6).setDisabled(true);
				// return true;
				//
				// } else if(settings.mode === "move") {
				//
				// }
				//
				// console.log("do nothing")
				// return false;
				// },

				oneStrokeHandler : function() {
					var undo = true, changed = false, msg = "", S = this.settings,action;
					switch (this.settings.mode) {

						case "draw":
						case "load":
							var recognizeResult = this.shapeRecognizer.Recognize(this.inputStrokes, false), //
							obj = this.oneStrokeVocabulary[this.settings.mode][recognizeResult.name];
							if(Ext.isDefined(obj)) {
								//this.logs.push("")
								console.log("obj: ", obj, " recognize result ", recognizeResult);
								// msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:"+undo;
								if(Ext.isFunction(obj)) {
									obj = obj.call(this);
								}
								if(Ext.isObject(obj)) {
									undo = obj.undo;
									action = obj.command;
									changed = this.Domain[action](obj.argsGen.call(this, recognizeResult.data));
									// msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:"+undo;
									// msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:"//
									// + obj.command + "; success: " + changed + "; undoable:" + undo;
								} else {
									undo = "NA";
									action = "no found";
								}
								msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:"+undo;
							}
							break;
						case "select":
							var recognizeResult = this.shapeRecognizer.Recognize(this.inputStrokes, false), //
							d = $D.distance(recognizeResult.data.from, recognizeResult.data.to), //
							l = recognizeResult.data.PathLength,action;
							if(d / l > this.settings.circleSelectThreshold) {
								action = "intersectSelect";
								changed = this.Domain["intersectSelect"]({
									"curve" : recognizeResult.data.ResamplePoints
								});
							} else {
								if(l < this.settings.clickSelectThreshold) {
									// action = "clickSelect";
									// changed = this.Domain["clickSelect"]({
										// "X" : recognizeResult.data.from.X,
										// "Y" : recognizeResult.data.from.Y
									// });
								} else {
									action = "circleSelect";
									changed = this.Domain["circleSelect"]({
										"poly" : recognizeResult.data.ResamplePoints
									});
								}
							}
							undo = true;
							msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:"+undo;
							break;
						case "move":
							changed = this.Domain["jumpMoveSelectedNodes"]({
								"dx" : this.mouseX - this.moveStartX,
								"dy" : this.mouseY - this.moveStartY,
							});
							action = "moveSelectedComponent";
							undo = true;
							msg = "mode: " + S.mode + "; actioin:" + action + " ;undoable:"+undo;

							break;
						default:
							alert("mode not found!")
							break;
					}
					
					

					if(!changed) {
						console.log("do nothing");
						msg += "; Domain is not changed";
						this.logs.push(msg);
						this.refresh();
						return;
					}
					

					// alert("is ready to run? "+this.Domain.isReadyToRun());
					var inlineProc = function() {
						if(undo) {
							this.Domain.commit();
							this.bottomBar.getComponent(5).setDisabled(false);
							this.bottomBar.getComponent(6).setDisabled(true);
						} else {
							this.Domain.discard();
						}
						msg += "; Domain is changed";
						this.logs.push(msg);
						this.refresh();
					};
					if(this.settings.autoAnalysis) {
						// if(this.settings.analysisMode === "auto") {
						this.reanalyze(inlineProc);
					} else {
						inlineProc.call(this);
					}
				},
				oneStrokeVocabulary : {
					"draw" : {
						"line" : {
							command : "addALineElement",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								result.x1 = data.from.X;
								result.y1 = data.from.Y;
								result.x2 = data.to.X;
								result.y2 = data.to.Y;
								result.type = settings.defaultLineELementType;
								result.geomTransf = settings.defaultGeomTransf;

								if(settings.snapToNode) {
									result.snapToNodeThreshold = settings.snapToNodeThreshold / settings.viewPortScale;
								}
								if(settings.snapToLine) {
									result.snapToLineThreshold = settings.snapToLineThreshold / settings.viewPortScale;
								}
								if(settings.snapToGrid) {
									result.grid = settings.grid;
								}
								if(settings.autoMergeNodeOnLine) {
									result.autoMergeNodeOnLineThreshold = settings.autoMergeNodeOnLineThreshold;
								}
								return result;
							},
							undo : true
						},
						"triangle" : {
							command : "addASPC",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								;
								result.topX = data.from.X;
								result.topY = data.from.Y;
								result.angle = data.IndicativeAngle;
								result.show = settings.showSPC;

								if(settings.SPCSnapToDirection) {
									result.dT = settings.SPCSnapToDirectionThreshold;
								}
								if(settings.SPCSnapToNode) {
									result.nT = settings.SPCSnapToNodeThreshold;
								}
								if(settings.snapToGrid) {
									result.grid = settings.grid;
								}
								return result;
							},
							undo : true
						},
						"circle" : {
							command : "releaseASPC",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								result.cenX = data.Centroid.X;
								result.cenY = data.Centroid.Y;
								result.t = settings.circleSnapToSPCThreshold;
								return result;
							},
							undo : true
						},
						"rectangle" : function() {
							return this.vocabulary["draw"]["circle"];
						},
					},
					"select" : {
						"circleSelect" : {
							command : "circleSelect",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								result.poly = data.ResamplePoints;
								return result;
							},
							undo : true
						},
						"intersectSelect" : function() {
							return this.vocabulary["select"]["circle"];
						},
						"clickSelect" : function() {
							return this.vocabulary["select"]["circle"];
						},
					},
					"load" : {
						"line" : {
							command : "addALoad",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								result.x1 = data.from.X;
								result.y1 = data.from.Y;
								result.x2 = data.to.X;
								result.y2 = data.to.Y;
								result.nT = settings.LoadSnapToNodeThreshold;
								result.lT = settings.LoadSnapToLineThreshold;
								result.nLoadType = settings.defaultNodeLoadType;
								if(settings.snapToGrid) {
									result.grid = settings.grid;
								}
								return result;
							},
							undo : true
						},
						"squareBracket" : {
							command : "addUniformElementLoad",
							argsGen : function(data) {
								var result = {}, settings = this.settings;
								result.x1 = data.from.X;
								result.y1 = data.from.Y;
								result.x2 = data.to.X;
								result.y2 = data.to.Y;
								result.x3 = data.MidPoint.X;
								result.y3 = data.MidPoint.Y;
								result.aT = settings.UniformElementLoadDirectionThreshold;
								result.lT = settings.UniformElementLoadSnapToLineThreshold;
								return result;
							},
							undo : true
						}

					}

				},

			})
			window.Ctrl = sketchit.controllers.main;

			Ext.dispatch({
				controller : 'main',
				action : 'initAll',
			});

		}
	});

})();
