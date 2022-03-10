import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'xHibiking';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CLICKED = false;

const CONTRACT_ADDRESS = '0x29da88B9F5911d7628b9df89cd2E91913f05288C';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentMintedNum, setMintedNum] = useState('')
  const [mintInfo, setMintInfo] = useState('');
  const [mintURL, setMintURL] = useState('');
  console.log('currentAccount: ', currentAccount);

  const checkIfWalletisConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  }


  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask');
        return;
      }
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async() => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setMintedNum(tokenId);
          setMintInfo(`NFTがミントされました! OpenSeaへのリンクはこちら`);
          setMintURL(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log('Setup event Listener!')
      } else {
        console.log('Ethereum object doesnt exist!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkCurrentMintedNum = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        const newTokenId = await connectedContract.getTokenIds();
        setMintedNum(newTokenId);
        console.log('We could get tokenId!');
      } else {
        console.log('Ethereum object doesnt exist!');
      }
    } catch (error) {
      console.log(error);
    }
  }
  

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log('Going to pop wallet now to pay gas...');
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log('Mining.. please wait.');
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log('Ethereum object doesnt exist!');
      }
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    checkIfWalletisConnected();
    checkCurrentMintedNum();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              あなただけの特別な NFT を Mint しよう💫
            </p>
            {
              currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              <button onClick={askContractToMintNft} className='cta-button connect-wallet-button'>
              Mint NFT
              </button>
            )}
          <p className="sub-text">{`現在までにミントされた数：${currentMintedNum} / 50`}</p>
          <a href={mintURL}>{mintInfo}</a>

        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={"https://twitter.com/xHibiking"}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
