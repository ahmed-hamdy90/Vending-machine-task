(() => {
    'use strict';

    // load modules
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const ProductMapper = require('../DB/Mappers/productMapper');
    const ProductModel = require('../DB/MongoModels/product.model');
    const ProductEntity = require('../Entities/product');
    const UserEntity = require('../Entities/user');

    // Define Products details will be Seeding.
    const product1 =
        new ProductEntity(1, 'Water bottle', new UserEntity(3, 'Mustafa'), 5.5, 5);
    const product2 =
        new ProductEntity(2, 'Pepsi', new UserEntity(3, 'Mustafa'), 10, 5);
    const product3 =
        new ProductEntity(3, 'Mandolen', new UserEntity(3, 'Mustafa'), 15, 10);
    const product4 =
        new ProductEntity(4, 'Oreo', new UserEntity(4, 'Amr'), 10, 0);
    const product5 =
        new ProductEntity(5, 'Chips', new UserEntity(4, 'Amr'), 0, 10);

    const productsList = [product1, product2, product3, product4, product5];

    /**
     * Define Product Db seeder loader as clousor
     */
    module.exports = () => {

        productsList.forEach(product => { 
            const productModel = new ProductModel(ProductMapper.toPersistence(product));

            MongoDbAdapter.save(
                productModel,
                function (result) {
                    // TODO: Replace with Custom Logger
                    console.log(result);
                },
                function (error) {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                }
            );
        });
    };

})();