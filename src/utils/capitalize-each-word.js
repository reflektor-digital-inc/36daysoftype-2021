/**
 * @function CapitalizeEachWord.
 * @description This function will capitalize each word in a string.
 * @param {String} str - A string.
 * @return {String} Reformatted string
 */
const regexCapitalize = /\b[a-z]/g; // regex will match for any word starting with a lowercase
                                    // letter
const regexLowercase = /\B[A-Z]/g; // regex matches all lowercase letters after the first letter of
                                   // a word
const capitalizeEachWord = str => (
  str
    .replace(regexLowercase, letter => letter.toLowerCase()) // lowercase all capital letters
    .replace(regexCapitalize, letter => letter.toUpperCase()) // uppercase first letter of each
                                                                // word
);

export default capitalizeEachWord;
