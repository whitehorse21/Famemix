const types = {
    TOGGLE_AUTH: "TOGGLE_AUTH",
    UPDATE_USER_INFO: "UPDATE_USER_INFO",
    PROFILE_CHANGES: "PROFILE_CHANGES"
};
const initialState = {
    isLogged: false,
    user: {},
    isProfileChanges: 0
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.TOGGLE_AUTH:
            return {
                ...state,
                isLogged: ! state.isLogged,
                user: action.user
            };
        case types.UPDATE_USER_INFO:
            return {
                ...state,
                user: action.user
            };
        case types.PROFILE_CHANGES:
            return {
                ...state,
                isProfileChanges: state.isProfileChanges + 1
            };
        default:
            return state;
    }
};
