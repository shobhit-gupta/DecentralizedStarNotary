const StarNotary = artifacts.require('StarNotary');

let accounts,
    owner;

contract('StarNotary', accs => {
    accounts = accs;
    owner = accounts[0];

    it('can create a star', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 1,
              name = 'Awesome Star';
        await instance.createStar(name, tokenId, {from: owner});
        const newStarName = await instance.tokenIdToStar.call(tokenId);
        assert.equal(newStarName, name, 'Names do not match');
    });


    it('can put up a star for sale', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 2,
              name = 'World Star',
              user = accounts[1],
              price = web3.utils.toWei('.01', 'ether');
        await instance.createStar(name, tokenId, {from: user});
        await instance.putStarUpForSale(tokenId, price, {from: user});
        const starPrice = await instance.starsForSale.call(tokenId);
        assert.equal(starPrice, price, 'Prices do not match');
    });


    it('lets seller receive funds after a sale', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 3,
              name = 'Milky Way Star',
              seller = accounts[1],
              buyer = accounts[2],
              price = web3.utils.toWei('.01', 'ether'),
              payment = web3.utils.toWei('0.05', 'ether');
        await instance.createStar(name, tokenId, {from: seller});
        await instance.putStarUpForSale(tokenId, price, {from: seller});
        const sellerBalancePreSale = await web3.eth.getBalance(seller);
        await instance.buyStar(tokenId, {from: buyer, value: payment});
        const sellerBalancePostSale = await web3.eth.getBalance(seller);
        assert.equal(
            Number(sellerBalancePreSale) + Number(price), 
            Number(sellerBalancePostSale), 
            'Seller did not receive correct funds'
        );
    });


    it('lets buyer buy a star that is up for sale', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 4,
              name = 'Andromeda Star',
              seller = accounts[1],
              buyer = accounts[2],
              price = web3.utils.toWei('.01', 'ether'),
              payment = web3.utils.toWei('0.05', 'ether');
        await instance.createStar(name, tokenId, {from: seller});
        await instance.putStarUpForSale(tokenId, price, {from: seller});
        await instance.buyStar(tokenId, {from: buyer, value: payment});
        const owner = await instance.ownerOf.call(tokenId);
        assert.equal(owner, buyer, 'Buyer should be the owner of the purchased star');
    });


    it('reduces buyer\'s balance correctly after purchase', async () => {
        
        async function _getTxCost(txResponse) {
            const txDetails = await web3.eth.getTransaction(txResponse.tx);
            const gasPrice = txDetails.gasPrice;
            const gasUsed = txResponse.receipt.gasUsed;
            return gasPrice * gasUsed;
        }

        const instance = await StarNotary.deployed();
        const tokenId = 5,
              name = 'Far Away Star',
              seller = accounts[1],
              buyer = accounts[2],
              price = web3.utils.toWei('.01', 'ether'),
              payment = web3.utils.toWei('0.05', 'ether');
        await instance.createStar(name, tokenId, {from: seller});
        await instance.putStarUpForSale(tokenId, price, {from: seller});
        const buyerBalancePreSale = await web3.eth.getBalance(buyer);
        const tx = await instance.buyStar(tokenId, {from: buyer, value: payment});
        const buyerBalancePostSale = await web3.eth.getBalance(buyer);
        const txCost = await _getTxCost(tx);
        assert.closeTo(
            Number(buyerBalancePreSale) - Number(price) - txCost, 
            Number(buyerBalancePostSale), 
            100000,     // delta
            'Correct funds not deducted from buyer');
    });
    
});