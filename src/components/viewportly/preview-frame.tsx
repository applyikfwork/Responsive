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

  const initialWidth = isRotated ? height : width;
  const initialHeight = isRotated ? width : height;
  
  const [size, setSize] = React.useState({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    setSize({ width: initialWidth, height: initialHeight });
  }, [id, initialWidth, initialHeight]);


  const startResizing = (e: React.MouseEvent, direction: 'horizontal' | 'vertical' | 'both') => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const doDrag = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      if (direction === 'horizontal' || direction === 'both') {
        newWidth = Math.max(320, startWidth + (e.clientX - startX));
      }
      if (direction === 'vertical' || direction === 'both') {
        newHeight = Math.max(200, startHeight + (e.clientY - startY));
      }
       if (containerRef.current && isSingleView) {
        const parentWidth = containerRef.current.parentElement?.clientWidth ?? window.innerWidth;
        newWidth = Math.min(newWidth, parentWidth - 40);
      }
      setSize({ width: newWidth, height: newHeight });
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const iframeLoadRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
      setIframeKey(Date.now()); // Force re-render of iframe
    }
  }, [url]);

  const handleLoad = () => setIsLoading(false);
  
  const handleError = () => {
    // This is tricky because of cross-origin policies. 
    // A common workaround is to check if we can access the contentDocument after a short delay.
    // If we can't, it's likely blocked.
    setTimeout(() => {
        try {
            // If the iframe's content is accessible, it means it loaded without a security error.
            // If it's a blank page from the source, we can't detect that, but we can detect security blocks.
            if (iframeLoadRef.current && iframeLoadRef.current.contentDocument) {
               // It might have loaded a page that's just blank. We'll consider it loaded.
               handleLoad();
            }
        } catch (e) {
            setIsLoading(false);
            setError(
              `The website at ${new URL(url).hostname} has security settings (likely X-Frame-Options or Content-Security-Policy) that prevent it from being displayed inside other websites. This is a security feature of that website, not an error with this tool.`
            );
        }
    }, 500); // 500ms delay to give it time to load or fail
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
        className="relative flex flex-col overflow-hidden shadow-xl border-border/80 transition-shadow duration-100"
        style={{ width: size.width, height: 'auto', minWidth: '320px' }}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 p-3 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">{isResizing ? "Live Adjust" : name}</CardTitle>
              <CardDescription className="text-xs tabular-nums">
                {Math.round(size.width)}px &times; {Math.round(size.height)}px
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => {
                  setSize({ width: size.height, height: size.width });
                  setIsRotated(prev => !prev);
                }}
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
                    <AlertDescription className="text-sm">{error}</AlertDescription>
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
              {/* Corner Resize Handle */}
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-20"
                onMouseDown={(e) => startResizing(e, 'both')}
              >
                <Move className="w-3 h-3 text-primary/50 rotate-45"/>
              </div>
              {/* Vertical Resize Handle */}
              <div 
                className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-10"
                onMouseDown={(e) => startResizing(e, 'vertical')}
              />
              {/* Horizontal Resize Handle */}
              <div 
                className="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-10"
                 onMouseDown={(e) => startResizing(e, 'horizontal')}
              />
            </>
          )}
          {isResizing && <div className="absolute inset-0 z-20" style={{userSelect: 'none'}}/>}
        </CardContent>
      </Card>
    </div>
  );
}
