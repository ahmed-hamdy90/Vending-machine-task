(() => {
    'use strict';

    // load modules
    const AbstractMapper = require('./abstractMapper');
    const ProductEntity = require('../../Entities/product');
    const UserEntity = require('../../Entities/user');
    const AvailbleUserRule = require('../../Entities/rules');

    class ProductMapper extends AbstractMapper {

        /**
         * {@inheritdoc}
         * @returns {ProductEntity | null} Hydrated Product instance
         */
        toEntity(data) {
            if (!data) {
                return null;
            }

            /**
             * TODO:
             *  - Solution #1: Make calls for MongoDB to getting the full User's details.
             *  - Solution #2: Replace Product's Document Schema to store User's ID and name (Rule not save only if Saller)
             */
            const sallerEntity =
                new UserEntity(data.sallerId, '', 0, AvailbleUserRule.SALLER);

            return new ProductEntity(
                data.productId, 
                data.productname,
                sallerEntity,
                data.cost,
                data.amountAvailable
            );
        }

        /**
         * {@inheritdoc}
         * @param {ProductEntity} entity
         * @returns {Object | null} Product Data Ready for Product mongoose Model instance for mongoose
         */
        toPersistence(entity) {
            if (!entity || !(entity instanceof ProductEntity)) {
                return null;
            }
        
            return {
                productId: entity.id,
                productname: entity.name,
                cost: entity.cost,
                amountAvailable: entity.amountAvailble,
                sallerId: entity.saller.id
            };
        }
    }

    module.exports = new ProductMapper();
})();