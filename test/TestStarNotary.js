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
});