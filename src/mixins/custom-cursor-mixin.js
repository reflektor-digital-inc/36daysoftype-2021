import { mapMutations } from 'vuex';

export default {
  mounted() {
    const { isMobile, isTouch } = this.$data.$_device;
    if (isMobile || isTouch) return;

    this.$nextTick(this.setupCursorElements);

    this.mouseEnterHandlers = [];
  },
  beforeDestroy() {
    this.removeCustomCursorListeners();
    this.customCursorElements = null;
  },
  methods : {
    ...mapMutations([
      'setCursorState'
    ]),
    setupCursorElements() {
      if (!this.targetParentEl) this.targetParentEl = this.$el;

      if (!this.$data.$_device.isMobile) {
        const cursorElements = this.targetParentEl.getAttribute('data-cursor') ?
          [ this.targetParentEl ] :
          [];
        const elements = this.targetParentEl.querySelectorAll('[data-cursor]');
        const elementsArr = [ ...elements, ...cursorElements ];
        if (elementsArr.length) {
          this.setupCursorEvents(elementsArr);
        }
      }
    },
    setupCursorEvents(elements) {
      this.customCursorElements = elements.map((el) => {
        const dataset = JSON.parse(el.getAttribute('data-cursor')) || {};
        let image;
        if (dataset.image) {
          image = new Image();
          image.src = dataset.image;
        }

        const mouseEnterHandler = e => this.mouseEnterHandler(e, image);

        el.addEventListener('mouseenter', mouseEnterHandler);
        el.addEventListener('mouseleave', this.mouseLeaveHandler);

        return { el, mouseEnterHandler };
      });
    },
    removeCustomCursorListeners() {
      if (this.customCursorElements && this.customCursorElements.length) {
        this.customCursorElements.map((obj) => {
          obj.el.removeEventListener('mouseenter', obj.mouseEnterHandler);
          obj.el.removeEventListener('mouseleave', this.mouseLeaveHandler);
        });
      }
    },
    mouseEnterHandler(e, image = null) {
      const target = e.target;
      try {
        const dataset = JSON.parse(target.getAttribute('data-cursor')) || {};
        const { mode } = dataset;
        mode && this.setCursorState({ mode, image });
      }
      catch (error) {
        console.error(error.message);
      }
    },
    mouseLeaveHandler() {
      this.setCursorState({ mode : 'default' });
    }
  }
};
