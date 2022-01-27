import gradientParser from 'gradient-parser';
import { MathUtils, CanvasTexture } from 'three';

export function generateGradientTextureFromString(gradientString) {
  const gradientData = gradientParser.parse(gradientString);

  const angle = gradientData[0].orientation.type === 'directional' ? 0 : MathUtils.degToRad(gradientData[0].orientation.value);
  const canvas = makeRampCanvas(gradientData[0].colorStops, angle);

  return new CanvasTexture(canvas);
}

function makeRampCanvas(stops, angle, resolution = 256) {
  const halfRes = resolution / 2;

  const stopArrays = stops.map((stop, index) => {
    let pos = (1 / stops.length) * index;
    if (stop.length) {
      pos = stop.length.value * 0.01;
    }
    return { position : pos, color : `#${stop.value}` };
  });
  const sorted = stopArrays.sort((stopA, stopB) => stopA[0] - stopB[0]);

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;

  halfRes + (Math.sin(angle - Math.PI) * halfRes) * 1.2;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(
    halfRes + (Math.cos(-angle) * halfRes) * 1.2,
    halfRes + (Math.sin(-angle) * halfRes) * 1.2,
    halfRes + (Math.cos(-angle - Math.PI) * halfRes) * 1.2,
    halfRes + (Math.sin(-angle - Math.PI) * halfRes) * 1.2
  );

  sorted.forEach((stop) => {
    gradient.addColorStop(stop.position, stop.color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, resolution, resolution);

  return canvas;
}
