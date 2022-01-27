require('intersection-observer');

/**
 * Class to create and use IntersectionObserver instances.
 * @export
 * @class
 * @classdesc This is a helper class for creating IntersectionObserver instances.
 */
export default class IntersectionHelper {
  /**
   * Create instance variables and initialize IntersectionObserver instance
   * @param {Object} options - Options for creating class.
   * @param {HTMLElement} options.element - The element to observe
   * @param {Number} options.elementHeight - The height of the element.
   * @param {Number} options.threshold - Number which indicate at what percentage of the target's
   * visibility the observer's callback should be executed.
   * @param {Number} options.windowHeight - Height of window or viewport.
   * @param {handleIntersection} options.cb - Callback function for intersection. The callback
   *   function will receive the entry as the first argument. Check 'entry.isIntersecting'.
   * @param {String} [options.direction=both] - The scroll direction to call the callback.
   * Values must be one of: both, up, down. Default is both.
   * @param {Boolean} [options.willUnobserve=false ] - Optional boolean to stop observing after the
   * first. Default is false.
   * callback.
   */
  constructor({ element, elementHeight, threshold, windowHeight, cb, direction, willUnobserve }) {
    this.threshold = threshold;
    this.callback = cb;
    this.direction = direction || 'both';
    this.willUnobserve = willUnobserve || false;

    // Update these values on resize
    this.windowHeight = windowHeight;
    this.elementHeight = elementHeight;
    this.element = element;

    this.previousIntersectionRatio = null;

    this.init();
  }

  init() {
    // Initial Set Up
    this.screenThresholdSize = this.windowHeight * (1 - this.threshold);

    this.intersectionThreshold = Math.min(0.99, this.screenThresholdSize / this.elementHeight);

    this.options = {
      threshold : this.intersectionThreshold
    };

    this.intersectionObserver = new IntersectionObserver(this.handleIntersection, this.options);
  }

  determineScrollDirection(entry) {
    if (!this.previousIntersectionRatio || !entry.intersectionRatio) return;

    if (this.previousIntersectionRatio >= entry.intersectionRatio) {
      return 'down';
    }

    if (this.previousIntersectionRatio < entry.intersectionRatio) {
      return 'up';
    }

    return null;
  }

  handleIntersection(entries, observer) {
    const [ entry ] = entries;
    this.scrollDirection = this.determineScrollDirection(entry);

    // No direction or both
    if (!this.scrollDirection || this.direction === 'both') {
      this.callback(entry, observer);
    }

    // Scroll up
    if (this.scrollDirection === 'up' && this.direction === 'up') {
      (this.callback && this.callback(entry, observer));
      (this.willUnobserve && this.unobserve());
    }

    // Scroll down
    if (this.scrollDirection === 'down' && this.direction === 'down') {
      (this.callback && this.callback(entry, observer));
      (this.willUnobserve && this.unobserve());
    }

    // Cache intersectionRatio to compare with next value to determine scroll direction
    this.previousIntersectionRatio = entry.intersectionRatio;
  }

  observe = () => {
    this.intersectionObserver.observe(this.element);
  };

  unobserve = () => {
    this.intersectionObserver.unobserve(this.element);
  };

  destroy = () => {
    this.intersectionObserver.unobserve(this.element);
    this.intersectionObserver.disconnect();
    this.intersectionObserver = null;
  };
}

/**
 * Callback for handling element intersecting (true and false)
 * @callback handleIntersection
 * @param {Object} entry - The element that is being observed.
 * @param {Object} observer - The IntersectionObserver instance.
 */

/**
 * @type {HTMLElement}
 */
