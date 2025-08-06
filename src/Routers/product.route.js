(() => {
    'use strict';

    // load modules
    const express = require('express');
    const ProductService = require('../Services/productService');
    const ProductEntity = require('../Entities/product');

    const AuthenticationMiddleware = require('../Middlewares/authentication.middleware');
    const IsAuthorizedUserSallerRule = require('../Middlewares/isAuthorizedUserSallerRule.middleware');
    const isAuthorizedUserSallerRuleOwnRequestedProduct =
        require('../Middlewares/isAuthorizedUserSallerRuleOwnRequestedProduct.middleware');

    const NotFoundProductError = require('../Errors/notFoundProductError');
    const StringUtls = require('../Utils/StringUtls');

    // initialize express's router instance
    const router = express.Router();

    // define possible routes
    router.get('/', AuthenticationMiddleware, (req, res) => {
        // In case GetAll method that Can everyOne access this Route Not need Check Authrized User's Rule
        ProductService
            .getAll(
                (result) => {
                    /**
                     * @type {ProductEntity[]}
                     */
                    const products = result;
                    let validProductsList = [];
                    if (products && Array.isArray(products)) {
                        // Display Only The Products have Cost and Amount
                        validProductsList =
                            products
                                .filter(product => product.cost !== 0)
                                .filter(product => product.amountAvailble !== 0);
                    }

                    res.status(200);
                    res.json({Products: validProductsList});
                },
                (error) => {
                    console.error(error);
                    throw error;
                });
    });

    router.get('/:productId', AuthenticationMiddleware,
        isAuthorizedUserSallerRuleOwnRequestedProduct, (req, res) => {
         // TODO: Make Validator class for Given Product ID to reduce duplication
        const requestProductId = Number(req.params.productId);

        if (isNaN(requestProductId) || !requestProductId) {
            res.status(400).json({message: 'Must Given Correct Product ID'});
            return;
        }

        ProductService
            .get(
                requestProductId,
                (result) => {
                    if (!result) {
                        res.status(404).json({message: 'Product Not Found'});
                        return;
                    }

                    res.status(200).json({Product: result});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    res.status(404).json({message: 'Product Not Found'});
                }
            );
    });

    router.post('/', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
        // TODO: Make Validator class for Given Product Data to reduce duplication
        const {productName, cost, amount, saller} = req.body;

        const givenUserSallerId = Number(saller);

        if (StringUtls.isEmptyString(productName) || !givenUserSallerId || isNaN(givenUserSallerId)) {
            res.status(400).json({message: 'Must Given Product Name and Saller ID'});
            return;
        }

        /**
         * **NOTE:** The Requirements is not clear if possible to able Given Saller
         * or automtic taken Authorized Saller User
         */ 
        const newProductObject = {
            'name': productName,
            'saller': givenUserSallerId
        };
        const givenNewProductCost = Number(cost);
        if (givenNewProductCost && !isNaN(givenNewProductCost)) {
            newProductObject['cost'] = givenNewProductCost;
        }
        const givenNewProductAmount = Number(amount);
        if (givenNewProductAmount && !isNaN(givenNewProductAmount)) {
            newProductObject['amount'] = givenNewProductAmount;
        }

        ProductService
            .save(
                newProductObject,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Add New Product Process Faild'});
                        return;
                    }

                    res.status(201).json({message: 'new Product Created'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    res.status(400).json({message: 'Add New Product Process Faild'});
                }
            );
    });

    router.put('/edit/:productId', AuthenticationMiddleware,
        isAuthorizedUserSallerRuleOwnRequestedProduct, (req, res) => {
        // TODO: Make Validator class for Given Product ID to reduce duplication
        const requestProductId = Number(req.params.productId);

        if (isNaN(requestProductId) || !requestProductId) {
            res.status(400).json({message: 'Must Given Correct Product ID'});
            return;
        }
        
        // TODO: Make Validator class for Given Product Data to reduce duplication
        const {productName, cost, amount, saller} = req.body;

        const updateProductObject = {
            id: requestProductId
        };
        if (!StringUtls.isEmptyString(productName)) {
            updateProductObject['name'] = productName;
        }
        const givenNewProductCost = Number(cost);
        if (givenNewProductCost && !isNaN(givenNewProductCost)) {
            updateProductObject['cost'] = givenNewProductCost;
        }
        const givenNewProductAmount = Number(amount);
        if (givenNewProductAmount && !isNaN(givenNewProductAmount)) {
            updateProductObject['amount'] = givenNewProductAmount;
        }
        /** **NOTE:** The Requirements is not clear if possible to update Saller or not */
        const givenNewUserSallerId = Number(saller);
        if (givenNewUserSallerId && !isNaN(givenNewUserSallerId)) {
            updateProductObject['saller'] = givenNewUserSallerId;
        }

        ProductService
            .update(
                requestProductId,
                updateProductObject,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Update Product Process Faild'});
                        return;
                    }

                    res.status(200).json({message: 'Product Updated'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    if (error instanceof NotFoundProductError) {
                        res.status(404).json({message: 'Product Not Exists'});
                    } else {
                        res.status(400).json({message: 'Invalid Uodate Product Process'});
                    }
                }
            );
    });

    router.delete('/remove/:productId', AuthenticationMiddleware,
        isAuthorizedUserSallerRuleOwnRequestedProduct, (req, res) => {
        // TODO: Make Validator class for Given Product ID to reduce duplication
        const requestProductId = Number(req.params.productId);

        if (isNaN(requestProductId) || !requestProductId) {
            res.status(400).json({message: 'Must Given Correct Product ID'});
            return;
        }

        ProductService
            .remove(
                requestProductId,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Delete Product Process Faild'});
                        return;
                    }

                    res.status(200).json({message: 'Product Delete'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    if (error instanceof NotFoundProductError) {
                        res.status(404).json({message: 'Product Not Exists'});
                    } else {
                        res.status(400).json({message: 'Delete Product Process Faild'});
                    }
                }
            );
    });

    module.exports = router;
})();