/* vim: set softtabstop=2 shiftwidth=2 expandtab: */

(function () {
  var canvasBorder = window.getComputedStyle(canvas)['border'];
  var canvasMargin = window.getComputedStyle(canvas)['margin'];
  var canvasHeight = canvas.height;
  var canvasWidth = canvas.width;

  if (window.navigator.standalone) {
    document.body.style['height'] = "100%";
    document.body.style['width'] = "100%";
    document.body.style['margin'] = "0px";
    document.documentElement.style['height'] = "100%";
    document.documentElement.style['width'] = "100%";
    document.documentElement.style['margin'] = "0px";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style["border"] = "none";
    canvas.style["margin"] = "0";
  }

  document.addEventListener("resize", function() {
    if (window.navigator.standalone) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  if (typeof screenfull !== "undefined") {
    document.addEventListener(screenfull.raw.fullscreenchange, function() {
      if (screenfull.isFullscreen) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style["border"] = "none";
        canvas.style["margin"] = "0";
      } else {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style["border"] = canvasBorder;
        canvas.style["margin"] = canvasMargin;
      }
    });
  }
})();
