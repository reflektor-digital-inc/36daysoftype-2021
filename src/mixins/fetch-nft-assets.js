import { mapState, mapMutations } from 'vuex';
import { data } from '@data/letterData';
import letterIndexMap from '@data/letter-map';

export default {
  computed : {
    ...mapState({
      allNfts : state => state.nft.allNfts
    })
  },
  watch : {
    '$route'(route) {
      const selectedLetter = this.$route.path.split('/')[2];
      if (route.path.includes('letter') && selectedLetter) {
        let assetFromParam = null;
        let stop = false;
        for (let i = 0; i < this.allNfts.length && !stop; i++) {
          const asset = this.allNfts[i];
          if (asset.letter === selectedLetter) {
            assetFromParam = { ...asset };
            stop = true;
          }
        }
        
        const currentNftName = `#${String(assetFromParam.letterTitleIndex).padStart(2, '0')} Letter ${assetFromParam.letter.toUpperCase()} \u2013 ${assetFromParam.name}`;
        this.setCurrentNft({
          tokenId : assetFromParam.letter,
          letterIndex : assetFromParam.letterIndex,
          name : currentNftName,
          previewImage : assetFromParam.image,
          previewVideo : assetFromParam.video,
          price : assetFromParam.price,
          sold : assetFromParam.sold,
          owner : assetFromParam.owner
        });
      }
    }
  },
  async mounted() {
    await this.fetchNftAssets();
  },
  methods : {
    ...mapMutations({
      setAllNfts : 'nft/setAllNfts',
      setCurrentNft : 'nft/setCurrentNft'
    }),
    async fetchNftAssets() {
      const assetData = [];
      const letterKeys = Object.keys(data);
      
      for (let i = 0; i < letterKeys.length; i++) {
        const letterKey = letterKeys[i];
        const letterInfo = data[letterKey];
        const letterIndex = letterIndexMap[letterKey];
        const letterOwned = await this.$wallet.checkLetterOwnership(letterIndex);
        assetData.push({
          ...letterInfo,
          letter : letterKey,
          letterIndex,
          name : letterInfo.word.toString(),
          price : letterInfo.price,
          sold : letterOwned,
          image : letterInfo.imageThumb,
          video : letterInfo.videoThumb,
          owner : 'Reflektor Digital'
        });
      }
    
      // reorder the letters so that it's [a-z][0-9]
      const assets = [
        ...assetData.slice(10, assetData.length),
        ...assetData.slice(0, 10)
      ].map((letter, index) => ({
        ...letter,
        letterTitleIndex : index + 1
      }));

      this.setAllNfts(assets);
    }
  }
};
