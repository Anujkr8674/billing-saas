import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-foreground" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure global platform settings.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
         <Settings className="w-16 h-16 text-muted-foreground/30 mb-4" />
         <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon</h2>
         <p className="text-muted-foreground max-w-md">Admin settings and platform configuration are currently under development.</p>
      </div>
    </div>
  );
}
