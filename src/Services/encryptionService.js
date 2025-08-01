(() => {
    'use strict';

    // load modules
    const cryptoUtil = require('crypto');

    /**
     * Custom Encryption Service includes any logic need to make encrypt processes
     * based on a given library or utility
     */
    class EncryptionService {

        /**
         * Instance for any library or utility Object which used
         * As helper to complete our custom encryption process.
         * @type {crypto}
         */
        encryptionUtil;

        /**
         * EncryptionService Constructor
         * @param {crypto} encryptionUtil Crypto Library class as Utility instance
         */
        constructor(encryptionUtil) {
            this.encryptionUtil = encryptionUtil;
        }

        /**
         * Generate new string encrypted with MD5 encrypt algorithm
         * @param {string} plainString given string which need to encrypt
         * @returns {string} converted string value
         */
        generateMd5HashString(plainString) {
            const md5Hash = this.encryptionUtil.createHash('md5');
            md5Hash.update(plainString, 'utf8');

            return md5Hash.digest('hex');
        }
    }

    module.exports = new EncryptionService(cryptoUtil);
})();