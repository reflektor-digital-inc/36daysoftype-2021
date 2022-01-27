/**
 * @export
 * @function wait
 * @description Wait a specific amount of time and resolve a promise.
 * @param {Number} [ms=0] - The number of milliseconds to wait before resolving the promise.
 * @returns {Promise} Promise object that will resolve after n milliseconds
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @export
 * @function noop
 * @description Function that does nothing (no operation)
 * @return {undefined}
 */
export const noop = () => {
};

/**
 * @export
 * @function GetDifference
 * @description Calculates the difference between 2 numbers, maintaining the sign.
 * @param  {Number} num1 - The first number
 * @param  {Number} num2 - The second number
 * @return {Number} The difference between the two numbers.
 */
export const getDifference = (num1, num2) => {
  const diff = Math.abs(num1 - num2);
  return (num1 > num2) ? -diff : diff;
};

/**
 * @export
 * @function GenerateUniqueKey
 * @description This function will generate an alphanumeric string, with a character length of 9.
 * @returns {String} Alphanumeric string.
 * @see {@link https://gist.github.com/gordonbrander/2230317|Source}
 */
export const generateUniqueKey = () => (
  Math.random()
    .toString(36)
    .substr(2, 9)
);

/**
 * @export
 * @function NumberInRange.
 * @description Function to determine if a number is between two number. It can be inclusive or
 * exclusive.
 * @param {Object} obj - An object.
 * @param {Number} obj.min -  The minimum value.
 * @param {Number} obj.max -  The maximum value.
 * @param {Number} obj.number - The value/number to check if it is within the range.
 * @param {Boolean} obj.inclusive - If true, the range will include the min and max values.
 * Otherwise, min and max won't be included in the range.
 * @return {Boolean} True if within the range.
 */
export const numberInRange = ({ min, max, number, inclusive }) => (
  inclusive ?
    ((number - min) * (number - max) <= 0) :
    ((number - min) * (number - max) < 0)
);

/**
 * @export
 * @function NumberPositionInRange
 * @description Return a normalized number who determine its range between two numbers
 * Example: numberPositionInRange(10, 20, 15) === 0.5
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @param {number} number - The number to be determined
 * @returns {number} - Between 0 and 1. If it's more/less, that meet
 */
export const numberPositionInRange = (min, max, number) => 1 - ((max - number) / (max - min));

/**
 * @export
 * @function NumberValueInRange
 * @description Return a number who can be found into a specific range.
 * The number is defined depending to a normalized number (between 0 and 1)
 * Example: numberValueInRange(10, 20, 0.5) === 15
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @param {number} normalizedValue - The value who determines the number to find
 * @returns {number} - The number to find between the range
 */
export const numberValueInRange = (min, max, normalizedValue) => (
  max + (normalizedValue * (min - max))
);

/**
 * @function ShuffleArray.
 * @description Shuffles the values of a given array, without mutating the original array. This
 * is a Javascript implementation of the Durstenfeld shuffle, a computer-optimized version of
 * the Fisher-Yates shuffle.
 * @param {Array} targetArray - The given array to shuffle.
 * @return {Array} The shuffled array
 *
 * {@link https://stackoverflow.com/a/12646864|Source}
 */
export const shuffleArray = (targetArray) => {
  const shuffled = [ ...targetArray ];
  const totalItems = shuffled.length;
  for (let i = totalItems - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ shuffled[i], shuffled[j] ] = [ shuffled[j], shuffled[i] ];
  }
  return shuffled;
};

/**
 * @export
 * @function FlattenArrayDeep.
 * @description Flattens an array of nested arrays (deep)
 * @param {Array} arr - An array.
 * @return {Array} the flattened array
 */
export const flattenArrayDeep = arr => (
  arr.reduce((flattened, toFlatten) => flattened.concat(
    Array.isArray(toFlatten) ?
      flattenArrayDeep(toFlatten) :
      toFlatten
  ), [])
);

/**
 * @export
 * @function FlattenArrayShallow.
 * @description Flattens an array of nested arrays (shallow - one level depth).
 * @param {Array} arr - An array.
 * @return {Array} the flattened array
 */
export const flattenArrayShallow = arr => arr.reduce((agg, arr) => agg.concat(arr), []);

/**
 * @export
 * @function Clamp.
 * @description Keeps a number between two values.
 * @param {Number} number - Number to clamp.
 * @param {Number} minimum - The smallest possible value.
 * @param {Number} maximum - The largest possible value.
 * @return {Number} The clamped array
 */
export const clamp = (number, minimum, maximum) => Math.min(Math.max(number, minimum), maximum);
