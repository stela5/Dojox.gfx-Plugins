# Dojox.gfx Plugins

Dojox.gfx Plugins are a collection of effects that are designed to work with <a href="http://www.dojotoolkit.org/reference-guide/dojox/gfx.html">dojox.gfx</a> (version 1.7 or higher).

## Installation

1. If you will be using the canvas renderer, update the _render function in dojox/gfx/canvas.js (or extend using g.canvas.Shape.prototype._render):

```javascript
_render = function(/* Object */ ctx){
	// summary: render the shape
	ctx.save();
	// process effect, if exists
	if (this._gfxEffect && this.getUID() in this._gfxEffect) {
		var effect = this._gfxEffect[this.getUID()];
		if (effect && effect.type && effect.type == "shadow") {
			ctx.shadowOffsetX = parseFloat(effect.dx);
			ctx.shadowOffsetY = parseFloat(effect.dy);
			ctx.shadowBlur    = parseFloat(effect.size);
			var color = g.normalizeColor(effect.color);
			ctx.shadowColor   = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
		}
	}
	this._renderTransform(ctx);
	this._renderShape(ctx);
	this._renderFill(ctx, true);
	this._renderStroke(ctx, true);
	ctx.restore();
};
```

2. See the examples for usage.

## Usage

    blur: Object
        size: String - can be float or "none" (default = 2.5)
        sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight), "pixelRadius" (from VML) (default = "stdDeviation")

    shadow: Object
        dx: Integer - sets x-axis offset (default = 4)
        dy: Integer - sets y-axis offset (default = 4)
        size: String - sets shadow size, can be float or "none" (default = 2.5)
        sizeType: String - can be "stdDeviation" (from SVG), "radius" (from Silverlight), "pixelRadius" (from VML) (default = "stdDeviation")
        color: Array|String|Object (dojo.Color) - sets shadow color (default = [0,0,0,0.5])

## FAQ

**Q:** Why does the blur effect not work with the Canvas renderer?  
**A:** Canvas doesn't support a stand-alone blur effect.

**Q:** Why doesn't my Silverlight blur work?  
**A:** Silverlight version 3 or higher is required for blur.

**Q:** Why doesn't my Silverlight object show multiple effects?  
**A:** Silverlight currently only supports one effect per object.

**Q:** Why doesn't the blur effect work in Safari?  
**A:** Safari doesn't currently implement feGaussianBlur properly.  Use WebKit nightly instead.

**Q:** Why does the shadow sometimes appear through the original object using the Canvas renderer?  
**A:** Good question.  Setting globalCompositeOperation="lighter" helps a little but I'm sure there's a better answer.

## Dual-Licensed

Copyright (c) 2011, <a href="http://stela5.com/">Stela 5</a>

* <a href="http://www.opensource.org/licenses/mit-license.php">MIT</a>
* <a href="http://www.opensource.org/licenses/GPL-2.0">GPL v2 (or later)</a>

