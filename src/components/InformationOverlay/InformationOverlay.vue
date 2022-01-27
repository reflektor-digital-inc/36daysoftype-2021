<template>
  <div
    :class="['InformationOverlay', {'InformationOverlay--mobile': isMobileLayout}]"
  >
    <div ref="informationCard">
      <div
        v-if="isInfoOverlayOpen"
        class="InformationOverlay__card"
        @mouseleave="() => !isMobileLayout && mouseLeaveHandler()"
      >
        <Icons
          v-if="isMobileLayout"
          class="InformationOverlay__card-close"
          @click="() => isInfoOverlayOpen && closeOverlay()"
        >
          <IconClose
            class="Icons__icon-svg"
          />
        </Icons>
        <h1 class="InformationOverlay__card-heading">
          {{ word }}
        </h1>
        <p class="InformationOverlay__card-description">
          {{ creator }}
          <br>
          <strong>Tech: </strong>{{ tech }}
        </p>
        <a
          :href="source"
          target="_blank"
          class="InformationOverlay__card-source"
        >
          <IconSource />
          View Source
        </a>
      </div>
    </div>
    <div class="InformationOverlay__icons">
      <Icons
        :class="['InformationOverlay__icon', {'Icons--active': isInfoOverlayOpen && !isMobileLayout}]"
        @mouseenter="() => !isMobileLayout && toggleInfoOverlay()"
        @click="() => (isMobileLayout && !isInfoOverlayOpen) && openOverlay()"
      >
        <IconInfo
          class="Icons__icon-svg"
          height="19"
        />
      </Icons>
      <div class="InformationOverlay__icon">
        <div
          ref="shareIcons"
          class="InformationOverlay__icons-share"
          @mouseenter="() => isShareIconVisible && showShareIcons()"
          @mouseleave="shareMouseLeave"
        >
          <Icons
            ref="iconCopy"
            class="Icons__icon-share"
            @click="shareLink"
          >
            <IconCopy class="Icons__icon-svg" height="16" />
          </Icons>
          <Icons
            ref="iconLinkedin"
            class="Icons__icon-share"
            @click="shareLinkedIn"
          >
            <IconLinkedin class="Icons__icon-svg" height="10" />
          </Icons>
          <Icons
            ref="iconTwitter"
            class="Icons__icon-share"
            @click="shareTwitter"
          >
            <IconTwitter class="Icons__icon-svg" height="12" />
          </Icons>
        </div>
        <Icons
          @mouseenter="() => !isMobileLayout && showShareIcons()"
          @mouseleave="shareMouseLeave"
          @click="() => isMobileLayout && openShareDialog()"
        >
          <IconShare
            height="16"
            :class="['Icons__icon-svg']"
          />
        </Icons>
      </div>
      <Icons class="InformationOverlay__icon" @click="() => toggleAudio()">
        <IconAudio
          width="18"
          :class="['Icons__icon-svg', 'InformationOverlay__icons--unmuted', {'InformationOverlay__icons--muted': muteState}]"
        />
      </Icons>
    </div>
  </div>
</template>

<script>
  import { Howler } from 'howler';
  import _get from 'lodash/get';
  import gsap from 'gsap';
  import { mapState, mapMutations } from 'vuex';
  import IconAudio from '@assets/svgs/icon-audio.svg';
  import IconShare from '@assets/svgs/icon-share.svg';
  import IconInfo from '@assets/svgs/icon-info.svg';
  import IconTwitter from '@assets/svgs/icon-twitter.svg';
  import IconLinkedin from '@assets/svgs/icon-linkedin.svg';
  import IconCopy from '@assets/svgs/icon-copy.svg';
  import IconClose from '@assets/svgs/icon-close.svg';
  import IconSource from '@assets/svgs/ui/source.svg';
  import Icons from '@components/Icons/Icons.vue';
  import letterData from '@data/letterData.js';
  import share from 'share-dialog';
  import copy from 'copy-text-to-clipboard';

  export default {
    name : 'InformationOverlay',
    components : {
      IconAudio,
      Icons,
      IconInfo,
      IconSource,
      IconShare,
      IconLinkedin,
      IconTwitter,
      IconCopy,
      IconClose
    },
    props : {
      isMobileLayout : {
        type : Boolean,
        required : false,
        default : false
      }
    },
    data() {
      return {
        muteState : false,
        overlayTimeout : null,
        shareAnimationTimeout : null,
        shareAnimationTimeline : null,
        isShareIconVisible : false
      };
    },
    computed : {
      ...mapState({
        isInfoOverlayOpen : state => state.overlays.isInfoOverlayOpen
      }),
      letterInfo() {
        const data = letterData(this.$route.name.split('-')[1]);
        return data;
      },
      word() {
        return _get(this.letterInfo, 'word', 'NA');
      },
      source() {
        return _get(this.letterInfo, 'sourceLink', 'http://google.com');
      },
      creator() {
        return _get(this.letterInfo, 'creator', 'NA');
      },
      tech() {
        return _get(this.letterInfo, 'tech', '');
      }
    },
    mounted() {
      //
      gsap.set(this.$refs.informationCard, {
        xPercent : 100
      });
    },
    methods : {
      ...mapMutations({
        openInfoOverlay : 'overlays/openInfoOverlay',
        closeInfoOverlay : 'overlays/closeInfoOverlay'
      }),
      toggleAudio() {
        this.muteState = !this.muteState;
        Howler.mute(this.muteState);
      },
      openShareDialog() {
        const shareData = {
          title : '',
          text : '',
          url : window.location.href
        };
        navigator.share(shareData);
      },
      showShareIcons() {
        clearTimeout(this.shareAnimationTimeout);
        if (!this.isShareIconVisible) {
          const copyIcon = this.$refs.iconCopy.$el;
          const copyTwitter = this.$refs.iconTwitter.$el;
          const copyLinkedin = this.$refs.iconLinkedin.$el;
          const shareIcons = this.$refs.shareIcons;
          gsap.to(shareIcons, {
            opacity : 1,
            x : -50,
            duration : 0.2,
            delay : 0.2
          });
          gsap.to([copyIcon, copyLinkedin, copyTwitter], {
            opacity : 1,
            duration : 0.2
          });
          gsap.to([copyLinkedin, copyTwitter], {
            duration : 0.2,
            x : -45,
            delay : 0.2
          });
          gsap.to(copyTwitter, {
            duration : 0.2,
            x : -90,
            delay : 0.2
          });
        }
        this.isShareIconVisible = true;
      },
      hideShareIcons() {
        const copyIcon = this.$refs.iconCopy.$el;
        const shareIcons = this.$refs.shareIcons;
        const copyTwitter = this.$refs.iconTwitter.$el;
        const copyLinkedin = this.$refs.iconLinkedin.$el;
        gsap.to(copyTwitter, {
          duration : 0.2,
          x : -90,
          delay : 0.2
        });
        gsap.to([copyLinkedin, copyTwitter], {
          duration : 0.2,
          x : -45,
          delay : 0.2
        });
        gsap.to([copyIcon, copyLinkedin, copyTwitter], {
          opacity : 1,
          duration : 0.2,
          x : 0,
          delay : 0.2
        });
        gsap.to(shareIcons, {
          opacity : 0,
          x : 0,
          duration : 0.2,
          delay : 0.2
        });
        this.isShareIconVisible = false;
      },
      shareMouseLeave() {
        this.shareAnimationTimeout = this.isShareIconVisible && setTimeout(() => this.hideShareIcons(), 200);
      },
      shareLinkedIn() {
        share.linkedIn(window.location.href).open();
      },
      shareTwitter() {
        share.twitter(window.location.href).open();
      },
      shareLink() {
        copy(window.location.href);
      },
      closeOverlay() {
        if (!this.isMobileLayout) {
          gsap.to(this.$refs.informationCard, {
            xPercent : 100,
            duration : 0.4,
            ease : 'power2.in',
            onComplete : () => {
              this.closeInfoOverlay();
            }
          });
        }
        else {
          gsap.fromTo(this.$refs.informationCard, {
            y : 0,
            x : 0
          }, {
            y : -265,
            duration : 0.4,
            ease : 'power2.in',
            onComplete : () => {
              this.closeInfoOverlay();
            }
          });
        }
      },
      openOverlay() {
        this.openInfoOverlay();
        if (!this.isMobileLayout) {
          gsap.fromTo(this.$refs.informationCard, {
            xPercent : 100,
            y : 0
          }, {
            xPercent : 1,
            ease : 'power2.out',
            duration : 0.4
          });
        }
        else {
          gsap.fromTo(this.$refs.informationCard, {
            x : 0,
            y : -265
          }, {
            y : 0,
            ease : 'power2.out',
            duration : 0.4
          });
        }
      },
      toggleInfoOverlay() {
        if (this.isInfoOverlayOpen) {
          this.closeOverlay();
        }
        else {
          this.openOverlay();
        }
      },
      mouseLeaveHandler() {
        this.overlayTimeout = setTimeout(() => this.toggleInfoOverlay(), 100);
      },
      clearOverlayTimeout() {
        clearTimeout(this.overlayTimeout);
      }
    }
  };
</script>

<style lang="scss">
  .InformationOverlay {
    z-index: $information-overlay-z;
    $padding: 1.9em;
    position: fixed;
    right: 1px;
    top: 50%;
    width: 375px;
    height: 216px;
    transform: translateY(-50%);
    &--mobile {
      top: 0;
      transform: translateY(0);
      width: calc(100% - 2px);
      height: 265px;
      & .InformationOverlay__card {
        padding-top: $padding * 3.2;
        width: 100%;
        height: 281px;

        &-close {
          position: absolute;
          top: $padding;
          right: 18px;
        }
      }
      & .InformationOverlay__icons {
        position: absolute;
        right: 18px;
        bottom: $padding * 2;
        width: fit-content;
      }
    }

    &__icon {
      position: relative;
    }

    &__card {
      position: absolute;
      width: 375px;
      height: 216px;
      background: #0f0f0f;
      padding: $padding;
      color: $white;
      right: 0;
      pointer-events: auto;

      &::after {
        content: "";
        position: absolute;
        width: calc(100% + 2px);
        top: -1px;
        left: -1px;
        height: calc(100% + 2px);
        background: $popsicle-gradient;
        z-index: -1;
      }

      &-heading {
        @include fk-display-regular(24, 0, 0.8);
      }
      &-description {
        @include fk-grotesk-neue-regular(14, 0, 1.714);
        padding-right: 60px;
      }
      &-source {
        position: absolute;
        @include fk-grotesk-neue-regular(14, 0, 1.714);
        bottom: $padding;
        & svg {
          height: 11.54px;
        }
        cursor: pointer;
        pointer-events: auto;
        background: transparent;
        color: $white;
        padding: 0;
        border: none;
      }
    }
    &__icons {
      position: absolute;
      top: 50%;
      cursor: pointer;
      transform: translateY(-50%);
      right: $padding;
      & .InformationOverlay__icon + .InformationOverlay__icon {
        margin-top: 10px;
      }
      &--muted .rect {
        width: 3px;
      }
      &-share {
        position: absolute;
        top: 0;
        right: 8px;
      }
    }
    .Icons__icon-share {
      opacity: 0;
      .Icons__icon-svg {
        opacity: 1;
        transition: opacity 0.3s;
      }
      &:hover {
        .Icons__icon-svg {
          opacity: 0.75;
        }
      }
    }
  }
</style>
