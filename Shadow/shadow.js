/*
Dojox.gfx Shadow plugin v2.0
Copyright (c) 2011, Stela 5

Dual-licensed:
   - MIT: http://www.opensource.org/licenses/mit-license.php
   - GPL v2 (or later): http://www.opensource.org/licenses/GPL-2.0
*/

"use strict";	// ES5 Strict
require(["dojox/gfx", "dojox/gfx/shape"],
    function(g, shape){

	if(!g.renderer) return this;

	switch(g.renderer){

		case "svg":
			shape.Shape.prototype.setShadow = function(shadow){
				//	summary:
				//		sets a shadow effect (SVG) - see http://www.w3.org/TR/SVG/filters.html#AnExample
				//	shadow: Object
				//		dx: Integer - sets x-axis offset (default = 4)
				//		dy: Integer - sets y-axis offset (default = 4)
				// 		size: String - sets shadow size, can be float or "none" (default = 2.5)
				//		sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight),
				//					 "pixelRadius" (from VML) (default = "stdDeviation")
				//		color: Array|String|Object (dojo.Color) - sets shadow color (default = [0,0,0,0.5])

				if (!shadow) shadow = {"dx":4,"dy":4,"size":"2.5","sizeType":"stdDeviation","color":[0,0,0,0.5]};
				if (!shadow.dx || !parseInt(shadow.dx)) shadow.dx = 4;
				if (!shadow.dy || !parseInt(shadow.dy)) shadow.dy = 4;
				if (!shadow.size) shadow.size = "2.5";
				if (!shadow.sizeType) shadow.sizeType = "stdDeviation";
				if (!shadow.color) shadow.color = [0,0,0,0.5];
				if (shadow.size == "none"){
					// remove shadow
					if (this.rawNode.getAttribute("filter")){
						var rawNodeFilter = this.rawNode.getAttribute("filter");
						this._getParentSurface().defNode.removeChild(g.svg.getRef(rawNodeFilter));
						this.rawNode.removeAttribute("filter");
					}
				} else if (parseFloat(shadow.size)){
					// add shadow
					var size = parseFloat(shadow.size);
					if (shadow.sizeType == "radius") size = (size / 3.0);
        		                var svgns = g.svg.xmlns.svg,
        		                	surface = this._getParentSurface(),
        		                	defNode = surface.defNode;
					var filterNode = _createElementNS(svgns, "filter");
					filterNode.setAttribute("id", g._base._getUniqueId());
					filterNode.setAttribute("filterUnits", "objectBoundingBox");
					filterNode.setAttribute("x", "-100%");
					filterNode.setAttribute("y", "-100%");
					filterNode.setAttribute("width", "300%");
					filterNode.setAttribute("height", "400%");
					var blurFilter = _createElementNS(svgns, "feGaussianBlur");
					blurFilter.setAttribute("in", "SourceAlpha");
        		                blurFilter.setAttribute("stdDeviation", size);
        		                blurFilter.setAttribute("result", "InitialBlur");
					var offsetFilter = _createElementNS(svgns, "feOffset");
					offsetFilter.setAttribute("in", "InitialBlur");
					offsetFilter.setAttribute("dx", parseInt(shadow.dx));
					offsetFilter.setAttribute("dy", parseInt(shadow.dy));
        		                offsetFilter.setAttribute("result", "FinalBlur");
					var colorFilter = _createElementNS(svgns, "feColorMatrix");
					var color = g.normalizeColor(shadow.color);
					var Ra = "0 0 0 " + (color.r / 255) + " 0 ",
						Ga = "0 0 0 " + (color.g / 255) + " 0 ",
						Ba = "0 0 0 " + (color.b / 255) + " 0 ",
						Aa = "0 0 0 " + color.a + " 0";
					var colorMatrix = Ra + Ga + Ba + Aa;
					colorFilter.setAttribute("in", "FinalBlur");
					colorFilter.setAttribute("type", "matrix");
					colorFilter.setAttribute("values", colorMatrix);
					colorFilter.setAttribute("result", "FinalShadow");
					var mergeFilter = _createElementNS(svgns, "feMerge");
					var mergeNodeBlur = _createElementNS(svgns, "feMergeNode");
					mergeNodeBlur.setAttribute("in", "FinalShadow");
					var mergeNodeShape = _createElementNS(svgns, "feMergeNode");
					mergeNodeShape.setAttribute("in", "SourceGraphic");
					mergeFilter.appendChild(mergeNodeBlur);
					mergeFilter.appendChild(mergeNodeShape);
        		                filterNode.appendChild(blurFilter);
        		                filterNode.appendChild(offsetFilter);
        		                filterNode.appendChild(colorFilter);
        		                filterNode.appendChild(mergeFilter);
					defNode.appendChild(filterNode);
        		        	surface.rawNode.appendChild(defNode);
        		        	this.rawNode.setAttribute("filter", "url(#" + filterNode.getAttribute("id") +")");
				}
        		        return this;
			};
			break;

		case "silverlight":
			shape.Shape.prototype.setShadow = function(shadow){
				//	summary:
				//		sets a shadow effect (Silverlight) - see http://msdn.microsoft.com/en-us/library/system.windows.media.effects.dropshadoweffect(VS.96).aspx
				//	shadow: Object
				//		dx: Integer - sets x-axis offset (default = 4)
				//		dy: Integer - sets y-axis offset (default = 4)
				// 		size: String - sets shadow size, can be float or "none" (default = 2.5)
				//		sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight),
				//					 "pixelRadius" (from VML) (default = "stdDeviation")
				//		color: Array|String|Object (dojo.Color) - sets shadow color (default = [0,0,0,0.5])
				//
				//	notes:	Requires Silverlight 3 or higher
				//		Silverlight nodes only support a maximum of one effect
				//		(TODO: add additional effects to a Border node with background="no brush")

				if (!shadow) shadow = {"dx":4,"dy":4,"size":"2.5","sizeType":"stdDeviation","color":[0,0,0,0.5]};
				if (!shadow.dx || !parseInt(shadow.dx)) shadow.dx = 4;
				if (!shadow.dy || !parseInt(shadow.dy)) shadow.dy = 4;
				if (!shadow.size) shadow.size = "2.5";
				if (!shadow.sizeType) shadow.sizeType = "stdDeviation";
				if (!shadow.color) shadow.color = [0,0,0,0.5];
				if (shadow.size == "none"){
					// remove shadow
					this.rawNode.effect = null;
				} else if (parseFloat(shadow.size)){
					// add shadow
					var size = parseFloat(shadow.size);
					if (shadow.sizeType != "radius") size = (size * 3.0);
					var color = dojox.gfx.normalizeColor(shadow.color);
					var orientation = _convertOffset(shadow.dx,shadow.dy);
					var xamlFragment = "<DropShadowEffect Color='" + color.toHex() + 
						"' Direction='" + orientation.direction + "' ShadowDepth='" + orientation.depth + 
						"' BlurRadius='" + size + "' Opacity='" + color.a + "'/>";
					var shadowEffect = this.rawNode.getHost().content.createFromXaml(xamlFragment);
					this.rawNode.effect = shadowEffect;
				}
                		return this;
        		};
			break;

		case "vml":
			shape.Shape.prototype.setShadow = function(shadow){
				//	summary:
				//		sets a shadow effect (VML) - see http://msdn.microsoft.com/en-us/library/bb229490(VS.85).aspx
				//	shadow: Object
				//		dx: Integer - sets x-axis offset (default = 4)
				//		dy: Integer - sets y-axis offset (default = 4)
				// 		size: String - sets shadow size, can be float or "none" (default = 2.5)
				//		sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight),
				//					 "pixelRadius" (from VML) (default = "stdDeviation")
				//		color: Array|String|Object (dojo.Color) - sets shadow color (default = [0,0,0,0.5])
				//
				//	note: VML shadow does not support blur

				if (!shadow) shadow = {"dx":4,"dy":4,"size":"2.5","sizeType":"stdDeviation","color":[0,0,0,0.5]};
				if (!shadow.dx || !parseInt(shadow.dx)) shadow.dx = 4;
				if (!shadow.dy || !parseInt(shadow.dy)) shadow.dy = 4;
				if (!shadow.size) shadow.size = "2.5";
				if (!shadow.sizeType) shadow.sizeType = "stdDeviation";
				if (!shadow.color) shadow.color = [0,0,0,0.5];
				if (shadow.size == "none"){
					// remove shadow
					this.rawNode.shadow.on = "False";
				} else if (parseFloat(shadow.size)){
					// add shadow
					var size = parseFloat(shadow.size);
					var color = dojox.gfx.normalizeColor(shadow.color);
					this.rawNode.shadow.offset = parseInt(shadow.dx) + "pt," + parseInt(shadow.dy) + "pt";
					this.rawNode.shadow.color = color.toHex();
					this.rawNode.shadow.opacity = color.a;
					this.rawNode.shadow.on = "True";				
				}
                		return this;
                	};
			break;

		case "canvas":
		case "canvasWithEvents":
			shape.Shape.prototype.setShadow = function(shadow){
				//	summary:
				//		sets a shadow effect (Canvas) - see http://www.w3.org/TR/2dcontext/#shadows
				//	shadow: Object
				//		dx: Integer - sets x-axis offset (default = 4)
				//		dy: Integer - sets y-axis offset (default = 4)
				// 		size: String - sets shadow size, can be float or "none" (default = 2.5)
				//		sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight),
				//					 "pixelRadius" (from VML) (default = "stdDeviation")
				//		color: Array|String|Object (dojo.Color) - sets shadow color (default = [0,0,0,0.5])

				if (!shadow) shadow = {"dx":4,"dy":4,"size":"2.5","sizeType":"stdDeviation","color":[0,0,0,0.5]};
				if (!shadow.dx || !parseInt(shadow.dx)) shadow.dx = 4;
				if (!shadow.dy || !parseInt(shadow.dy)) shadow.dy = 4;
				if (!shadow.size) shadow.size = "2.5";
				if (!shadow.sizeType) shadow.sizeType = "stdDeviation";
				if (!shadow.color) shadow.color = [0,0,0,0.5];
				if (shadow.size == "none"){
					// remove shadow
					ctx.shadowColor = "rgba(0,0,0,0)";
				} else if (parseFloat(shadow.size)){
					// add shadow
					var size = parseFloat(shadow.size);
					var color = dojox.gfx.normalizeColor(shadow.color);
					var ctx = this.surface.rawNode.getContext("2d");
					var f = this.fillStyle;
					if (shadow.sizeType == "radius") size = (size / 3.0);
					ctx.shadowOffsetX = parseInt(shadow.dx);
					ctx.shadowOffsetY = parseInt(shadow.dy);
					ctx.shadowBlur    = size.toString();
					ctx.shadowColor   = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
					// TODO: fix shadow stroke displaying through shape in Canvas renderer
				}
	        		return this;
			};
			break;

		default:
			shape.Shape.prototype.setShadow = function(shadow){
				return this;
			};
	}

	var _createElementNS = function(ns, nodeType){
		// summary:
		//	Internal helper to deal with creating elements that
		//	are namespaced.  Mainly to get SVG markup output
		//	working on IE.
		if(dojo.doc.createElementNS){
			return dojo.doc.createElementNS(ns,nodeType);
		}else{
			return dojo.doc.createElement(nodeType);
		}
	}

	var _convertOffset = function(xOffset, yOffset){
		// summary:
		//	Internal helper to deal with Silverlight needing 
		//	direction and depth (thanks, Kor!)
		var x1=4, y1=4, x2=0, y2=0;
		if (parseInt(xOffset) && parseInt(yOffset) && !(parseInt(xOffset)==0 && parseInt(yOffset)== 0)) {
			x1 = parseInt(xOffset);
			y1 = parseInt(yOffset);
		}
		var X=x1-x2;
		var Y=y2-y1;
		var Z=Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2)));	// depth
		var r=Math.atan2(Y,X);	// angle (in radians)
		var d=r*180/Math.PI	// direction (in degrees)
		d<0?d+=Math.PI*2:null;	// correction for "negative" quadrants
		return {"direction":d, "depth":Z};
	}

});

