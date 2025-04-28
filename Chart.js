export default class Chart {
  constructor(canvas, N, dx, axisStart) {
    this.canvas = canvas;
    if (this.canvas.getContext) {
      this.ctx = canvas.getContext("2d");
    }

    this.H = canvas.height;
    this.W = canvas.width;

    this.N = N;
    this.dx = dx;

    this.axisStart = axisStart;
    this.axisEnd = this.axisStart + (this.N - 1) * this.dx;
    this.axisWidth = this.axisEnd - this.axisStart;
  }

  clear() {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1;
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.strokeRect(0, 0, this.W, this.H);
  }

  // Draw the points of graph to the canvas
  draw(points, color, strokeWidth) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.moveTo(0, this.H);
    for (let i = 0; i < this.N; i++) {
      this.ctx.lineTo(
        ((i * this.W) / this.axisWidth) * this.dx,
        this.H / 2 - points[i] * 1000
      );
      // console.log(i*W/axisWidth*dx, H-points[i]*1000)
    }

    this.ctx.stroke();
  }
}
