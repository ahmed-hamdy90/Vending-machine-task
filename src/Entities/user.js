(() => {
    'use strict';

    // load modules
    const AvailbleUserRule = require('./rules');
    const BasicEntity = require('./basicEntity');
    const InvalidParameterError = require('../Errors/invalidParameterError');

    /**
     * Represent Domian Entity for User who use Vending Machine
     */
    class User extends BasicEntity {

        /**
         * User's username
         * @type {string}
         */
        name;

        /**
         * Total Money had been deposit
         * @type {int}
         */
        deposit = 0;

        /**
         * User's Rule which depetermine his privilages
         * @type {AvailbleUserRule}
         */
        #rule;

        /**
         * User Constructor
         * @param {int} id user's user
         * @param {string} username user's name
         * @param {int} deposit user's deposit
         * @param {int} rule user's rule, one of available Rules under @see {AvailbleUserRule}
         */
        constructor(id, username, deposit = 0, rule = AvailbleUserRule.BUYER) {
            super(id);
            this.name = username;
            this.deposit = deposit;
            this.setUserRule(rule);
        }

        /**
         * Setter for User's rule
         * @param {int} rule given rule for this user
         * @throws {InvalidParameterError} In case Given User Rule Invalid
         */
        setUserRule(rule) {
            if (rule !== AvailbleUserRule.BUYER && rule !== AvailbleUserRule.SALLER) {
                throw new InvalidParameterError('Given In-correct User Rule Type');
            }

            this.#rule = rule;
        }

        /**
         * Getter for User's rule
         * @returns {int} rule for User
         */
        getUserRule() {
            return this.#rule;
        }
    }

    module.exports = User;
})();