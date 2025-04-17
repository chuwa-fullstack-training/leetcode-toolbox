import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">HR Token Management</h1>
      
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading token management...</p>
        </div>
      </div>
    </div>
  );
}