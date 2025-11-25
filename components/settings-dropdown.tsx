"use client";

import { Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@/components/ui/menu";
import { useFaviconStore } from "@/stores/favicon-store";

export function SettingsDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const includePwa = useFaviconStore((state) => state.includePwa);
  const setIncludePwa = useFaviconStore((state) => state.setIncludePwa);

  const resetToDefaults = () => {
    router.push(pathname);
  };

  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" />}>
        <Settings className="rotate-0 scale-100 transition-all" />
        <span className="sr-only">Settings</span>
      </MenuTrigger>
      <MenuPopup align="end" className="w-56">
        <MenuGroup>
          <MenuSub>
            <MenuSubTrigger>Theme</MenuSubTrigger>
            <MenuSubPopup>
              <MenuRadioGroup value={theme} onValueChange={setTheme}>
                <MenuRadioItem value="light">Light</MenuRadioItem>
                <MenuRadioItem value="dark">Dark</MenuRadioItem>
                <MenuRadioItem value="system">System</MenuRadioItem>
              </MenuRadioGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuCheckboxItem
            checked={includePwa}
            onCheckedChange={setIncludePwa}
          >
            Include PWA Assets
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem
            onClick={() => {
              if (confirm("Are you sure you want to reset all settings?")) {
                resetToDefaults();
              }
            }}
          >
            Reset to default
          </MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
