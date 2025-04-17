
import * as React from "react";
import { cn } from "@/lib/utils";

export interface UploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const Upload = React.forwardRef<HTMLInputElement, UploadProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <input
        type="file"
        className={cn(
          "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Upload.displayName = "Upload";

export { Upload };
