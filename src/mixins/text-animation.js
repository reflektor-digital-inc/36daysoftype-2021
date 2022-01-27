import { gsap } from 'gsap/all';
import { SplitText } from 'gsap/dist/SplitText';
import { mapState } from 'vuex';

gsap.registerPlugin(SplitText);

const ANIMATIONS = {
  slideUp : {
    from : {
      yPercent : 100
    },
    to : {
      yPercent : 0,
      duration : 1,
      ease : 'power3.out',
      stagger : 0.1
    },
    initial : { yPercent : 100 }
  },
  slideDown : {
    from : { yPercent : 0 },
    to : {
      yPercent : 100,
      duration : 1,
      ease : 'power3.out',
      stagger : 0.1
    },
    initial : { yPercent : -100 }
  },
  fade : {
    from : { autoAlpha : 0 },
    to : {
      autoAlpha : 1,
      duration : 0.5,
      ease : 'linear',
      stagger : 0.2
    },
    initial : { autoAlpha : 0 }
  },
  slideRight : {
    from : { xPercent : -100 },
    to : {
      xPercent : 0,
      duration : 0.5,
      ease : 'quad.out',
      stagger : 0.2
    },
    initial : { xPercent : -100 }
  },
  scaleIn : {
    from : { scaleX : 0 },
    to : {
      scaleX : 1,
      duration : 0.5,
      ease : 'power2.out'
    },
    initial : { scaleX : 0 }
  }
};

/**
 * @export
 * @description This mixin will create fade up animations with gsap. It will look for any refs
 * defined with 'this.defaultAnimationRefs'. This can be overridden with 'this.animationRefs'.
 *
 * @author Andrew Kim <andrew@reflektor.digital>
 */

export default {
    // watch : {
    //   windowSize : {
    //     deep : true,
    //     handler() {
    //       this.destroyAnimationElements();
    //       this.setUpAnimationElements();
    //       this.createTimeline(false);
    //       this.timeline.play();
    //     }
    //   }
    // },
  computed : {
    ...mapState([
      'windowSize'
    ]),
    isLoaderActive() {
      return this.$store.state.loader.isActive;
    }
  },
  created() {
    this.intersectionObserverConfig = {
      threshold : [ 0, 0.3, 1 ],

      // Function to check if the ratio (how much of the element is visible) should trigger the
      // animation
      isIntersecting : intersectionRatio => intersectionRatio > 0.1
    };

    this.defaultAnimationElements = [
      {
        name : 'heading',
        animationType : 'slideUp'
      },
      {
        name : 'copy',
        animationType : 'slideUp'
      },
      {
        name : 'description',
        animationType : 'fade'
      }
    ];

    this.isIntersecting = false;

    this.createLoaderStateWatcher();
  },
  async mounted() {
    // Use Scroll Trigger
    // this.setUpListeners();

    this.setUpAnimationElements();

    // User Intersection Observer
    this.createIntersectionObserver();
    this.createTimeline(false);
    await this.timeline.play();
    // this.destroyAnimationElements();
  },
  beforeDestroy() {
    this.destroyIntersectionObserver();
    this.removeListeners();
    this.destroyAnimationElements();

    // this.destroyTimelines();
  },
  methods : {
    createExitTimeline() {
      this.destroyAnimationElements();
      this.setUpAnimationElements();
      this.createTimeline(false, true);
      return this.timeline.play();
    },
    createIntersectionObserver() {
      this.intersectionObserver = new IntersectionObserver(this.handleIntersection, {
        threshold : this.intersectionObserverConfig.threshold
      });
      this.intersectionObserver.observe(this.$el);
    },
    destroyIntersectionObserver() {
      if (!this.intersectionObserver) return;
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    },
    handleIntersection(entries = []) {
      const [ entry ] = entries;
      if (!entry) return console.error('No entry');

      this.isIntersecting = this.intersectionObserverConfig.isIntersecting(entry.intersectionRatio);

      if (this.isLoaderActive) return;

      if (this.unwatchLoader) this.destroyLoaderStateWatcher();

      if (this.isIntersecting) {
        this.timeline?.play(null, false);
      }
      else {
        // removed to prevent timeline replaying when scrolling back
        // this.timeline.seek(0, false);
      }
    },
    setUpListeners() {
      this.$eventBus.on('scrollTriggerReady', this.createTimeline);
    },
    removeListeners() {
      this.$eventBus.off('scrollTriggerReady', this.createTimeline);
    },
    setUpAnimationElements() {
      try {
        this.animationElements = this.getAnimationElements();

        this.animationElements = this.animationElements.map((element) => {
          const { animationType, ref } = element;
          const { initial } = ANIMATIONS[animationType];

          if (animationType === 'slideUp') {
            const splitLineWrappers = new SplitText(ref, {
              type : 'lines',
              linesClass : 'SplitText__wrapper'
            });

            const splitLines = new SplitText(splitLineWrappers.lines, {
              type : 'lines',
              linesClass : 'SplitText__line'
            });

            gsap.set(splitLines.lines, initial);

            element.splitLineWrappers = splitLineWrappers;
            element.splitLines = splitLines;
          }
          else if (animationType === 'slideRight') {
            gsap.set(Array.isArray(ref) ? ref.map(ele => ele.children[0]) : ref, initial);
          }
          else {
            gsap.set(ref, initial);
          }

          return element;
        });
      }
      catch (error) {
        console.error('setUpAnimationElements error:', error.message);
      }
    },
    destroyAnimationElements() {
      try {
        if (this.animationElements) {
          this.animationElements.map(({ splitLineWrappers, splitLines }) => {
            if (splitLineWrappers) {
              splitLineWrappers.revert();
            }
            if (splitLines) {
              splitLines.revert();
            }
          });
          this.animationElements = null;
        }
      }
      catch (error) {
        console.error('destroyAnimationElements error:', error.message);
      }
      this.destroyTimelines();
    },
    createSlideUpTimeline(element, from, to, offset) {
      const { splitLines, splitLineWrappers } = element;
      const splitLineWrappersSetter = gsap.quickSetter(splitLineWrappers.lines, 'overflow');
      splitLineWrappersSetter('hidden');

      this.timeline.add(
        gsap.fromTo(
          splitLines.lines,
          from,
          {
            ...to

            // onStart           : () => splitLineWrappersSetter('hidden'),
            // onComplete        : () => splitLineWrappersSetter('visible'),
            // onReverseComplete : () => splitLineWrappersSetter('hidden')
            // removed to make reverse transition cleaner
          }
        ),
        offset
      );
    },
    createSlideRightTimeline(ref, from, to, offset) {
      this.timeline.add(gsap.fromTo(
        Array.isArray(ref) ?
          ref.map(ele => ele.children[0]) :
          ref,
        from,
        to
      ), offset);
    },
    createTimeline(withScrollTrigger = true, reverse = false) {
      try {
        this.timeline = gsap.timeline({
          // onComplete : () => {
          //   this.$nextTick(() => {
          //     this.destroyAnimationElements();
          //   });
          // },
          ...(withScrollTrigger && {
            scrollTrigger : {
              trigger : this.$el,
              markers : true,
              start : '50px bottom',
              end : 'bottom top',

              // Values oneOff: [ play, pause, resume, reverse, restart, reset, complete, none]
              // Toggle Actions: viewPortEnterBehaviour forwardPastEndpointBehaviour
              // backwardsInToView scrollPastStart
              toggleActions : 'restart none restart none'
            }
          }),
          paused : !withScrollTrigger
        });

        this.animationElements.map((element, index) => {
          const { animationType, ref } = element;
          const { to, from } = ANIMATIONS[animationType];
          const offset = 0.2 * index;

          if (!ANIMATIONS[animationType]) console.error(`${animationType} not found.`);

          switch (animationType) {
            case 'slideUp' :
              reverse ? this.createSlideUpTimeline(element, to, from, offset) : this.createSlideUpTimeline(element, from, to, offset);
              break;
            case 'slideRight' :
              this.createSlideRightTimeline(ref, from, to, offset);
              break;
            case 'fade' :
              this.timeline.add(gsap.fromTo(ref, from, { ...to, delay : 0.4 }), offset);
              break;
            default :
              this.timeline.add(gsap.fromTo(ref, from, to), offset);
              break;
          }
        });
      }
      catch (error) {
        console.error('createTimeline error:', error.message);
      }
    },
    destroyTimelines() {
      if (this.timelines) {
        this.timelines.map(tl => tl.kill());
        this.timelines = null;
      }
      if (this.timeline) {
        this.timeline.kill();
        this.timeline = null;
      }
    },
    getAnimationElements() {
      return (this.animationElements || this.defaultAnimationElements)
        .reduce((elements, element) => {
          const { name } = element;
          const ref = this.$refs[name];
          if (ref) {
            element.ref = ref;
            return [
              ...elements,
              element
            ];
          }
          return elements;
        }, []);
    },
    createLoaderStateWatcher() {
      this.unwatchLoader = this.$watch('isLoaderActive', this.handleLoaderActiveStateChange);
    },
    destroyLoaderStateWatcher() {
      if (this.unwatchLoader) {
        this.unwatchLoader();
        this.unwatchLoader = null;
      }
    },
    handleLoaderActiveStateChange(isActive) {
      if (this.isIntersecting && !isActive && this.timeline) {
        // this.timeline.play(null, false);

        this.destroyLoaderStateWatcher();
      }
    }
  }
};
