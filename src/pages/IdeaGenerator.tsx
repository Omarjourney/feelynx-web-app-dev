import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Sparkles, Users, DollarSign, Heart, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
}

const ideaCategories = {
  themes: {
    icon: Sparkles,
    title: 'Stream Themes',
    ideas: [
      {
        id: 't1',
        title: 'Behind the Scenes',
        description: 'Show your creative process, daily routine, or workspace setup',
        category: 'themes',
      },
      {
        id: 't2',
        title: 'Q&A Session',
        description: 'Answer fan questions live and build deeper connections',
        category: 'themes',
      },
      {
        id: 't3',
        title: 'Themed Challenge',
        description: 'Try a 24-hour challenge, cooking challenge, or skill showcase',
        category: 'themes',
      },
      {
        id: 't4',
        title: 'Collaboration Stream',
        description: 'Team up with other creators for a joint stream experience',
        category: 'themes',
      },
      {
        id: 't5',
        title: 'Tutorial & Teaching',
        description: 'Share your expertise in makeup, gaming, music, or your niche',
        category: 'themes',
      },
    ],
  },
  interactive: {
    icon: Users,
    title: 'Interactive Activities',
    ideas: [
      {
        id: 'i1',
        title: 'Viewer Poll Decisions',
        description: 'Let your audience vote on what you do next during the stream',
        category: 'interactive',
      },
      {
        id: 'i2',
        title: 'Shoutout Hour',
        description: 'Dedicate time to personally thank top supporters and new followers',
        category: 'interactive',
      },
      {
        id: 'i3',
        title: 'Prediction Games',
        description: 'Create guessing games where viewers predict outcomes for rewards',
        category: 'interactive',
      },
      {
        id: 'i4',
        title: 'Viewer Challenges',
        description: 'Invite viewers to submit challenges for you to complete live',
        category: 'interactive',
      },
      {
        id: 'i5',
        title: 'Live Reactions',
        description: 'React to viewer-submitted content, videos, or memes together',
        category: 'interactive',
      },
    ],
  },
  monetization: {
    icon: DollarSign,
    title: 'Monetization Ideas',
    ideas: [
      {
        id: 'm1',
        title: 'Exclusive Content Tiers',
        description: 'Offer premium content or private streams for top supporters',
        category: 'monetization',
      },
      {
        id: 'm2',
        title: 'Gift Goal Milestones',
        description: 'Set gift goals with rewards when the community reaches them',
        category: 'monetization',
      },
      {
        id: 'm3',
        title: 'Personal Experiences',
        description: 'Auction off one-on-one calls or personalized content',
        category: 'monetization',
      },
      {
        id: 'm4',
        title: 'Merchandise Showcase',
        description: 'Launch and promote your branded merchandise during streams',
        category: 'monetization',
      },
      {
        id: 'm5',
        title: 'Tip-Triggered Actions',
        description: 'Perform special actions or effects when reaching tip amounts',
        category: 'monetization',
      },
    ],
  },
  engagement: {
    icon: Heart,
    title: 'Engagement Strategies',
    ideas: [
      {
        id: 'e1',
        title: 'Regular Schedule',
        description: 'Stream at consistent times so fans know when to tune in',
        category: 'engagement',
      },
      {
        id: 'e2',
        title: 'Loyalty Rewards',
        description: 'Create a VIP program for your most dedicated supporters',
        category: 'engagement',
      },
      {
        id: 'e3',
        title: 'Community Building',
        description: 'Foster connections between viewers through chat games and events',
        category: 'engagement',
      },
      {
        id: 'e4',
        title: 'Surprise Events',
        description: 'Announce spontaneous streams or special appearances',
        category: 'engagement',
      },
      {
        id: 'e5',
        title: 'Milestone Celebrations',
        description: 'Celebrate follower milestones with special streams or giveaways',
        category: 'engagement',
      },
    ],
  },
};

const IdeaGenerator = () => {
  const [randomIdea, setRandomIdea] = useState<Idea | null>(null);

  const getAllIdeas = () => {
    return Object.values(ideaCategories).flatMap((category) => category.ideas);
  };

  const generateRandomIdea = () => {
    const allIdeas = getAllIdeas();
    const randomIndex = Math.floor(Math.random() * allIdeas.length);
    setRandomIdea(allIdeas[randomIndex]);
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Idea Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get inspired with fresh content ideas for your streams. Browse by category or generate a
          random suggestion to spark your creativity.
        </p>
      </div>

      {/* Random Idea Generator */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Need Instant Inspiration?
          </CardTitle>
          <CardDescription>Click to generate a random idea from all categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateRandomIdea} size="lg" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Random Idea
          </Button>
          {randomIdea && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">{randomIdea.title}</h3>
                <p className="text-muted-foreground">{randomIdea.description}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Categorized Ideas */}
      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(ideaCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(ideaCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>
                  Explore creative ideas to enhance your streams and grow your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.ideas.map((idea) => (
                    <Card key={idea.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips for Successful Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✨ Mix and match ideas from different categories for unique experiences</li>
            <li>🎯 Announce special streams in advance to build anticipation</li>
            <li>💬 Always engage with your chat and make viewers feel valued</li>
            <li>📊 Track which ideas resonate most with your audience</li>
            <li>🔄 Rotate themes regularly to keep content fresh and exciting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeaGenerator;
