import logo from './logo.svg';
import './App.css';
import { BigNumber, ethers, utils } from "ethers"
import { abi2, abi, contractAddress } from './constants';
import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  // const zero = BigNumber.from(0);
  const [currentAccount, setCurrentAccount] = useState(null)
  const [tokenAmount, setTokenAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(0);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(0);

  async function getSignerOrProvider(signer = false) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    let contract;
    if (signer) {
      const signer = provider.getSigner()
      contract = new ethers.Contract(contractAddress, abi, signer)

      return contract
    }
    contract = new ethers.Contract(contractAddress, abi, provider)

    return contract;
  }


  async function connectWallet() {
    try {
      if (window.ethereum) {
        const temp = await window.ethereum.request({
          method: "eth_requestAccounts"
        })
        setCurrentAccount(temp[0])

      }
      else {
        throw new Error("Install metamask")
      }
    } catch (err) {
      console.log(err)
    }

  }

  async function isWalletDisconnectedOrConnected() {
    try {
      if (window.ethereum) {
        const temp = await window.ethereum.request({
          method: "eth_accounts"
        })

        if (temp.length == 0) {
          setCurrentAccount(null)
        }
        else {
          setCurrentAccount(temp[0])
        }
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  window.ethereum.on('accountsChanged', (account) => {
    setCurrentAccount(account)
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload()
  })


  const getSupply = async () => {
    try {

      const contract = await getSignerOrProvider()
      const res = await contract.totalSupply()
      setTokensMinted(parseInt(utils.formatEther(res.toString())))
      // console.log(parseInt(res))

    } catch (err) {
      console.log(err)
    }
  }
  // console.log(tokensMinted)

  const setClaimableCryptoDevTokens = async () => {
    try {
      let amount = 0;

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = await getSignerOrProvider(true)
      const nftAddr = await contract.nft()
      const nftContract = new ethers.Contract(nftAddr, abi2, signer)
      const bal = await nftContract.balanceOf(currentAccount)
      const temp = parseInt(bal)
      // console.log("hehe", temp)
      for (let i = 0; i < temp; i++) {
        // console.log("first")
        let tokenId = nftContract.tokenOfOwnerByIndex(currentAccount, i);
        const claimed = await contract.isIdMinted(tokenId)
        if (!claimed) {
          amount++;
        }
      }
      setTokensToBeClaimed(amount)

    } catch (err) {
      console.log(err)
    }
  }

  const claimCryptoDevTokens = async () => {
    try {
      const contract = await getSignerOrProvider(true)
      const tx = await contract.claim()
      await tx.wait()
      console.log("done")
    }
    catch (err) {
      console.log(err)
    }

  }


  const renderButton = () => {
    // If we are currently waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className="button">Loading...</button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className="description">
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className="button" onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className="input"
          />
        </div>

        {tokensMinted < 10000 ? <button
          className="button"
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button> : ""}
      </div>
    );
  };

  const mintCryptoDevToken = async (val) => {
    try {
      const temp = val * 0.001
      const contract = await getSignerOrProvider(true)
      // console.log("eee")
      const tx = await contract.mint(val, { value: BigNumber.from((utils.parseEther(temp.toString()))) })
      setLoading(true)
      await tx.wait()
      console.log(tx)
      toast.success('Success');
      setLoading(false)
    } catch (err) {
      toast.error('Failed');
      console.log(err)

    }
  }

  const setOwner = async () => {
    try {
      if (currentAccount) {
        const contract = await getSignerOrProvider()
        const temp2 = await contract.owner()
        if (currentAccount.toLowerCase() === temp2.toLowerCase()) {
          setIsOwner(true)
        }
        else {
          setIsOwner(false)
        }
      }
    }
    catch (err) {
      console.log("err")
    }
  }

  const getBalance = async () => {
    try {
      const contract = await getSignerOrProvider()

      const bal = await contract.balanceOf(currentAccount)
      const temp = utils.formatEther(parseInt(bal).toString())
      setBalanceOfCryptoDevTokens(temp)
    } catch (err) {
      console.log(err)
    }
  }

  const withdraw = async () => {
    try {
      const contract = await getSignerOrProvider(true)
      setLoading(true)
      const tx = await contract.withdraw()

      await tx.wait()
      toast.success("Success")
      setLoading(false)

    } catch (err) {
      const a = JSON.stringify(err)
      console.log(JSON.parse(a).reason)
      toast.error(JSON.parse(a).reason)
      setLoading(false)

      // console.log(, "asd")
    }
  }

  useEffect(() => {
    isWalletDisconnectedOrConnected()
    setClaimableCryptoDevTokens()
    setOwner()
  }, [currentAccount])

  useEffect(() => {
    getSupply()
    if (currentAccount) {
      getBalance()
      setOwner()
    }
  })

  // getBalance()
  return (
    <div>
      <ToastContainer />

      {currentAccount}
      <div className="main">
        <div>

          <h1 className="title">Welcome to Crypto Devs ICO!</h1>
          <div className="description">
            You can claim or mint Crypto Dev tokens here
          </div>
          {currentAccount ? (
            <div>
              <div className="description">
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {balanceOfCryptoDevTokens} Crypto Devs Token
              </div>
              <div className="description">
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {tokensMinted}/10000 have been minted!!!

              </div>
              {renderButton()}
              {/* Display additional withdraw button if connected wallet is owner */}
              {isOwner ? (
                <div>
                  {loading ? <button className="button">Loading...</button>
                    : <button className="button" onClick={withdraw}>
                      Withdraw Coins
                    </button>
                  }
                </div>
              ) : ("")
              }
            </div>
          ) : (
            <button onClick={connectWallet} className="button">
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className="image" src="./0.svg" />
        </div>
      </div>

      <footer className="footer">
        Cryptodevs by Asmar
      </footer>
    </div>
  );
}


export default App;
