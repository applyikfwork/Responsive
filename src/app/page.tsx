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

import { Globe, Plus, Smartphone, Tablet, Laptop, MoveHorizontal, MoveVertical, DraftingCompass } from 'lucide-react';

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
      title: "🚀 Previews Loading",
      description: `Loading ${values.url} in all frames.`,
    });
  }

  function onAddFrame(values: z.infer<typeof customFrameSchema>) {
    const newFrame: Frame = {
      id: Date.now(),
      name: `Custom`,
      width: values.width,
      height: values.height,
      icon: DraftingCompass,
      isCustom: true,
    };
    setFrames(prev => [...prev, newFrame]);
    toast({
      title: "🖼️ Frame Added",
      description: `Added custom frame with dimensions ${values.width}x${values.height}.`,
    });
  }

  const removeFrame = (id: number) => {
    setFrames(prev => prev.filter(frame => frame.id !== id));
    toast({
      title: "🗑️ Frame Removed",
      description: "The custom frame has been removed.",
      variant: "destructive",
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ViewPortly
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a website link to instantly preview it across a range of popular device sizes and custom resolutions.
          </p>
        </header>

        <Card className="mb-8 p-4 sm:p-6 shadow-lg border-border/80">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            <Form {...urlForm}>
              <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-3 md:col-span-3">
                <FormField
                  control={urlForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Website URL</FormLabel>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="https://example.com" className="pl-10" {...field} />
                          </FormControl>
                        </div>
                        <Button type="submit" className="font-bold">Preview</Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <Form {...customFrameForm}>
              <form onSubmit={customFrameForm.handleSubmit(onAddFrame)} className="space-y-3 md:col-span-2">
                 <FormLabel className="font-semibold">Add Custom Frame</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={customFrameForm.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                         <div className="relative">
                           <MoveHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <FormControl>
                              <Input type="number" placeholder="Width" className="pl-10" {...field} />
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
                              <Input type="number" placeholder="Height" className="pl-10" {...field} />
                           </FormControl>
                         </div>
                         <FormMessage className="text-xs mt-1"/>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>

        <div id="framesContainer" className="flex flex-wrap justify-center items-start gap-8">
          {frames.map((frame) => (
            <PreviewFrame key={frame.id} {...frame} url={submittedUrl} onRemove={removeFrame} />
          ))}
        </div>
      </div>
    </main>
  );
}
