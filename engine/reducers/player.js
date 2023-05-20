const types = {
    TOGGLE_FULL: "TOGGLE_FULL",
    TOGGLE_SHOW: "TOGGLE_SHOW",
    QUEUE_CHANGE: "QUEUE_CHANGE",
    TOGGLE_LOCK_UP: "TOGGLE_LOCK_UP",
    TOGGLE_LOCK_DOWN: "TOGGLE_LOCK_DOWN",
    RESET_PLAYER: "RESET_PLAYER"
};
export const toggleLockUp = () => {
    return {
        type: types.TOGGLE_LOCK_UP,
    }
};
export const toggleLockDown = () => {
    return {
        type: types.TOGGLE_LOCK_DOWN,
    }
};
const initialState = {
    show: false,
    full: false,
    lock: false,
    queue: 0
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.TOGGLE_SHOW:
            return {
                ...state,
                full: false,
                show: !state.show,
                lock: false
            };
        case types.TOGGLE_FULL:
            return {
                ...state,
                full: !state.full,
                show: true,
                lock: false
            };
        case types.QUEUE_CHANGE:
            console.log(action);
            return {
                ...state,
                full: action.full,
                show: true,
                queue: state.queue + 1,
                lock: false
            };
        case types.TOGGLE_LOCK_UP:
            return {
                ...state,
                full: true,
                queue: state.queue,
                lock: true
            };
        case types.TOGGLE_LOCK_DOWN:
            return {
                ...state,
                full: false,
                queue: state.queue,
                lock: true
            };
        case types.RESET_PLAYER:
            return initialState;
        default:
            return state;
    }
};
