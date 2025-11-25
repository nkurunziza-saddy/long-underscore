import { Copy, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface FaviconHeaderProps {
  onShare: () => void;
  copied: boolean;
  children?: ReactNode;
}

export function FaviconHeader({
  onShare,
  copied,
  children,
}: FaviconHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium hidden sm:block">ICo</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="gap-1.5"
          >
            {copied ? (
              <Copy className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Share"}
            </span>
          </Button>
          {children}
        </div>
      </div>
    </header>
  );
}
