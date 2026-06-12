import { Moon, Sun } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useTheme } from "../components/theme-provider";

export function ModeToggle({
  small,
  setOpen,
}: {
  small: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      {!small && (
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun
              className={`${
                small ? "text-primary" : ""
              } h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
            />
            <Moon
              className={`${
                small ? "text-primary" : ""
              } absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
      )}
      {small && (
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            <Sun
              className={`${
                small ? "text-primary" : ""
              } h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`}
            />
            <Moon
              className={`${
                small ? "text-primary" : ""
              } absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
      )}

      {!small && (
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
