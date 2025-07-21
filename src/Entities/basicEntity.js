(() => {
    'use strict';

    class BasicEntity {
        /**
         * id, Unique idetifer for Entity
         * @type {int}
         */
        id;

        /**
         * Basic Entity Constructor
         * @param {int} id Unique id value for Entity 
         */
        constructor(id) {
            this.id = id;
        }
    }

    module.exports = BasicEntity;
})();