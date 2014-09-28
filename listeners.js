var mousedown = false;
var lastMouseX;
var lastMouseY;

canvas.addEventListener("mousedown", function(e) {
  if (e.button !== 0) return;
  mousedown = true;
  lastMouseX = e.pageX;
  lastMouseY = e.pageY;
}, false);

document.addEventListener("mousemove", function(e) {
  if (!mousedown) return;
  var dX = e.pageX - lastMouseX;
  var dY = e.pageY - lastMouseY;
  lastMouseX = e.pageX;
  lastMouseY = e.pageY;
  offsetX -= dX / scale;
  offsetY -= dY / scale;
}, false);

document.addEventListener("mouseup", function(e) {
  mousedown = false;
}, false);

canvas.addEventListener("mousewheel", function(e) {
  var mult;
  var rect = canvas.getBoundingClientRect();
  if (e.wheelDelta > 0) mult = 1.1; else mult = 1 / 1.1;
  offsetX += (e.clientX - rect.left) * (1 - 1 / mult) / scale;
  offsetY += (e.clientY - rect.top) * (1 - 1 / mult) / scale;
  scale *= mult;
}, false);

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
if (window.navigator.standalone) {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
}

if (typeof screenfull !== "undefined") {
  document.addEventListener(screenfull.raw.fullscreenchange, function() {
    if (screenfull.isFullscreen) {
      canvas.width = document.body.clientWidth;
      canvas.height = document.body.clientHeight;
    } else {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
  });
}
