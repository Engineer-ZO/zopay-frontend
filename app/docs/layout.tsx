import { ReactNode } from "react";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { DocsFooter } from "@/components/docs/DocsFooter";

export default function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <article className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-headings:text-lg prose-headings:font-semibold prose-p:text-sm prose-li:text-sm prose-code:text-xs">
              {children}
              <DocsNavigation />
              <DocsFooter />
            </article>
          </div>
        </main>
        <OnThisPage />
      </div>
    </div>
  );
}
