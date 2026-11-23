"use client";

import { useEffect } from "react";
import { registerWebMcpTools } from "@/lib/ui-agent";

export function UiAgentBridge() {
  useEffect(() => {
    return registerWebMcpTools();
  }, []);

  return null;
}
