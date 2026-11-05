import * as React from "react";
import { cn } from "@/lib/utils";

function SelectNativo({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select-nativo"
      className={cn(
        "h-9 w-full rounded-md border bg-card px-2 text-base shadow-xs md:text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

export { SelectNativo };
