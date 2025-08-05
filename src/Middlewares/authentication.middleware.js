(() => {
    'use strict';

    // load modules
    const AuthenticationService = require('../Services/authService');
    const StringUtls = require('../Utils/StringUtls');

    // Make Closure function as Middleware To Perfrom Authentication middleware
    module.exports = (req, res, next) => {
        const authToken = req.header('Authorization');

        if (StringUtls.isEmptyString(authToken) || !String(authToken).startsWith('Bearer')) {
            res.status(401).json({message: 'No token, authorization denied'});
            return;
        }

        // extract only JWT token from header's parameter value
        const givenJwtToken = String(authToken).replace('Bearer', '').trim();

        // Check Wether given JWT Token Valid or not
        AuthenticationService.verifyGivenTokenAndGetAutherizedUser(
            givenJwtToken,
            (decodedToken) => {
                if (!decodedToken) {
                    res.status(401).json({message: 'Token is Not Valid'});
                    return;
                }

                req.user = decodedToken.user;
                next();
            },
            (error) => {
                // TODO: Replace with Custom Logger
                console.error(error);
                res.status(401).json({message: 'Token is Not Valid'});
            }
        );
    };
})();