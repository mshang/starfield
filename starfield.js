/* vim: set softtabstop=2 shiftwidth=2 expandtab: */

var getStars;

(function () {
  // -- settings, immutable -- //
  var BRIGHTNESS_FACTOR = 15; // Higher = brighter
  var STAR_RANGE_INDICES = 10; // Higher = more random looking, comp expensive
  var LEVEL_DEPTH = 5; // Higher = more (faint) stars, comp expensive

  // TODO:
  // - touchscreen support
  // - resize / fullscreen
  // - older browsers / polyfill

  var MAX_INT = -1 >>> 1;

  function Star(worldX, worldY, brightness) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.brightness = brightness;
  }

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

  function _getStars(worldOffsetX, worldOffsetY, worldWidth, worldHeight) {

    // The level at which you would expect one star in current viewport.
    var levelForCurrentScale = - Math.log(worldWidth * worldHeight) / 2
    var startLevel = Math.floor(levelForCurrentScale);
    var stars = [];

    for (level = startLevel; level < startLevel + LEVEL_DEPTH; level++) {
      var spacing = Math.exp(-level);
      for (
        xIndex = Math.floor(worldOffsetX / spacing) - STAR_RANGE_INDICES;
        xIndex <= Math.ceil((worldOffsetX + worldWidth) / spacing)
          + STAR_RANGE_INDICES;
        xIndex++
      ) {
        for (
          yIndex = Math.floor(worldOffsetY / spacing) - STAR_RANGE_INDICES;
          yIndex <= Math.ceil((worldOffsetY + worldHeight) / spacing)
            + STAR_RANGE_INDICES;
          yIndex++
        ) {
          var hash = cachedHash(xIndex + ':' + yIndex + ':' + level);
          stars.push(new Star(
            xIndex * spacing
              + (hash[0] / MAX_INT) * spacing * STAR_RANGE_INDICES,
            yIndex * spacing
              + (hash[1] / MAX_INT) * spacing * STAR_RANGE_INDICES,
            Math.max(0,
              Math.atan(
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
            )
          ));
        }
      }
    }
    return stars;
  }

  getStars = _getStars;
})();
