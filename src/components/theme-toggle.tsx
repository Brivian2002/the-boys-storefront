"use client";

import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, palette, setPalette } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="h-9 w-9"
      >
        <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Choose palette">
            <Palette className="h-[1.1rem] w-[1.1rem]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Store palette
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPalette("commerce")} className="cursor-pointer">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[oklch(0.66_0.21_45)]" />
                <span>Bright Commerce</span>
              </div>
              {palette === "commerce" && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPalette("luxury")} className="cursor-pointer">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[oklch(0.16_0.005_240)] ring-1 ring-[oklch(0.72_0.15_80)]" />
                <span>Light Luxury</span>
              </div>
              {palette === "luxury" && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
