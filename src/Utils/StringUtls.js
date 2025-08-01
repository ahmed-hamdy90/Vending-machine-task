(() => {
    'use strict';

    /**
     * Represent class includes Utilities methods for any String Data type 
     */
    class StringUtls {

        /**
         * Check Whether given string value is Empty or not
         * @param {string} value string value that needs to check
         * @returns Boolean, true if empty, otherwise false
         */
        static isEmptyString(value) {
            if (value === null || value === undefined) {
                return true;
            }

            if (typeof value !== 'string') {
                return false;
            }

            return value.trim().length === 0;
        }
    }

    module.exports = StringUtls;
})();