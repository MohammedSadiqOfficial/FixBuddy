import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const isDark = theme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded-full border border-border/50 transition-all hover:bg-secondary">
            <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary h-7 w-12"
            >
                {isDark ? (
                    <Moon className="h-3 w-3 text-foreground" />
                ) : (
                    <Sun className="h-3 w-3 text-foreground" />
                )}
            </Switch>
        </div>
    )
}
