(() => {
    'use strict';

    // load modules
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

        // TODO: Make Validator class for Given User ID to reduce duplication
        const requestUserId = Number(req.params.userId);

        if (isNaN(requestUserId) || !requestUserId) {
            res.status(400).json({message: "Requested User ID is Not Found"});
            return;
        }

        let accessPermissionStatus = false;
        if (Number(authorizedUser.id) === requestUserId) {
            // First Check if Given Requested User the same Authorized User
            accessPermissionStatus = true;
        } else {
            // Otherwise Check if Authorized User with Saller Rule So can perform
            let authorizedUserAsEntity;
            try {
                authorizedUserAsEntity =
                    new UserEntity(authorizedUser.id, '', 0, authorizedUser.rule);   
            } catch (error) {
                // TODO: Replace with Custom Logger
                console.error(error);
                authorizedUserAsEntity = null;
            }

            if (authorizedUserAsEntity &&
                authorizedUserAsEntity.getUserRule() === AvailbleUserRule.SALLER) {
                    accessPermissionStatus = true;
            }
        }

        if (accessPermissionStatus) {
            next();
        } else {
            res.status(403).json({message: "Invalid Authorized User Rule"});
            return;
        }
    };
})();