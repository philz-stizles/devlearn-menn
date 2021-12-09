const basicInfo = require('./basicInfo');
const servers = require('./servers');
const components = require('./components');
const tags = require('./tags');
const auth = require('./paths/auth');
// const categories = require('./paths/categories');
// const coupons = require('./paths/coupons');
// const menus = require('./paths/menus');

module.exports = {
    ...basicInfo,
    servers,
    components,
    tags,
    paths: {
        ...auth,
        // ...categories,
        // ...menus,
        // ...coupons,
    },
    // security: [{ bearerAuth: [] }], this applies
};
