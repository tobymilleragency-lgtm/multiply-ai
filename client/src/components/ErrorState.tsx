import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load the data. Please try again.",
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-blue-500 text-white hover:bg-blue-600",
            "transition-colors"
          )}
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}