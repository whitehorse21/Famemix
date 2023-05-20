import {store, persistor} from '../store/configureStore';

const initialState = {
    scroll: null,
    home: false,
    community: false,
    radio: false,
    music: false,
    settings: false
};

function resetState() {
    //limit the time user can to scroll to top
    setTimeout(() => {
        store.dispatch({type: 'RESET_SCROLL'});
    }, 2000)
}
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case 'SCROLL_HOME':
            resetState();
            return {
                ...state,
                home: ! state.home
            };
        case 'SCROLL_EXPLORE':
            resetState();
            return {
                ...state,
                explore: ! state.explore
            };
        case 'SCROLL_PODCAST':
            resetState();
            return {
                ...state,
                podcast: ! state.podcast
            };
        case 'SCROLL_RADIO':
            resetState();
            return {
                ...state,
                radio: ! state.radio
            };
        case 'SCROLL_PROFILE':
            resetState();
            return {
                ...state,
                music: ! state.music
            };
        case 'SCROLL_COMMUNITY':
            resetState();
            return {
                ...state,
                community: ! state.community
            };
        case 'SCROLL_SETTINGS':
            resetState();
            return {
                ...state,
                settings: ! state.settings
            };
        case 'RESET_SCROLL':
            state.scroll = null;
            return initialState;
        default:
            break;
    }
    return state;
};
