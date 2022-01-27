const FFO = require('fontfaceobserver/fontfaceobserver');

export default function () {
  const families = [];

  const promises = families.map((f) => {
    const font = new FFO(f.family);
    return font.load(null, 4000);
  });

  return Promise.all(promises);
}
