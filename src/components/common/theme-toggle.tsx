"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label="Basculer le thème"
          className="rounded-full text-heading hover:text-primary transition-colors"
        >
          {theme === "dark" ? (
            <Moon className="size-4" />
          ) : theme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Laptop className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "dark"
          ? "Mode sombre (cliquer pour auto)"
          : theme === "light"
            ? "Mode clair (cliquer pour sombre)"
            : "Thème système (cliquer pour clair)"}
      </TooltipContent>
    </Tooltip>
  );
}

