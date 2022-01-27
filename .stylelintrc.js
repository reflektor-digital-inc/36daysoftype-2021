module.exports = {
  'severity': 'warning',
  'plugins': [
    'stylelint-scss'
  ],
  'rules': {
    'at-rule-whitelist': [
      'at-root',
      'content',
      'debug',
      'each',
      'else',
      'else if',
      'error',
      'extend',
      'font-face',
      'for',
      'function',
      'if',
      'import',
      'include',
      'keyframes',
      'media',
      'mixin',
      'page',
      'return',
      'warn',
      'while'
    ],

    'at-rule-no-unknown': [
      true,
      {
        'ignoreAtRules': [
          'at-root',
          'content',
          'debug',
          'each',
          'else',
          'else if',
          'error',
          'extend',
          'font-face',
          'for',
          'function',
          'if',
          'import',
          'include',
          'keyframes',
          'media',
          'mixin',
          'page',
          'return',
          'warn',
          'while'
        ]
      }
    ],

    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'declaration-block-no-duplicate-properties': [
      true,
      {
        'ignore': [ 'consecutive-duplicates-with-different-values' ]
      }
    ],
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'keyframe-declaration-no-important': true,
    'media-feature-name-no-unknown': true,

    /* need to disable this rule for stylelint-processor-arbitrary-tags package */
    'no-empty-source': null,

    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': null,
    'property-no-unknown': [
      true,
      { 'ignoreProperties': [ 'user-drag', '&', '#{&}' ] }
    ],
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'shorthand-property-no-redundant-values': true,
    'string-no-newline': true,
    'unit-no-unknown': true,
    'at-rule-name-case': 'lower',
    //	"at-rule-name-space-after": "always-single-line",
    'at-rule-semicolon-newline-after': 'always',
    'block-closing-brace-empty-line-before': 'never',
    //	"block-closing-brace-newline-after": "always",
    'block-closing-brace-newline-before': 'always-multi-line',
    'block-closing-brace-space-before': 'always-single-line',
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-after': 'always-single-line',
    //	"block-opening-brace-space-before": "always",
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'comment-empty-line-before': [
      null,
      {
        'except': [ 'first-nested' ],
        'ignore': [ 'stylelint-commands', 'after-comment' ]
      }
    ],
    'comment-whitespace-inside': null,
    'custom-property-empty-line-before': [
      'always',
      {
        'except': [ 'after-custom-property', 'first-nested' ],
        'ignore': [ 'after-comment', 'inside-single-line-block' ]
      }
    ],
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-single-line-max-declarations': 1,
    'declaration-block-trailing-semicolon': 'always',
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'function-comma-newline-after': 'always-multi-line',
    'function-comma-space-after': 'always-single-line',
    'function-comma-space-before': 'never',
    'function-max-empty-lines': 0,
    'function-name-case': 'lower',
    'function-parentheses-newline-inside': 'always-multi-line',
    'function-parentheses-space-inside': 'never-single-line',
    'function-whitespace-after': 'always',
    'indentation': 2,
    'length-zero-no-unit': true,
    'max-empty-lines': [
      2,
      {
        'ignore': [ 'comments' ]
      }
    ],
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-name-case': 'lower',
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',
    'no-eol-whitespace': [
      true,
      { 'ignore': [ 'empty-lines' ] }
    ],
    'no-missing-end-of-source-newline': true,
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    'property-case': 'lower',
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-descendant-combinator-no-non-space': true,
    'selector-list-comma-space-before': 'never',
    'selector-max-empty-lines': 0,
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    'selector-pseudo-element-colon-notation': 'double',
    'selector-type-case': 'lower',
    'unit-case': 'lower',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',
    'value-list-max-empty-lines': 0,

    // stylelint-scss package - @if/@else rule configuration
    'at-rule-empty-line-before': [
      'always',
      {
        'except': [ 'after-same-name', 'inside-block' ],
        'ignore': [ 'after-comment' ],
        'ignoreAtRules': [ 'else', 'else if', 'import', 'if', 'function', 'mixin', 'each', 'for' ]
      }
    ],
    'block-opening-brace-space-before': 'always',
    'block-closing-brace-newline-after': [
      'always', {
        'ignoreAtRules': [ 'if', 'else' ]
      }
    ],
    'at-rule-name-space-after': 'always',
    'rule-empty-line-before': [
      'always',
      {
        'except': [ 'inside-block', 'inside-block-and-after-rule' ],
        'ignore': [ 'inside-block', 'after-comment' ]
      }
    ],
    'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
    'scss/at-else-closing-brace-space-after': 'always-intermediate',
    'scss/at-else-empty-line-before': 'never',
    'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
    'scss/at-if-closing-brace-space-after': 'always-intermediate',
    'scss/at-mixin-argumentless-call-parentheses': 'never'
  }
};
