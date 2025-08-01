(() => {
    'use strict';

    // load modules
    const AbstrictCrudOptsService = require('./AbstrictCrudOptsService');
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const UserMapper = require('../DB/Mappers/userMapper');
    const UserModel = require('../DB/MongoModels/user.model');
    const UserEntity = require('../Entities/user');
    const AvailbleUserRule = require('../Entities/rules');
    const NotFoundUserError = require('../Errors/notFoundUserError');
    const StringUtls = require('../Utils/StringUtls');

    /**
     * User Service includes all logic which perform on user Domain
     */
    class UserService extends AbstrictCrudOptsService {

        /**
         * @type {MongoDbAdapter}
         */
        mongoDbAdapter;

        /**
         * @type {UserMapper}
         */
        userMapper;

        /**
         * @type {UserModel}
         */
        userMongoModel;

        /**
         * UserService Constructor
         * @param {MongoDbAdapter} mongoDbAdapter Mongo database adapter instance
         * @param {UserMapper} mapper User Mapper instance
         * @param {UserModel} mongoModel User Mongo database Model instance
         */
        constructor(mongoDbAdapter, mapper, mongoModel) {
            super();
            this.mongoDbAdapter = mongoDbAdapter;
            this.userMapper = mapper;
            this.userMongoModel = mongoModel;
        }

        /**
         * {@inheritdoc}
         */
        get(id, successCallback, errorCallback) {
            this.mongoDbAdapter.findByCriteria(
                this.userMongoModel,
                {userId: id},
                (result) => {
                    if (!result || !Array.isArray(result) || result.length === 0) {
                        errorCallback(new NotFoundUserError('User Not Exists'));
                        return;
                    }

                    successCallback(this.userMapper.toEntity(result[0]))
                }, 
                errorCallback
            );
        }

        /**
         * {@inheritdoc}
         */
        getAll(criteria = {}, offset = 0, limit = 20, successCallback, errorCallback) {
            // TODO: make make offset and limit condition
            this.mongoDbAdapter.findByCriteria(
                this.userMongoModel,
                criteria,
                (result) => {
                    let resultAsEntities = [];
                    if (!result || !Array.isArray(result)) {
                        successCallback(resultAsEntities);
                        return;
                    }

                    result.forEach(userData => {
                        resultAsEntities.push(this.userMapper.toEntity(userData));
                    })

                    successCallback(resultAsEntities);
                },
                errorCallback
            );
        }

        /**
         * {@inheritdoc}
         * @param {UserEntity|Object} saveEntity user instance which need to save
         */
        save(saveEntity, successCallback, errorCallback) {
            // First getting the last User Id stored
            this.mongoDbAdapter.getLastStoredDocument(
                this.userMongoModel, 
                (result) => {
                    let newUserId = 1;

                    if (result) {
                        const lastStoredUser = this.userMapper.toEntity(result);
                        if (lastStoredUser) {
                            newUserId = lastStoredUser.id + 1;
                        }
                    }

                    // Prepare Data for new User Entity Then Prepare Persistence Data
                    const newUserName =
                        (saveEntity.hasOwnProperty('name') && !StringUtls.isEmptyString(saveEntity.name))
                            ? saveEntity.name : null;
                    const newUserPassword =
                        (saveEntity.hasOwnProperty('password') && !StringUtls.isEmptyString(saveEntity.password))
                            ? saveEntity.password : null;
                    const newUserDeposit =
                        (saveEntity.hasOwnProperty('deposit') && !isNaN(Number(saveEntity.deposit)))
                            ? saveEntity.deposit : 0;
                    const newUserRule =
                        (saveEntity.hasOwnProperty('rule') && !isNaN(Number(saveEntity.rule)))
                            ? saveEntity.rule : AvailbleUserRule.BUYER;
                    
                    if (!newUserName || !newUserPassword) {
                        errorCallback(
                            new Error('Save Process Failed As You Must Given Username and Password'));
                        return;
                    }

                    let newUserEntity;
                    try {
                        newUserEntity =
                            new UserEntity(newUserId, newUserName, newUserDeposit, newUserRule);
                    } catch (error) {
                        // TODO: Replace with Custom Logger
                        console.error(error);
                        errorCallback(new Error('Save Process Failed'));
                        return;
                    }

                    const userPersistenceData =
                            this.userMapper.toPersistenceWithPassword(newUserEntity, newUserPassword);

                    this.mongoDbAdapter.save(
                        this.userMongoModel(userPersistenceData),
                        successCallback,
                        errorCallback
                    );
                },
                error => errorCallback(error)  
            );
        }

        /**
         * {@inheritdoc}
         * @param {UserEntity|Object} updateEntity user instance which need to update
         */
        update(id, updateEntity, successCallback, errorCallback) {
            // First getting the old User details To make sure if exists already or not
            this.get(
                id,
                (user) => {
                    if (!user) {
                        errorCallback(new NotFoundUserError('User Not Exists'));
                        return;
                    }     
                    // Then Override only data had been update and take old User's data
                    const updatedUserName =
                        (updateEntity.hasOwnProperty('name') && !StringUtls.isEmptyString(updateEntity.name))
                            ? updateEntity.name : user.name;
                    const updatedUserDeposit =
                        (updateEntity.hasOwnProperty('deposit') && !isNaN(Number(updateEntity.deposit)))
                            ? updateEntity.deposit : user.deposit;
                    const updatedUserRule =
                        (updateEntity.hasOwnProperty('rule') && !isNaN(Number(updateEntity.rule)))
                            ? updateEntity.rule : user.rule;

                    let updatedUserEntity;
                    try {
                        updatedUserEntity =
                            new UserEntity(user.id, updatedUserName, updatedUserDeposit, updatedUserRule);
                    } catch (error) {
                        // TODO: Replace with Custom Logger
                        console.error(error);
                        errorCallback(new Error('Update Process Failed'));
                        return;
                    }

                    let userPersistenceData;
                    if (updateEntity.hasOwnProperty('password') &&
                        !StringUtls.isEmptyString(updateEntity.password)) {
                        userPersistenceData =
                            this.userMapper
                                .toPersistenceWithPassword(updatedUserEntity, updateEntity.password);
                    } else {
                        userPersistenceData = this.userMapper.toPersistence(updatedUserEntity);
                        // Make sure not override Password
                        delete userPersistenceData.password;
                    }

                    // Finally begin Prepare Save new data then perform call Database
                    this.mongoDbAdapter
                        .updateByCriteria(
                            this.userMongoModel,
                            {userId: id},
                            userPersistenceData,
                            successCallback,
                            errorCallback
                        );
                },
                (error) => errorCallback(error)
            );
        }

        /**
         * {@inheritdoc}
         */
        remove(id, successCallback, errorCallback) {
            // First getting the old User details To make sure if exists already or not
            this.get(
                id,
                (user) => {
                    if (!user) {
                        errorCallback(new NotFoundUserError('User Not Exists'));
                        return;
                    }
                    // Then perform call database
                    this.mongoDbAdapter
                        .deleteByCriteria(this.userMongoModel, {userId: id}, successCallback, errorCallback);
                },
                (error) => errorCallback(error)
            );
        }
    }

    module.exports = new UserService(MongoDbAdapter, UserMapper, UserModel);
})();