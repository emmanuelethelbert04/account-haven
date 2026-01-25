import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getBackendConfigSummary, setBackendConfig } from '@/lib/supabase';

const backendSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(1, 'Project URL is required'),
  anonKey: z
    .string()
    .min(20, 'Anon key looks too short')
    .refine((v) => v !== 'placeholder-key', 'Please paste your real anon key'),
});

export default function BackendSetupPage() {
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string } | null)?.from || '/auth/register';
  const summary = useMemo(() => getBackendConfigSummary(), []);

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = backendSchema.safeParse({ url, anonKey });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const saved = setBackendConfig(url, anonKey);
    if (!saved) {
      toast({
        title: 'Unable to save settings',
        description:
          'Your browser blocked local storage in this preview. Try disabling strict privacy/anti-tracking for this site, or open the preview in a different browser, then try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: 'Saved',
      description: 'Reloading the app with your backend settings…',
    });

    // Full reload is required because the client is created at import-time.
    window.location.assign(from);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Backend Setup</CardTitle>
          <CardDescription>
            Your preview isn’t receiving the project URL + anon key automatically. Save them here to enable registration and login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backendUrl">Project URL</Label>
              <Input
                id="backendUrl"
                placeholder="https://xxxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anonKey">Anon key (public)</Label>
              <Input
                id="anonKey"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                disabled={isSaving}
                required
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use the <span className="font-medium">anon</span> key (public), not the service role key.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={isSaving}>
                Save & Reload
              </Button>

              <Button variant="ghost" asChild>
                <Link to={from}>Back</Link>
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-md border border-border p-3 text-sm">
            <div className="font-medium text-foreground">Current status</div>
            <div className="mt-1 text-muted-foreground">
              {summary.configured
                ? `Configured via ${summary.source} (${summary.urlHost || 'unknown host'})`
                : `Not configured (${summary.source})`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
