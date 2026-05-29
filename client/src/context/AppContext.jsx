import { useCallback, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { AppContext } from "./appContext";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [wishlist, setWishlist] = useState([])

    const [cars, setCars] = useState([])

    // Function to check if user is logged in
    const fetchUser = useCallback(async ()=>{
        try {
           const {data} = await axios.get('/api/user/data')
           if (data.success) {
            setUser(data.user)
            setIsOwner(data.user.role === 'owner')
           }else{
            navigate('/')
           }
        } catch (error) {
            toast.error(error.message)
        }
    }, [navigate])
    // Function to fetch all cars from the server

    const fetchCars = useCallback(async () =>{
        try {
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }, [])

    // Function to log out the user
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }

    const toggleWishlist = (carId) => {
        setWishlist((prev) => {
            const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
            localStorage.setItem('wishlist', JSON.stringify(next))
            return next
        })
    }


    // useEffect to retrieve the token from localStorage
    useEffect(()=>{
        const token = localStorage.getItem('token')
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        setToken(token)
        setWishlist(savedWishlist)
        fetchCars()
    },[fetchCars])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    },[token, fetchUser])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, 
        pickupDate, setPickupDate, returnDate, setReturnDate, wishlist, toggleWishlist
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

