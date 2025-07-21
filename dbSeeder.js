(() => {
    'use strict';

    // load modules
    const userDBSeeder = require('./src/Seeds/user.seeder');
    const productDBSeeder = require('./src/Seeds/product.seeder');

    /**
     * load available Db seeder loaders process
     */
    const loadDbSeed = () => {
        // load Users and Products collection DB seeder
        userDBSeeder();
        productDBSeeder();
    }

    loadDbSeed();

})();