// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const agent = createAgent();

function OrderPreferencesPanel({
  onConfirmDelete,
}: {
  onConfirmDelete: () => void;
}) {
  const [commune, setCommune] = useState("uuid-ibanda");
  const [express, setExpress] = useState(false);
  const [currency, setCurrency] = useState("CDF");
  const [note, setNote] = useState("");

  return (
    <div>
      <Label htmlFor="delivery-note">Delivery note</Label>
      <Input
        id="delivery-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <label>
        <Checkbox checked={express} onCheckedChange={setExpress} />
        Express 24h
      </label>

      <RadioGroup
        aria-label="Payment currency"
        value={currency}
        onValueChange={setCurrency}
      >
        <label>
          <RadioGroupItem value="CDF" />
          CDF
        </label>
        <label>
          <RadioGroupItem value="USD" />
          USD
        </label>
      </RadioGroup>

      <Select value={commune} onValueChange={setCommune}>
        <SelectTrigger aria-label="Commune">
          <SelectValue placeholder="Choose commune" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uuid-ibanda">Ibanda</SelectItem>
          <SelectItem value="uuid-kadutu">Kadutu</SelectItem>
          <SelectItem value="uuid-bagira">Bagira</SelectItem>
        </SelectContent>
      </Select>

      <Tabs defaultValue="summary">
        <TabsList aria-label="Order sections">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">Order summary panel</TabsContent>
        <TabsContent value="history">Order history panel</TabsContent>
      </Tabs>

      <Accordion type="single" collapsible aria-label="FAQ">
        <AccordionItem value="pricing">
          <AccordionTrigger>How is pricing calculated?</AccordionTrigger>
          <AccordionContent>Prices are frozen at checkout.</AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View details</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pickup details</DialogTitle>
            <DialogDescription>
              Courier arrives between 08:00 and 10:00.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Cancel order</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>
              Confirm cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

describe("Migrated @ui-sdk/react UI primitives", () => {
  it("handles user interactions across Tabs, Accordion, Checkbox, RadioGroup, Dialog, and AlertDialog", async () => {
    const user = userEvent.setup();
    const onConfirmDelete = vi.fn();

    render(<OrderPreferencesPanel onConfirmDelete={onConfirmDelete} />);

    const selectTrigger = screen.getByRole("combobox", { name: "Commune" });
    expect(selectTrigger.textContent).toContain("Ibanda");
    expect(selectTrigger.textContent).not.toContain("uuid-ibanda");
    await user.click(selectTrigger);
    expect(screen.getByRole("option", { name: "Kadutu" }).textContent).toContain("Kadutu");
    expect(screen.getByRole("option", { name: "Kadutu" }).textContent).not.toContain("uuid-kadutu");
    await user.click(screen.getByRole("option", { name: "Kadutu" }));
    expect(selectTrigger.textContent).toContain("Kadutu");

    const checkbox = screen.getByRole("checkbox", { name: "Express 24h" });
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    await user.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");

    const usdRadio = screen.getByRole("radio", { name: "USD" });
    await user.click(usdRadio);
    expect(usdRadio.getAttribute("aria-checked")).toBe("true");

    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByText("Order history panel")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "How is pricing calculated?" }),
    );
    expect(screen.getByText("Prices are frozen at checkout.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(screen.getByRole("dialog", { name: "Pickup details" })).toBeTruthy();
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Cancel order" }));
    expect(
      screen.getByRole("alertdialog", { name: "Cancel this order?" }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Confirm cancellation" }),
    );
    expect(onConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it("exposes migrated controls to createAgent and executes actions", async () => {
    render(<OrderPreferencesPanel onConfirmDelete={vi.fn()} />);

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    const labels = components.map((entry) => entry.label);

    expect(labels).toContain("Delivery note");
    expect(labels).toContain("Express 24h");
    expect(labels).toContain("Payment currency");
    expect(labels).toContain("Commune");

    const result = await agent.act({
      steps: [
        { ref: "Delivery note", action: "setValue", args: ["Call on arrival"] },
        { ref: "Express 24h", action: "setChecked", args: [true] },
        { ref: "Payment currency", action: "setValue", args: ["USD"] },
      ],
    });

    expect(result.ok, result.error?.message).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>("Delivery note").value).toBe(
      "Call on arrival",
    );
    expect(
      screen
        .getByRole("checkbox", { name: "Express 24h" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "USD" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
