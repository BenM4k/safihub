"use client";

import {
  agentTools,
  createAgent,
  registerTools,
} from "@ui-sdk/react/agent";

type UiAgent = ReturnType<typeof createAgent>;

let agentInstance: UiAgent | null = null;

function confirmAgentStep(message: string): boolean {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    return false;
  }
  return window.confirm(message);
}

export function getUiAgent(): UiAgent {
  if (!agentInstance) {
    agentInstance = createAgent({
      allow: (step) => (step.confirm ? confirmAgentStep(step.confirm) : true),
    });
  }
  return agentInstance;
}

export function registerWebMcpTools(): () => void {
  const agent = getUiAgent();
  // Confirmation is already handled by agent's own allow callback.
  return registerTools(agent, {
    allow: () => true,
  });
}

export { agentTools };
