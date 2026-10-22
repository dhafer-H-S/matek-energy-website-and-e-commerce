import type { Metadata } from "next";
import { fontClassFor } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Matek Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(fontClassFor("en"), "h-full")}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background-alt text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
