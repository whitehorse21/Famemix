import { ActionConst } from 'react-native-router-flux';

const initialState = {
    scene: {},
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case ActionConst.FOCUS:
            console.log(action)
            return {
                ...state,
                scene: action.scene,
            };
        default:
            return state;
    }
}