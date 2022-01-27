class CanvasHelper {
  static distance(point1, point2) {
    const a = point1.x - point2.x;
    const b = point1.y - point2.y;
    return Math.sqrt(a * a + b * b);
  }

  static convertDegreesToRads() {
    return angleDegree => Math.PI / 180 * angleDegree;
  }

  static convertRadiansToDegrees() {
    return angleRadians => 180 / Math.PI * angleRadians;
  }

  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  }

  _blendModes = [
    'lighten',
    'multiply',
    'overlay',
    'darken',
    'source-over',
    'source-atop',
    'source-in',
    'source-out',
    'destination-over',
    'destination-atop',
    'destination-in',
    'destination-out',
    'copy',
    'xor',
    'screen'
  ];

  static get blendModes() {
    return CanvasHelper._blendModes;
  }

  static set blendModes(value) {
    CanvasHelper._blendModes = value;
  }

  constructor({ width, height, ctx, ...options }) {
    if (!width || !height) {
      console.error(`${options.width ? 'height' : 'width'} property missing.`);
    }
    if (!ctx) {
      console.error('Canvas context missing!');
    }

    // Set options as instance variables
    Object.keys(options).map((key) => {
      this[key] = options[key];
    });

    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.width = width;
    this.height = height;
    this.ctx = ctx;

    this.center = {
      x : this.width / 2,
      y : this.height / 2
    };

    this.ctx.scale(this.dpr, this.dpr);

    this.cursorPosition = this.center;

    // this.circleRadius = this.radius * 0.05;
    this.circleRadius = 3;
  }

  set width(val) {
    this._width = val;
  }

  get width() {
    // return this._width * this.dpr;
    return this._width;
  }

  set height(val) {
    this._height = val;
  }

  get height() {
    // return this._height * this.dpr;
    return this._height;
  }

  set radius(val) {
    this._radius = val;
  }

  get radius() {
    // return this._radius * this.dpr;
    return this._radius;
  }

  set strokeLength(val) {
    this._strokeLength = val;
  }

  get strokeLength() {
    // return this._strokeLength * this.dpr;
    return this._strokeLength;
  }

  set lineWidth(val) {
    this._lineWidth = val;
  }

  get lineWidth() {
    // return this._lineWidth * this.dpr;
    return this._lineWidth;
  }

  setInitialState = () => {
    const ctx = this.ctx;
    this.clear();
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.stroke;

    if (this.fill) {
      ctx.fillStyle = this.fill;
    }
  };

  clear = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  fill = () => {
    this.ctx.fillRect(0, 0, this.width, this.height);
  };

  drawCircle = ({ radius = 3, start = 0, end = 2 * Math.PI, fill, stroke, width = 1.5 }) => {
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, start, end, false);
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.lineWidth = width;
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke();
    }
  };

  drawDot = () => {
    this.ctx.save();
    this.ctx.translate(this.cursorPosition.x, this.cursorPosition.y);
    this.ctx.globalCompositeOperation = 'source-over';

    this.drawCircle({
      radius : 3.5,
      start : 0,
      end : 2 * Math.PI,
      fill : this.primaryStrokeStyle,
      width : this.lineWidth
    });

    this.drawCircle({
      radius : 2,
      start : 0,
      end : 2 * Math.PI,
      fill : '#fff',
      width : this.lineWidth
    });
    this.ctx.restore();
  };

  drawLine = ({ start = { x : 0, y : 0 }, end = { x : 0, y : 0 } }) => {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x * this.dpr, start.y * this.dpr);
    this.ctx.lineTo(end.x * this.dpr, end.y * this.dpr);
    this.ctx.stroke();
  };
}

export default CanvasHelper;
