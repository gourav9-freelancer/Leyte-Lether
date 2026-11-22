"use client";

import { Icon } from "./Icon";
import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  /** Used in accessible names, e.g. "Decrease quantity of Classic Leather Bifold Wallet". */
  itemName?: string;
  busy?: boolean;
  disabled?: boolean;
}

export function QuantityStepper({ value, min = 1, max = 10, onChange, itemName, busy, disabled }: QuantityStepperProps) {
  const suffix = itemName ? ` of ${itemName}` : "";
  return (
    <div className={[styles.stepper, busy ? styles.busy : ""].join(" ")} role="group" aria-label={`Quantity${suffix}`}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(value - 1)}
        disabled={disabled || busy || value <= min}
        aria-label={`Decrease quantity${suffix}`}
      >
        <Icon name="remove" size={20} />
      </button>
      <output className={styles.value} aria-live="polite" aria-label={`Quantity${suffix}`}>
        {value}
      </output>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(value + 1)}
        disabled={disabled || busy || value >= max}
        aria-label={`Increase quantity${suffix}`}
      >
        <Icon name="add" size={20} />
      </button>
    </div>
  );
}
