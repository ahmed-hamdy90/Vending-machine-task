(() => {
    'use strict';

    // load modules
    const NotImplementError  = require('../../Exceptions/notImplementError');
    const BasicEntity = require('../../Entities/basicEntity');

    /**
     * Represent Basic Mapper class which will be use doe any Entity-Model Mapper relation.
     * Mainly one case here used for Mongoose Documents (can be Geneal for high level system)
     */
    class AbstractMapper {

        /**
         * AbstractMapper Constructor
         * @throws {TypeError} in case called Parent Class (this calss)
         */
        constructor() {
            if (new.target === AbstractMapper) {
                // TODO: passing logger to logging this Error
                throw new TypeError("Cannot instantiate AbstractMapper directly.");
            }
        }

        /**
         * Converts a Mongoose Document or Data Object to an Entity instance.
         * Hint: This is the "hydration" step.
         * @param {mongoose.Document | Object | null} doc given data details will be hydrate into entity instance
         * @returns {BasicEntity | null} completed hydrated entity
         */
        toEntity(doc) {
            throw new NotImplementError("Method 'toEntity()' must be implemented.");
        }

        /**
         * Converts an Entity instance to a plain object Or Mongoose Document.
         * Hint: This is the "dehydration" step
         * @param {BasicEntity} entity The Entity instance.
         * @returns {Object} A plain object representing hydrate entity for persistence.
         */
        toPersistence(entity) {
            throw new NotImplementError("Method 'toPersistence()' must be implemented.");
        }
    }

    module.exports = AbstractMapper;
})();