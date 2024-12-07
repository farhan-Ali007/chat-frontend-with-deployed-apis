import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "https://valiant-important-capri.glitch.me/api",
    withCredentials: true
})