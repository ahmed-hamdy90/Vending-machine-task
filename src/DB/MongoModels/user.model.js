(() => {
    'use strict';

    // load modules
    const mongoDbAdapter = require('../Adapters/mongoDbAdapter');

    /**
     * Represent Customer Mongoose Collection schema
     * @type {{id: number, username: string, password: string, deposit:number, rule:number}}
     */
    const userSchema = {
        userId: 'number',
        username: 'string',
        password: 'string',
        deposit: 'number',
        rule: 'number'
    };

    module.exports = mongoDbAdapter.createModel('User', userSchema);
})();