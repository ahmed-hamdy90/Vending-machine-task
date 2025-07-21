(() => {
    'use strict';

    // load modules
    const mongoDbAdapter = require('../Adapters/mongoDbAdapter');

    /**
     * Represent Customer Mongoose Collection schema
     * @type {{id: number, productname: string, cost:number, amountAvailable:number, sallerId:number}}
     */
    const productSchema = {
        productId: 'number',
        productname: 'string',
        cost: 'number',
        amountAvailable: 'number',
        sallerId: 'number'
    };

    module.exports = mongoDbAdapter.createModel('Product', productSchema);
})();