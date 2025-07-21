(() => {
    'use strict';

    // load modules
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const ProductMapper = require('../DB/Mappers/productMapper');
    const ProductModel = require('../DB/MongoModels/product.model');
    const ProductEntity = require('../Entities/product');
    const UserEntity = require('../Entities/user');
    const AvailbleUserRule = require('../Entities/rules');

    // Define Products details will be Seeding.
    const product1 =
        new ProductEntity(1, 'Water bottle', new UserEntity(1, 'Ahmed'), 5.5, 5);
    const product2 =
        new ProductEntity(2, 'Pepsi', new UserEntity(1, 'Ahmed'), 10, 5);
    const product3 =
        new ProductEntity(1, 'mandolen', new UserEntity(1, 'Ahmed'), 15, 10);
    
    const productsList = [product1, product2, product3];

    /**
     * Define Product Db seeder loader as clousor
     */
    module.exports = () => {

        productsList.forEach(product => { 
            const productModel = new ProductModel(ProductMapper.toPersistence(product));

            MongoDbAdapter.save(
                productModel,
                function (result) {
                    console.log(result);
                },
                function (error) {
                    console.error(error);
                }
            );
        });
    };

})();