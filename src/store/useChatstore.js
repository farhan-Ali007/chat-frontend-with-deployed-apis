import toast from 'react-hot-toast'
import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { useAuthstore } from './useAuthstore'

export const useChatstore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    getUsers: async () => {
        set({ isUsersLoading: true })
        const token = localStorage.getItem("token")
        try {
            const res = await axiosInstance.get('/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            set({ users: res.data })
            set({ isUsersLoading: false })
        } catch (error) {
            console.log("Error in getting all users", error)
            set({ isUsersLoading: false })
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const token = localStorage.getItem("token")
            const res = await axiosInstance.get(`/messages/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            set({ messages: res.data })
            set({ isMessagesLoading: false })
        } catch (error) {
            console.log("Error in getting messages", error)
            toast.error(error.message)
            set({ isMessagesLoading: false })
        }
    },
    sendMessage: async (messageData) => {
        try {
            const token = localStorage.getItem("token")
            const { selectedUser, messages } = get()
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData ,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            set({ messages: [...messages, res.data] })
        } catch (error) {
            console.log("Error in sending messages", error)
            toast.error(error?.response?.data?.message)
        }
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthstore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthstore.getState().socket;
        socket.off("newMessage")
    },
    setSelectedUser: (selectedUser) => set({ selectedUser })
}))