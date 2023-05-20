const types = {
    SWITCH_LANGUAGE: "SWITCH_LANGUAGE",
    SWITCH_RTL: "SWITCH_RTL",
};

export const switchLanguage = (code) => {
    return {
        type: types.SWITCH_LANGUAGE,
        code
    }
};

const initialState = {
    code: 'en',
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.SWITCH_LANGUAGE:
            return {
                ...state,
                code: action.code
            };
        default:
            return state;
    }
};
