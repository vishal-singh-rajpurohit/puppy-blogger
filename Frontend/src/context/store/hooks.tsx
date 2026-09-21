"use client"
import { useDispatch, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// store के टाइप को इन्फर (Infer) करना
export type AppStore = ReturnType<typeof configureStore>;
// स्टोर से RootState और AppDispatch के टाइप्स निकालना
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// सामान्य hooks की जगह इन Custom Typed Hooks का इस्तेमाल करें
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();