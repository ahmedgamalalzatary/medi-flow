import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ThemeState {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  sidebarCollapsed: boolean
  fontSize: 'small' | 'medium' | 'large'
  notifications: boolean
}

const initialState: ThemeState = {
  mode: 'system',
  primaryColor: 'blue',
  sidebarCollapsed: false,
  fontSize: 'medium',
  notifications: true,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.mode = action.payload
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload
    },
  },
})

export const {
  setThemeMode,
  setPrimaryColor,
  toggleSidebar,
  setSidebarCollapsed,
  setFontSize,
  toggleNotifications,
  setNotifications,
} = themeSlice.actions

export default themeSlice.reducer