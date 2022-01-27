module.exports = {
  root : true,
  env : {
    browser : true,
    node : true
  },

  extends : [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  parser : 'vue-eslint-parser',
  parserOptions : {
    parser : '@babel/eslint-parser',
    ecmaVersion : 2018,
    babelOptions : {
      configFile : './.babelrc'
    },
  },
  plugins : [
    'import',
    'vue',
    '@babel'
  ],
  globals : {
    __static : true,

    // GSAP methods. Since we've elected to use a CDN, rather than installing the module, we
    // must add these methods to the globals array.
    TweenLite : 'readonly',
    TweenMax : 'readonly',
    TimelineMax : 'readonly',
    TimelineLite : 'readonly',
    gsap : 'readonly',

    // GSAP eases. Defining them here will prevent an error from 'no-undef' rule.
    Expo : 'readonly',
    Sine : 'readonly',
    Power0 : 'readonly',
    Power1 : 'readonly',
    Power2 : 'readonly',
    Power3 : 'readonly',
    Power4 : 'readonly',
    Quad : 'readonly',
    Quart : 'readonly',
    Quint : 'readonly',
    Linear : 'readonly',
    Elastic : 'readonly',
    Circ : 'readonly',
    Cubic : 'readonly',
    SplitText : 'readonly',

    Modernizr : 'readonly',
    ga : 'readonly',
    NETLIFY_BUILD_DATE : 'readonly',
    GIT_COMMIT : 'readonly',
    GIT_BRANCH : 'readonly',
    GIT_HEAD : 'readonly',
    BUILD_ID : 'readonly',
    DEPLOY_ID : 'readonly',
    DocumentTouch : 'readonly',
    SERVER_HOST : 'readonly',
    SERVER_PORT : 'readonly'
  },

  // add your custom rules here
  rules : {
    'lines-around-comment' : [
      'warn',
      {
        beforeBlockComment : true,
        afterBlockComment : false,
        beforeLineComment : false,
        afterLineComment : false,
        allowBlockStart : true,
        allowBlockEnd : true,
        allowObjectStart : true,
        allowObjectEnd : true,
        allowArrayStart : true,
        allowArrayEnd : true,
        allowClassStart : true,
        allowClassEnd : true
      }
    ],
    'no-undef' : 'error',
    'no-unused-vars' : [
      'error', {
        vars : 'all',
        args : 'after-used',
        caughtErrors : 'all',
        ignoreRestSiblings : false
      }
    ],
    'no-trailing-spaces' : [
      'error', {
        skipBlankLines : true
      }
    ],
    'no-unreachable' : 'error',
    'no-alert' : 'off',
    semi : [ 'error', 'always', { omitLastInOneLineBlock : true } ],
    eqeqeq : [ 'error', 'smart' ],
    quotes : [ 'error', 'single', { allowTemplateLiterals : true } ],

    // Because the unary ++ and -- operators are subject to automatic semicolon insertion,
    // differences in whitespace can change semantics of source code.
    'no-plusplus' : [ 'off', { allowForLoopAfterthoughts : true } ],
    'comma-dangle' : [
      'error', {
        arrays : 'never',
        objects : 'never',
        imports : 'never',
        exports : 'never',

        // functions should only be enabled when linting ECMAScript 2017 or higher.
        functions : 'ignore'
      }
    ],
    'comma-spacing' : [
      'error',
      {
        before : false,
        after : true
      }
    ],
    'semi-spacing' : [
      'error',
      {
        before : false,
        after : true
      }
    ],
    'semi-style' : [ 'error', 'last' ],
    'no-extra-semi' : 'error',
    'brace-style' : [ 'warn', 'stroustrup', { allowSingleLine : true } ],
    'func-call-spacing' : [ 'error', 'never' ],
    curly : [ 'off', 'multi-or-nest', 'consistent' ],
    'object-curly-spacing' : [ 'error', 'always', {
      arraysInObjects : true,
      objectsInObjects : true
    }],
    'quote-props' : [ 'error', 'as-needed' ],
    'object-curly-newline' : ['error', {
      ObjectExpression : { multiline : true, consistent : true },
      ObjectPattern : { multiline : true },
      ImportDeclaration : { multiline : true },
      ExportDeclaration : { multiline : true, minProperties : 2 }
    }],
    indent : [
      'error', 2, {
        SwitchCase : 1, // default = 0; 2-space indentation
        VariableDeclarator : {
          var : 2,
          let : 2,
          const : 3
        },

        // 'ignoreComments' : true,
        MemberExpression : 1, // indent the multi-line property chains with 2 spaces.
        ArrayExpression : 1, // default = 1; enforces indentation level for elements in arrays
        ObjectExpression : 1, // default = 1; enforces indentation level for properties in
        // objects.,
        ignoreComments : true
      }
    ],
    'prefer-const' : [
      'error', {
        destructuring : 'any',
        ignoreReadBeforeAssign : false
      }
    ],
    'no-var' : 'error',
    'multiline-ternary' : [ 'error', 'always-multiline' ],
    'operator-linebreak' : [
      'error',
      'after', {
        overrides : {
          '?' : 'after',
          ':' : 'after'
        }
      }
    ],
    'space-infix-ops' : [ 'error', { int32Hint : false } ],
    'keyword-spacing' : [
      'error',
      {
        before : true,
        after : true
      }
    ],
    'arrow-spacing' : [
      'error',
      {
        before : true,
        after : true
      }
    ],
    'array-bracket-spacing' : 'off',
    'space-in-parens' : ['error', 'never'],
    'space-before-function-paren' : ['error', {
      anonymous : 'always',
      named : 'never',
      asyncArrow : 'always'
    }],

    // 'no-param-reassign' : [ 'error' ],
    'function-paren-newline' : [ 'error', 'multiline-arguments' ],
    'prefer-arrow-callback' : 'error',
    'arrow-body-style' : [ 'error', 'as-needed' ],
    'arrow-parens' : [ 'error', 'as-needed', { requireForBlockBody : true } ],
    'implicit-arrow-linebreak' : [ 'error', 'beside' ],
    'space-before-blocks' : [
      'error', {
        functions : 'always',
        keywords : 'always',
        classes : 'always'
      }
    ],
    'rest-spread-spacing' : [ 'error', 'never' ],
    'no-multi-spaces' : [
      'error', {
        ignoreEOLComments : true,
        exceptions : {
          Property : true,
          VariableDeclarator : true,
          ImportDeclaration : true,
          ObjectPattern : true,
          ExpressionStatement : true,
          AssignmentExpression : true,
          ConditionalExpression : true

          // 'Identifier'           : true,
          // 'MemberExpression'     : true
        }
      }
    ],
    'padded-blocks' : [
      'error',
      {
        switches : 'never',
        classes : 'never',
        blocks : 'never'
      }
    ],
    'no-console' : [
      'error',
      {
        allow : [
          'warn',
          'error',
          'trace',
          'info',
          'time',
          'timeEnd',
          'group',
          'groupEnd'
        ]
      }
    ],
    'key-spacing' : [
      'error', {
        singleLine : {
          beforeColon : true,
          afterColon : true
        },
        multiLine : {
          beforeColon : true,
          afterColon : true

          // align       : 'colon'
        }
      }
    ],
    'no-mixed-spaces-and-tabs' : [ 'error', 'smart-tabs' ],
    'no-debugger' : 'error',
    'no-empty' : 'error',
    'no-empty-function' : [
      'error', {
        allow : [ 'arrowFunctions' ]
      }
    ],
    'default-case' : 'error',
    'max-len' : [
      'error', {
        code : 200,
        tabWidth : 2,
        ignoreComments : true,
        ignoreTrailingComments : true,
        ignoreUrls : true,
        ignoreStrings : true,
        ignoreRegExpLiterals : true,
        ignoreTemplateLiterals : true,
        ignorePattern : '^import\\\\s.+\\\\sfrom\\\\s.+;$'
      }
    ],
    'no-prototype-builtins' : 'warn',
    'no-multiple-empty-lines' : ['error', { max : 1, maxEOF : 1 }],

    /* eslint-plugin-vue rules */
    'vue/script-indent' : [
      'error', 2, {
        baseIndent : 1,
        switchCase : 1,
        ignores : []
      }
    ],
    'vue/html-indent' : [
      'error', 2, {
        attribute : 1,
        baseIndent : 1,
        closeBracket : 0,
        alignAttributesVertically : false,
        ignores : []
      }
    ],
    'vue/max-len' : ['error', {
      code : 200,
      template : 200,
      tabWidth : 2,
      comments : 200,
      ignoreComments : true,
      ignoreTrailingComments : true,
      ignoreUrls : true,
      ignoreStrings : true,
      ignoreRegExpLiterals : true,
      ignoreTemplateLiterals : true,
      ignoreHTMLAttributeValues : true,
      ignoreHTMLTextContents : false,
      ignorePattern : '^import\\\\s.+\\\\sfrom\\\\s.+;$'
    }],
    'vue/html-closing-bracket-newline' : [
      'error', {
        singleline : 'never',
        multiline : 'always'
      }
    ],
    'vue/html-closing-bracket-spacing' : [
      'error', {
        startTag : 'never',
        endTag : 'never',
        selfClosingTag : 'always'
      }
    ],

    // NOTE 2019-03-28 andrewkim: disabling rule for now, due to false positives.
    'vue/require-component-is' : 'warn',

    // Rule doesn't work with <component v-bind={ object with is property } />
    'vue/no-unused-components' : [
      'off', {
        ignoreWhenBindingPresent : true
      }
    ],
    'vue/order-in-components' : [
      'error', {
        order : [
          'el',
          'name',
          'parent',
          'functional',
          [ 'delimiters', 'comments' ],
          [ 'components', 'directives', 'filters' ],
          'extends',
          'mixins',
          'layout',
          'inheritAttrs',
          'model',
          [ 'props', 'propsData' ],
          'asyncData',
          'async asyncData',
          'data',
          'computed',
          'watch',
          'LIFECYCLE_HOOKS',
          'methods',
          [ 'template', 'render' ],
          'renderError',
          'metaInfo'
        ]
      }
    ],
    'vue/this-in-template' : [ 'error', 'never' ],
    'vue/v-on-function-call' : [ 'error', 'never' ],
    'vue/mustache-interpolation-spacing' : [ 'error', 'always' ],
    'vue/no-multi-spaces' : [
      'error', {
        ignoreProperties : false
      }
    ],
    'vue/component-name-in-template-casing' : ['error', 'PascalCase', {
      registeredComponentsOnly : false,
      ignores : [
        'router-view',
        'router-link',
        'transition',
        'transition-group',
        'keep-alive',
        'component',
        'template',
        'slot',
        'nuxt',
        'nuxt-child',
        'nuxt-link',
        'client-only'
      ]
    }],
    'vue/attribute-hyphenation' : ['error', 'always', {
      ignore : [
        'preserveAspectRatio',
        'imageURL',
        'clearcoatRoughness',
        'envMapIntensity',
        'bumpScale',
        'aoMapIntensity',
        'displacementScale'
      ]
    }],

    'vue/max-attributes-per-line' : ['error', {
      singleline : 2,
      multiline : {
        max : 1,
        allowFirstLine : false
      }
    }],

    /* Eslint-Plugin-Import Rules */
    'import/no-duplicates' : 'error',
    'import/first' : 'error',
    'import/newline-after-import' : [ 'error', { count : 1 } ],
    'import/order' : [
      'error', {
        groups : [
          [ 'builtin', 'external' ],
          [ 'internal' ],
          [ 'unknown' ],
          [ 'parent', 'sibling' ],
          'index'
        ],
        'newlines-between' : 'never'
      }
    ],
    'import/default' : 'warn',

    'import/no-unresolved' : [ 'off', {
      ignore : [ '^vue-resize-directive$', '^raf-loop$', '^@three' ]
    }]
  },
  overrides : [
    {
      // disable indent rule for vue files, as 'vue/script-indent' will handle the indentation
      // inside of script tags
      files : [ '*.vue' ],
      rules : {
        indent : 'off'
      }
    }
  ]
};
