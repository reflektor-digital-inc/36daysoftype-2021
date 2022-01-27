/**
 * @export
 * @function ValidateName
 * @description Validates name (first and last). The string must have a minimum length of one
 * (1), no digits allowed.
 * @param {String} name - The name to validate
 * @return {Boolean} - true if valid, otherwise false
 */
export default (name) => {
  const regex = /^[a-z]+[^\d]\D*$/i;
  return regex.test(name);
};
