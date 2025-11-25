import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy";
import { ExportButton } from "./export-button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";

export function FaviconHeader() {
  const { copyToClipboard, isCopied, copyButtonRef } = useCopyToClipboard({
    timeout: 2000,
    url: typeof window !== "undefined" ? window.location.href : "",
    title: "Link copied!",
  });

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="hidden text-lg font-medium sm:block">ICo</h1>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  ref={copyButtonRef}
                  onClick={copyToClipboard}
                  disabled={isCopied}
                  aria-label="Copy link"
                  size="sm"
                  variant="outline"
                />
              }
            >
              <span className="hidden sm:inline">Share</span>
            </TooltipTrigger>
            <TooltipPopup>
              <p>Copy link to clipboard</p>
            </TooltipPopup>
          </Tooltip>

          <ExportButton />
        </div>
      </div>
    </header>
  );
}
