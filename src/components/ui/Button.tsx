import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "gold" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 border border-white/5",
      outline: "border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-foreground shadow-sm",
      ghost: "hover:bg-white/5 hover:text-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      gold: "bg-gradient-to-r from-accent to-primary text-white hover:opacity-90 shadow-lg shadow-accent/20 font-bold border border-white/10",
      destructive: "bg-red-500/80 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 backdrop-blur-sm",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-md px-8 text-lg",
      icon: "h-10 w-10",
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
