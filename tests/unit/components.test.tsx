import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

describe("Button", () => {
  it("shows loading text, is busy and blocks clicks", () => {
    const onClick = vi.fn();
    render(<Button loading loadingText="Adding…" onClick={onClick}>Add to cart</Button>);
    const b = screen.getByRole("button");
    expect(b).toHaveTextContent("Adding…");
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("aria-busy", "true");
  });
});

describe("TextField", () => {
  it("associates label and error accessibly", () => {
    render(<TextField label="Email address" required error="Enter your email address." />);
    const input = screen.getByLabelText(/Email address/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your email address.");
  });
  it("toggles password visibility", () => {
    render(<TextField label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
  });
});

describe("QuantityStepper", () => {
  it("respects min and max", () => {
    const onChange = vi.fn();
    const { rerender } = render(<QuantityStepper value={1} onChange={onChange} itemName="Wallet" />);
    expect(screen.getByRole("button", { name: "Decrease quantity of Wallet" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity of Wallet" }));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<QuantityStepper value={10} onChange={onChange} itemName="Wallet" />);
    expect(screen.getByRole("button", { name: "Increase quantity of Wallet" })).toBeDisabled();
  });
});
