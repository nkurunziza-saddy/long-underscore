import { PageBody } from "@/components/layout/page";
import { BrowserSection } from "./browser";
import { HomeScreenSection } from "./home-screen";
import { LinkPreviewSection } from "./link-preview";
import { MarkSection } from "./mark";

const linkClass =
  "underline decoration-fg-3/50 underline-offset-4 transition-colors hover:text-foreground";

/**
 * The page: the mark in every place it will actually live, from the nearest
 * view of it to the furthest. Nothing here is pressed; what changes it is in
 * the controls beside it.
 */
export function Preview() {
  return (
    <PageBody>
      <MarkSection />
      <BrowserSection />
      <div className="grid gap-x-3 gap-y-8 @xl:grid-cols-3">
        <HomeScreenSection />
        <LinkPreviewSection className="@xl:col-span-2" />
      </div>
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-1 text-xs text-fg-3">
        <p>
          Drawn entirely in your browser. Nothing is uploaded, and your work is
          kept in this browser between visits.
        </p>
        <p>
          Icons by{" "}
          <a
            href="https://phosphoricons.com"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Phosphor
          </a>
          , type by{" "}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Google Fonts
          </a>
          .
        </p>
      </footer>
    </PageBody>
  );
}
