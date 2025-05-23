export const getAllEndpoints = (app, parentPath = '') => {
    const endpoints = [];

    if (!app._router || !app._router.stack) {
        console.error("No routes found in the app.");
        return endpoints;
    }

    console.log("Traversing app._router.stack...");
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Direct routes
            console.log("Direct route found:", middleware.route.path);
            endpoints.push({
                path: parentPath + middleware.route.path,
                methods: Object.keys(middleware.route.methods),
            });
        } else if (middleware.name === 'router' && middleware.handle.stack) {
            // Router-level middleware (nested routes)
            console.log("Router middleware found:", middleware.regexp);
            const routerPath = middleware.regexp ? middleware.regexp.source.replace('^\\', '').replace('\\/?$', '') : '';
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    console.log("Nested route found:", handler.route.path);
                    endpoints.push({
                        path: parentPath + routerPath + handler.route.path,
                        methods: Object.keys(handler.route.methods),
                    });
                }
            });
        }
    });

    return endpoints;
};