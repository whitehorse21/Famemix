import { createStore, applyMiddleware, compose } from 'redux';
import reducers from '../reducers/index';
import {createLogger} from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const loggerMiddleware = createLogger({ predicate: (getState, action) => __DEV__ })

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: autoMergeLevel2,
    blacklist: ['player']
};

function configureStore () {
    const enhancer = compose(
        applyMiddleware(
            loggerMiddleware
        )
    );

    const pReducer = persistReducer(persistConfig, reducers);
    const store = createStore(pReducer, enhancer);

    const persistor = persistStore(store)
    //const store = createStore(reducers, enhancer);
    if (module.hot) {
        module.hot.accept(() => {
            const nextRootReducer = require('../reducers/index').default;
            store.replaceReducer(nextRootReducer)
        })
    }
    return { store, persistor };
}

let engine = configureStore ();

export const store = engine.store;
export const persistor = engine.persistor;
