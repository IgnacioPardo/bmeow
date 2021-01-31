var video = document.createElement("video");
var canvasElement;
var canvas;
function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
		f = video.videoWidth / video.videoHeight
		w = window.innerHeight*f
		dx = -80
    canvas.drawImage(video, dx, 0, w, window.innerHeight);
    var imageData = canvas.getImageData(0, 0, window.innerWidth, window.innerHeight);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#BD00FF");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#BD00FF");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#BD00FF");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#BD00FF");
      console.log(code.data);
      window.location.href = code.data;
			return null
    } 
  }
  requestAnimationFrame(tick);
}