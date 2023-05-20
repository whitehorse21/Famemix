const GLOBAL = require('../config/Global');

const types = {
    TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
};
const initialState = {
    darkMode: GLOBAL.DEFAULT_DARK_MODE,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.TOGGLE_DARK_MODE:
            return {
                ...state,
                darkMode: ! state.darkMode
            };
        default:
            return state;
    }
};
