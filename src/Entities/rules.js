(() => {
    'use strict';

    /**
     * Represent Static/Enum Class for Available User Rules for the System
     */
    class AvailbleUserRule {

        /**
         * The Main Rule for Buyer
         */
        static BUYER = 1;

        /**
         * The Admin Rule for Saller
         */
        static SALLER = 2;
    }

    module.exports = AvailbleUserRule;

})();