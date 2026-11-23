// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent, registerTools } from "@ui-sdk/react/agent";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "@/components/ui/switch";

let approveConfirmedStep = false;
const agent = createAgent({
  allow: (step) => !step.confirm || approveConfirmedStep,
});

function ControlledSwitchExample({
  onChangeSpy,
}: {
  onChangeSpy: (checked: boolean, source: string) => void;
}) {
  const [openNow, setOpenNow] = useState(false);

  return (
    <div>
      <label>
        Open now only
        <Switch
          checked={openNow}
          onCheckedChange={(checked, details) => {
            setOpenNow(checked);
            onChangeSpy(checked, details.source);
          }}
        />
      </label>
      <label>
        Pause all orders
        <Switch
          defaultChecked={false}
          data-agent-confirm="Pauses incoming customer orders for this house"
        />
      </label>
    </div>
  );
}

describe("Switch (@ui-sdk/react/switch)", () => {
  it("toggles on click and Space, ignores Enter, and exposes data-checked/data-unchecked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch
        aria-label="Limiter les commandes par jour"
        onCheckedChange={onCheckedChange}
      />
    );

    const toggle = screen.getByRole("switch", {
      name: "Limiter les commandes par jour",
    });

    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(toggle.hasAttribute("data-unchecked")).toBe(true);
    expect(toggle.hasAttribute("data-checked")).toBe(false);
    expect(toggle.hasAttribute("aria-disabled")).toBe(false);

    await user.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(toggle.hasAttribute("data-checked")).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle.getAttribute("aria-checked")).toBe("true");

    await user.keyboard(" ");
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("blocks interaction when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch
        aria-label="Covered neighborhood"
        disabled
        onCheckedChange={onCheckedChange}
      />
    );

    const toggle = screen.getByRole("switch", {
      name: "Covered neighborhood",
    });

    expect(toggle.hasAttribute("data-disabled")).toBe(true);
    await user.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("exposes named switches to createAgent, respects data-agent-confirm, and registers WebMCP tools", async () => {
    const onChangeSpy = vi.fn();
    render(<ControlledSwitchExample onChangeSpy={onChangeSpy} />);

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");

    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }

    const labels = components.map((entry) => entry.label);
    expect(labels).toContain("Open now only");
    expect(labels).toContain("Pause all orders");

    const toggleResult = await agent.act({
      steps: [{ ref: "Open now only", action: "setChecked", args: [true] }],
    });
    expect(toggleResult.ok, toggleResult.error?.message).toBe(true);
    expect(onChangeSpy).toHaveBeenCalledWith(true, "agent");
    expect(
      screen
        .getByRole("switch", { name: "Open now only" })
        .getAttribute("aria-checked")
    ).toBe("true");

    approveConfirmedStep = false;
    const blocked = await agent.act({
      steps: [{ ref: "Pause all orders", action: "setChecked", args: [true] }],
    });
    expect(blocked.ok).toBe(false);

    approveConfirmedStep = true;
    const approved = await agent.act({
      steps: [{ ref: "Pause all orders", action: "setChecked", args: [true] }],
    });
    expect(approved.ok, approved.error?.message).toBe(true);

    const tools = new Map<string, { execute: (input: object) => unknown }>();
    Object.assign(document, {
      modelContext: {
        registerTool: async (tool: {
          name: string;
          execute: (input: object) => unknown;
        }) => {
          tools.set(tool.name, tool);
        },
      },
    });

    const unregister = registerTools(agent, { allow: () => true });
    try {
      expect(tools.has("snapshot")).toBe(true);
      expect(tools.has("query")).toBe(true);
      expect(tools.has("act")).toBe(true);
      expect(await tools.get("snapshot")!.execute({})).toBeInstanceOf(Array);
    } finally {
      unregister();
    }
  });
});
