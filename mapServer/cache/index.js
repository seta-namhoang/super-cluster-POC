const NodeCache = require( "node-cache" );
let myCache;
const getCacheInstance = () => {
    if(!myCache) {
        myCache = new NodeCache({ useClones: false });
    }
    return myCache;
}

module.exports = {
    getCacheInstance
};
