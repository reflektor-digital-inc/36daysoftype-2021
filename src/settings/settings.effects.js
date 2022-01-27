import gsap from 'gsap'; // eslint-disable-line
import SplitText from 'gsap/dist/SplitText';

export const FADE_AND_TRANSFORM = {
  name : 'fadeAndTransform',
  effect : (targets, config) => {
    const tl = gsap.timeline({ delay : config.delay });

    tl.add([
      gsap.fromTo(
        targets,
        { opacity : config.opacityFrom },
        {
          opacity : config.opacityTo,
          duration : config.duration,
          ease : 'none' // use linear (no easing) for opacity
        }
      ),
      gsap.fromTo(
        targets,
        { y : config.yFrom },
        {
          y : config.yTo,
          duration : config.duration,
          ease : config.ease,
          onComplete : config.onComplete
        }
      )
    ]);
    return tl;
  },
  defaults : {
    duration : 0.5, stagger : 0.2, ease : 'power4.out', opacityFrom : 0, opacityTo : 1, yFrom : 40, yTo : 0, delay : 0, onComplete : null
  }, //defaults get applied to any "config" object passed to the effect
  extendTimeline : true //now you can call the effect directly on any GSAP timeline to have the result immediately inserted in the position you define (default is sequenced at the end)
};

export const SPLIT_LINES = {
  name : 'splitLines',
  effect : (targets, config) => {
    // SplitText docs: https://greensock.com/docs/v3/Plugins/SplitText
    // type: Split text into array of divs for each line
    // linesClass: Give class to each line div
    const splitChild = new SplitText(targets, { type : 'lines', linesClass : 'SplitChild' });

    // split text again to get lines inside a wrapper.
    // IMPORTANT: Ensure SplitParent is a global style with overflow: hidden.
    //const splitParent =
    const splitParent = new SplitText(targets, {
      type : 'lines',
      linesClass : 'SplitParent'
    });

    const lines = splitChild.lines;

    return {
      tl : gsap.fromTo(
        [...lines],
        {
          y : config.yFrom,
          paused : true
        },
        {
          y : config.yTo,
          duration : config.duration,
          ease : config.ease,
          stagger : config.stagger,
          delay : config.delay,
          onComplete : () => {
            // splitParent?.revert();
            // splitChild?.revert();
          }
        }
      ),
      splitChild,
      splitParent
    };
  },
  defaults : { duration : 0.5, yFrom : '2em', yTo : '0', stagger : 0.1, ease : 'power2.out', delay : 0 }, //defaults get applied to any "config" object passed to the effect
  extendTimeline : true //now you can call the effect directly on any GSAP timeline to have the result immediately inserted in the position you define (default is sequenced at the end)
};
