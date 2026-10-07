"use client";

import {
  ArrowCounterClockwiseIcon,
  ArrowUUpLeftIcon,
  CopyIcon,
  DiceFiveIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  LinkIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSegments,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { toastManager } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BRAND } from "@/lib/brand";
import { useStudio } from "@/stores/studio-store";
import { studioActions } from "./actions";
import { useAssets } from "./assets-context";

const MODES = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
] as const;

/** A page action: its button, and on hover what it does and the key for it. */
function Action({
  hint,
  keys,
  render,
  children,
}: {
  hint: string;
  keys?: string;
  render: React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={render}>{children}</TooltipTrigger>
      <TooltipContent>
        {hint}
        {keys && <Kbd>{keys}</Kbd>}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The title row above the page: the studio's name, then its actions. It sits
 * on the chrome and lines up with the insets under it.
 */
export function Header() {
  const { theme, setTheme } = useTheme();
  const canUndo = useStudio((state) => state.past.length > 0);
  const shuffle = useStudio((state) => state.shuffle);
  const undo = useStudio((state) => state.undo);
  const reset = useStudio((state) => state.reset);
  const actions = studioActions(useAssets());

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-app px-2">
      <div className="flex h-11 items-center gap-2.5 px-3">
        <h1 className="shrink-0">
          <Logo />
        </h1>
        <p className="hidden min-w-0 truncate text-sm text-fg-3 md:block">
          {BRAND.tagline}
        </p>
        <div className="flex-1" />

        <TooltipProvider>
          <div
            data-slot="page-actions"
            className="flex shrink-0 items-center gap-1.5"
          >
            <Action
              hint="Restyle the same mark at random"
              keys="S"
              render={<Button variant="secondary" onClick={shuffle} />}
            >
              <DiceFiveIcon />
              Shuffle
            </Action>
            <Action
              hint="Undo"
              keys="Z"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                />
              }
            >
              <ArrowUUpLeftIcon />
            </Action>
            <Action
              hint="Copy a link to this design"
              render={
                <Button variant="ghost" onClick={actions.copyShareLink} />
              }
            >
              <LinkIcon />
              Share
            </Action>
            <Menu>
              <MenuTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="More" />
                }
              >
                <DotsThreeIcon weight="bold" />
              </MenuTrigger>
              <MenuPopup align="end">
                <MenuSegments
                  label="Appearance"
                  value={theme}
                  onValueChange={setTheme}
                  options={MODES}
                />
                <MenuSeparator />
                <MenuItem onClick={actions.copySvg}>
                  <CopyIcon />
                  Copy icon.svg
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    reset();
                    toastManager.add({
                      title: "Back to the default mark",
                      description: "Changed your mind? Undo brings it back.",
                      timeout: 4000,
                    });
                  }}
                >
                  <ArrowCounterClockwiseIcon />
                  Start over
                </MenuItem>
              </MenuPopup>
            </Menu>
            <Action
              hint="Download the kit"
              keys="E"
              render={<Button onClick={actions.downloadKit} />}
            >
              <DownloadSimpleIcon />
              Export
            </Action>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
