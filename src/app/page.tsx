'use client';

import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PreviewFrame } from '@/components/viewportly/preview-frame';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

import { AppWindow, Grid, Globe, Plus, Smartphone, Tablet, Laptop, MoveHorizontal, MoveVertical, DraftingCompass, X } from 'lucide-react';

export type Frame = {
  id: number;
  name: string;
  width: number;
  height: number;
  icon: React.ElementType;
  isCustom: boolean;
};

const initialFrames: Frame[] = [
  { id: 1, name: 'Mobile', width: 375, height: 667, icon: Smartphone, isCustom: false },
  { id: 2, name: 'Tablet', width: 768, height: 1024, icon: Tablet, isCustom: false },
  { id: 3, name: 'Desktop', width: 1280, height: 800, icon: Laptop, isCustom: false },
];

const urlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)" }),
});

const customFrameSchema = z.object({
  width: z.coerce.number().min(100, "Min 100px").max(4000, "Max 4000px"),
  height: z.coerce.number().min(100, "Min 100px").max(4000, "Max 4000px"),
});

export default function ViewportlyPage() {
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [frames, setFrames] = useState<Frame[]>(initialFrames);
  const [selectedFrameId, setSelectedFrameId] = useState<number>(initialFrames[0].id);
  const [isGridView, setIsGridView] = useState<boolean>(false);
  const { toast } = useToast();

  const urlForm = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "" },
  });

  const customFrameForm = useForm<z.infer<typeof customFrameSchema>>({
    resolver: zodResolver(customFrameSchema),
    defaultValues: { width: 1920, height: 1080 },
  });

  function onUrlSubmit(values: z.infer<typeof urlSchema>) {
    setSubmittedUrl(values.url);
    toast({
      title: "🚀 Preview Loading",
      description: `Attempting to load ${values.url} in the selected frame(s).`,
    });
  }

  function onAddFrame(values: z.infer<typeof customFrameSchema>) {
    const newFrame: Frame = {
      id: Date.now(),
      name: `Custom ${values.width}x${values.height}`,
      width: values.width,
      height: values.height,
      icon: DraftingCompass,
      isCustom: true,
    };
    setFrames(prev => [...prev, newFrame]);
    setSelectedFrameId(newFrame.id);
    toast({
      title: "🖼️ Frame Added",
      description: `Added and selected custom frame with dimensions ${values.width}x${values.height}.`,
    });
    customFrameForm.reset();
  }

  const removeFrame = (id: number) => {
    setFrames(prev => {
        const newFrames = prev.filter(frame => frame.id !== id);
        if (selectedFrameId === id) {
            setSelectedFrameId(newFrames[0]?.id || 0);
        }
        return newFrames;
    });
    toast({
      title: "🗑️ Frame Removed",
      description: "The custom frame has been removed.",
      variant: "destructive",
    });
  };
  
  const selectedFrame = frames.find(f => f.id === selectedFrameId);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ViewPortly
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a URL to instantly preview it across a range of popular device sizes and custom resolutions.
          </p>
        </header>

        <Card className="mb-8 shadow-lg border-border/80">
           <CardContent className="p-4 sm:p-6">
                <Form {...urlForm}>
                  <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
                    <FormField
                      control={urlForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-base">Website URL</FormLabel>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-grow">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl>
                                <Input placeholder="https://example.com" className="pl-10 h-11 text-base" {...field} />
                              </FormControl>
                            </div>
                            <Button type="submit" size="lg" className="font-bold">Preview</Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                
                <Separator className="my-6" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <Label className="font-semibold">View Options</Label>
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex items-center space-x-2">
                              <AppWindow className="h-5 w-5 text-muted-foreground" />
                              <Label htmlFor="view-mode" className={!isGridView ? 'text-foreground' : 'text-muted-foreground'}>Single View</Label>
                              <Switch id="view-mode" checked={isGridView} onCheckedChange={setIsGridView} />
                              <Label htmlFor="view-mode" className={isGridView ? 'text-foreground' : 'text-muted-foreground'}>Grid View</Label>
                               <Grid className="h-5 w-5 text-muted-foreground" />
                            </div>
                           {!isGridView && (
                             <div className="flex-1">
                                <Select value={String(selectedFrameId)} onValueChange={(value) => setSelectedFrameId(Number(value))}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select a device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frames.map(frame => (
                                            <SelectItem key={frame.id} value={String(frame.id)}>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-2">
                                                        <frame.icon className="h-4 w-4" />
                                                        <span>{frame.name} ({frame.width}x{frame.height})</span>
                                                    </div>
                                                    {frame.isCustom && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-2 hover:bg-destructive/20"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                removeFrame(frame.id);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                           )}
                        </div>
                    </div>
                    <Form {...customFrameForm}>
                      <form onSubmit={customFrameForm.handleSubmit(onAddFrame)} className="space-y-3">
                         <Label className="font-semibold">Add Custom Frame</Label>
                        <div className="flex gap-2">
                          <FormField
                            control={customFrameForm.control}
                            name="width"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                 <div className="relative">
                                   <MoveHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                   <FormControl>
                                      <Input type="number" placeholder="Width" className="pl-10 h-11" {...field} />
                                   </FormControl>
                                 </div>
                                 <FormMessage className="text-xs mt-1"/>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customFrameForm.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <div className="relative">
                                   <MoveVertical className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                   <FormControl>
                                      <Input type="number" placeholder="Height" className="pl-10 h-11" {...field} />
                                   </FormControl>
                                 </div>
                                 <FormMessage className="text-xs mt-1"/>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" size="lg" className="font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                </div>
           </CardContent>
        </Card>

        <div id="framesContainer" className="flex flex-wrap justify-center items-start gap-8">
          {isGridView ? (
            frames.map(frame => (
               <PreviewFrame key={frame.id} {...frame} url={submittedUrl} onRemove={removeFrame} isRemovable={frame.isCustom} />
            ))
          ) : selectedFrame ? (
            <PreviewFrame key={selectedFrame.id} {...selectedFrame} url={submittedUrl} onRemove={removeFrame} isRemovable={selectedFrame.isCustom} />
          ) : (
             <Card className="flex flex-col items-center justify-center p-12 text-center shadow-xl border-border/80 w-full" style={{minHeight: 400}}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">No Device Selected</CardTitle>
                    <CardDescription className="mt-2">Please add or select a device to start previewing.</CardDescription>
                </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
