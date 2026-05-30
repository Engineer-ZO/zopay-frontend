import { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footerws";
import Header from "@/components/header";

export default function ApplyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
