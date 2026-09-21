"use client"
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./functions/counterSlice";


export const store = () => configureStore({
    reducer: {
        counter: counterReducer
    },
});