(() => {
    'use strict';

    // load modules
    const AbstrictCrudOptsService = require('./AbstrictCrudOptsService');
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const ProductMapper = require('../DB/Mappers/productMapper');
    const ProductModel = require('../DB/MongoModels/product.model');
    const ProductEntity = require('../Entities/product');

    const UserService = require('../Services/userService');
    const UserEntity = require('../Entities/user');
    const AvailbleUserRule = require('../Entities/rules');

    const NotFoundProductError = require('../Errors/notFoundProductError');
    const StringUtls = require('../Utils/StringUtls');

    /**
     * Product Service includes all logic which perform on product Domain
     */
    class ProductService extends AbstrictCrudOptsService {

        /**
         * @type {MongoDbAdapter}
         */
        mongoDbAdapter;

        /**
         * @type {ProductMapper}
         */
        productMapper;

        /**
         * @type {ProductModel}
         */
        productMongoModel;

        /**
         * @type {UserService}
         */
        userService;

        /**
         * ProductService Constructor
         * @param {MongoDbAdapter} mongoDbAdapter Mongo database adapter instance
         * @param {ProductMapperr} mapper Product Mapper instance
         * @param {ProductModel} mongoModel Product Mongo database Model instance
         * @param {UserService} userService User Service instance
         */
        constructor(mongoDbAdapter, mapper, mongoModel, userService) {
            super();
            this.mongoDbAdapter = mongoDbAdapter;
            this.productMapper = mapper;
            this.productMongoModel = mongoModel;
            this.userService = userService;
        }

        /**
         * {@inheritdoc}
         */
        get(id, successCallback, errorCallback) {
            this.mongoDbAdapter.findByCriteria(
                this.productMongoModel,
                {productId: id},
                (result) => {
                    if (!result || !Array.isArray(result) || result.length === 0) {
                        errorCallback(new NotFoundProductError('Product Not Exists'));
                        return;
                    }

                    successCallback(this.productMapper.toEntity(result[0]))
                }, 
                errorCallback
            );
        }

        /**
         * {@inheritdoc}
         */
        getAll(successCallback, errorCallback, criteria = {}, offset = 0, limit = 20) {
            // TODO: make make offset and limit condition
            this.mongoDbAdapter.findByCriteria(
                this.productMongoModel,
                criteria,
                (result) => {
                    let resultAsEntities = [];
                    if (!result || !Array.isArray(result)) {
                        successCallback(resultAsEntities);
                        return;
                    }

                    result.forEach(productData => {
                        resultAsEntities.push(this.productMapper.toEntity(productData));
                    });

                    successCallback(resultAsEntities);
                },
                errorCallback
            );
        }

        /**
         * {@inheritdoc}
         * @param {ProductEntity|Object} saveEntity product instance which need to save
         */
        save(saveEntity, successCallback, errorCallback) {
            // First getting the last Product Id stored
            this.mongoDbAdapter.getLastStoredDocument(
                this.productMongoModel, 
                (result) => {
                    let newProductId = 1;

                    if (result) {
                        const lastStoredProduct = this.productMapper.toEntity(result);
                        if (lastStoredProduct) {
                            newProductId = lastStoredProduct.id + 1;
                        }
                    }

                    // Prepare Data for new Product Entity Then Prepare Persistence Data
                    const newProductName =
                        (saveEntity.hasOwnProperty('name') && !StringUtls.isEmptyString(saveEntity.name))
                            ? saveEntity.name : null;
                    const newProductSaller =
                        (saveEntity.hasOwnProperty('saller') && !isNaN(Number(saveEntity.saller)))
                            ? saveEntity.saller : null;
                    const newProductCost =
                        (saveEntity.hasOwnProperty('cost') && !isNaN(Number(saveEntity.cost)))
                            ? saveEntity.cost : 0;
                    const newProductAmount =
                        (saveEntity.hasOwnProperty('amount') && !isNaN(Number(saveEntity.amount)))
                            ? saveEntity.amount : 0;
                    
                    if (!newProductName || !newProductSaller) {
                        errorCallback(
                            new Error(
                                'Save Process Failed As You Must Given Product Name and Saller Id who Own Product')
                        );
                        return;
                    }

                    // Make sure Given Saller exists and has Saller Rule
                    this.userService
                        .get(
                            newProductSaller,
                            (result) => {
                                /**
                                 * @type {null|UserEntity}
                                 */
                                const user = result;

                                if (!user) {
                                    errorCallback(new Error('Save Process Failed As Given Saller Not Exists'));
                                    return;
                                }

                                if (user.getUserRule() !== AvailbleUserRule.SALLER) {
                                    errorCallback(new Error('Save Process Failed As Given User Is not Saller Rule'));
                                    return;
                                }

                                const newProductEntity =
                                        new ProductEntity(newProductId, newProductName, user,newProductCost,
                                            newProductAmount);
                                const productPersistenceData = this.productMapper.toPersistence(newProductEntity);

                                this.mongoDbAdapter.save(
                                    this.productMongoModel(productPersistenceData),
                                    successCallback,
                                    errorCallback
                                );
                            },
                            (error) => errorCallback(error)
                        );
                },
                error => errorCallback(error)  
            );
        }

        /**
         * {@inheritdoc}
         * @param {ProductEntity|Object} updateEntity Product instance which need to update
         */
        update(id, updateEntity, successCallback, errorCallback) {
            // First getting the old Product details To make sure if exists already or not
            this.get(
                id,
                (result) => {
                    /**
                     * @type {ProductEntity}
                     */
                    const product = result;
                    if (!product) {
                        errorCallback(new NotFoundProductError('Product Not Exists'));
                        return;
                    }
    
                    // Then Override only data had been update and take old Product's data
                    const updateProductName =
                        (updateEntity.hasOwnProperty('name') && !StringUtls.isEmptyString(updateEntity.name))
                            ? updateEntity.name : product.name;
                    const updateProductSaller =
                        (updateEntity.hasOwnProperty('saller') && !isNaN(Number(updateEntity.saller)))
                            ? updateEntity.saller : null;
                    const updateProductCost =
                        (updateEntity.hasOwnProperty('cost') && !isNaN(Number(updateEntity.cost)))
                            ? updateEntity.cost : product.cost;
                    const updateProductAmount =
                        (updateEntity.hasOwnProperty('amount') && !isNaN(Number(updateEntity.amount)))
                            ? updateEntity.amount : product.amountAvailble;

                    /**
                     * Finally begin Prepare Save new data then perform call Database
                     * Through Two Ways based on Given details
                     */
                    let updateProductEntity;
                    let productPersistenceData;
                    if (updateProductSaller) {
                        // In case Given update Saller
                        // Make sure Given Saller exists and has Saller Rule
                        this.userService
                            .get(
                                Number(updateProductSaller),
                                (result) => {
                                    /**
                                     * @type {null|UserEntity}
                                     */
                                    const user = result;

                                    if (!user) {
                                        errorCallback(
                                            new Error('Update Process Failed As Given Saller Not Exists'));
                                        return;
                                    }

                                    if (user.getUserRule() !== AvailbleUserRule.SALLER) {
                                        errorCallback(
                                            new Error('Update Process Failed As Given User Is not Saller Rule'));
                                        return;
                                    }

                                    updateProductEntity =
                                        new ProductEntity(product.id, updateProductName, user,
                                            updateProductCost, updateProductAmount);
                                    productPersistenceData = this.productMapper.toPersistence(updateProductEntity);
                                    
                                    this.mongoDbAdapter
                                        .updateByCriteria(
                                            this.productMongoModel,
                                            {productId: id},
                                            productPersistenceData,
                                            successCallback,
                                            errorCallback
                                        );
                                },
                                (error) => errorCallback(error)
                            );

                    } else {
                        // In case update product without update Saller
                        updateProductEntity =
                            new ProductEntity(product.id, updateProductName, product.saller,
                                updateProductCost, updateProductAmount);
                        productPersistenceData = this.productMapper.toPersistence(updateProductEntity);
                        
                        this.mongoDbAdapter
                            .updateByCriteria(
                                this.productMongoModel,
                                {productId: id},
                                productPersistenceData,
                                successCallback,
                                errorCallback
                            );
                    }
                },
                (error) => errorCallback(error)
            );
        }

        /**
         * {@inheritdoc}
         */
        remove(id, successCallback, errorCallback) {
            // First getting the old product details To make sure if exists already or not
            this.get(
                id,
                (product) => {
                    if (!product) {
                        errorCallback(new NotFoundProductError('Product Not Exists'));
                        return;
                    }
                    // Then perform call database
                    this.mongoDbAdapter
                        .deleteByCriteria(this.productMongoModel, {productId: id}, successCallback, errorCallback);
                },
                (error) => errorCallback(error)
            );
        }

    }

    module.exports = new ProductService(MongoDbAdapter, ProductMapper, ProductModel, UserService);
})();