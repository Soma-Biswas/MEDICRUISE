import { cn } from "@/lib/utils"

export interface CtaProps {
  ctaEnabled?: boolean
  label?: string
  href?: string
  variant?: "default" | "outline" | "link"
  className?: string
}

export function Cta({
  cta,
  className,
}: {
  cta: CtaProps
  className?: string
}) {
  if (!cta.ctaEnabled) {
    return null
  }

  const {
    label = "Learn More",
    href = "#",
    variant = "default",
  } = cta

  const baseStyles =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

  const variantStyles = {
    default:
      "bg-foreground text-background hover:opacity-90",
    outline:
      "border border-border bg-background text-foreground hover:bg-muted",
    link:
      "text-foreground underline-offset-4 hover:underline",
  }

  return (
    <a
      href={href}
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
    >
      {label}
    </a>
  )
}

export default Cta