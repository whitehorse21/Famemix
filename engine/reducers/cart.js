const types = {
    UPDATE_CART: "UPDATE_CART",
};
const initialState = {
    item_count: 0,
    currency: 'USD',
    subtotal: 0,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.UPDATE_CART:
            return {
                ...state,
                item_count: action.cart.items.length,
                currency: action.cart.currency,
                subtotal: action.cart.subtotal
            };
        default:
            return state;
    }
};
