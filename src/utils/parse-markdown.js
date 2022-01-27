/**
 * @function ParseMarkdown.
 * @description Basic function parse Markdown and replace things correctly
 * @param {String} stringMD - The markdown string.
 * @param {Object} options - an object
 * @param {Boolean} options.removeStrongTag - When true, parser will remove <strong> tags.
 * @param {Boolean} options.removePTag - When true, parser will remove <p> tags.
 * @param {Boolean} options.lowercase - When true, parser will lowercase string.
 * @return {String} parsed markdown string
 */

const parseMarkdown = (
  stringMD,
  { removeStrongTag = false, removePTag = false, lowercase = false } = {}
) => {
  const isString = (typeof stringMD === 'string');
  let parsedString = stringMD;

  if (!isString) {
    console.group('parseMarkdown | invalid argument');
    console.error('Argument: stringMD is not type string!');

    // console.trace();
    console.groupEnd();
    return '';
  }

  if (!stringMD) {
    console.group('parseMarkdown');
    console.warn('Argument: stringMD is an empty string');

    // console.trace();
    console.groupEnd();
    return '';
  }

  parsedString = removeStrongTag ? parsedString.replace(/_+/g, '') : parsedString;

  parsedString = lowercase ? parsedString.toLowerCase() : parsedString;

  // parsedString = Marked(parsedString)
  // Remove breaking line at the end of the string
  //   .trim();

  if (removePTag) {
    // Remove the whole p tags
    parsedString = parsedString.replace(/<\/?p[^>]*>/g, '');

    // Replace \n by br tags
    parsedString = parsedString.replace(/\n(?!<\/p>)/gm, ' <br /> ');
  }

  return parsedString;
};

// const strings = [
//   '**andrew**',
//   '__title__',
// ];
//
// for (const str of strings) {
//   const removed = parseMarkdown(str);
//   console.log('STR:', str);
//   console.log('REMOVED:', removed);
// }

export default parseMarkdown;
