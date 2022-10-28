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
});