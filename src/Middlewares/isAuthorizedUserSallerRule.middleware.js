(() => {
    'use strict';

    // load modules
    const AvailbleUserRule = require('../Entities/rules');
    const UserEntity = require('../Entities/user');

    // Make Closure function as Middleware To Perfrom Check Authorized User with Sallar Rule ot not
    module.exports = (req, res, next) => {
        const authorizedUser = req.user;

        if (!authorizedUser) {
            res.status(401).json({message: "Authorized User Not Found"});
            return;
        }

        let authorizedUserAsEntity; 
        try {
            authorizedUserAsEntity = new UserEntity(authorizedUser.id, '', 0, authorizedUser.rule);   
        } catch (error) {
            console.error(error);
            res.status(403).json({message: "Invalid Authorized User Rule"});
            return;
        }

        if (authorizedUserAsEntity.getUserRule() !== AvailbleUserRule.SALLER) {
            res.status(403).json({message: "Invalid Authorized User Rule"});
            return;
        }

        next();
    };
})();