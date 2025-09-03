'use client';

import * as React from 'react';
import type { Frame } from '@/app/page';
import { intelligentErrorReporting } from '@/ai/flows/intelligent-error-reporting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

interface PreviewFrameProps extends Frame {
  url: string;
  onRemove: (id: number) => void;
}

export function PreviewFrame({ id, name, width, height, icon: Icon, isCustom, url, onRemove }: PreviewFrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState<{ explanation: string } | null>(null);
  const [effectiveWidth, setEffectiveWidth] = React.useState(width);
  const [isClient, setIsClient] = React.useState(false);

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
      setErrorInfo(null);
    } else {
        setIsLoading(false);
        setErrorInfo(null);
    }
  }, [url]);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !url) {
        setIsLoading(false);
        return;
    }

    // A small delay allows the browser to block the content and update the iframe's state.
    const checkTimeout = setTimeout(async () => {
      let isBlocked = false;
      let errorMessage = 'The website did not load as expected. It might be due to security settings like X-Frame-Options or Content-Security-Policy.';

      try {
        // Accessing the document of a cross-origin iframe throws a security error if it's blocked.
        // This is a reliable way to detect X-Frame-Options.
        if (iframe.contentWindow && iframe.contentWindow.document.readyState) {
           // No error thrown.
        }
      } catch (e: any) {
        isBlocked = true;
        errorMessage = e.message;
      }
      
      // Some websites use CSP (Content Security Policy), which makes the iframe load 'about:blank'.
      if (!isBlocked && iframe.contentWindow?.location.href === 'about:blank' && iframe.src.startsWith('http')) {
        isBlocked = true;
        errorMessage = 'Content Security Policy of the website is preventing it from being displayed here.';
      }

      if (isBlocked) {
        const result = await intelligentErrorReporting({ url, errorMessage });
        setErrorInfo({ explanation: result.explanation });
      } else {
        setErrorInfo(null);
      }
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(checkTimeout);
  };

  return (
    <div className="flex flex-col gap-4 items-center animate-in fade-in-50 duration-500">
      <Card
        className="flex flex-col overflow-hidden shadow-xl border-border/80"
        style={{ width: isClient ? effectiveWidth : width, minWidth: '320px' }}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">{name}</CardTitle>
              <CardDescription className="text-xs">{width}px &times; {height}px</CardDescription>
            </div>
          </div>
          {isCustom && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemove(id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove frame</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="relative p-0" style={{ height }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {errorInfo && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm z-10 p-4">
                <Alert variant="destructive" className="text-left max-h-full overflow-y-auto">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-bold">Content Blocked</AlertTitle>
                    <AlertDescription className="text-xs whitespace-pre-wrap">
                        {errorInfo.explanation}
                    </AlertDescription>
                </Alert>
            </div>
          )}
          {!url && !isLoading && !errorInfo && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <p className="text-sm text-muted-foreground">Enter a URL to preview</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            title={`${name} Preview`}
            src={url || 'about:blank'}
            width="100%"
            height="100%"
            onLoad={handleLoad}
            className="border-0 bg-white transition-opacity duration-300"
            style={{ opacity: isLoading || errorInfo ? 0.3 : 1 }}
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        </CardContent>
      </Card>
    </div>
  );
}
