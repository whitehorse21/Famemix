const types = {
    INCREASE_FREQUENCY: "INCREASE_FREQUENCY",
    SHOW_MEDIA_AD: "SHOW_MEDIA_AD",
    HIDE_MEDIA_AD: "HIDE_MEDIA_AD",
};

const initialState = {
    showing: false,
    frequency: 0,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.SHOW_MEDIA_AD:
            return {
                ...state,
                showing: true,
            };
        case types.HIDE_MEDIA_AD:
            return {
                ...state,
                showing: false,
            };
        case types.INCREASE_FREQUENCY:
            return {
                ...state,
                frequency: state.frequency + 1,
            };
        default:
            return state;
    }
};
