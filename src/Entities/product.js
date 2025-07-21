(() => {
    'use strict';
    
    // load modules
    const BasicEntity = require('./basicEntity');
    const User = require("./user");

    class Product extends BasicEntity {

        /**
         * Product's Productname
         * @type {string}
         */
        name;

        /**
         * @type {User}
         */
        saller;

        /**
         * Total Money for product
         * @type {int}
         */
        cost = 0;

       /**
         * Total available ammount for product
         * @type {int}
         */
        amountAvailble = 0;

        constructor(id, productname, saller, cost = 0, amount = 0) {
            super(id);
            this.name = productname;
            this.saller = saller;
            this.cost = cost;
            this.amountAvailble = amount;
        }
    }

    module.exports = Product;
})();