"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">Configure global store preferences and admin permissions.</p>
      </div>

      <Card className="border-muted-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Configuration
          </CardTitle>
          <CardDescription>These settings affect the entire storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Settings module is currently under development. Global configuration options will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
