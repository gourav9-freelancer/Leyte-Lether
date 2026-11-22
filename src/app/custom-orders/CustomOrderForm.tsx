"use client";

import { useHydrated } from "@/lib/client/useHydrated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import {
  CUSTOM_ORDER_ALLOWED_TYPES,
  CUSTOM_ORDER_MAX_FILE_BYTES,
  CUSTOM_ORDER_MAX_FILES,
  customOrderSchema,
} from "@/lib/validation";
import styles from "./custom.module.css";

type Values = z.input<typeof customOrderSchema>;
type Picked = { id: string; file: File; url: string };
type Phase = { kind: "idle" } | { kind: "uploading"; pct: number } | { kind: "error"; message: string } | { kind: "done"; reference: string };

const GROUPS = [
  { id: "group-contact", label: "Contact details", fields: ["name", "email"] as const },
  { id: "group-item", label: "Item specifications", fields: ["itemType", "measurements"] as const },
  { id: "group-budget", label: "Budget & deadline", fields: [] as const },
  { id: "group-images", label: "Reference images", fields: [] as const },
];

function prettySize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function CustomOrderForm({ defaults }: { defaults: Partial<Values> }) {
  const [files, setFiles] = useState<Picked[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();
  const { register, handleSubmit, watch, setError, formState } = useForm<Values>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: { name: "", email: "", itemType: "", measurements: "", notes: "", budget: "", deadline: "", ...defaults },
    mode: "onTouched",
  });
  const values = watch();

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), [files]);

  function addFiles(list: FileList | File[]) {
    setFileError(null);
    const incoming = Array.from(list);
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= CUSTOM_ORDER_MAX_FILES) {
        setFileError(`You can upload up to ${CUSTOM_ORDER_MAX_FILES} reference images.`);
        break;
      }
      if (!(CUSTOM_ORDER_ALLOWED_TYPES as readonly string[]).includes(f.type)) {
        setFileError(`“${f.name}” isn't a JPEG, PNG or WebP image.`);
        continue;
      }
      if (f.size > CUSTOM_ORDER_MAX_FILE_BYTES) {
        setFileError(`“${f.name}” is larger than 8 MB.`);
        continue;
      }
      next.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random()}`, file: f, url: URL.createObjectURL(f) });
    }
    setFiles(next);
  }

  function removeFile(id: string) {
    setFiles((fs) => {
      const gone = fs.find((f) => f.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return fs.filter((f) => f.id !== id);
    });
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const onSubmit = handleSubmit(
    (v) =>
      new Promise<void>((resolve) => {
        const data = new FormData();
        for (const [k, val] of Object.entries(v)) data.append(k, String(val ?? ""));
        for (const f of files) data.append("images", f.file, f.file.name);
        // XHR (not fetch) so real upload progress can be shown.
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/custom-orders");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setPhase({ kind: "uploading", pct: Math.round((e.loaded / e.total) * 100) });
        };
        xhr.onload = () => {
          let body: { reference?: string; error?: { message: string; fields?: Record<string, string> } } = {};
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            /* ignore */
          }
          if (xhr.status === 201 && body.reference) {
            setPhase({ kind: "done", reference: body.reference });
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            if (body.error?.fields) {
              for (const [k, m] of Object.entries(body.error.fields)) {
                if (k === "images") setFileError(m);
                else setError(k as keyof Values, { message: m });
              }
            }
            setPhase({ kind: "error", message: body.error?.message ?? "Your request wasn't completed. Review the information and try again." });
          }
          resolve();
        };
        xhr.onerror = () => {
          setPhase({ kind: "error", message: "We couldn't reach Leyte Leather. Check your connection and try again — your details are still here." });
          resolve();
        };
        setPhase({ kind: "uploading", pct: 0 });
        xhr.send(data);
      }),
  );

  if (phase.kind === "done") {
    return (
      <div className={styles.form} style={{ maxWidth: 760, margin: "0 auto" }}>
        <Alert tone="success" title="Your request has been received.">
          Reference <strong>{phase.reference}</strong>. Keep this for your records.
        </Alert>
        <div className={styles.group}>
          <div className={styles.next}>
            <h2 className="t-h4" style={{ color: "var(--color-neutral-950)" }}>
              What happens next
            </h2>
            <ol>
              <li>Leyte Leather reviews your idea, measurements and reference images.</li>
              <li>You receive a quotation by email.</li>
              <li>Accept the quotation and secure a place in the production queue with a deposit.</li>
            </ol>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button href="/shop">Explore the collection</Button>
            <Button href="/" variant="secondary">
              Return to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const busy = phase.kind === "uploading" || formState.isSubmitting;
  const complete = {
    "group-contact": Boolean(values.name && values.email),
    "group-item": Boolean(values.itemType && values.measurements),
    "group-budget": Boolean(values.budget || values.deadline),
    "group-images": files.length > 0,
  } as Record<string, boolean>;

  return (
    <div className={styles.layout}>
      <nav className={styles.progress} aria-label="Request progress">
        {GROUPS.map((g, i) => (
          <a key={g.id} href={`#${g.id}`} className={`${styles.progressItem} ${complete[g.id] ? styles.progressDone : ""}`}>
            <span className={styles.progressDot} aria-hidden="true">
              {complete[g.id] ? <Icon name="check" size={16} /> : i + 1}
            </span>
            {g.label}
            <span className="visually-hidden">{complete[g.id] ? " (complete)" : ""}</span>
          </a>
        ))}
      </nav>

      <form method="post" className={styles.form} onSubmit={onSubmit} noValidate>
        {phase.kind === "error" && (
          <Alert tone="error" title="We couldn't submit your request." card>
            {phase.message}
          </Alert>
        )}

        <fieldset id="group-contact" className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendTitle}>1 — Contact details</span>
          </legend>
          <div className={styles.two}>
            <TextField label="Name" autoComplete="name" required error={formState.errors.name?.message} {...register("name")} />
            <TextField label="Email address" type="email" icon="mail" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
          </div>
        </fieldset>

        <fieldset id="group-item" className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendTitle}>2 — Item specifications</span>
          </legend>
          <TextField
            label="What would you like made?"
            placeholder="For example: a wallet, a belt, a strap"
            required
            error={formState.errors.itemType?.message}
            {...register("itemType")}
          />
          <TextArea
            label="Measurements and specifications"
            required
            rows={4}
            hint="Include any sizes you know, even if approximate."
            error={formState.errors.measurements?.message}
            {...register("measurements")}
          />
          <TextArea label="Notes" optional rows={4} error={formState.errors.notes?.message} {...register("notes")} />
        </fieldset>

        <fieldset id="group-budget" className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendTitle}>3 — Budget &amp; deadline</span>
            <span className={styles.legendHint}>Optional</span>
          </legend>
          <div className={styles.two}>
            <TextField label="Budget (CAD)" inputMode="decimal" optional placeholder="e.g. 150" error={formState.errors.budget?.message} {...register("budget")} />
            <TextField label="Ideal deadline" type="date" optional error={formState.errors.deadline?.message} {...register("deadline")} />
          </div>
        </fieldset>

        <fieldset id="group-images" className={styles.group} aria-describedby="images-help">
          <legend className={styles.legend}>
            <span className={styles.legendTitle}>4 — Reference images</span>
            <span className={styles.legendHint}>
              {files.length} of {CUSTOM_ORDER_MAX_FILES}
            </span>
          </legend>
          <div
            className={`${styles.drop} ${drag ? styles.dropActive : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <Icon name="upload" size={28} />
            <p id="images-help">Upload up to five reference images. JPEG, PNG or WebP, up to 8 MB each.</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="visually-hidden"
              id="images-input"
              aria-label="Choose reference images"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
              disabled={files.length >= CUSTOM_ORDER_MAX_FILES || busy}
            />
            <Button variant="secondary" compact onClick={() => inputRef.current?.click()} disabled={files.length >= CUSTOM_ORDER_MAX_FILES || busy}>
              Choose images
            </Button>
          </div>
          {fileError && (
            <Alert tone="error" title="Image not added.">
              {fileError}
            </Alert>
          )}
          {files.length > 0 && (
            <ul className={styles.files} aria-label="Selected reference images">
              {files.map((f) => (
                <li key={f.id} className={styles.file}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={f.url} alt={`Preview of ${f.file.name}`} className={styles.filePreview} />
                  <p className={styles.fileMeta}>
                    {f.file.name} · {prettySize(f.file.size)}
                  </p>
                  <button type="button" className={styles.fileRemove} onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`} disabled={busy}>
                    <Icon name="close" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {phase.kind === "uploading" && (
          <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="t-body-s">{phase.pct < 100 ? `Uploading… ${phase.pct}%` : "Processing your request…"}</p>
            <div className={styles.bar} aria-hidden="true">
              <div className={styles.barFill} style={{ width: `${phase.pct}%` }} />
            </div>
          </div>
        )}

        <div className={styles.next}>
          <p>
            After you submit, Leyte Leather will review your request and email a quotation. Once accepted, a deposit secures your place in the
            production queue.
          </p>
        </div>
        <div>
          <Button type="submit" loading={busy} loadingText="Submitting…" disabled={!hydrated}>
            Submit request
          </Button>
        </div>
      </form>
    </div>
  );
}
