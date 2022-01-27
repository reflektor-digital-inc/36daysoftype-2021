/* BASIC ANIMATIONS */
export const opacityFadeUp = (element, { duration = 0.5 } = {}) => TweenMax.fromTo(
  element,
  duration,
  { autoAlpha : 0 },
  { autoAlpha : 1, ease : Linear.easeNone }
);

export const translateFadeUp = (
  element,
  { duration = 0.8, y = 20, ease = Sine.easeOut } = {}
) => TweenMax.fromTo(element, duration, { y }, { y : 0, ease });

/* CLASSIC ANIMATIONS */
export const classicFadeUp = (element, { duration = 0.8, y = 20, ease = Sine.easeOut } = {}) => {
  const timeline = new TimelineMax();
  timeline.add(translateFadeUp(element, { duration, y, ease }));
  timeline.add(opacityFadeUp(element, { duration : duration * 0.5 }), 0);
  return timeline;
};

export const dotFadeUp = (element, { duration = 0.8 } = {}) => {
  const timeline = new TimelineMax();
  timeline.fromTo(element, duration, { y : '150%' }, { y : '50%' });
  timeline.add(opacityFadeUp(element, { duration }), 0);
  return timeline;
};

/* COMPLEX ANIMATIONS */
export const listFadeUp = (elements, {
  duration = 1,
  y = 30,
  ease = Power2.easeOut,
  stagger = 0.1
} = {}) => {
  const timeline = new TimelineMax();

  // Use the spread operator here to be sure the elements is an Array and not a NodeArray
  [ ...elements ].forEach((elm, index) => {
    timeline.add(classicFadeUp(elm, { duration, ease, y }), index * stagger);
  });
  return timeline;
};

// TODO use the animations methods
export const charsFadeUp = ({ chars, duration = 1, stagger = 0.05, paused = false }) => {
  const timeline = new TimelineMax({ paused });
  chars.map((c, index) => {
    timeline.fromTo(
      c,
      duration,
      { yPercent : 80, xPercent : 0 },
      { yPercent : 0, xPercent : 0, ease : Expo.easeOut },
      index * stagger
    );
    timeline.add(opacityFadeUp(c, { duration : duration * 0.5 }), index * stagger);
  });
  return timeline;
};
