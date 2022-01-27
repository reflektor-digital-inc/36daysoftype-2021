/**
 * @export
 * @module
 * @class Analytics.
 * @classdesc This is a helper class for tracking events and page views for Google Analytics.
 */

class Analytics {
  /**
   * @description Track a custom event
   * @param {Object} params - Function parameters object.
   * @param {String} params.category - Typically the object that was interacted with (e.g. 'Video').
   * @param {String} params.action - The type of interaction (e.g. 'play').
   * @param {String} [params.label=''] - Useful for categorizing events (e.g. 'Fall Campaign').
   * @param {Number} [params.value=0] - A numeric value associated with the event (e.g. 42).
   * @return {undefined}
   */
  trackEvent({ category, action, label = '', value = 0 }) {
    if (ga) {
      ga('send', 'event', category, action, `${label} | Page: ${value}`, 0);
    }
  }

  /**
   * @description Track a page view
   * @param {String} page - The name of the page viewed
   * @return {undefined}
   */
  trackPage(page) {
    if (ga) {
      ga('send', 'pageview', page);
    }
  }
}

export default new Analytics();
