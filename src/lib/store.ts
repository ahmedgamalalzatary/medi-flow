import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiSlice } from './features/api/apiSlice'
import authReducer from './features/auth/authSlice'
import appointmentReducer from './features/appointments/appointmentSlice'
import medicalHistoryReducer from './features/medical/medicalHistorySlice'
import themeReducer from './features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    medicalHistory: medicalHistoryReducer,
    theme: themeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch