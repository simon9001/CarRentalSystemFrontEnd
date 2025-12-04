import { configureStore } from '@reduxjs/toolkit'
import { AuthApi } from '../features/Api/AuthApi'
import authSlice from '../features/Slice/AuthSlice'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { 
    persistReducer, 
    persistStore, 
    FLUSH, 
    REHYDRATE, 
    PAUSE, 
    PERSIST, 
    PURGE, 
    REGISTER 
} from 'redux-persist';

// Import all car rental APIs
import { VehicleApi } from '../features/Api/VehicleApi';
import { BranchApi } from '../features/Api/BranchApi';
import { ReviewApi } from '../features/Api/ReviewApi';
import { BookingApi } from '../features/Api/BookingApi';
import { CustomerApi } from '../features/Api/CustomerApi';
import { PaymentApi } from '../features/Api/PaymentApi';
import { DashboardApi } from '../features/Api/dashboardApi'; // Fixed import path
import { CarModelApi } from '../features/Api/CarModelApi';
import { InsuranceApi } from '../features/Api/InsuranceApi';
import { CouponApi } from '../features/Api/CouponApi';
import { ServiceApi } from '../features/Api/ServiceApi';
import { DamageApi } from '../features/Api/DamageApi';
import { UserProfileApi} from '../features/Api/CustomerUserApi';
import { CustomerDashboardApi } from '../features/Api/CustomerDashboardAPI';
import {staffApi} from '../features/Api/staffApi';
import {MaintenanceApi} from '../features/Api/maintenanceApi';
import { settingsApi } from '../features/Api/settingsApi'



// Add this at the top of your store file
declare const process: {
    env: {
      NODE_ENV: 'development' | 'production' | 'test';
    };
  };
  

// Configure the Redux store
const authPersistConfig = {
    key: 'auth',
    storage,
    version: 1,
    whitelist: ['token', 'refresh_token', 'isAuthenticated', 'user', 'token_expiry'], // persist auth state
};

// Create the persisted reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const store = configureStore({
    reducer: {
        // Auth
        auth: persistedAuthReducer,
        
        // API reducers - Organized by functionality
        [AuthApi.reducerPath]: AuthApi.reducer,
        [settingsApi.reducerPath]: settingsApi.reducer,
        
        // Core Business APIs
        [DashboardApi.reducerPath]: DashboardApi.reducer,
        [BookingApi.reducerPath]: BookingApi.reducer,
        [VehicleApi.reducerPath]: VehicleApi.reducer,
        [CustomerApi.reducerPath]: CustomerApi.reducer,
        [PaymentApi.reducerPath]: PaymentApi.reducer,
        [staffApi.reducerPath]: staffApi.reducer,
        [MaintenanceApi.reducerPath]: MaintenanceApi.reducer,
        
        // Vehicle Management APIs
        [CarModelApi.reducerPath]: CarModelApi.reducer,
        [BranchApi.reducerPath]: BranchApi.reducer,
        
        // Support & Maintenance APIs
        [InsuranceApi.reducerPath]: InsuranceApi.reducer,
        [ServiceApi.reducerPath]: ServiceApi.reducer,
        [DamageApi.reducerPath]: DamageApi.reducer,
        
        // Customer Experience APIs
        [CustomerDashboardApi.reducerPath]: CustomerDashboardApi.reducer,
        [ReviewApi.reducerPath]: ReviewApi.reducer,
        [CouponApi.reducerPath]: CouponApi.reducer,
        
        // User Management APIs
        [UserProfileApi.reducerPath]: UserProfileApi.reducer, // Moved to User Management section
        
        // Add other feature slices here as needed
        // example: bookingSlice: bookingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            // Core Business Middleware
            AuthApi.middleware,
            DashboardApi.middleware,
            BookingApi.middleware,
            VehicleApi.middleware,
            CustomerApi.middleware,
            PaymentApi.middleware,
            staffApi.middleware,
            MaintenanceApi.middleware,
            
            // Vehicle Management Middleware
            CarModelApi.middleware,
            BranchApi.middleware,
            settingsApi.middleware,
            
            // Support & Maintenance Middleware
            InsuranceApi.middleware,
            ServiceApi.middleware,
            DamageApi.middleware,
            
            // Customer Experience Middleware
            CustomerDashboardApi.middleware,
            ReviewApi.middleware,
            CouponApi.middleware,
            
            // User Management Middleware
            UserProfileApi.middleware // Moved to User Management section
        ),
    // Optional: Enable Redux DevTools in development
    devTools: process.env.NODE_ENV !== 'production',
})

// Export the persisted store
export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch