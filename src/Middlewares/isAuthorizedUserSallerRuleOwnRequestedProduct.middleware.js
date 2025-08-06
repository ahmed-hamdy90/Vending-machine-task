(() => {
    'use strict';

    // load modules
    const ProductService = require('../Services/productService');
    const ProductEntity = require('../Entities/product');

    const AvailbleUserRule = require('../Entities/rules');
    const UserEntity = require('../Entities/user');

    /**
     * Make Closure function as Middleware To Perfrom Check Authorized User with Saller Rule
     * Or Authorized User is the same as Requested User 
     */ 
    module.exports = (req, res, next) => {
        const authorizedUser = req.user;

        if (!authorizedUser) {
            res.status(401).json({message: "Authorized User is Not Found"});
            return;
        }

        let authorizedUserAsEntity; 
        try {
            authorizedUserAsEntity =
                new UserEntity(Number(authorizedUser.id), '', 0, authorizedUser.rule);   
        } catch (error) {
            // TODO: Replace with Custom Logger
            console.error(error);
            res.status(403).json({message: "Invalid Authorized User"});
            return;
        }

        if (authorizedUserAsEntity.getUserRule() !== AvailbleUserRule.SALLER) {
            res.status(403).json({message: "Invalid Authorized User"});
            return;
        }

        // TODO: Make Validator class for Given Product ID to reduce duplication
        const requestProductId = Number(req.params.productId);

        if (isNaN(requestProductId) || !requestProductId) {
            res.status(400).json({message: "Requested Product ID is Not Found"});
            return;
        }

        // Getting the full details of requested product To check its Owner with Authorized User
        ProductService.get(
            requestProductId,
            (result) => {
                /**
                 * @type {ProductEntity}
                 */
                const product = result;
                if (!product) {
                    res.status(404).json({message: "Requested Product is Not Found"});
                    return;
                }

                if (product.saller.id !== authorizedUserAsEntity.id) {
                    res.status(403).json({message: "Invalid Requested Product's Owner"});
                    return;
                }

                next();
            },
            (error) => {
                // TODO: Replace with Custom Logger
                console.error(error);
                res.status(404).json({message: "Requested Product is Not Found"});
                return;
            }
        );
    }
})();
