/**
 * @export
 * @function ValidatePhoneNumber
 * @description Validates 10 digit phone numbers
 * @param {String|Number} phoneNumber - The phone number to validate
 * @return {Boolean} - true if valid, otherwise false
 */
export default (phoneNumber) => {
  // const regex = /^\s*\d{3}\W*\d{3}\W*\d{4}\s*$/i;

  // Original Regex source: https://stackoverflow.com/a/29767609
  // Original regex does not take into consideration white spaces at the beginning/end of string.
  // \s* were added to the both ends of the regex.
  const regex = /^\s*[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}\s*$/i;
  return regex.test(phoneNumber);
};

// Test
// const validatePhoneNumber = (phoneNumber) => {
//   const regex = /^\s*[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}\s*$/i;
//   return regex.test(phoneNumber);
// };
// const phoneNumbers = [
//   '(123) 456-7890',
//   '(123)456-7890',
//   '123-456-7890',
//   '123.456.7890',
//   '1234567890',
//   123456778890,
//   '+31636363634',
//   '075-63546725',
//   '  (123) 456-7890  ',
//   '  (123)456-7890  ',
//   '  123-456-7890  ',
//   '  123.456.7890  ',
//   '  1234567890  ',
//   '  +31636363634  124',
//   '  075-63546725 0'
// ];
//
// for (const number of phoneNumbers) {
//   const isValid = validatePhoneNumber(number);
//   console.log('NUMBER:', number, 'IS_VALID:', isValid);
// }
