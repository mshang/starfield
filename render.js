/* vim: set softtabstop=2 shiftwidth=2 expandtab: */

var canvas;

(function () {
  var STAR_SIZE_PIXELS = 1.5;
  var DECELERATION_BLEED_RATIO_PER_TICK = 0.05; // A tick is 1/60 sec.
  var DEBUG = false;
  var timestamps = [];

  var worldOffsetX = 0; // Top left has this x coordinate in world frame.
  var worldOffsetY = 0;
  // scale of 1 means 1 world unit = 1 canvas pixel
  // scale of 100 means 1 world unit = 100 canvas pixels
  var scale = 1;

  var mousedown = false;
  var isPinching = false;
  var lastMouseX;
  var lastMouseY;
  var lastScale;
  var pixelVelocityX = 0;
  var pixelVelocityY = 0;
  var lastMoveTimestamp = 0;
  var lastRenderTimestamp = 0;

  canvas = document.getElementById("starfield");
  canvas.style['background-color'] = 'black';

  function render(timestamp) {
    var star, stars, i, j, context, brightnessToStars, dt, ratio;

    requestAnimationFrame(render);

    // deceleration
    if (lastRenderTimestamp && !mousedown) {
      dt = timestamp - lastRenderTimestamp;
      worldOffsetX -= pixelVelocityX * dt / scale;
      worldOffsetY -= pixelVelocityY * dt / scale;
      ratio = 1 - Math.min(
        1, DECELERATION_BLEED_RATIO_PER_TICK * dt / (1000 / 60)
      );
      pixelVelocityX *= ratio;
      pixelVelocityY *= ratio;
    }
    lastRenderTimestamp = timestamp;

    stars = getStars(
      worldOffsetX,
      worldOffsetY, 
      canvas.width / scale,
      canvas.height / scale
    );

    // setting fillStyle is expensive, so quantize and batch it.
    brightnessToStars = [];
    for (i = 0; i < 100; i++) brightnessToStars.push([]);
    for (i = 0; i < stars.length; i++) {
      star = stars[i];
      brightnessToStars[Math.floor(star.brightness * 100)].push(star);
    }

    context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < 100; i++) {
      context.fillStyle = 'rgba(255, 255, 255, ' + i / 100 + ')';
      stars = brightnessToStars[i];
      for (j = 0; j < stars.length; j++) {
        star = stars[j];
        context.fillRect(
          (star.worldX - worldOffsetX) * scale,
          (star.worldY - worldOffsetY) * scale,
          STAR_SIZE_PIXELS,
          STAR_SIZE_PIXELS
        );
      }
    }

    timestamps.push(timestamp);
    if (timestamps.length > 10) {
      if (DEBUG) console.log(
        (10 * 1000 / (timestamps[10] - timestamps[0])).toFixed(2) + ' fps'
      );
      timestamps = [];
    }
  }

  requestAnimationFrame(render);

  var hammer = new Hammer.Manager(canvas)
  hammer.add(new Hammer.Pan());
  hammer.add(new Hammer.Pinch());

  hammer.on('panstart', function(e) {
    mousedown = true;
    lastMouseX = 0;
    lastMouseY = 0;
  });

  hammer.on('panmove', function(e) {
    worldOffsetX -= (e.deltaX - lastMouseX) / scale;
    worldOffsetY -= (e.deltaY - lastMouseY) / scale;
    lastMouseX = e.deltaX;
    lastMouseY = e.deltaY;
  });

  hammer.on('panend', function(e) {
    mousedown = false;
    pixelVelocityX = -e.velocityX;
    pixelVelocityY = -e.velocityY;
  });

  hammer.on('pinchstart', function(e) {
    isPinching = true;
    lastScale = 1;
    pixelVelocityX = 0;
    pixelVelocityY = 0;
  });

  hammer.on('pinchmove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleDelta = e.scale / lastScale;
    worldOffsetX += (e.center.x - rect.left) * (1 - 1 / scaleDelta) / scale;
    worldOffsetY += (e.center.y - rect.top) * (1 - 1 / scaleDelta) / scale;
    scale *= scaleDelta;
    lastScale = e.scale;
  });

  hammer.on('pinchend', function(e) {
    isPinching = false;
  });

  canvas.addEventListener("mousewheel", function(e) {
    var mult;
    var rect = canvas.getBoundingClientRect();
    if (e.wheelDelta > 0) mult = 1.1; else mult = 1 / 1.1;
    worldOffsetX += (e.clientX - rect.left) * (1 - 1 / mult) / scale;
    worldOffsetY += (e.clientY - rect.top) * (1 - 1 / mult) / scale;
    scale *= mult;
    pixelVelocityX = 0;
    pixelVelocityY = 0;
  }, false);

})();
