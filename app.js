(() => {
    'use strict';

    // load configuration
    const environment = process.env.NODE_ENV || 'development';
    const configuration = require(`./Config/config.${environment}.json`);

    const port = process.env.PORT || configuration.api.port;
    const version = configuration.api.verion || 1;

    // load modules
    const express = require('express');
    const InvalidApiRouteError = require('./src/Errors/invalidApiRouteError');
    const AuthenticationRoute = require('./src/Routers/auth.route');
    const UsersRoute = require('./src/Routers/user.route');
    const ProductRoute = require('./src/Routers/product.route');

    // initialize express API
    const app = express();

    // Middleware to parse JSON request bodies
    app.use(express.json());

    app.use(`/api/v${version}/auth`, AuthenticationRoute);
    app.use(`/api/v${version}/users`, UsersRoute);
    app.use(`/api/v${version}/products`, ProductRoute);

    // API handle wrong routes
    app.all('/{*splat}', (req, res) => {
        throw new InvalidApiRouteError('Invalid API Route');
    });

    // API handle wrong routes plus Error handler
    app.use((err, req, res, next) => {
        // TODO: Replace with Custom Logger
        console.error(err);
        if (err instanceof InvalidApiRouteError) {
            res.status(404).json({});
        } else {
            // only display full error details into development environment
            let error = (environment === 'development') ? err : 'Error Happened';
            res.status(500).json('error', {error: error});
        }
    });

    // make server run on chosen host and port
    app.listen(
        port,
        configuration.api.host,
        _ => console.log(`Running Node API on http://${configuration.api.host}:${port}`)
    );
})();