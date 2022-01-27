import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import glslify from 'rollup-plugin-glslify';
import pages from 'vite-plugin-pages';
import svgLoader from 'vite-svg-loader';
import inject from '@rollup/plugin-inject';
import configAlias from './config.alias';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins : [
    vue(),
    glslify(),
    svgLoader({
      svgoConfig : {
        plugins : [
          {
            name : 'preset-default',
            params : {
              overrides : {
                removeViewBox : false,
                addAttributesToSVGElement : {
                  attributes : [ `preserveAspectRatio="xMidYMid meet"` ]
                },
                removeHiddenElems : false,
                mergePaths : false,
                prefixIds : false,
                cleanupIDs : false
              }
            }
          },
          'removeDimensions',
          'convertShapeToPath'
        ]
      }
    }),
    pages({
      pagesDir : './src/pages',
      exclude : [
        '**/classes/*.vue',
        '**/classes/*.js',
        '**/working/*.vue'
      ],
      // make all page imports synchronous on dev for better DX
      // resolve as async (default) on prod
      importMode : mode === 'development' ? 'sync' : null
    })
  ],
  assetsInclude : /\.(glb)$/,
  css : {
    preprocessorOptions : {
      scss : {
        // example : additionalData: `@import "./src/design/styles/variables";`
        // dont need include file extend .scss
        additionalData : `
          @use "sass:math";
          @import "./src/styles/_shared.scss";
        `
      }
    }
  },
  build : {
    rollupOptions : {
      plugins : [inject({ Buffer : ['buffer', 'Buffer'] })]
    },
    commonjsOptions : {
      transformMixedEsModules : true
    }
  },
  resolve : {
    extensions : ['.vue', '.js'],
    alias : {
      ...configAlias
    }
  }
}));
