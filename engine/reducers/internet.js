const types = {
    NET_ONLINE: "NET_ONLINE",
    NET_OFFLINE: "NET_OFFLINE",
};

const initialState = {
    online: true,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.NET_ONLINE:
            return {
                ...state,
                online: true,
            };
        case types.NET_OFFLINE:
            return {
                ...state,
                online: false,
            };
        default:
            return state;
    }
};
