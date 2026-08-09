"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
