/**
 * Created by Jayd
 * @https://codecanyon.net/user/aimejayd
 */

const THEME = require('./Theme');

module.exports = {
    //default language at first
    languages: ['en', 'kin'],
    APP_NAME: 'FameMix',
    API_URL: 'https://famemix.com/api',
    DEEP_LINK_SCHEME: 'famemix',
    OWNER_EMAIL: 'aimejayd2016@gmail.com',
    VERSION: '1.0.3',
    ENABLE_STORE: true,
    ADMOB_BANNER_UNIT_ID: false,
    SIGN_IN_WITH_FACEBOOK: false,
    SIGN_IN_WITH_TWITTER: false,
    SIGN_IN_WITH_APPLE: true,
    SIGN_IN_WITH_GOOGLE: true,
    DEFAULT_DARK_MODE: true,
    ENABLE_PODCAST: true,
    ENABLE_RADIO: true,
    SHOW_TAB_MENU_NAME: true,
    themes: THEME // DO NOT  CHANGE THIS
};
