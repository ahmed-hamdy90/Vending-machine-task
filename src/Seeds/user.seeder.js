(() => {
    'use strict';

    // load modules
    const MongoDbAdapter = require('../DB/Adapters/mongoDbAdapter');
    const UserMapper = require('../DB/Mappers/userMapper');
    const UserModel = require('../DB/MongoModels/user.model');
    const UserEntity = require('../Entities/user');
    const AvailbleUserRule = require('../Entities/rules');

    // Define Users details will be Seeding.
    const buyer1 = new UserEntity(1, 'Ahmed', 100, AvailbleUserRule.BUYER);
    const buyer2 = new UserEntity(2, 'Omar', 0, AvailbleUserRule.BUYER);
    const saller = new UserEntity(3, 'Mostafa', 0, AvailbleUserRule.SALLER);

    const users = [buyer1, buyer2, saller];

    /**
     * Define User Db seeder loader as clousor
     */
    module.exports = () => {
        const randomPasswordPrefix = 'Test';

        users.forEach(user => { 
            const userPresistenceData =
                UserMapper.toPersistenceWithPassword(user, `${randomPasswordPrefix} ` + user.id);
            const userModel = new UserModel(userPresistenceData);

            MongoDbAdapter.save(
                userModel,
                function (result) {
                    console.log(result);
                },
                function (error) {
                    console.error(error);
                }
            );
        });
    };

})();