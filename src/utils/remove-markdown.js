/**
 * @function RemoveMarkdown.
 * @description Basic function to remove markdown characters from a string.
 * @param {String} stringMD - The markdown string.
 * @return {String} string with all markdown characters removed.
 */
const removeMarkdown = stringMD => (
  stringMD
    .replace(/\\n/gm, '') // Remove new line
    .replace(/([^a-z]-|-[^a-z])/gim, '') // Remove list item
    .replace(/[^a-z\s\d-&]+/gmi, '') // Remove special characters
  // .replace(/\s{2,}/gm, '') // Trim white space
);

export default removeMarkdown;
