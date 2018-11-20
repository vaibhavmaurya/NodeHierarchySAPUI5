sap.ui.define("iot/ma/iot/tree", ["sap/ui/thirdparty/d3"], function (d3Object) {

	var oTree = sap.ui.core.Control.extend("iot.ma.iot.tree", {

		metadata: { // the Control API
			properties: {
				"duration": {
					type: "int",
					defaultValue: 750
				}, // setter and getter are created behind the scenes,
				"nodeRadius": {
					type: "int",
					defaultValue: 6.5
				},
				"nodeColorWithChildren": {
					type: "string",
					defaultValue: "lightsteelblue"
				},
				"nodeColorWithoutChildren": {
					type: "string",
					defaultValue: "#fff"
				}
				// including data binding and type validation
			},
			events:{
			"openNodeMenu":{}
		}
		},
		init: function () {
			this._oControlSettings = {
				"attributes": {
					"circle": {
						"events": {
							"mouseover": [{
								key: "r",
								val: 7.5
							}, ],
							"mouseout": [{
								key: "r",
								val: this.getNodeRadius()
							}, ]
						}
					}
				},
				"styles": {
					"circle": {
						"events": {
							"mouseover": [{
								key: "stroke",
								val: "black"
							}, {
								key: "stroke-width",
								val: "3px"
							}],
							"mouseout": [{
								key: "stroke",
								val: "steelblue"
							}, {
								key: "stroke-width",
								val: "2px"
							}]
						}
					}
				}
			};
		},

		setData: function (oData) {
			"use strict";
			var oTreeContainer = $(".iot-treeContainer");
			this._oTreeData = oData;
			this._oBaseSvg = null;
			this.oMargin = {
				top: 20,
				right: 50,
				bottom: 20,
				left: 100
			};
			this._oBaseSvg = d3Object.select(".iot-treeContainer").append("svg")
				.attr("viewBox", "0 0 " + oTreeContainer.width() + " " + 1000)
				.attr("preserveAspectRatio", "xMidYMid meet");
			// .attr("width", viewerWidth)
			// .attr("height", viewerHeight)
			// .attr("class", "overlay")
			// .call(zoomListener);

			this._oSvgGroup = this._oBaseSvg.append("g")
				.attr("transform", "translate(" + this.oMargin.left + "," + this.oMargin.top + ")");

			var oSVGElement = $("svg");
			this._oTree = d3Object.layout.tree()
				.size([oSVGElement.height(), oSVGElement.width()]);
			// this._oTreeData.x0 = (oSVGElement.height() / 2) - 200;
			this._oTreeData.x0 = 0;
			this._oTreeData.y0 = 0;
			this.update(this._oTreeData);
			// d3Object.json("/webapp/model/data.json", fnCallback.bind(this));			
		},

		renderer: function (oRm, oControl) { // the part creating the HTML
			// instead of "this" in the renderer function
			oRm.write("<div class='iot-treeContainer'");
			oRm.writeControlData(oControl); // writes the Control ID and enables event handling - important!
			oRm.writeClasses(); // there is no class to write, but this enables
			// support for ColorBoxContainer.addStyleClass(...)
			oRm.write(">");

			// var aChildren = oControl.getContent();
			// for (var i = 0; i < aChildren.length; i++) { // loop over all child Controls,
			// 	// render the colored box around them
			// 	oRm.write("<div");
			// 	oRm.addStyle("display", "inline-block");
			// 	oRm.addStyle("border", "3px solid " + oControl.getBoxColor()); // specify the border around the child
			// 	oRm.writeStyles();
			// 	oRm.write(">");

			// 	oRm.renderControl(aChildren[i]); // render the child Control
			// 	// (could even be a big Control tree, but you don't need to care)

			// 	oRm.write("</div>"); // end of the box around the respective child
			// }

			oRm.write("</div>"); // end of the complete Control
		},

		onAfterRendering: function () {

		},

		fnClick: function (d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
			} else {
				d.children = d._children;
				d._children = null;
			}
			this.update(d);
		},

		_registerNodeEnter: function (oNode, oSource) {
			var iCircleRadius = this.getNodeRadius();
			var sNodeColorWithChildren = this.getNodeColorWithChildren();
			var sNodeColorWithoutChildren = this.getNodeColorWithoutChildren();
			var self = this;
			var oEventAttributes = this._oControlSettings.attributes.circle.events;
			var oEventStyles = this._oControlSettings.styles.circle.events;
			// Enter any new nodes at the parent's previous position.
			var oNodeEnter = oNode.enter().append("g")
				.attr("class", "iot-node")
				.attr("transform", function (d) {
					return "translate(" + oSource.y0 + "," + oSource.x0 + ")";
				})
				.on('click', self.fnClick.bind(self));

			var fnEventBasedNodeAttrAndStyling = function (oMe, aList, method) {
				aList.forEach(function (o) {
					oMe[method](o.key, o.val);
				});
			};

			oNodeEnter.append("circle")
				// .attr('class', 'nodeCircle')
				.attr("r", iCircleRadius)
				.style("fill", function (d) {
					return d._children ? sNodeColorWithChildren : sNodeColorWithoutChildren;
				})
				.on('contextmenu', function (o) {
					d3Object.event.preventDefault();
					self.fireOpenNodeMenu({node:this,nodeData:o});
				})
				.on('mouseover', function (d) {
					var oMe = d3Object.select(this);
					fnEventBasedNodeAttrAndStyling(oMe,oEventAttributes.mouseover,"attr");
					fnEventBasedNodeAttrAndStyling(oMe,oEventStyles.mouseover,"style");
				})
				.on('mouseout', function (d) {
					var oMe = d3Object.select(this);
					fnEventBasedNodeAttrAndStyling(oMe,oEventAttributes.mouseout,"attr");
					fnEventBasedNodeAttrAndStyling(oMe,oEventStyles.mouseout,"style");
				});

			oNodeEnter.append("text")
				.attr("x", function (d) {
					return d.children || d._children ? -10 : 10;
				})
				.attr("dy", ".35em")
				// .attr('class', 'nodeText')
				.attr("text-anchor", function (d) {
					return d.children || d._children ? "end" : "start";
				})
				.text(function (d) {
					return d.name;
				})
				.style("fill-opacity", 0);

		},

		_registerNodeUpdate: function (oNode) {
			// Transition nodes to their new position.
			var iDuration = this.getDuration();
			var iCircleRadius = this.getNodeRadius();
			var sNodeColorWithChildren = this.getNodeColorWithChildren();
			var sNodeColorWithoutChildren = this.getNodeColorWithoutChildren();
			var oNodeUpdate = oNode.transition()
				.duration(iDuration)
				.attr("transform", function (d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

			// Fade the text in
			oNodeUpdate.select("text")
				.style("fill-opacity", 1);

			oNodeUpdate.select("circle")
				.attr("r", iCircleRadius)
				.style("fill", function (d) {
					return d._children ? sNodeColorWithChildren : sNodeColorWithoutChildren;
				});
		},

		_registerNodeExit: function (oNode, oSource) {
			// Transition exiting nodes to the parent's new position.
			var iDuration = this.getDuration();
			var oNodeExit = oNode.exit().transition()
				.duration(iDuration)
				.attr("transform", function (d) {
					return "translate(" + oSource.y + "," + oSource.x + ")";
				})
				.remove();

			oNodeExit.select("circle")
				.attr("r", 0);

			oNodeExit.select("text")
				.style("fill-opacity", 0);
		},

		_registerLink: function (oLink, oSource) {
			// Enter any new links at the parent's previous position.
			var iDuration = this.getDuration();
			var oDiagonal = d3Object.svg.diagonal()
				.projection(function (d) {
					return [d.y, d.x];
				});
			oLink.enter().insert("path", "g")
				.attr("class", "iot-link")
				.attr("d", function (d) {
					var o = {
						x: oSource.x0,
						y: oSource.y0
					};
					return oDiagonal({
						source: o,
						target: o
					});
				});
			// Transition links to their new position.
			oLink.transition()
				.duration(iDuration)
				.attr("d", oDiagonal);

			// Transition exiting nodes to the parent's new position.
			oLink.exit().transition()
				.duration(iDuration)
				.attr("d", function (d) {
					var o = {
						x: oSource.x,
						y: oSource.y
					};
					return oDiagonal({
						source: o,
						target: o
					});
				})
				.remove();
		},
		
		_openPopupMenu : function(){
			
		},
		
		

		update: function (source) {
			// Compute the new height, function counts total children of this._oTreeData node and sets tree height accordingly.
			// This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
			// This makes the layout more consistent.
			var levelWidth = [1];
			var viewerWidth = $("svg").width() - this.oMargin.right - this.oMargin.left;
			var viewerHeight = $("svg").height() - this.oMargin.bottom - this.oMargin.top;
			var i = 0;
			var childCount = function (level, n) {

				if (n.children && n.children.length > 0) {
					if (levelWidth.length <= level + 1) levelWidth.push(0);

					levelWidth[level + 1] += n.children.length;
					n.children.forEach(function (d) {
						childCount(level + 1, d);
					});
				}
			};
			childCount(0, this._oTreeData);
			var newHeight = d3Object.max(levelWidth) * 20; // 20 pixels per line  
			// tree = tree.size([newHeight, viewerWidth]);
			this._oTree.size([newHeight > viewerHeight ? newHeight : viewerHeight, viewerWidth]);
			// Compute the new tree layout.
			var nodes = this._oTree.nodes(this._oTreeData).reverse();
			var aLinks = this._oTree.links(nodes);
			// links = this._oTree.links(nodes);

			// Set widths between levels based on maxLabelLength.
			nodes.forEach(function (d) {
				// d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
				// alternatively to keep a fixed scale one can set a fixed depth per level
				// Normalize for fixed-depth by commenting out below line
				d.y = (d.depth * 200); //500px per level.
			});

			// Update the nodes…
			var node = this._oSvgGroup.selectAll("g.iot-node")
				.data(nodes, function (d) {
					i += 1;
					return d.id || (d.id = i);
				});
			// Update the links…
			var oLink = this._oSvgGroup.selectAll("path.iot-link")
				.data(aLinks, function (d) {
					return d.target.id;
				});

			this._registerNodeEnter(node, source);

			// phantom node to give us mouseover in a radius around it
			// nodeEnter.append("circle")
			// 	.attr('class', 'ghostCircle')
			// 	.attr("r", 30)
			// 	.attr("opacity", 0.2) // change this to zero to hide the target area
			// 	.style("fill", "red")
			// 	.attr('pointer-events', 'mouseover')
			// 	.on("mouseover", function (node) {
			// 		overCircle(node);
			// 	})
			// 	.on("mouseout", function (node) {
			// 		outCircle(node);
			// 	});

			// // Update the text to reflect whether node has children or not.
			// node.select('text')
			// 	.attr("x", function (d) {
			// 		return d.children || d._children ? -10 : 10;
			// 	})
			// 	.attr("text-anchor", function (d) {
			// 		return d.children || d._children ? "end" : "start";
			// 	})
			// 	.text(function (d) {
			// 		return d.name;
			// 	});

			// // Change the circle fill depending on whether it has children and is collapsed
			// node.select("circle.nodeCircle")
			// 	.attr("r", iCircleRadius)
			// 	.style("fill", function (d) {
			// 		return d._children ? sNodeColorWithChildren : sNodeColorWithoutChildren;
			// 	});

			// Transition nodes to their new position.
			this._registerNodeUpdate(node);

			// Transition exiting nodes to the parent's new position.
			this._registerNodeExit(node, source);

			// update links
			this._registerLink(oLink, source);
			// Stash the old positions for transition.
			nodes.forEach(function (d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}

	});
	return oTree;

});