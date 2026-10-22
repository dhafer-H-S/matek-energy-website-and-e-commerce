import { Outfit, Inter } from "next/font/google";

/** Headings, buttons and labels. */
export const displayFont = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

/** Reading text. */
export const bodyFont = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-body-face",
  display: "swap",
});

export function fontClassFor(_locale: string): string {
  return `${displayFont.variable} ${bodyFont.variable}`;
}
