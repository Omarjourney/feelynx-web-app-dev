import { useCallback } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useZodForm } from './useZodForm';

const dmcaSchema = z.object({
  reporterName: z.string().min(2).max(120).trim(),
  reporterEmail: z.string().trim().email().max(320),
  contentLink: z.string().trim().url(),
});

export type DmcaFormValues = z.infer<typeof dmcaSchema>;

interface DmcaNoticeFormProps {
  onSubmitted: () => void;
}

export const DmcaNoticeForm = ({ onSubmitted }: DmcaNoticeFormProps) => {
  const form = useZodForm(dmcaSchema, {
    defaultValues: {
      reporterName: '',
      reporterEmail: '',
      contentLink: '',
    },
  });

  const handleSubmit = useCallback(
    async (values: DmcaFormValues) => {
      const response = await fetch('/dmca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Failed to submit notice. Please try again.');
        return;
      }

      toast.success('Notice submitted successfully.');
      form.reset();
      onSubmitted();
    },
    [form, onSubmitted],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-md" noValidate>
        <FormField
          control={form.control}
          name="reporterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input {...field} maxLength={120} autoComplete="name" placeholder="Jane Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reporterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={320}
                  placeholder="you@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contentLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Link</FormLabel>
              <FormControl>
                <Input {...field} type="url" inputMode="url" placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};
