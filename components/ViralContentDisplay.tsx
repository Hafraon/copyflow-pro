'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Video, Camera, Youtube, Twitter, Hash, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type ViralContentResponse } from '@/lib/validations';
import { type Language } from '@/lib/translations';
import { toast } from 'sonner';

interface ViralContentDisplayProps {
  data: ViralContentResponse;
  language: Language;
}

const platformIcons = {
  tiktok: Video,
  instagram: Camera,
  youtube: Youtube,
  twitter: Twitter,
};

const platformColors = {
  tiktok: 'from-pink-500 to-red-500',
  instagram: 'from-purple-500 to-pink-500',
  youtube: 'from-red-500 to-red-600',
  twitter: 'from-blue-400 to-blue-600',
};

export function ViralContentDisplay({ data, language }: ViralContentDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(key));
      toast.success(language === 'en' ? 'Copied!' : language === 'ua' ? 'Скопійовано!' : 'Copié!');
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to copy' : language === 'ua' ? 'Помилка копіювання' : 'Erreur de copie');
    }
  };

  const renderHashtags = (hashtags: string[]) => (
    <div className="flex flex-wrap gap-1 mt-2">
      {hashtags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );

  const renderCopyButton = (content: string, key: string) => {
    const isCopied = copiedItems.has(key);
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(content, key)}
        className="h-8 w-8 p-0 hover:bg-accent"
      >
        <AnimatePresence mode="wait">
          {isCopied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4 text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Copy className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tiktok" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(platformIcons).map(([platform, IconComponent]) => (
            <TabsTrigger key={platform} value={platform} className="flex items-center space-x-2">
              <IconComponent className="w-4 h-4" />
              <span className="capitalize">{platform}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TikTok Content */}
        <TabsContent value="tiktok" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platformColors.tiktok} flex items-center justify-center`}>
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <span>TikTok Video Script</span>
                </div>
                {renderCopyButton(
                  `${data.tiktokScript.hook}\n\n${data.tiktokScript.problem}\n\n${data.tiktokScript.solution}\n\n${data.tiktokScript.proof}\n\n${data.tiktokScript.cta}`,
                  'tiktok-full'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Hook (0-3s)</Badge>
                    {renderCopyButton(data.tiktokScript.hook, 'tiktok-hook')}
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg">{data.tiktokScript.hook}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Problem (3-8s)</Badge>
                    {renderCopyButton(data.tiktokScript.problem, 'tiktok-problem')}
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg">{data.tiktokScript.problem}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Solution (8-20s)</Badge>
                    {renderCopyButton(data.tiktokScript.solution, 'tiktok-solution')}
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg">{data.tiktokScript.solution}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Proof (20-25s)</Badge>
                    {renderCopyButton(data.tiktokScript.proof, 'tiktok-proof')}
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg">{data.tiktokScript.proof}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">CTA (25-30s)</Badge>
                    {renderCopyButton(data.tiktokScript.cta, 'tiktok-cta')}
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg">{data.tiktokScript.cta}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Hashtags</h4>
                  {renderCopyButton(data.tiktokScript.hashtags.join(' '), 'tiktok-hashtags')}
                </div>
                {renderHashtags(data.tiktokScript.hashtags)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Content */}
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platformColors.instagram} flex items-center justify-center`}>
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span>Instagram Content</span>
                </div>
                {renderCopyButton(data.instagramCaption.caption, 'instagram-caption')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Caption</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{data.instagramCaption.caption}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Hashtags</h4>
                  {renderCopyButton(data.instagramCaption.hashtags.join(' '), 'instagram-hashtags')}
                </div>
                {renderHashtags(data.instagramCaption.hashtags)}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Story Ideas</h4>
                <div className="space-y-2">
                  {data.instagramCaption.storyIdeas.map((idea, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{idea}</span>
                      {renderCopyButton(idea, `story-${index}`)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* YouTube Content */}
        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platformColors.youtube} flex items-center justify-center`}>
                  <Youtube className="w-4 h-4 text-white" />
                </div>
                <span>YouTube Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Title</h4>
                  {renderCopyButton(data.youtubeTitle, 'youtube-title')}
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">{data.youtubeTitle}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  {renderCopyButton(data.youtubeDescription, 'youtube-description')}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{data.youtubeDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twitter Content */}
        <TabsContent value="twitter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platformColors.twitter} flex items-center justify-center`}>
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                  <span>Twitter Thread</span>
                </div>
                {renderCopyButton(data.twitterThread.join('\n\n'), 'twitter-thread')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {data.twitterThread.map((tweet, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Tweet {index + 1}</Badge>
                      {renderCopyButton(tweet, `tweet-${index}`)}
                    </div>
                    <div className="bg-muted p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm">{tweet}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tweet.length}/280 characters
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Viral Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span>Viral Hooks</span>
            </div>
            {renderCopyButton(data.viralHooks.join('\n'), 'viral-hooks')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.viralHooks.map((hook, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <span className="text-sm">{hook}</span>
                {renderCopyButton(hook, `hook-${index}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-blue-500" />
            <span>Platform-Specific Hashtags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.platformHashtags).map(([platform, hashtags]) => {
              const IconComponent = platformIcons[platform as keyof typeof platformIcons];
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    {renderCopyButton(hashtags.join(' '), `${platform}-hashtags`)}
                  </div>
                  {renderHashtags(hashtags)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}