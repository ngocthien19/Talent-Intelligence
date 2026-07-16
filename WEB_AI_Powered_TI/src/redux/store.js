import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'

import authReducer from './slices/auth.slice'
import uiReducer from './slices/ui.slice'
import favoriteReducer from './slices/favorite.slice'

const customStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key))
}

// 1. Cấu hình persist
const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['auth', 'ui', 'favorite']
}

// 2. Gom reducers
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  favorite: favoriteReducer
})

// 3. Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 4. Khởi tạo Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

// 5. Khởi tạo persistor
export const persistor = persistStore(store)