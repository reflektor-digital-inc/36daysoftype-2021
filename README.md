# 36 Days of Type – 2021

## Stack

- Vue 3
- TroisJS
- GSAP

## Install

`yarn`

### 🚨 Note 🚨
This project uses bonus features from [Club Greensock](https://greensock.com/club/) to successfully run this project locally, you'll need to have a subscription and (install the package yourself)[https://greensock.com/docs/v3/Installation?checked=core,morphSVG,requireSyntax#ZIP]

## Run

#### First-time Setup

**On your browser**

1. Make a `.env` file with keys from `.env.example`.
    - `cp .env.example .env`
2. You'll need to download [MetaMask](https://metamask.io/download) and then create an account.
3. Once you've created an account, copy your account's private key and paste it in `.env`'s `PRIVATE_KEY` field.

**In the terminal**

1. Download `http-server` using `npm install http-server --global`.
2. In a terminal, `cd` to `src/assets/local-nft-metadata` and run `http-server --port 8123`.
3. Add `http://localhost:8123` to `.env`'s `DEPLOY_CONTRACT_BASE_URI`.

**In another terminal**

1. `npx hardhat compile` - Compiles smart contract(s).
2. `npx hardhat node` - Runs a local Ethereum chain for testing via Hardhat.

**In another terminal**

1.  `npx hardhat run ./scripts/deploy.js --network localhost` - Deploys smart contract(s).
2. Once you've deployed the NFT contract, you'll get the deployed contract address. Copy this value to `.env`'s `VITE_CONTRACT_ADDRESS`.
3. `yarn dev` - Runs the frontend.

#### Local Development

1. `yarn dev` in the terminal.

## Add a new letter

**Option 1** - Copy `src/pages/Letter/Template` -> to a new letter

**Option 2** - Copy any of the other letters as a template

**Option 3** - Start from scratch

# Notes

## MetaMask

Download the MetaMask extension [here](https://metamask.io/download).

## Hardhat

**Run local node**

```shell
npx hardhat node
```
> This will give you 10 local accounts with 1000 fake Ethers.
Please **don't transfer any real ETH to these accounts** because they will be lost!

**Getting local accounts**

```shell
npx hardhat accounts
```

**Compile smart contracts**

```shell
npx hardhat compile
```

**Deploy smart contracts**

```shell
node scripts/sample-script.js
```
