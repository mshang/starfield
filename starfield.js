// -- settings, immutable -- //
var BRIGHTNESS_FACTOR = 10; // Higher = brighter
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

var cache = new RRCache(100000);
function cachedMD5(to_hash) {
  var cached = cache.get(to_hash);
  if (cached) return cached; else {
    var digest = SparkMD5.hash(to_hash, true);
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
        var hash = cachedMD5(xIndex + ':' + yIndex + ':' + level);
        var x = xIndex * spacing
          + (hash[0] / MAX_INT) * spacing * STAR_RANGE_INDICES;
        var y = yIndex * spacing
          + (hash[1] / MAX_INT) * spacing * STAR_RANGE_INDICES;
	var z = Math.atan(
          Math.exp(-level + (hash[2] / MAX_INT)) * BRIGHTNESS_FACTOR
            / Math.exp(-levelForCurrentScale)
        ) * 2 / Math.PI;
        context.fillStyle = 'rgba(255, 255, 255, ' + z + ')';
        context.fillRect(
          (x - offsetX) * scale,
          (y - offsetY) * scale,
          STAR_SIZE_PIXELS,
          STAR_SIZE_PIXELS
        );
      }
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
