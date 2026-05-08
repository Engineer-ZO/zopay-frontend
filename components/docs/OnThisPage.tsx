"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Heading {
    id: string;
    text: string;
    level: number;
}

export function OnThisPage() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const pathname = usePathname();

    useEffect(() => {
        // Extract headings from the page
        const extractHeadings = () => {
            const headingElements = document.querySelectorAll("h2");
            const extracted: Heading[] = [];
            const usedIds = new Set<string>();

            headingElements.forEach((heading) => {
                let id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, "-") || "";

                // Ensure ID is unique
                if (usedIds.has(id)) {
                    let counter = 1;
                    while (usedIds.has(`${id}-${counter}`)) {
                        counter++;
                    }
                    id = `${id}-${counter}`;
                }

                usedIds.add(id);
                heading.id = id;

                extracted.push({
                    id,
                    text: heading.textContent || "",
                    level: parseInt(heading.tagName.charAt(1)),
                });
            });

            setHeadings(extracted);
        };

        // Wait for content to load
        setTimeout(extractHeadings, 100);

        // Set up intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-100px 0px -66%",
                threshold: 0,
            }
        );

        const headingElements = document.querySelectorAll("h2");
        headingElements.forEach((heading) => observer.observe(heading));

        return () => {
            observer.disconnect();
        };
    }, [pathname]);

    if (headings.length === 0) return null;

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <aside className="w-64 bg-background overflow-y-auto h-[calc(100vh-4rem)] sticky top-16 hidden xl:block">
            <div className="p-4 mt-8">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <span>On this page</span>
                </h3>
                <nav className="space-y-1">
                    {headings.map((heading) => (
                        <a
                            key={heading.id}
                            href={`#${heading.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToHeading(heading.id);
                            }}
                            className={`block py-1.5 px-3 rounded-lg text-sm transition-colors ${activeId === heading.id
                                ? "bg-muted text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            style={{ paddingLeft: `${(heading.level - 2) * 0.75 + 0.75}rem` }}
                        >
                            {heading.text}
                        </a>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
