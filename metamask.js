
hideSpinner = () => {
    document.getElementById('loading').style.display = 'none';
}

connectMetamask = async () => {
    if(window.ethereum !== "undefined") {
        const accounts = await ethereum.request({ method: "eth_requestAccounts"});
        const account = accounts[0];
        await fetchAccountData(account);     
    }
}

connectWeb3 = async (account) => {
  const web3 = new Web3(window.ethereum);
  const balance = await web3.eth.getBalance(account);
  const formatedBalance = web3.utils.fromWei(balance, "ether");
  const netWorkchainID = web3.currentProvider.networkVersion;
  const newtworkName = chains[netWorkchainID].name;
  return { balance, formatedBalance, netWorkchainID, newtworkName }
}

fetchAccountData = async (account) => {
  if(account || localStorage.selectedAccount){
    if(!account) 
    account = localStorage.selectedAccount;
        const accountDetails = await connectWeb3(account);

        document.getElementById("selected-account").innerHTML = account;
        document.getElementById("account-balance").innerHTML = accountDetails.formatedBalance + " " + chains[accountDetails.netWorkchainID].symbol;
        document.getElementById("network-name").innerHTML = accountDetails.netWorkchainID + " : " + accountDetails.newtworkName;
        document.getElementById("connectedArea").style.display = "block";   
        document.getElementById("disconnectedArea").style.display = "none";
        document.getElementById("transaction-info").style.display = "none";    

        localStorage.selectedAccount = account;
        localStorage.accountBalance = accountDetails.formatedBalance;
        localStorage.selectedNetwork = accountDetails.newtworkName;
        localStorage.selectedChainId = accountDetails.netWorkchainID;
  }else {
    document.getElementById("connectedArea").style.display = "none";   
    document.getElementById("disconnectedArea").style.display = "block";   
  }
}

accountChanged = async () => {
  window.ethereum.on('accountsChanged', async (accounts) => {
    if(!accounts[0] || !localStorage.selectedAccount){
      await disconnectMetamask();
    }else{
      await fetchAccountData(accounts[0]);
    }
  })
}

networkChanged = async () => {
  window.ethereum.on('chainChanged', function (chainId) {
    const web3 = new Web3(window.ethereum);
    const netWorkchainID = web3.currentProvider.networkVersion;
    document.getElementById("network-name").innerHTML = netWorkchainID + " : " + chains[netWorkchainID].name;
    localStorage.selectedNetwork = chains[netWorkchainID].name;
    localStorage.selectedChainId = netWorkchainID;
    location.reload();
  });
}

metamaskControl = async () => {
  if(typeof window.ethereum === 'undefined') {
    alert('Please install Metamask first.');
  }
}

disconnectMetamask = async () => {
  localStorage.clear();
  location.reload();
}

sendWalletToken = async () => {
  document.getElementById("btn-send").disabled = true;
  setTimeout(function(){ 
    document.getElementById("btn-send").disabled = false;
   }, 5000);   
  const amount = document.getElementById("amount").value;
  const address = document.getElementById("address").value;
  if(amount && address && Number(amount)){
    const web3 = new Web3(window.ethereum);
    const getAccounts = await web3.eth.getAccounts();
    account = getAccounts[0];
    const isAddress = web3.utils.isAddress(address);
    if(isAddress){
        web3.eth.sendTransaction({
            from: account,
            to: address,
            value: web3.utils.toWei(amount, 'ether')
        })
        .on('transactionHash', hash => { 
          document.getElementById("transaction-info").style.display = "block"; 
          document.getElementById("transaction-info").innerHTML = 'Hash: ' + hash + '<br>'
        })
        .on('receipt', receipt => document.getElementById("transaction-info").innerHTML += 'Receipt: ' + receipt.to + '<br>')
        .on('confirmation', confirmationNumber => document.getElementById("transaction-info").innerHTML += 'Confirmation: ' + confirmationNumber + '<br>')
        .on('error', console.error);
    }else{
      document.getElementById("transaction-info").style.display = "block"; 
      document.getElementById("transaction-info").innerHTML = 'Address is not validated';
    }
  }    
}

connectContract = async () => {
  const web3 = new Web3(window.ethereum);
  const address = document.getElementById("contractAddress").value;
  const isAddress = web3.utils.isAddress(address);
  if(address && isAddress){
      const contract = new web3.eth.Contract(contractAbi, address); 
      document.getElementById("transaction-info").style.display = "block";
      
      const tokenSymbol = await contract.methods.symbol().call().catch(err => document.getElementById("transaction-info").innerHTML = err.message);
      const tokenName = await contract.methods.name().call();
      const tokenSupply = await contract.methods.totalSupply().call();
      const tokenDecimals = await contract.methods.decimals().call();

      document.getElementById("transaction-info").innerHTML = 'Token Name : ' + tokenName + '<br>';
      document.getElementById("transaction-info").innerHTML += 'Token Symbol : ' + tokenSymbol + '<br>';
      document.getElementById("transaction-info").innerHTML += 'Token Decimals : ' + tokenDecimals + '<br>';
      document.getElementById("transaction-info").innerHTML += 'Token Total Supply : ' + tokenSupply + '<br>';
    }else{
      document.getElementById("transaction-info").style.display = "block"; 
      document.getElementById("transaction-info").innerHTML = 'Address is not validated';
    } 

}

initialize = async () => {
    await metamaskControl();
    await fetchAccountData();
    await accountChanged();
    await networkChanged();
    hideSpinner();
};

window.addEventListener('load', initialize);

