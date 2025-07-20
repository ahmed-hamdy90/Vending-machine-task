(() => {
    'use strict';

    /**
     * Represent Custom Exception Class for NotImplement method/function like Java alike,
     * @link {https://commons.apache.org/proper/commons-lang/javadocs/api-3.4/org/apache/commons/lang3/NotImplementedException.html}
     */
    class NotImplementError extends Error {

        /**
         * It's standard practice to set the 'name' property to the class name.
         * This helps in identifying the type of error during debugging.
         */
        name;

        /**
         * This is our custom property to hold extra information.
         */
        field;

        /**
         * @param {string} message The error message.
         * @param {string} [field] The name of the field that failed validation, this Optional Parameter, defult value is NULL.
         */
        constructor(message, field = null) {

            // Pass the message to the parent Error class constructor.
            super(message);

            this.name = 'NotImplementError';
            this.field = field;

            /**
             * Capturing a stack trace (V8-specific, but good practice for Node.js/Chrome)
             * This helps in creating a cleaner stack trace by omitting the constructor call from it.
             */
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, NotImplementError);
            }
        }
    }

    module.exports = NotImplementError;
})();