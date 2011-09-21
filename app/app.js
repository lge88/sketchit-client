(function() {
	var $D = DirectFEA;
	Ext.regApplication({
		name : "sketchit",
		glossOnIcon : false,
		launch : function() {

			sketchit.controllers.main = Ext.regController("main", {
				initAll : function(options) {
					//init views
					this.mainView = new sketchitMainView({
						listeners : {
							afterrender : function() {
								sketchit.controllers.main.canvas = this.getComponent(0);
								sketchit.controllers.main.topBar = this.getDockedItems()[0];
								sketchit.controllers.main.bottomBar = this.getDockedItems()[1];

							}
						}
					})

					//init model Domain
					this.Domain = new $D.Domain();
					window.Domain = this.Domain;

					//init Renderer
					this.Renderer = new $D.Renderer(document.getElementById('workspace'));
					window.Renderer = this.Renderer;

					this.settings = {};
					$D.apply(this.settings, {
						mode : 'draw',
						touchMoveAnimation : false,
						touchMoveFps : 10,

						autoAnalysis : true,
						showMessage : true,
						messageBoxPositionX : 10,
						messageBoxPositionY : 10,
						messageTextFont : "bold 12px sans-serif",
						messageTextFillStye : "rgb(0,0,0)",
						messageLastTime : 5,

						modelScale : 2.0,
						loadScale : 1.0,

						mouseWheelSpeedFactor : 5, //1~10, scale = e^(wheelDelta*speedFactor/speedBase)
						mouseWheelSpeedBase : 1000, //fixed

						viewPortScale : 1.0,
						maxViewPortScale : 20.0,
						minViewPortScale : 0.2,
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

						SPCSnapToLine : true,
						SPCSnapToLineThreshold : 15,
						
						circleSnapToSPCThreshold : 25,

						loadSnapToNodeThreshold : 15,
						loadSnapToLineThreshold : 15,

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

					this.inputStrokes = [];
					this.logs = [],
					this.shapeRecognizer = new DollarRecognizer();
					this.initHandlers();
					this.setCanvasPosition(0, this.topBar.getHeight(), this.mainView.getWidth(), this.mainView.getHeight() - this.topBar.getHeight() - this.bottomBar.getHeight());
					this.resetViewPort();
					this.refresh();
				},
				initHandlers : function() {
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
						mousewheel : this.onMouseWheel,
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
					this.bottomBar.getComponent(7).setHandler(this.saveScript, this);

					//mode toggle button
					this.bottomBar.getComponent(11).on({
						toggle : function() {
							this.settings.mode = this.bottomBar.getComponent(11).getPressed().text;
						},
						scope : this
					});

				},
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
				setCanvasPosition : function(upleftX, upleftY, width, height) {
					this.canvasUpLeftX = upleftX;
					this.canvasUpleftY = upleftY;
					this.canvasWidth = width;
					this.canvasHeight = height;
				},
				initCT : function() {
					this.Renderer.setTransform(1.0, 0, 0, -1.0, 0, this.canvasHeight);
				},
				applyViewPortTransform : function() {
					this.Renderer.transform(this.settings.viewPortScale, 0, 0, this.settings.viewPortScale, this.settings.viewPortShiftX, this.settings.viewPortShiftY);
				},
				resetViewPort : function() {
					this.settings.viewPortScale = 1.0;
					this.settings.viewPortShiftX = 0.0;
					this.settings.viewPortShiftY = 0.0;
				},
				deltaTransform : function(dScale, dShiftX, dShiftY) {
					var R = this.Renderer;
					R.save();
					R.transform(dScale, 0, 0, dScale, dShiftX, dShiftY);
					this.deltaScale = dScale;
					this.deltaShiftX = dShiftX;
					this.deltaShiftY = dShiftY;
					this.clearScreen();
					R.save();
					this.initCT();
					this.drawMessage();
					R.restore();
					this.drawDomain();
					R.restore();
				},
				recordDeltaTransform : function() {
					var S = this.settings;
					S.viewPortShiftX = S.viewPortScale * this.deltaShiftX + S.viewPortShiftX;
					S.viewPortShiftY = S.viewPortScale * this.deltaShiftY + S.viewPortShiftY;
					S.viewPortScale = S.viewPortScale * this.deltaScale;
				},
				applyInputStrokeStyle : function(scale) {
					var R = this.Renderer, S = this.settings;
					R.strokeStyle = S.inputStrokeStyle;
					R.lineWidth = S.inputStrokeWidth / scale;
				},
				applyGridStyle : function(scale) {
					var R = this.Renderer, S = this.settings;
					R.strokeStyle = S.gridLineStyle;
					R.lineWidth = S.gridLineWidth / scale;
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
					var R = this.Renderer;
					R.save();
					this.initCT();
					R.fillStyle = this.settings.canvasBgColor;
					R.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
					R.restore();
				},
				drawObjectStore : function(store, fn) {
					var i, args = Array.prototype.slice.call(arguments, 2);
					store.each(function(e) {
						e[fn].apply(e, args);
					});
				},
				drawMessage : function() {
					var R = this.Renderer, //
					S = this.settings, //
					l = this.logs, //
					len = l.length;
					if(len > 0) {
						var m = l[len - 1]
						R.save();
						R.font = S.messageTextFont;
						R.fillStyle = S.messageTextFillStye;
						R.transform(1, 0, 0, -1, 0, 0);
						R.fillText(m, S.messageBoxPositionX, -S.messageBoxPositionY);
						R.restore();
					}
				},
				drawDomain : function() {
					var R = this.Renderer, //
					S = this.settings, //
					vps = S.viewPortScale, //
					dfs = S.deformationScale, //
					draw = this.drawObjectStore, //
					domain = this.Domain, //
					nodes = domain.theNodes, //
					eles = domain.theElements;

					if(S.showGrid) {
						var c1 = this.getCanvasCoordFromViewPort({
							X : 0,
							Y : 0
						}), c2 = this.getCanvasCoordFromViewPort({
							X : this.canvasWidth,
							Y : this.canvasHeight
						});
						this.applyGridStyle(vps);
						R.drawGrid(S.grid, S.grid, c1.X, c2.X, c1.Y, c2.Y);
					}
					draw(eles, "display", R, vps);
					draw(domain.theSPCs, "display", R, vps);
					draw(domain.thePatterns[1].Loads, "display", R, vps);
					draw(nodes, "display", R, vps);

					if(this.Domain.deformationAvailable && S.showDeformation) {
						draw(eles, "displayDeformation", R, vps, dfs, S.deformationResolution);
						draw(nodes, "displayDeformation", R, vps, dfs);
					}
					if(this.Domain.deformationAvailable && S.showMoment) {
						draw(eles, "displayMoment", R, vps, S.momentScale, S.momentResolution);
					}
				},
				refresh : function() {
					this.clearScreen();
					this.initCT();
					this.drawMessage();
					this.applyViewPortTransform();
					this.drawDomain();
				},
				onOrientationchange : function() {
					this.setCanvasPosition(0, this.topBar.getHeight(), this.mainView.getWidth(), this.mainView.getHeight() - this.topBar.getHeight() - this.bottomBar.getHeight());
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
					// console.log("touch start!",e)
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					this.touchCurrentX = P.X;
					this.touchCurrentY = P.Y;
					this.touchStartX = P.X;
					this.touchStartY = P.Y;
					this.shiftKey = e.event.shiftKey;
					if(this.settings.mode === "move") {
						if((e.event.type === "mousedown" && e.event.button == 1) || e.event.shiftKey) {

						} else {
							this.settings.touchMoveAnimation = true;
							this.animate(function() {
								return this.settings.touchMoveAnimation;
							}, function() {
								if(this.settings.autoAnalysis) {
									this.reanalyze(function() {
										this.refresh();
									});
								} else {
									this.refresh();
								}
							}, 1000 / this.settings.touchMoveFps)

						}
					} else {
						this.inputStrokes = [];
						this.inputStrokes.push(P);
					}
				},
				onTouchMove : function(e, el, obj) {
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					if(e.event.type === "mousemove" && (e.event.button == 1 || e.event.shiftKey)) {
						this.deltaTransform(1, P.X - this.touchStartX, P.Y - this.touchStartY);
					} else {
						if(this.settings.mode === "move" && this.settings.touchMoveAnimation === true) {
							this.Domain["moveSelectedNodes"]({
								"dx" : P.X - this.touchCurrentX,
								"dy" : P.Y - this.touchCurrentY
							});
						} else {
							this.inputStrokes.push(P);
							var l = this.inputStrokes.length;
							this.applyInputStrokeStyle(this.settings.viewPortScale);
							this.Renderer.drawLine(this.inputStrokes[l - 2], this.inputStrokes[l - 1]);
						}
					}
					this.touchCurrentX = P.X;
					this.touchCurrentY = P.Y;
				},
				onTouchEnd : function(e, el, obj) {
					if(this.settings.mode === "move") {
						this.settings.touchMoveAnimation = false;
					}
					if((e.event.type === "mouseup" && e.event.button == 1) || (e.event.type === "mouseup" && this.shiftKey)) {
						this.recordDeltaTransform();
						this.refresh();
					} else if(e.touches.length === 0 || e.touches.length === 1) {
						this.oneStrokeHandler();
					}
					this.inputStrokes = [];
					this.shiftKey = e.event.shiftKey;
				},
				onPinchStart : function(e, el, obj) {
					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					});
					this.pinchCenter0 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
				},
				onPinch : function(e, el, obj) {
					if(!$D.isDefined(e.touches[0]) || !$D.isDefined(e.touches[1])) {
						return;
					}
					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					}), s = e.scale, S = this.settings;
					this.pinchCenter1 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
					if (S.viewPortScale * s < S.maxViewPortScale && S.viewPortScale * s > S.minViewPortScale){
						this.deltaTransform(s, this.pinchCenter1.X - this.pinchCenter0.X * s, this.pinchCenter1.Y - this.pinchCenter0.Y * s);
					} else if (S.viewPortScale * s >= S.maxViewPortScale){
						alert("max scale reached");
					} else{
						alert("min scale reached");
					}
				},
				onMouseWheel : function(event) {
					// console.log("event",event)
					var e = event.browserEvent, //
					S = this.settings, //
					s = Math.pow(Math.E, e.wheelDelta * S.mouseWheelSpeedFactor / S.mouseWheelSpeedBase), //
					P = this.getCanvasCoordFromPage({
						X : e.pageX,
						Y : e.pageY
					});
					
					if (S.viewPortScale * s < S.maxViewPortScale && S.viewPortScale * s > S.minViewPortScale){
						S.viewPortShiftX = S.viewPortScale * P.X * (1 - s) + S.viewPortShiftX;
						S.viewPortShiftY = S.viewPortScale * P.Y * (1 - s) + S.viewPortShiftY;
						S.viewPortScale = S.viewPortScale * s;
					} else if (S.viewPortScale * s >= S.maxViewPortScale){
						alert("max scale reached");
					} else{
						alert("min scale reached");
					}
					
					this.refresh();
				},
				onPinchEnd : function() {
					this.recordDeltaTransform();
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
				saveScript : function() {
					alert(this.Domain.runStaticConstant(this.settings.modelScale, this.settings.loadScale));
				},
				reanalyze : function(fn) {
					var args = Array.prototype.slice.call(arguments, 1), flag = false;
					if(this.Domain.isReadyToRun()) {
						if(this.settings.showMoment || this.settings.showDeformation) {
							$D.ajaxPost({
								url : "/cgi-bin/lge/sketchit-server/test/sketchit.ops",
								scope : this,
								data : this.Domain.runStaticConstant(this.settings.showDeformation, this.settings.showMoment),
								success : function(result) {
									this.Domain.loadResultData(result.responseText);
									this.Domain.set("deformationAvailable", true);
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
								},
							});
							flag = true;
						}
					} else {
						this.Domain.set("deformationAvailable", false);
					}
					if($D.isDefined(fn) && !flag) {
						fn.apply(this, args);
					}
				},
				oneStrokeHandler : function() {
					var undo = true, changed = false, msg = "", S = this.settings, action;
					switch (this.settings.mode) {

						case "draw":
						case "load":
							var recognizeResult = this.shapeRecognizer.Recognize(this.inputStrokes, false), //
							obj = this.oneStrokeVocabulary[this.settings.mode][recognizeResult.name];
							if($D.isDefined(obj)) {
								console.log("obj: ", obj, " recognize result ", recognizeResult);
								if($D.isFunction(obj)) {
									obj = obj.call(this);
								}
								if($D.isObject(obj)) {
									undo = obj.undo;
									action = obj.command;
									changed = this.Domain[action](obj.argsGen.call(this, recognizeResult.data));
								} else {
									undo = "NA";
									action = "no found";
								}
								msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:" + undo;
							}
							break;
						case "select":
							var recognizeResult = this.shapeRecognizer.Recognize(this.inputStrokes, false), //
							d = $D.distance(recognizeResult.data.from, recognizeResult.data.to), //
							l = recognizeResult.data.PathLength, action;
							if(d / l > this.settings.circleSelectThreshold) {
								action = "intersectSelect";
								changed = this.Domain["intersectSelect"]({
									"curve" : recognizeResult.data.ResamplePoints
								});
							} else {
								if(l >= this.settings.clickSelectThreshold) {
									action = "circleSelect";
									changed = this.Domain["circleSelect"]({
										"poly" : recognizeResult.data.ResamplePoints
									});
								}
							}
							undo = true;
							msg = "mode: " + S.mode + "; shape: " + recognizeResult.name + "; actioin:" + action + " ;undoable:" + undo;
							break;
						case "move":
							changed = this.Domain["jumpMoveSelectedNodes"]({
								"dx" : this.touchCurrentX - this.touchStartX,
								"dy" : this.touchCurrentY - this.touchStartY,
							});
							action = "moveSelectedComponent";
							undo = true;
							msg = "mode: " + S.mode + "; actioin:" + action + " ;undoable:" + undo;

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
								if(settings.SPCSnapToLine) {
									result.lT = settings.SPCSnapToLineThreshold;
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
								result.nT = settings.loadSnapToNodeThreshold;
								result.lT = settings.loadSnapToLineThreshold;
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
