/**
 * @export
 * @function ValidatePostalCode
 * @description Validates Canadian postal codes.
 * @param {String} postalCode - The postal code to validate
 * @return {Boolean} - true if valid, otherwise false
 */
export default (postalCode) => {
  const regex = /^[a-z]\d[a-z][ -]?\d[a-z]\d$/i;
  return regex.test(postalCode);
};
