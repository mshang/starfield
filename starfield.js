/* vim: set softtabstop=2 shiftwidth=2 expandtab: */

// -- settings, immutable -- //
var BRIGHTNESS_FACTOR = 15; // Higher = brighter
var STAR_SIZE_PIXELS = 1.5;
var STAR_RANGE_INDICES = 10; // Higher = more random looking, comp expensive
var LEVEL_DEPTH = 5; // Higher = more (faint) stars, comp expensive

// TODO:
// - touchscreen support
// - resize / fullscreen
// - older browsers / polyfill

var MAX_INT = -1 >>> 1;

// -- zoom and pan, altered by listeners -- //
var offsetX = 0; // Top left has this x coordinate in world frame.
var offsetY = 0;
// scale of 1 means 1 world unit = 1 canvas pixel
// scale of 100 means 1 world unit = 100 canvas pixels
var scale = 1;

var canvas = document.getElementById("starfield");
canvas.style['background-color'] = 'black';
var context = canvas.getContext('2d');

var timestamps = [];

function hashFnv32a(str) {
  var i, l,
    hval = 0x811c9dc5;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) +
      (hval << 24);
  }
  return hval >> 0;
}

var cache = new RRCache(100000);
function cachedHash(to_hash) {
  var cached = cache.get(to_hash);
  if (cached) return cached; else {
    var digest = [
      hashFnv32a(to_hash + 'a'),
      hashFnv32a(to_hash + 'b'),
      hashFnv32a(to_hash + 'c')
    ];
    cache.set(to_hash, digest);
    return digest;
  }
}

function render() {
  var worldWidth = canvas.width / scale;
  var worldHeight = canvas.height / scale;

  // The level at which you would expect one star in current viewport.
  var levelForCurrentScale = - Math.log(worldWidth * worldHeight) / 2
  var startLevel = Math.floor(levelForCurrentScale);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // setting fillStyle is expensive, so quantize and batch it.
  var brightnessToWorldPositions = [];
  for (var i = 0; i < 100; i++) brightnessToWorldPositions.push([]);

  for (level = startLevel; level < startLevel + LEVEL_DEPTH; level++) {
    var spacing = Math.exp(-level);
    for (
      xIndex = Math.floor(offsetX / spacing) - STAR_RANGE_INDICES;
      xIndex <= Math.ceil((offsetX + worldWidth) / spacing)
        + STAR_RANGE_INDICES;
      xIndex++
    ) {
      for (
        yIndex = Math.floor(offsetY / spacing) - STAR_RANGE_INDICES;
        yIndex <= Math.ceil((offsetY + worldHeight) / spacing)
          + STAR_RANGE_INDICES;
        yIndex++
      ) {
        var hash = cachedHash(xIndex + ':' + yIndex + ':' + level);
        brightnessToWorldPositions[
          Math.floor(Math.max(0,
	    100 * Math.atan(
              (
                Math.exp(
                  levelForCurrentScale - level - Math.abs(hash[2] / MAX_INT)
                ) - Math.exp(
                  // This is to prevent the lowest level of stars from
                  // suddenly popping in and out with high brightness.
                  levelForCurrentScale - (startLevel + LEVEL_DEPTH)
                )
              ) * BRIGHTNESS_FACTOR
            ) * 2 / Math.PI
          ))
        ].push([
          xIndex * spacing
            + (hash[0] / MAX_INT) * spacing * STAR_RANGE_INDICES,
          yIndex * spacing
            + (hash[1] / MAX_INT) * spacing * STAR_RANGE_INDICES,
        ]);
      }
    }
  }

  for (i = 0; i < 100; i++) {
    context.fillStyle = 'rgba(255, 255, 255, ' + i / 100 + ')';
    var to_paint = brightnessToWorldPositions[i];
    for (var j = 0; j < to_paint.length; j++) {
      context.fillRect(
        (to_paint[j][0] - offsetX) * scale,
        (to_paint[j][1] - offsetY) * scale,
        STAR_SIZE_PIXELS,
        STAR_SIZE_PIXELS
      );
    }
  }

  timestamps.push(new Date().getTime());
  if (timestamps.length > 10) {
    console.log(
      (9 * 1000 / (timestamps[9] - timestamps[0])).toFixed(2) + ' fps'
    );
    timestamps = [];
  }
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
