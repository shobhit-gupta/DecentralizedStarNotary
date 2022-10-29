import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  createStar: async function() {
    // Fetch input
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    // User Ix - Pre
    App.setStatus(`Creating star for ${this.account}... (please wait)`);
    // Perform
    const { createStar } = this.meta.methods;
    await createStar(name, id).send({ from: this.account });
    // User Ix - Post
    App.setStatus(`New Star Owner is ${this.account}.`);
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    // Fetch input
    const id = document.getElementById("lookid").value;
    // User Ix - Pre
    this.setStatus(`Looking up token id ${id}... (please wait)`);
    // Perform
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starName = await lookUptokenIdToStarInfo(id).call() || 'Unnamed';
    // User Ix - Post
    this.setStatus(`${starName} has the token id ${id}`);
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

};


window.App = App;


window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});





