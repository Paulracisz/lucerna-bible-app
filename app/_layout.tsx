// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { ReaderProvider } from "./ReaderContext";

export default function Layout() {
  return (
    <ReaderProvider>
      <Stack     
      screenOptions={{
      headerShown: false,}} />
    </ReaderProvider>
  );
}