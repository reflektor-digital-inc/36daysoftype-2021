const { expect } = require('chai');

describe('NFT Deploy', () => {

  // before(() => {

  // })

  it('Deploy the NFT contract, mint a token, and ensure that we have the right metadata associated with the tokenId', async () => {
    const NFT = await ethers.getContractFactory('ReflektorNFT');

    const alpha = "0123456789abcdefghijklmnopqrstuvwxyz";
    const letters = alpha.split('');
    const nft = await NFT.deploy(letters, "http://localhost:3000/");
    await nft.deployed();




    const txLetters = await nft.getAllDefaultLetters();

    const allLetters = txLetters.map((letterData) => {
      console.info(letterData);
    })

  //   const characters = charactersTxn.map((characterData) =>
  //   transformCharacterData(characterData)
  // );

    // await nft.mint(URI, {
    //   value : ethers.utils.parseEther('0.001')
    // });


    // expect(await nft.tokenURI(1)).to.equal(URI);
  });

});
