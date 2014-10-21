To use this starfield generator in your own app, use `starfield.js` and its dependencies `Star.js`, `hashFnv32a.js`, and `rrcache.js`. `starfield.js` provides a function called `getStars`, which takes the following parameters:

1) `worldOffsetX`, the `x` position of the upper-left corner of the current viewport in the gameworld's coordinates.
2) `worldOffsetY`, the `y` position of the same.
3) `worldWidth`, the width of the current viewport in the gameworld's coordinates.
4) `worldHeight`, the height.

and returns an array of `Star` objects, which specify the positions of the stars in the gameworld's coordinates as well as their brightnesses, which range from `0` to `1`.

The remaining files in the project handle rendering to the canvas, browser events, and fullscreen. You can leave them out if your project already handles those tasks.

Here's a write-up about how the starfield generator works:

http://mshang.ca/2014/10/20/starfield.html
