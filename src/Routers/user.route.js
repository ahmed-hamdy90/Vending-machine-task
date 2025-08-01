(() => {
    'use strict';

    // load modules
    const express = require('express');
    const UserService = require('../Services/userService');
    const UserEntity = require('../Entities/user');

    const AuthenticationMiddleware = require('../Middlewares/authentication.middleware');
    const IsAuthorizedUserSallerRule = require('../Middlewares/isAuthorizedUserSallerRule.middleware');

    const NotFoundUserError = require('../Errors/notFoundUserError');
    const StringUtls = require('../Utils/StringUtls');

    // initialize express's router instance
    const router = express.Router();

    // define possible routes
    router.get('/', (req, res) => {
        // In case GetAll method that Can everyOne access this Route So Useless Authentication
        UserService
            .getAll({}, 0, 100,
                (users) => {
                    res.status(200);
                    res.json({Users: users});
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    throw error;
                });
    });

    router.get('/:userId', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
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

    router.post('/', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
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

    router.put('/edit/:userId', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
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
                        res.status(400).json({message: 'Uodate User Process Faild'});
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

    router.delete('/remove/:userId', AuthenticationMiddleware, IsAuthorizedUserSallerRule, (req, res) => {
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