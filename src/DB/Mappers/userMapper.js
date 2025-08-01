(() => {
    'use strict';

    // load modules
    const AbstractMapper = require('./abstractMapper');
    const UserModel = require('../MongoModels/user.model');
    const UserEntity = require('../../Entities/user');
    const EncryptionService = require('../../Services/encryptionService');
    
    /**
     * User Mapper class for any User Entity-Model Relation
     */
    class UserMapper extends AbstractMapper {

        /**
         * @type {EncryptionService}
         */
        encryptionService;

        /**
         * UserMapper Constructor
         * @param {EncryptionService} encryptionService Encryption service instance
         */
        constructor(encryptionService) {
            super();
            this.encryptionService = encryptionService;
        }

        /**
         * {@inheritdoc}
         * @returns {UserEntity | null} Hydrated User instance
         */
        toEntity(data) {
            if (!data || typeof data !== 'object') {
                return null;
            }

            return new UserEntity(data.userId, data.username, data.deposit, data.rule);
        }

        /**
         * {@inheritdoc}
         * @param {UserEntity} entity
         * @returns {Object | null} User Data Ready for User mongoose Model instance for mongoose
         */
        toPersistence(entity) {
            if (!entity || !(entity instanceof UserEntity)) {
                return null;
            }

            return {
                userId: entity.id,
                username: entity.name,
                password: null,
                deposit: entity.deposit,
                rule: entity.getUserRule()
            };
        }

        /**
         * Sepecial Override Method for @see toPersistence method To Appending password 
         * Under User Presistence data for Mongoose Model, As we need keep this Sensitive data out of the Entity class
         * @param {UserEntity} entity given User entity instance which need to overirde.
         * @param {string} password Given new/updated password value
         * @returns {Object | null} User Data Ready for User mongoose Model instance for mongoose
         */
        toPersistenceWithPassword(entity, password) {
            let presistanceData = this.toPersistence(entity);
            if (presistanceData == null)
                return null;

            presistanceData.password =
                this.encryptionService.generateMd5HashString(password);

            return presistanceData;
        }
    }

    module.exports = new UserMapper(EncryptionService);
})();