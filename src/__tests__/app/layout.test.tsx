/**
 * @jest-environment jsdom
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RootDocumentLayout, { metadata } from "@/app/layout";
import { connection } from "next/server";

jest.mock("next/server", () => ({
  connection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/layouts/RootLayout/RootLayout", () => ({
  RootLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="root-layout">{children}</div>
  ),
}));

describe("RootDocumentLayout", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (originalAppUrl === undefined) {
      // delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
    jest.clearAllMocks();
  });

  it("exports the expected document metadata", () => {
    expect(metadata).toEqual({
      title: { default: "SFMC", template: "%s | SFMC" },
      description: "Salesforce Marketing Cloud",
    });
  });

  it("awaits the request connection and renders the document without a base path", async () => {
    // delete process.env.NEXT_PUBLIC_APP_URL;
    const layout = await RootDocumentLayout({
      children: <p>Page content</p>,
      params: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(layout);

    expect(connection).toHaveBeenCalledTimes(1);
    expect(markup).toContain('<html lang="en">');
    expect(markup).toContain("<p>Page content</p>");
    expect(markup).toContain('url("/fonts/ObjectSans-Regular.woff2")');
    expect(markup).toContain('url("/fonts/bandwidth-display.woff")');
  });

  it("prefixes font URLs with the configured app base path", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "/ftr-forms";
    const layout = await RootDocumentLayout({
      children: <p>Form page</p>,
      params: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(layout);

    expect(markup).toContain(
      'url("/ftr-forms/fonts/ObjectSans-Regular.woff2")',
    );
    expect(markup).toContain(
      'url("/ftr-forms/fonts/object-sans-regular.woff")',
    );
    expect(markup).toContain("<p>Form page</p>");
  });
});
