import { combineReducers } from 'redux';
import routes from './routes';
import scroll from './scroll';
import language from './lang';
import display from './display';
import player from './player';
import auth from './auth';
import cart from './cart';
import download from './download';
import internet from './internet';
import role from './role';
import ad from './ad';

export default combineReducers({
    routes,
    scroll,
    language,
    display,
    player,
    auth,
    cart,
    download,
    internet,
    role,
    ad
});
