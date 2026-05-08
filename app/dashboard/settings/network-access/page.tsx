import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NetworkAccessView } from "./NetworkAccessView";

export default function NetworkAccessPage() {
    return (
        <Suspense
            fallback={
                <div className="p-6 flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <NetworkAccessView />
        </Suspense>
    );
}
