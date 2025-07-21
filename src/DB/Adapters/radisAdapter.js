(() => {
    'use strict';

    // load configuration
    const environment = process.env.NODE_ENV || 'development';
    const configuration = require(`../../../Config/config.${environment}.json`);

    // load modules
    const redis = require('redis');


    class RedisDbAdapter {
                
        /**
         * Redis Database connection
         * @member {client}
         */
        adapter;

        /**
         * RedisDbAdapter constructor
         * @param {*} redis redis library instance
         * @param {Object} config Redis DB configuration details
         */
        constructor(redis, config) {
            let dbUri = `redis://${config.host}:${config.port}`;
            
            if (config.hasOwnProperty('user') && config.hasOwnProperty('password') && 
                (config.password !== null || config.password !== '')) {
                    dbUri =
                        `redis://${config.user}:${config.password}@${config.host}:${config.port}`;
            }

            this.adapter = redis.createClient({
                url: dbUri
            });

            // Event Listeners
            this.adapter.on('error', (error) => {
                // TODO: Override console error with Custom Logger
                console.error('Redis Client Error:', error);
            });

            this.adapter.on('connect', () => {
                // TODO: Override console log with Custom Logger
                console.log('Redis client connected.');
            });

            this.adapter.on('reconnecting', () => {
                // TODO: Override console log with Custom Logger
                console.log('Redis client reconnecting...');
            });

            this.adapter.on('end', () => {
                // TODO: Override console log with Custom Logger
                console.log('Redis client disconnected.');
            });
        }

        /**
         * Private method for open Connection to use Redis DB
         */
        #openDbConnection() {
            this.adapter.connect();
        }

        /**
         * Private method for close Connection to use Redis DB
         */
        #closeDbConnection() {
            this.adapter.destroy();
        }

        /**
         * Getting Stored Value for a Given key
         * @param {string} key given name represent stored key
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        async getKey(key, successCallback, errorCallback) {
            this.#openDbConnection();

            let retrieveValueForKey = null;
            let throwExcaption = null;

            try {
                retrieveValueForKey = await this.adapter.get(key);
            } catch (error) {
                throwExcaption = error;
                // TODO: Override console log with Custom Logger
                console.error('There is ');
            } finally {
                this.#closeDbConnection();
            }

            if (throwExcaption !== null)
                errorCallback(throwExcaption);
            else
                successCallback(retrieveValueForKey);
        }

        /**
         * Saving new value for given key
         * @param {string} key given name represent stored key
         * @param {string} value given value which need to stored under given key
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        async saveKey(key, value, successCallback, errorCallback) {
            this.#openDbConnection();

            let throwExcaption = null;

            try {
                retrieveValueForKey = await this.adapter.set(key, value);
            } catch (error) {
                throwExcaption = error;
                // TODO: Override console log with Custom Logger
                console.error('There is ');
            } finally {
                this.#closeDbConnection();
            }

            if (throwExcaption !== null)
                errorCallback(throwExcaption);
            else
                successCallback(true);
        }

        /**
         * Remove the stored key
         * @param {string} key given name represent stored key
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        async deleteKey(key, successCallback, errorCallback) {
            this.#openDbConnection();

            let throwExcaption = null;

            try {
                retrieveValueForKey = await this.adapter.del(key);
            } catch (error) {
                throwExcaption = error;
                // TODO: Override console log with Custom Logger
                console.error('There is ');
            } finally {
                this.#closeDbConnection();
            }

            if (throwExcaption !== null)
                errorCallback(throwExcaption);
            else
                successCallback(true);
        }
    }

    module.exports = new RedisDbAdapter(redis, configuration.databaseConfig.Redis);
})();