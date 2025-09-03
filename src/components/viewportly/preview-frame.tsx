'use client';

import * as React from 'react';
import type {Frame} from '@/app/page';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Loader2, AlertTriangle, Trash2, RefreshCw, Move} from 'lucide-react';

interface PreviewFrameProps extends Frame {
  url: string;
  onRemove: (id: number) => void;
  isRemovable: boolean;
  isSingleView?: boolean;
}

export function PreviewFrame({id, name, width, height, icon: Icon, isRemovable, url, onRemove, isSingleView = false}: PreviewFrameProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [iframeKey, setIframeKey] = React.useState(Date.now());
  const [isRotated, setIsRotated] = React.useState(false);

  const [size, setSize] = React.useState({ width: isRotated ? height : width, height: isRotated ? width : height });
  const [isResizing, setIsResizing] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const initialWidth = isRotated ? height : width;
  const initialHeight = isRotated ? width : height;

  React.useEffect(() => {
    setSize({ width: initialWidth, height: initialHeight });
  }, [id, initialWidth, initialHeight]);

  const handleResize = React.useCallback((e: MouseEvent) => {
    if (!frameRef.current) return;
    const newWidth = Math.max(320, e.clientX - frameRef.current.getBoundingClientRect().left);
    const newHeight = Math.max(200, e.clientY - frameRef.current.getBoundingClientRect().top);
    setSize({ width: newWidth, height: newHeight });
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleResize]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };
  
  const iframeLoadRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
      setIframeKey(Date.now());
    }
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };
  
  const handleError = () => {
    setTimeout(() => {
      try {
        // Accessing contentDocument will throw a cross-origin error if blocked
        const doc = iframeLoadRef.current?.contentDocument;
        if (doc && doc.readyState === 'complete') {
            handleLoad();
        } else {
            throw new Error("Blocked by security policy");
        }
      } catch (err) {
        setIsLoading(false);
        const siteHost = url ? new URL(url).hostname : 'the website';
        setError(
          `The website at ${siteHost} has security settings (likely X-Frame-Options or Content-Security-Policy) that prevent it from being displayed inside other websites. This is a security feature of that website, not an error with this tool.`
        );
      }
    }, 500);
  };

  const handleRefresh = () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    setIframeKey(Date.now());
  };

  React.useEffect(() => {
    if (containerRef.current && isSingleView) {
      const parentWidth = containerRef.current.parentElement?.clientWidth ?? window.innerWidth;
      const newWidth = Math.min(size.width, parentWidth - 40);
      if(newWidth !== size.width){
         setSize(s => ({...s, width: newWidth}));
      }
    }
  }, [isSingleView, size.width]);


  return (
    <div ref={containerRef} className="flex flex-col gap-4 items-center animate-in fade-in-50 duration-500">
      <Card
        ref={frameRef}
        className="flex flex-col overflow-hidden shadow-xl border-border/80 transition-[width,height] duration-100"
        style={{ width: size.width, height: 'auto', minWidth: '320px' }}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 p-3 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">{isResizing ? "Live Adjust" : name}</CardTitle>
              <CardDescription className="text-xs tabular-nums">
                {size.width}px &times; {size.height}px
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setIsRotated(prev => !prev)}
                title="Rotate frame"
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
                title="Remove frame"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove frame</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative p-0" style={{height: size.height}}>
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
              ref={iframeLoadRef}
              key={iframeKey}
              title={`${name} Preview`}
              src={url}
              className="border-0 bg-background transition-opacity duration-300"
              style={{ opacity: isLoading ? 0.3 : 1, width: '100%', height: '100%' }}
              onLoad={handleLoad}
              onError={handleError}
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          )}
          {isSingleView && (
            <>
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-20"
                onMouseDown={startResizing}
              >
                <Move className="w-3 h-3 text-primary/50 rotate-45"/>
              </div>
              <div 
                className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-10"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                  const handleVerticalResize = (me: MouseEvent) => setSize(s => ({...s, height: Math.max(200, me.clientY - frameRef.current!.getBoundingClientRect().top)}));
                  const stopVerticalResize = () => {
                    setIsResizing(false);
                    document.removeEventListener('mousemove', handleVerticalResize);
                    document.removeEventListener('mouseup', stopVerticalResize);
                    document.body.style.cursor = '';
                  };
                  document.addEventListener('mousemove', handleVerticalResize);
                  document.addEventListener('mouseup', stopVerticalResize);
                  document.body.style.cursor = 'ns-resize';
                }}
              />
              <div 
                className="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-10"
                 onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                  const handleHorizontalResize = (me: MouseEvent) => setSize(s => ({...s, width: Math.max(320, me.clientX - frameRef.current!.getBoundingClientRect().left)}));
                  const stopHorizontalResize = () => {
                    setIsResizing(false);
                    document.removeEventListener('mousemove', handleHorizontalResize);
                    document.removeEventListener('mouseup', stopHorizontalResize);
                     document.body.style.cursor = '';
                  };
                  document.addEventListener('mousemove', handleHorizontalResize);
                  document.addEventListener('mouseup', stopHorizontalResize);
                   document.body.style.cursor = 'ew-resize';
                }}
              />
            </>
          )}
          {isResizing && <div className="absolute inset-0 z-0"/>}
        </CardContent>
      </Card>
    </div>
  );
}
