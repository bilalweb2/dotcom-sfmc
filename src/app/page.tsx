import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  title: "Home",
};

/**
 * Home page — Server Component.
 * Data fetching goes here; pass results as props to HomePage.
 */
export default function Home() {
  return <HomePage />;
}
