import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const BASE_URL = "https://valiant-important-capri.glitch.me"
export const useAuthstore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigninigUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],
    signup: async (data) => {
        try {
            set({ isSigninigUp: true })
            const res = await axiosInstance.post('/auth/signup', data)
            set({ isSigninigUp: false })
            set({ authUser: res.data })
            localStorage.setItem("token", res.data?.token)
            get().connectSocket()
            toast.success("User created successfully")
        } catch (error) {
            console.log("Error in signup", error)
            toast.error(error?.message)
            set({ isSigninigUp: false })
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true })
        try {
            const res = await axiosInstance.post('auth/login', data)
            set({ authUser: res.data })
            localStorage.setItem("token", res.data?.token)
            get().connectSocket()
            set({ isLoggingIn: false })
            toast.success("User logged in successfully")
        } catch (error) {
            console.log("Error in login", error)
            set({ isLoggingIn: false })
            toast.error(error.message)
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true })
        try {
            const token = localStorage.getItem("token")
            console.log("Token in authcheck------>" , token)
            const res = await axiosInstance.get('/auth/check', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            set({ authUser: res.data })
            set({ isCheckingAuth: false })
            get().connectSocket()
        } catch (error) {
            console.log("Error in checking auth", error)
            set({ authUser: null })
            set({ isCheckingAuth: false })
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout')
            set({ authUser: null })
            get().disConnectSocket()
            toast.success("User logged out sucessfully")
        } catch (error) {
            console.log("Error in logout", error)
            toast.error(error?.message)
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const token = localStorage.getItem("token")
            const res = await axiosInstance.put('/auth/update-profile', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            set({ authUser: res.data })
            toast.success("Profile updated successfully.")
        } catch (error) {
            console.log("Error in updating profile", error)
            toast.error(error?.message)
            set({ isUpdatingProfile: false })
        }
    },
    connectSocket: async () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        })
        socket.connect()
        set({ socket: socket })
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },
    disConnectSocket: async () => {
        if (get().socket?.connected) get().socket?.disconnect()
    }
}))

