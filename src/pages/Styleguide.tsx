import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function Styleguide() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Design System — Feelynx</h1>

      <Card>
        <CardHeader>
          <CardTitle>Colors & Tokens</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'bg-background',
            'bg-card',
            'bg-muted',
            'bg-primary',
            'bg-secondary',
            'bg-destructive',
          ].map((c) => (
            <div key={c} className="space-y-2">
              <div className={`h-12 rounded ${c}`} />
              <div className="text-xs text-muted-foreground">{c}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inputs & Badges</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Email" />
          <Input placeholder="Password" type="password" />
          <div className="space-x-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="one" className="w-full">
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="text-sm text-muted-foreground">
              Content one
            </TabsContent>
            <TabsContent value="two" className="text-sm text-muted-foreground">
              Content two
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-sm text-muted-foreground">
        This page documents the live tokens/components rendered by the current codebase. For a full
        design reference, see docs/design-system.md and docs/naming-conventions.md.
      </p>
    </div>
  );
}
