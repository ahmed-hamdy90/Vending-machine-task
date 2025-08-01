(() => {
    'use strict';

    // load modules
    const NotImplementError  = require('../Errors/notImplementError');
    const BasicEntity = require('../Entities/basicEntity');

    /**
     * Custom Abstrict service to unified any Crud Operations will done on Domain Entity logic
     */
    class AbstrictCrudOptsService {

        /**
         * AbstrictCrudOptsService Constructor
         * @throws {TypeError} in case called Parent Class (this calss)
         */
        constructor() {
            if (new.target === AbstrictCrudOptsService) {
                // TODO: passing logger to logging this Error
                throw new TypeError("Cannot instantiate AbstrictCrudOptsService directly.");
            }
        }

        /**
         * Getting Entity instance By ID
         * @param {int} id given unique Id for entity's details
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        get(id, successCallback, errorCallback) {
            throw new NotImplementError("Method 'get()' must be implemented.");
        }

        /**
         * Getting all available list of Entity based on Given Criteria
         * @param {Object} criteria filtering criteria need to apply on listing entities
         * @param {int} offset the beginning number will begin listing entities from it
         * @param {int} limit the maximum total number of entities will return
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        getAll(criteria = {}, offset = 0, limit = 20, successCallback, errorCallback) {
            throw new NotImplementError("Method 'getAll()' must be implemented.");
        }

        /**
         * Saving Given Entity's data
         * @param {BasicEntity} saveEntity represent entity instance which need to be save 
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        save(saveEntity, successCallback, errorCallback) {
            throw new NotImplementError("Method 'save()' must be implemented.");
        }

        /**
         * Update Given Entity's data
         * @param {int} id given unique Id for entity's details
         * @param {BasicEntity} updateEntity represent entity instance which need to be save 
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        update(id, updateEntity, successCallback, errorCallback) {
            throw new NotImplementError("Method 'update()' must be implemented.");
        }

        /**
         * Remove Exists Entity's data
         * @param {int} id given unique Id for entity's details
         * @param {function} successCallback success callback function will called on process done successfully
         * @param {function} errorCallback error callback function will called on process failed
         */
        remove(id, successCallback, errorCallback) {
            throw new NotImplementError("Method 'remove()' must be implemented.");
        }
    }

    module.exports = AbstrictCrudOptsService;
})();