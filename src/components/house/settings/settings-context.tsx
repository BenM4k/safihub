"use client";

import { createContext, useContext } from "react";

interface SettingsDirtyContextType {
  setIsDirty: (isDirty: boolean) => void;
}

export const SettingsDirtyContext = createContext<SettingsDirtyContextType>({
  setIsDirty: () => {},
});

export function useSettingsDirty() {
  return useContext(SettingsDirtyContext);
}

