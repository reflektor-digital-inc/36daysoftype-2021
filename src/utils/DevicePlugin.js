import eventBus from './event-bus';

export default class Device {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.checkResolution = this.checkResolution.bind(this);
    this.checkResolution();

    eventBus.$on('windowResize', (width, height) => {
      // console.log('window resize emitted in device');
      this.width = width;
      this.height = height;
      this.checkResolution();
    });
  }

  checkResolution() {
    this.isPhone = (this.width < 728 && this.width >= 300);
    this.isTablet = (this.width >= 728 && this.width <= 1024);
    this.isMobile = (this.isPhone || this.isTablet);

    // console.log('this.isMobile:', this.isMobile);
  }
}
