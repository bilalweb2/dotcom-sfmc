import {
  buildContentSecurityPolicy,
  createCspNonce,
} from "@/utils/contentSecurityPolicy";

describe("createCspNonce", () => {
  it("returns a base64-encoded UUID", () => {
    const nonce = createCspNonce();

    expect(Buffer.from(nonce, "base64").toString("utf8")).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
  });
});

describe("buildContentSecurityPolicy", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("includes the nonce and strict policy directives in production", () => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_ENV: "production",
    });

    const policy = buildContentSecurityPolicy("test-nonce");

    expect(policy).toContain(
      "script-src 'self' 'nonce-test-nonce' 'strict-dynamic'",
    );
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("object-src 'none'");
  });

  it("allows unsafe eval in development for Next.js tooling", () => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_ENV: "development",
    });

    expect(buildContentSecurityPolicy("dev-nonce")).toContain(
      "script-src 'self' 'nonce-dev-nonce' 'strict-dynamic' 'unsafe-eval'",
    );
  });
});
