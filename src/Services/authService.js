(() => {
    'use strict';

    // load configuration
    const environment = process.env.NODE_ENV || 'development';
    const configuration = require(`../../Config/config.${environment}.json`);
    
    // load modules
    const JwtService = require('jsonwebtoken');
    const UserService = require('./userService');
    const EncryptionService = require('./encryptionService');
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const UserModel = require('../DB/MongoModels/user.model');
    const UserEntity = require('../Entities/user');

    const InvalidParameterError = require('../Errors/invalidParameterError');
    const NotFoundUserError = require('../Errors/notFoundUserError');

    /**
     * Represent Service related to Authentication process and logic
     */
    class AuthenticationService {

        /**
         * @type {Object}
         */
        configurationForJwt;

        /**
         * @type {jsonwebtoken}
         */
        jwtService;

        /**
         * @type {UserService}
         */
        userService;

        /**
         * @type {EncryptionService}
         */
        encryptionService;

        /**
         * @type {MongoDbAdapter}
         */
        mongoDbAdapter;

        /**
         * @type {UserModel}
         */
        userMongoModel;

        /**
         * AuthenticationService Constructor
         * @param {Object} configuration configuration object for authentication process
         * @param {jsonwebtoken} jwtService JWT library class as Service instance
         * @param {UserService} userService User Service instance
         * @param {EncryptionService} encryptionService Encryption Service instance
         * @param {MongoDbAdapter} mongoDbAdapter MongoDB Adapter layer class instance
         * @param {UserModel} mongoModel User Mongo Model class instance, need to inject for MongoDB Operations
         * @throws {InvalidParameterError} In case Given Configuration invalid
         */
        constructor(configuration, jwtService, userService, encryptionService, mongoDbAdapter, mongoModel) {
            if (!configuration ||
                Object.keys(configuration).length === 0 ||
                configuration.hasOwnProperty('secret')) {
                new InvalidParameterError('Invalid given Auth configuration');
            }
            this.configurationForJwt = configuration;
            this.jwtService = jwtService;
            this.userService = userService;
            this.encryptionService = encryptionService;
            this.mongoDbAdapter = mongoDbAdapter;
            this.userMongoModel = mongoModel;
        }

        /**
         * Perform Login process for Authenticaton API access
         * @param {string} username given username for user which need to authenticate
         * @param {string} password given password for user which need to authenticate
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        login(username, password, successCallback, errorCallback) {
            // First check given Username exists
            this.userService.getAll(
                (users) => {
                    if (!users || users.length == 0) {
                        errorCallback(new NotFoundUserError('User Not Exists'));
                        return;
                    }
                    
                    /**
                     * Get User
                     * @type {UserEntity}
                     */
                    const user = users[0];

                    // We have to make calling adapter to getting Mongo Data to include password
                    // TODO: make Enahcement to Wrapper this way as not perfect way
                    this.mongoDbAdapter.findByCriteria(
                        this.userMongoModel,
                        {userId: user.id},
                        (result) => {
                            if (!result) {
                                errorCallback(new NotFoundUserError('User Not Exists'));
                                return;
                            }

                            // Check  if 
                            const storedUserData = result[0];
                            const storedPasssword = String(storedUserData.password);
                            const givenHasdPassword = this.encryptionService.generateMd5HashString(password);

                            if (storedPasssword !== givenHasdPassword) {
                                errorCallback(new NotFoundUserError(`Given passwrod Invalid for UserId: ${user.id}`));
                                return;
                            }

                            // Create New Token for authrozied user
                            const jwtPayload = {
                                user: {
                                    id: user.id,
                                    rule: user.getUserRule()
                                }
                            }

                            this.jwtService.sign(
                                jwtPayload,
                                this.configurationForJwt.secret,
                                { expiresIn: '30m' },
                                (error, token) => {
                                    if (error) {
                                        // TODO: Replace with Custom Logger
                                        console.error(error);
                                        errorCallback(error);
                                        return;
                                    };
                                    successCallback(user, token);
                                }
                            );
                        }, 
                        errorCallback
                    );
                },
                (error) => {
                    // TODO: Replace with Custom Logger
                    console.error(error);
                    errorCallback(error);
                },
                {username: username},
                0,
                1
            );
        }

        /**
         * Perfrom Verification for Authentication token which used to identifie authenticated user
         * @param {string} token given token which need to verify
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        verifyGivenTokenAndGetAutherizedUser(token, successCallback, errorCallback) {
            let decodedToken = null;

            try {
                decodedToken = this.jwtService.verify(String(token), this.configurationForJwt.secret);
            } catch (error) {
                // TODO: Replace with Custom Logger
                console.error(error);
                errorCallback(error);
                return;
            }

            /**
             * @type {null|{id: int, rule: int}}
             */
            const authorizedUser = (decodedToken) ? decodedToken.user : undefined;
            if (authorizedUser) {
                // Make sure Given Token is still User exists
                this.userService
                    .get(
                        Number(authorizedUser.id),
                        (result) => {
                            if (!result) {
                                errorCallback(new NotFoundUserError('Expired Token As User had been Removed'));
                                return;
                            }
                            /**
                             * @type {UserEntity}
                             */
                            const user = result;
                            if (user.getUserRule() !== Number(authorizedUser.rule)) {
                                errorCallback(new Error('Expired Token As store Rule is not Correct'));
                                return;
                            }

                            successCallback(decodedToken);
                        },
                        error => errorCallback(error)
                    );
            } else {
                errorCallback(new NotFoundUserError('Expired Token As Invalid User details'));
            }
        }
    }

    module.exports = new AuthenticationService(
        configuration.auth,
        JwtService,
        UserService,
        EncryptionService,
        MongoDbAdapter,
        UserModel
    );
})();