import gsap from 'gsap'; // eslint-disable-line
import * as _ from 'lodash';
import * as PIXI from 'pixi.js';
import { isMobile } from 'pixi.js';
import EventBus from '@utils/event-bus';
import store from '@src/store/store.js';
import {
  DIAMOND_SIZE,
  DIAMOND_SIZE_MOBILE,
  DIAMOND_PADDING,
  DIAMOND_PADDING_MOBILE
} from './Loader.settings';

const messages = {
  home : '',
  about : 'It was a labour of love',
  contact : `We'd love to hear from you`,
  letter : 'Each letter has a secret interaction.\nTry to find them all'
};

class LoaderCanvas {
  constructor({
    canvasEl,
    width,
    height,
    resolution = window.devicePixelRatio,
    animationWatcher = () => {}
  }) {
    this.canvasEl = canvasEl;
    this.containerWidth = width;
    this.containerHeight = height;
    this.resolution = resolution;

    this.app = new PIXI.Application({
      width : width * this.resolution,
      height : height * this.resolution,
      resolution,
      antialias : false,
      autoDensity : true,
      backgroundAlpha : 0
    });

    this.container = null;
    this.message = null;
    this.messageText = '';
    this.blackBoxContainer = null;
    this.diamondContainer = null;
    this.scalingDiamondContainer = null;
    this.diamonds = [];
    this.scalingDiamonds = [];
    this.animIterations = 1;
    this.loading = true;
    this.animationWatcher = animationWatcher;
    this.hasAnimatedOut = false;
    // Stylings
    this.diamondSize = isMobile.phone ? DIAMOND_SIZE_MOBILE : DIAMOND_SIZE;
    this.diamondPadding = isMobile.phone ? DIAMOND_PADDING_MOBILE : DIAMOND_PADDING;
    this.diamondBorderColor = 0xC839AC;

    this.canvasEl.appendChild(this.app.view);
    this.initContainer();
    this.addResizeListener();
  }

  initContainer() {
    if (this.container) this.container.destroy();

    this.container = new PIXI.Container();
    this.container.width = this.containerWidth;
    this.container.height = this.containerHeight;
  }

  addResizeListener() {
    window.addEventListener('resize', _.throttle(() => {
      this.containerWidth = window.innerWidth;
      this.containerHeight = window.innerHeight;
      this.app.renderer.resize(this.containerWidth, this.containerHeight);
    }, 300));
  }

  drawMessage() {
    if (this.message) this.message.destroy();

    this.message = new PIXI.Text(
      this.messageText,
      {
        fontFamily : 'FK Grotesk Neue',
        fontSize : 14,
        fill : 0xffffff,
        align : 'center',
        lineHeight : 18
      }
    );
    this.message.position.set(this.containerWidth / 2, this.containerHeight / 1.6);
    this.message.anchor.set(0.5, 0.5);

    this.container.addChild(this.message);
  }

  drawBlackBoxes() {
    if (this.blackBoxContainer) {
      this.middleBox.destroy();
      this.middleBox = null;
      this.middleBoxFilled.destroy();
      this.middleBoxFilled = null;
      this.blackBoxContainer.removeChildren();
      this.blackBoxContainer.destroy();
      this.blackBoxContainer = null;
    }

    this.blackBoxContainer = new PIXI.Container();

    const sideOffset = 1000;

    const blackBoxTop = new PIXI.Graphics();
    blackBoxTop.beginFill(0x000000);
    blackBoxTop.drawRect(
      -sideOffset,
      -sideOffset,
      this.containerWidth + sideOffset * 2 + 1,
      this.containerHeight / 2 - (this.diamondSize / 2) + sideOffset
    );
    blackBoxTop.endFill();

    const blackBoxBottom = new PIXI.Graphics();
    blackBoxBottom.beginFill(0x000000);
    blackBoxBottom.drawRect(
      -sideOffset,
      this.containerHeight / 2 + (this.diamondSize / 2),
      this.containerWidth + sideOffset * 2 + 1,
      this.containerHeight / 2 - (this.diamondSize / 2) + sideOffset + 1
    );
    blackBoxBottom.endFill();

    const blackBoxLeft = new PIXI.Graphics();
    blackBoxLeft.beginFill(0x000000);
    blackBoxLeft.drawRect(
      -sideOffset,
      this.containerHeight / 2 - (this.diamondSize / 2),
      this.containerWidth / 2 - (this.diamondSize / 2) + sideOffset,
      this.containerHeight / 2 + (this.diamondSize / 2)
    );
    blackBoxLeft.endFill();

    const blackBoxRight = new PIXI.Graphics();
    blackBoxRight.beginFill(0x000000);
    blackBoxRight.drawRect(
      this.containerWidth / 2 + (this.diamondSize / 2),
      this.containerHeight / 2 - (this.diamondSize / 2),
      this.containerWidth / 2 - (this.diamondSize / 2) + sideOffset + 1,
      this.containerHeight / 2 + (this.diamondSize / 2)
    );
    blackBoxRight.endFill();

    this.middleBox = new PIXI.Graphics();
    this.middleBox.lineStyle({
      width : 1,
      color : this.diamondBorderColor,
      native : true
    });
    this.middleBox.drawRect(
      this.containerWidth / 2 - (this.diamondSize / 2),
      this.containerHeight / 2 - (this.diamondSize / 2),
      this.diamondSize,
      this.diamondSize
    );
    this.middleBox.alpha = 0;

    this.middleBoxFilled = new PIXI.Graphics();
    this.middleBoxFilled.beginFill(0x000000);
    this.middleBoxFilled.drawRect(
      this.containerWidth / 2 - (this.diamondSize / 2),
      this.containerHeight / 2 - (this.diamondSize / 2),
      this.diamondSize,
      this.diamondSize
    );
    this.middleBoxFilled.endFill();

    this.blackBoxContainer.pivot.set(window.innerWidth / 2, window.innerHeight / 2);
    this.blackBoxContainer.position.x = window.innerWidth / 2;
    this.blackBoxContainer.position.y = window.innerHeight / 2;
    this.blackBoxContainer.rotation = Math.PI / 4;

    this.blackBoxContainer.addChild(blackBoxTop);
    this.blackBoxContainer.addChild(blackBoxBottom);
    this.blackBoxContainer.addChild(blackBoxLeft);
    this.blackBoxContainer.addChild(blackBoxRight);
    this.blackBoxContainer.addChild(this.middleBoxFilled);
    this.blackBoxContainer.addChild(this.middleBox);
    this.container.addChild(this.blackBoxContainer);
  }

  drawDiamonds() {
    if (this.diamondContainer) {
      this.diamonds.forEach(d => d.destroy());
      this.diamonds = [];
      this.diamondContainer.removeChildren();
      this.diamondContainer.destroy();
      this.diamondContainer = null;
    }

    const length = this.diamondSize;
    const padding = this.diamondPadding;
    this.diamondContainer = new PIXI.Container();
    this.diamondContainer.position.x = this.containerWidth / 2;
    this.diamondContainer.position.y = this.containerHeight / 2;

    for (let i = 0; i < 4; i++) {
      const diamond = new PIXI.Graphics();
      diamond.lineStyle({
        width : 1,
        color : this.diamondBorderColor,
        native : true
      });
      diamond.beginFill(0x000000);
      diamond.drawRect(
        i * padding,
        i * padding,
        length - (i * padding * 2),
        length - (i * padding * 2)
      );
      diamond.endFill();
      diamond.pivot.x = length / 2;
      diamond.pivot.y = length / 2;

      this.diamonds.push(diamond);
      this.diamondContainer.addChild(diamond);
    }
    this.container.addChild(this.diamondContainer);

    // note [william/20220117]:
    //   only enable this if the initial
    //   value of this.animIterations is even
    // gsap.set(this.diamonds.map(d => d), { rotation : -Math.PI / 4 });
  }

  drawScalingDiamonds() {
    if (this.scalingDiamondContainer) {
      this.scalingDiamonds.forEach(d => d.destroy());
      this.scalingDiamonds = [];
      this.scalingDiamondContainer.removeChildren();
      this.scalingDiamondContainer.destroy();
      this.scalingDiamondContainer = null;
    }

    const length = this.diamondSize;
    const padding = this.diamondPadding;
    this.scalingDiamondContainer = new PIXI.Container();
    this.scalingDiamondContainer.position.x = this.containerWidth / 2;
    this.scalingDiamondContainer.position.y = this.containerHeight / 2;

    for (let i = 0; i < 3; i++) {
      const scalingDiamond = new PIXI.Graphics();
      scalingDiamond.lineStyle({
        width : 1,
        color : this.diamondBorderColor,
        native : true
      });
      scalingDiamond.drawRect(
        i * padding,
        i * padding,
        length - (i * padding * 2),
        length - (i * padding * 2)
      );
      scalingDiamond.pivot.x = length / 2;
      scalingDiamond.pivot.y = length / 2;
      scalingDiamond.alpha = 0;

      this.scalingDiamonds.push(scalingDiamond);
      this.scalingDiamondContainer.addChild(scalingDiamond);
    }

    this.container.addChild(this.scalingDiamondContainer);
  }

  rotateDiamonds() {
    const diamondRotateTl = gsap.timeline();
    diamondRotateTl
      .to(
        this.diamonds.map(d => d.scale),
        { x : 2, y : 2, duration : 0.8, ease : 'power1.inOut', stagger : 0.05 }
      )
      .to(
        this.diamonds.map(d => d),
        {
          rotation : -(Math.PI / 4 * this.animIterations),
          duration : 0.8,
          ease : 'power1.inOut',
          stagger : 0.05,
          onComplete : () => {
            this.animIterations++;
          }
        },
        0
      )
      .to(
        this.diamonds.slice().reverse().map(d => d.scale),
        { x : 1, y : 1, duration : 0.8, ease : 'power1.inOut', stagger : 0.05 },
        1
      )
      .to(
        this.diamonds.map(d => d),
        {
          rotation : -(Math.PI / 4 * (this.animIterations + 1)),
          duration : 0.8,
          ease : 'power1.inOut',
          stagger : 0.05,
          onComplete : () => {
            this.animIterations++;
            if (this.loading) {
              this.rotateDiamonds();
            }
            else {
              this.animateOut();
            }
          }
        },
        1
      );
  }

  maskIn() {
    const animateInTl = gsap.timeline()
      .set(
        this.middleBoxFilled,
        { alpha : 0 },
      )
      .to(
        this.blackBoxContainer,
        { rotation : -Math.PI / 2, duration : 2, ease : 'power2.inOut' },
        0
      )
      .fromTo(
        this.blackBoxContainer.scale,
        {
          x : 100,
          y : 100
        },
        {
          x : 0.9,
          y : 0.9,
          duration : 2,
          ease : 'power2.out'
        },
        0
      )
      .fromTo(
        this.diamonds.map(d => d.scale),
        {
          x : 0, y : 0,
          rotation : Math.PI / 2
        },
        { x : 1, y : 1, rotation : 0, duration : 0.4, stagger : 0.1 },
        '-=0.5'
      )
      .to(
        this.middleBoxFilled,
        { alpha : 1, duration : 0.4 },
        '-=0.1'
      );
    return animateInTl.play();
  }
  
  async animateIn() {
    this.drawBlackBoxes();
    this.drawDiamonds();
    this.drawScalingDiamonds();
    this.animationWatcher(true);
    this.app.stage.addChild(this.container);
    if (this.hasAnimatedOut) {
      await this.maskIn();
    }
    const next = store.getters['loader/getNext'];
    if (next)
      next();
    
    this.rotateDiamonds();
    this.drawMessage();
  }

  animateOut() {
    const animateOutTl = gsap.timeline();
    this.hasAnimatedOut = true;

    // hide the loading diamonds
    animateOutTl
      .to(
        this.diamonds.map(d => d),
        { alpha : 0, duration : 0.4, ease : 'steps(12)', stagger : 0.1 }
      )
      .to(
        this.message,
        {
          alpha : 0,
          duration : 0.6,
          ease : 'power1.inOut'
        },
        0
      )
      .to(
        this.scalingDiamonds.map(d => d),
        {
          alpha : 1, duration : 0.4, ease : 'power1.inOut', stagger : 0.2,
          onComplete : () => {
            EventBus.emit('isLoading', false);
          }
        },
        0.3
      )
      .to(
        this.scalingDiamonds.map(d => d),
        {
          rotation : Math.PI / 2, duration : 2, ease : 'power1.inOut', stagger : 0.2
        },
        0.3
      )
      .to(
        // show and scale up + rotate clockwise the scaling diamonds
        this.scalingDiamonds.map(d => d.scale),
        {
          x : 100,
          y : 100,
          duration : 3,
          ease : 'power1.inOut',
          stagger : 0.3
        },
        0.3
      )
      .to(
        this.middleBoxFilled,
        { alpha : 0, duration : 2, delay : 0.5, ease : 'power1.inOut' },
        0.3
      )
      .to(
        this.middleBox,
        { alpha : 1, duration : 4, ease : 'power1.inOut' },
        0.3
      )
      .to(
        this.blackBoxContainer,
        { rotation : Math.PI / 2, duration : 2, delay : 1, ease : 'power1.inOut' },
        0.3
      )
      .to(
        this.blackBoxContainer.scale,
        {
          x : 100,
          y : 100,
          duration : 4,
          delay : 1,
          ease : 'power1.inOut',
          onStart : () => {
            this.animationWatcher(false);
          },
          onComplete : () => {
            this.setLoadingState(false);
            this.animIterations = 1;
          }
        },
        0.3
      );
  }

  setLoadingState(isLoading, page) {
    if (page) this.messageText = messages[page];
    this.loading = isLoading;
  }
}

export default LoaderCanvas;
