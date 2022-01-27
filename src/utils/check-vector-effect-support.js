/**
 * @function CheckVectorEffect.
 * @description Checks if a browser supports 'vector-scale' attribute for SVG's. It will then
 * add a custom property to Modernizr 'Modernizr.vectorEffect' with the value of true if it is
 * supported, otherwise false.
 * @return {undefined} - Return nothing.
 *
 * @external Modernizr
 * @see {@link https://modernizr.com/download?setclasses|Modernizr Website}
 */
const checkVectorEffect = () => {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  Modernizr.vectorEffect = (elm.style.vectorEffect !== undefined);
};

export default checkVectorEffect;
