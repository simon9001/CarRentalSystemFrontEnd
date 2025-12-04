import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Updated User interface to match your backend database schema
interface User {
    user_id: number;
    username: string;
    email: string;
    phone_number?: string;
    address?: string;
    role: 'Customer' | 'Admin' | 'Manager' | 'Agent';
    is_active: boolean;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    last_login?: string;
    created_at: string;
}

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    refresh_token: string | null;
    user: User | null;
    token_expiry: number | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    refresh_token: null,
    user: null,
    token_expiry: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user credentials - updated to match backend response
        setCredentials: (state, action: PayloadAction<{ 
            user: User; 
            token: string;
            refresh_token?: string;
            expires_in?: number;
        }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refresh_token = action.payload.refresh_token || null;
            state.isAuthenticated = true;
            
            // Calculate token expiry time (15 minutes from now)
            if (action.payload.expires_in) {
                state.token_expiry = Date.now() + (action.payload.expires_in * 1000);
            } else {
                state.token_expiry = Date.now() + (15 * 60 * 1000); // Default 15 minutes
            }
        },
        
        // Clear user credentials
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.refresh_token = null;
            state.isAuthenticated = false;
            state.token_expiry = null;
        },
        
        // Update user profile information
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        
        // Update tokens (for token refresh)
        updateTokens: (state, action: PayloadAction<{
            token: string;
            refresh_token?: string;
            expires_in?: number;
        }>) => {
            state.token = action.payload.token;
            if (action.payload.refresh_token) {
                state.refresh_token = action.payload.refresh_token;
            }
            
            if (action.payload.expires_in) {
                state.token_expiry = Date.now() + (action.payload.expires_in * 1000);
            } else {
                state.token_expiry = Date.now() + (15 * 60 * 1000);
            }
        },
        
        // Set email verification status
        setEmailVerified: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.is_email_verified = action.payload;
            }
        },
        
        // Set phone verification status
        setPhoneVerified: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.is_phone_verified = action.payload;
            }
        },
        
        // Update user activity status
        setUserActiveStatus: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.is_active = action.payload;
            }
        },
        
        // Check if token is expired
        checkTokenExpiry: (state) => {
            if (state.token_expiry && Date.now() > state.token_expiry) {
                state.isAuthenticated = false;
                state.token = null;
                state.refresh_token = null;
                state.token_expiry = null;
            }
        }
    },
})

export const { 
    setCredentials, 
    clearCredentials, 
    updateUser, 
    updateTokens, 
    setEmailVerified, 
    setPhoneVerified, 
    setUserActiveStatus,
    checkTokenExpiry 
} = authSlice.actions

export default authSlice.reducer