<template>
  <div class="PurchaseConfirm">
    <div class="PurchaseConfirm__bg" @click="closePurchaseConfirm" />
    <div class="PurchaseConfirm__modal">
      <div
        v-if="transactionInProgress"
        class="PurchaseConfirm__message"
      >
        Transaction in progress...
      </div>
      <div
        v-else-if="transactionDone"
        class="PurchaseConfirm__message"
      >
        Purchase complete!
      </div>
      <div v-else class="PurchaseConfirm__message">
        <p>Token ID: {{ currentNftTokenId }}</p>
      </div>
      <div class="PurchaseConfirm__buttons">
        <button v-if="!transactionInProgress" @click="cancel">
          Cancel
        </button>
        <button v-if="!transactionDone && !transactionInProgress" @click="confirm">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';

  export default {
    name : 'PurchaseConfirm',
    data() {
      return {
        transaction : 'inactive'
      };
    },
    computed : {
      ...mapState({
        currentNft : state => state.nft.currentNft,
        nftItemId : state => state.nft.currentNft.itemId
      }),
      transactionInProgress() {
        return this.transaction === 'in-progress';
      },
      transactionDone() {
        return this.transaction === 'done';
      }
    },
    methods : {
      ...mapMutations({
        closePurchaseConfirm : 'nft/closePurchaseConfirm'
      }),
      cancel() {
        this.closePurchaseConfirm();
      },
      async confirm() {
        this.transaction = 'in-progress';
        
        const tx = await this.$wallet.purchaseNFT(this.currentNft.letterIndex); // eslint-disable-line

        setTimeout(() => {
          this.transaction = 'done';
        }, 5000);
        
        this.closePurchaseConfirm();
      }
    }
  };
</script>

<style lang="scss">
  .PurchaseConfirm {
    @include full-size;
    display: flex;
    justify-content: center;
    align-items: center;

    &__bg {
      @include full-size;
      background-color: rgba($black, 0.8);
      pointer-events: auto;
      z-index: 1;
    }

    &__modal {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 400px;
      height: 200px;
      position: relative;
      padding: 30px;
      background-color: $white;
      color: $black;
      z-index: 2;
      pointer-events: auto;
    }

    &__buttons {
      button {
        padding: 5px 10px;
        border: 2px solid $black;
        background-color: $black;
        color: $white;
        cursor: pointer;

        &:hover {
          opacity: 0.7;
        }

        &:first-child {
          background: transparent;
          color: $black;
          margin-right: 10px;

          &:hover {
            opacity: 0.5;
          }
        }
      }
    }
  }
</style>
