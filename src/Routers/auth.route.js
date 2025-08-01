(() => {
    'use strict';

    // load modules
    const express = require('express');
    const UserService = require('../Services/userService');
    const AuthenticationService = require('../Services/authService');
    const StringUtls = require('../Utils/StringUtls');

    // initialize express's router instance
    const router = express.Router();

    // define possible routes
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        if (StringUtls.isEmptyString(username) || StringUtls.isEmptyString(password)) {
            res.status(400).json({message: 'Must Given Username and password'});
            return;
        }

        AuthenticationService
            .login(
                username,
                password,
                (user, token) => {
                    res.status(200)
                        .json({
                            User: {
                                UserId: user.id, 
                                Username: user.name
                            },
                            Token: token
                        });
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    res.status(401).json({message: "Invalid Username or password"});
                }
            );
    });

    module.exports = router;
})();