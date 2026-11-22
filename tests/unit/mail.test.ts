import { afterEach, describe, expect, it, vi } from "vitest";
import { sendMail } from "@/server/mail";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("mail provider boundary", () => {
  it("posts to Resend with bearer auth and strips header injection", async () => {
    vi.stubEnv("MAIL_PROVIDER", "resend");
    vi.stubEnv("MAIL_API_KEY", "re_test");
    vi.stubEnv("MAIL_FROM", "Leyte Leather <orders@example.com>");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await sendMail({ to: "a@b.co\r\nBcc: evil@x.y", subject: "Hi\nthere", text: "Body" });
    expect(res).toEqual({ delivered: true, via: "resend" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["a@b.co Bcc: evil@x.y"]);
    expect(body.subject).toBe("Hi there");
  });

  it("posts to Postmark with the server token header", async () => {
    vi.stubEnv("MAIL_PROVIDER", "postmark");
    vi.stubEnv("MAIL_API_KEY", "pm_test");
    vi.stubEnv("MAIL_FROM", "orders@example.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendMail({ to: "a@b.co", subject: "S", text: "T" })).toEqual({ delivered: true, via: "postmark" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.postmarkapp.com/email");
    expect(init.headers["X-Postmark-Server-Token"]).toBe("pm_test");
    expect(JSON.parse(init.body)).toMatchObject({ From: "orders@example.com", To: "a@b.co", TextBody: "T" });
  });

  it("reports provider rejection and network failure as not delivered", async () => {
    vi.stubEnv("MAIL_PROVIDER", "resend");
    vi.stubEnv("MAIL_API_KEY", "re_test");
    vi.stubEnv("MAIL_FROM", "x@example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 422 })));
    expect(await sendMail({ to: "a@b.co", subject: "S", text: "T" })).toEqual({ delivered: false, reason: "provider_http_422" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await sendMail({ to: "a@b.co", subject: "S", text: "T" })).toEqual({ delivered: false, reason: "provider_unreachable" });
  });

  it("never pretends to send in production without a provider", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MAIL_PROVIDER", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sendMail({ to: "a@b.co", subject: "S", text: "T" })).toEqual({ delivered: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
