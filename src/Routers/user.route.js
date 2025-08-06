(() => {
    'use strict';

    // load modules
    const express = require('express');
    const UserService = require('../Services/userService');

    const AuthenticationMiddleware = require('../Middlewares/authentication.middleware');
    const IsAuthorizedUserSallerRule = require('../Middlewares/isAuthorizedUserSallerRule.middleware');
    const isAuthorizedUserSallerRuleOrSameRequestedUser =
        require('../Middlewares/isAuthorizedUserSallerRuleOrSameRequestedUser.middleware');

    const NotFoundUserError = require('../Errors/notFoundUserError');
    const StringUtls = require('../Utils/StringUtls');

    // initialize express's router instance
    const router = express.Router();

    // define possible routes
    router.get('/', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
        // This Route Must not be Open For all Autherized Users Just Saller Users (act as Admin)
        UserService
            .getAll(
                (users) => {
                    res.status(200);
                    res.json({Users: users});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    throw error;
                }
            );
    });

    router.get('/:userId', AuthenticationMiddleware,
            isAuthorizedUserSallerRuleOrSameRequestedUser, (req, res) => {
        // TODO: Make Validator class for Given User ID to reduce duplication
        const requestUserId = Number(req.params.userId);

        if (isNaN(requestUserId) || !requestUserId) {
            res.status(400).json({message: 'Must Given Correct User ID'});
            return;
        }

        UserService
            .get(
                requestUserId,
                (result) => {
                    if (!result) {
                        res.status(404).json({message: 'User Not Found'});
                        return;
                    }

                    res.status(200).json({User: result});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    res.status(404).json({message: 'User Not Found'});
                }
            );
    });

    /**
     * **Thinking Opinion**
     * Skip this Route and Implement the same Functionality Under Auth/Register Route
     * especially We Cann Access this Route without Credentials.
     */
    router.post('/', (req, res) => {
        // TODO: Make Validator class for Given User Data to reduce duplication
        const {username, password, deposit, rule} = req.body;

        if (StringUtls.isEmptyString(username) || StringUtls.isEmptyString(password)) {
            res.status(400).json({message: 'Must Given Username and password Plus Correct User Rule'});
            return;
        }

        const newUserObject = {
            'name': username,
            'password': password,

        };
        const givenNewUserDeposit = Number(deposit);
        if (givenNewUserDeposit && !isNaN(givenNewUserDeposit)) {
            newUserObject['deposit'] = givenNewUserDeposit;
        }
        const givenNewUserRule = rule ?? -1;
        if (givenNewUserRule !== -1) {
            newUserObject['rule'] = givenNewUserRule;
        }

        UserService
            .save(
                newUserObject,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Add New User Process Faild'});
                        return;
                    }

                    res.status(201).json({message: 'new User Created'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    res.status(400).json({message: 'Add New User Process Faild'});
                }
            );
    });

    router.put('/edit/:userId', AuthenticationMiddleware,
            isAuthorizedUserSallerRuleOrSameRequestedUser, (req, res) => {
        // TODO: Make Validator class for Given User ID to reduce duplication
        const requestUserId = Number(req.params.userId);

        if (isNaN(requestUserId) || !requestUserId) {
            res.status(400).json({message: 'Must Given Correct User ID'});
            return;
        }
        
        // TODO: Make Validator class for Given User Data to reduce duplication
        const {username, password, deposit, rule} = req.body;

        const updateUserObject = {
            id: requestUserId
        };
        if (!StringUtls.isEmptyString(username)) {
            updateUserObject['name'] = username;
        }
        if (!StringUtls.isEmptyString(password)) {
            updateUserObject['password'] = password;
        }
        const givenNewUserDeposit = Number(deposit);
        if (givenNewUserDeposit && !isNaN(givenNewUserDeposit)) {
            updateUserObject['deposit'] = givenNewUserDeposit;
        }
        const givenNewUserRule = rule ?? -1;
        if (givenNewUserRule !== -1) {
            updateUserObject['rule'] = givenNewUserRule;
        }

        UserService
            .update(
                requestUserId,
                updateUserObject,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Update User Process Faild'});
                        return;
                    }

                    res.status(200).json({message: 'User Updated'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    if (error instanceof NotFoundUserError) {
                        res.status(404).json({message: 'User Not Exists'});
                    } else {
                        res.status(400).json({message: 'Invalid Uodate User Process'});
                    }
                }
            );
    });

    router.delete('/remove/:userId', AuthenticationMiddleware,
            isAuthorizedUserSallerRuleOrSameRequestedUser, (req, res) => {
        // TODO: Make Validator class for Given User ID to reduce duplication
        const requestUserId = Number(req.params.userId);

        if (isNaN(requestUserId) || !requestUserId) {
            res.status(400).json({message: 'Must Given Correct User ID'});
            return;
        }

        UserService
            .remove(
                requestUserId,
                (result) => {
                    if (!result) {
                        res.status(400).json({message: 'Delete User Process Faild'});
                        return;
                    }

                    res.status(200).json({message: 'User Delete'});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    if (error instanceof NotFoundUserError) {
                        res.status(404).json({message: 'User Not Exists'});
                    } else {
                        res.status(400).json({message: 'Delete User Process Faild'});
                    }
                }
            );
    });

    module.exports = router;
})();