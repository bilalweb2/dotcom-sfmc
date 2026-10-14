import type { Metadata } from "next";
import { connection } from "next/server";
import { RootLayout } from "@/layouts/RootLayout/RootLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SFMC", template: "%s | SFMC" },
  description: "Salesforce Marketing Cloud",
};

/**
 * Build @font-face declarations with the correct public path prefix.
 * NEXT_PUBLIC_APP_URL equals the basePath (e.g. "/ftr-forms") so that the
 * absolute font URLs match where Next.js actually serves public/ files.
 * CSS @font-face `url()` values are not rewritten by Next.js basePath,
 * so we must inject them dynamically from a Server Component.
 */
function buildFontFaceStyles(basePath: string): string {
  return `
    @font-face {
      font-family: "ObjectSans-Regular";
      src: url("${basePath}/fonts/ObjectSans-Regular.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-regular.woff") format("woff");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "ObjectSans-Medium";
      src: url("${basePath}/fonts/object-sans-medium.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-medium.woff") format("woff");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "ObjectSans-Bold";
      src: url("${basePath}/fonts/ObjectSans-Bold.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-bold.woff") format("woff");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "BandwidthDisplay-Regular";
      src: url("${basePath}/fonts/ObjectSans-Bandwidth.woff2") format("woff2"),
           url("${basePath}/fonts/bandwidth-display.woff") format("woff");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "Object Sans";
      src: url("${basePath}/fonts/ObjectSans-Regular.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-regular.woff") format("woff");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "Object Sans";
      src: url("${basePath}/fonts/object-sans-medium.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-medium.woff") format("woff");
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "Object Sans";
      src: url("${basePath}/fonts/ObjectSans-Bold.woff2") format("woff2"),
           url("${basePath}/fonts/object-sans-bold.woff") format("woff");
      font-weight: 600 900;
      font-style: normal;
      font-display: swap;
    }
  `;
}

export default async function Layout({ children }: LayoutProps<"/">) {
  // Required so CSP nonces from proxy.ts are applied during render (not at build time).
  await connection();

  // NEXT_PUBLIC_APP_URL equals the basePath (e.g. "/ftr-forms").
  // Used to build correct absolute font URLs since CSS @font-face paths are
  // not automatically rewritten by Next.js basePath handling.
  const basePath = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <html lang="en">
      {/* Inject @font-face with basePath-prefixed URLs so fonts resolve correctly */}
      <head>
        <style
          // Content is static env-var output, not user input — dangerouslySetInnerHTML is safe here.
          // style-src 'unsafe-inline' is already set in CSP (see contentSecurityPolicy.ts).
          dangerouslySetInnerHTML={{ __html: buildFontFaceStyles(basePath) }}
        />
      </head>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
