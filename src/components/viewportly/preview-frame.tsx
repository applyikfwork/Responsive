'use client';

import * as React from 'react';
import type {Frame} from '@/app/page';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Loader2, AlertTriangle, Trash2} from 'lucide-react';

interface PreviewFrameProps extends Frame {
  url: string;
  onRemove: (id: number) => void;
}

export function PreviewFrame({id, name, width, height, icon: Icon, isCustom, url, onRemove}: PreviewFrameProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [effectiveWidth, setEffectiveWidth] = React.useState(width);
  const [isClient, setIsClient] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;
    const updateWidth = () => {
      setEffectiveWidth(Math.min(width, window.innerWidth - 40));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, [width, isClient]);

  React.useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
      // Since onLoad might not be reliable with proxied content,
      // we'll just turn off the loader after a short delay.
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [url]);

  const proxiedUrl = url ? `/api/proxy?url=${encodeURIComponent(url)}` : 'about:blank';

  return (
    <div className="flex flex-col gap-4 items-center animate-in fade-in-50 duration-500">
      <Card
        className="flex flex-col overflow-hidden shadow-xl border-border/80"
        style={{width: isClient ? effectiveWidth : width, minWidth: '320px'}}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">{name}</CardTitle>
              <CardDescription className="text-xs">
                {width}px &times; {height}px
              </CardDescription>
            </div>
          </div>
          {isCustom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove frame</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="relative p-0" style={{height}}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm z-10 p-4">
              <Alert variant="destructive" className="text-left max-h-full overflow-y-auto">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">Loading Error</AlertTitle>
                <AlertDescription className="text-xs whitespace-pre-wrap">{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {!url && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <p className="text-sm text-muted-foreground">Enter a URL to preview</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            title={`${name} Preview`}
            src={proxiedUrl}
            width="100%"
            height="100%"
            className="border-0 bg-white transition-opacity duration-300"
            style={{opacity: isLoading || error ? 0.3 : 1}}
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </CardContent>
      </Card>
    </div>
  );
}
