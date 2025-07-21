(() => {
    'use strict';

    // load configuration
    const environment = process.env.NODE_ENV || 'development';
    const configuration = require(`../../../Config/config.${environment}.json`);

    // load modules
    const mongoose = require('mongoose');
    const InvalidParameterError = require('../../Exceptions/invalidParameterError');

    /**
     * MongoDb adapter class who responsible for any Db operations
     */
    class MongoDbAdapter {

        /**
         * mongo Database connection
         * @member {mongoose}
         */
        adapter;

        /**
         * MongoDbAdapter constructor
         * @param {*} mongo mongoose library instance
         * @param {Object} config mongoDb configuration details
         */
        constructor(mongo, config) {
            const dbUri = `mongodb://${config.host}:${config.port}/${config.database}`;
            const dbOptions = {};

            // TODO: Override console error with Custom Logger
            mongo.connect(dbUri, dbOptions)
                .then(() => console.log('Initial Mongoose connection completed'))
                .catch(error => console.error('Initial Mongoose connection failed error: ' + error));

            this.adapter = mongo;
        }

        /**
         * Create a mongoose model instance for collection under mongoDB
         * @param {string} name model's name value
         * @param {Object} schema model's schema details
         * @param {Object} [options] options need to pass during create model instance
         */
        createModel(name, schema, options = {}) {
            // create Schema as object
            const schemaObject = new this.adapter.Schema(schema, options);
            // setting virtual method for model Id
            schemaObject.virtual('id').get(() => this.userId);

            return this.adapter.model(name, schemaObject);
        }

        /**
         * Save given mongoose model
         * @param {*} model model instance which need to save
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        save(model, successCallback, errorCallback) {
            model.save()
                .then(result => successCallback(result))
                .catch(error => {
                    // TODO: integrate with Custom Logger
                    errorCallback(error)}
                );
        }

        /**
         * Retrieve all data under given mongoose model's collection
         * @param {*} model model instance which need get it's data
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        findAll(model, successCallback, errorCallback) {
            model.find({})
                .then(result => successCallback(result))
                .catch(error => {
                    // TODO: integrate with Custom Logger
                    errorCallback(error)}
                );
        }

        /**
         * Search for data under given mongoose model's collection
         * @param {*} model model instance which need to search into it's data
         * @param {Object} criteria define which filter will apply to search for data
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        findByCriteria(model, criteria, successCallback, errorCallback) {
            // must given criteria as object
            if (criteria === undefined || typeof criteria !== "object") {
                errorCallback(
                    new InvalidParameterError('Invalid given criteria to search with'));
                // TODO: integrate with Custom Logger
                return;
            }
            
            model.find(criteria)
                .then(result => successCallback(result))
                .catch(error => {
                    // TODO: integrate with Custom Logger
                    errorCallback(error)}
                );
        }

        /**
         * Update exit data under given mongoose model's collection
         * @param {*} model model instance which need to update into it's data
         * @param {Object} criteria define which filter will apply to search for data
         * @param {Object} updateData 
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        updateByCriteria(model, criteria, updateData, successCallback, errorCallback) {
            // must given criteria as object
            if (criteria === undefined || typeof criteria !== "object") {
                // TODO: integrate with Custom Logger
                errorCallback(
                    new InvalidParameterError('Invalid given criteria to search with'));
                return;
            }
            
            // must given updateData as object
            if (updateData === undefined || 
                typeof updateData !== "object" ||
                Object.keys(updateData).length === 0
            ) {
                // TODO: integrate with Custom Logger
                errorCallback(
                    new InvalidParameterError(
                        'Invalid given Update Data details Or Given Empty details'));
                return;
            }
            
            model.updateOne(criteria, updateData)
                .then(result => successCallback(result))
                .catch(error => {
                    // TODO: integrate with Custom Logger
                    errorCallback(error)}
                );
        }

        /**
         * Remove given mongoose model
         * @param {*} model model instance which need to remove
         * @param {Object} criteria define which filter will apply to search for data
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        deleteByCriteria(model, criteria, successCallback, errorCallback) {
            // must given criteria as object
            if (criteria === undefined || typeof criteria !== "object") {
                errorCallback(
                    new InvalidParameterError('Invalid given criteria to search with'));
                // TODO: integrate with Custom Logger
                return;
            }
            
            model.deleteOne(criteria)
                .then(result => successCallback(result))
                .catch(error => {
                    // TODO: integrate with Custom Logger
                    errorCallback(error)}
                );
        }
    }

    module.exports = new MongoDbAdapter(mongoose, configuration.databaseConfig.MongoDb);
})();