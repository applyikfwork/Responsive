'use client';

import * as React from 'react';
import type {Frame} from '@/app/page';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Loader2, AlertTriangle, Trash2, RefreshCw} from 'lucide-react';

interface PreviewFrameProps extends Frame {
  url: string;
  onRemove: (id: number) => void;
  isRemovable: boolean;
}

export function PreviewFrame({id, name, width, height, icon: Icon, isRemovable, url, onRemove}: PreviewFrameProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [iframeKey, setIframeKey] = React.useState(Date.now());
  const [isRotated, setIsRotated] = React.useState(false);

  const effectiveWidth = isRotated ? height : width;
  const effectiveHeight = isRotated ? width : height;
  
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(effectiveWidth);

  React.useEffect(() => {
    const updateWidth = () => {
      const parentWidth = iframeRef.current?.parentElement?.parentElement?.clientWidth ?? window.innerWidth;
      setContainerWidth(Math.min(effectiveWidth, parentWidth - 40));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [effectiveWidth]);

  React.useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
      setIframeKey(Date.now()); // Reset iframe to force re-render
    }
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    // This error handler is tricky because browsers often don't fire the `error` event
    // for cross-origin iframe security issues. Instead, they just block the load.
    // The onLoad event might also not fire. The most reliable check is often
    // trying to access the iframe's contentDocument, which will throw a security error.
    setTimeout(() => {
      try {
        // If we can access this, the page loaded same-origin or without protection.
        if (iframeRef.current && iframeRef.current.contentDocument?.body.innerHTML === '') {
            // about:blank can load but is empty
            throw new Error();
        }
        // If we reached here without an error, it might be a false negative, but we'll assume it's loaded.
        handleLoad();
      } catch (err) {
        setIsLoading(false);
        const siteHost = url ? new URL(url).hostname : 'the website';
        setError(
          `The website at ${siteHost} has security settings that prevent it from being displayed inside other websites.\n\nThis is a common security feature (called X-Frame-Options or Content-Security-Policy) and not an error with this tool.`
        );
      }
    }, 200);
  };

  const handleRefresh = () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setIframeKey(Date.now());
  };

  return (
    <div className="flex flex-col gap-4 items-center animate-in fade-in-50 duration-500">
      <Card
        className="flex flex-col overflow-hidden shadow-xl border-border/80"
        style={{width: containerWidth, minWidth: '320px'}}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">{name}</CardTitle>
              <CardDescription className="text-xs">
                {effectiveWidth}px &times; {effectiveHeight}px
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setIsRotated(prev => !prev)}
              >
                <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${isRotated ? 'rotate-90' : ''}`} />
                <span className="sr-only">Rotate frame</span>
              </Button>
            {isRemovable && (
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
          </div>
        </CardHeader>
        <CardContent className="relative p-0" style={{height: effectiveHeight}}>
          {(isLoading || error || !url) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 p-4">
              {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
              {error && !isLoading && (
                  <Alert variant="destructive" className="text-left max-h-full overflow-y-auto">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-bold">Content Blocked</AlertTitle>
                    <AlertDescription className="text-sm whitespace-pre-wrap">{error}</AlertDescription>
                  </Alert>
              )}
              {!url && !isLoading && !error && (
                <div className="text-center">
                    <p className="text-sm font-semibold text-muted-foreground">Enter a URL to start previewing</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">You can also rotate or remove this frame</p>
                </div>
              )}
            </div>
          )}

          {url && (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              title={`${name} Preview`}
              src={url}
              width="100%"
              height="100%"
              className="border-0 transition-opacity duration-300 bg-white"
              style={{ opacity: isLoading ? 0.3 : 1 }}
              onLoad={handleLoad}
              onError={handleError}
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
