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
        await instance.createStar(name, tokenId, { from: owner });
        const newStarName = await instance.tokenIdToStar.call(tokenId);
        assert.equal(newStarName, name, 'Names do not match');
    });


    it('can put up a star for sale', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 2,
              name = 'World Star',
              user = accounts[1],
              price = web3.utils.toWei('.01', 'ether');
        await instance.createStar(name, tokenId, { from: user });
        await instance.putStarUpForSale(tokenId, price, { from: user });
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
        await instance.createStar(name, tokenId, { from: seller });
        await instance.putStarUpForSale(tokenId, price, { from: seller });
        const sellerBalancePreSale = await web3.eth.getBalance(seller);
        await instance.buyStar(tokenId, { from: buyer, value: payment });
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
        await instance.createStar(name, tokenId, { from: seller });
        await instance.putStarUpForSale(tokenId, price, { from: seller });
        await instance.buyStar(tokenId, { from: buyer, value: payment });
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
        await instance.createStar(name, tokenId, { from: seller });
        await instance.putStarUpForSale(tokenId, price, { from: seller });
        const buyerBalancePreSale = await web3.eth.getBalance(buyer);
        const tx = await instance.buyStar(tokenId, { from: buyer, value: payment });
        const buyerBalancePostSale = await web3.eth.getBalance(buyer);
        const txCost = await _getTxCost(tx);
        assert.closeTo(
            Number(buyerBalancePreSale) - Number(price) - txCost,
            Number(buyerBalancePostSale),
            100000,     // delta
            'Correct funds not deducted from buyer');
    });


    // Implement Task 2 Add supporting unit tests

    it('can add the star token name and star symbol properly', async () => {
        // 1. create a Star with different tokenId
        const instance = await StarNotary.deployed();
        const tokenId = 6,
              name = 'Pole Star';
        await instance.createStar(name, tokenId, { from: owner });
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        const tokenName = await instance.name();
        const tokenSymbol = await instance.symbol();
        assert.equal(tokenName, 'SGStarToken', 'Invalid token name');
        assert.equal(tokenSymbol, 'SGSTR', 'Invalid token symbol');
    });


    it('lookUptokenIdToStarInfo test', async () => {
        const instance = await StarNotary.deployed();
        const tokenId = 7,
              name = 'Universal Star';
        await instance.createStar(name, tokenId, { from: owner });
        const starName = await instance.lookUptokenIdToStarInfo.call(tokenId);
        assert.equal(starName, name, 'Names do not match');
    });


    it('lets 2 users exchange stars', async () => {
        const instance = await StarNotary.deployed();

        // 1. create 2 Stars with different tokenId
        const tokenIdA = 8,
              nameA = 'Dhruv Tara',
              userA = accounts[1];
        const tokenIdB = 9,
              nameB = 'Jam Tara',
              userB = accounts[2];
        await instance.createStar(nameA, tokenIdA, { from: userA });
        await instance.createStar(nameB, tokenIdB, { from: userB });

        // 2. Call the exchangeStars functions implemented in the Smart Contract
        await instance.exchangeStars(tokenIdA, tokenIdB, { from: userA });

        // 3. Verify that the owners changed
        const ownerA = await instance.ownerOf.call(tokenIdA),
              ownerB = await instance.ownerOf.call(tokenIdB);
        assert.equal(ownerA, userB, 'Owner didn\'t change as expected');
        assert.equal(ownerB, userA, 'Owner didn\'t change as expected');

    });


    it('lets a user transfer a star', async () => {
        const instance = await StarNotary.deployed();
        // 1. create a Star with different tokenId
        const tokenId = 10,
              name = 'Kantara',
              userA = accounts[1],
              userB = accounts[2];
        await instance.createStar(name, tokenId, { from: userA });

        // 2. use the transferStar function implemented in the Smart Contract
        await instance.transferStar(userB, tokenId, { from: userA });

        // 3. Verify the star owner changed.
        const starOwner = await instance.ownerOf.call(tokenId);
        assert(starOwner, userB, 'Star was not transferred');
    });



});