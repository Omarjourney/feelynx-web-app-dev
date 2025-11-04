import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';

interface FormState {
  reporterName: string;
  reporterEmail: string;
  contentLink: string;
}

interface FormErrors {
  reporterName?: string;
  reporterEmail?: string;
  contentLink?: string;
  form?: string;
}

const initialState: FormState = {
  reporterName: '',
  reporterEmail: '',
  contentLink: '',
};

const DMCA = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.reporterName.trim()) {
      nextErrors.reporterName = 'Please provide your name.';
    }

    if (!form.reporterEmail.trim()) {
      nextErrors.reporterEmail = 'Please provide a contact email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporterEmail)) {
      nextErrors.reporterEmail = 'Enter a valid email address.';
    }

    if (!form.contentLink.trim()) {
      nextErrors.contentLink = 'Please include a link to the content.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/dmca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw await toApiError(response);
      }

      toast.success('DMCA notice submitted successfully.');
      setSubmitted(true);
      setForm(initialState);
      setErrors({});
    } catch (error) {
      console.error('Failed to submit DMCA notice', error);
      setErrors({ form: getUserMessage(error) });
      toast.error(getUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Notice submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. Our team will review your report and follow up if needed.
        </p>
        <Button className="mt-4" onClick={() => setSubmitted(false)}>
          Submit another notice
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DMCA Notice</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-1">
          <Input
            name="reporterName"
            placeholder="Your Name"
            value={form.reporterName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.reporterName)}
            aria-describedby={errors.reporterName ? 'reporterName-error' : undefined}
            className={cn(
              errors.reporterName && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          {errors.reporterName && (
            <p id="reporterName-error" className="text-sm text-destructive">
              {errors.reporterName}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            name="reporterEmail"
            type="email"
            placeholder="Your Email"
            value={form.reporterEmail}
            onChange={handleChange}
            aria-invalid={Boolean(errors.reporterEmail)}
            aria-describedby={errors.reporterEmail ? 'reporterEmail-error' : undefined}
            className={cn(
              errors.reporterEmail && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          {errors.reporterEmail && (
            <p id="reporterEmail-error" className="text-sm text-destructive">
              {errors.reporterEmail}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            name="contentLink"
            placeholder="Content Link"
            value={form.contentLink}
            onChange={handleChange}
            aria-invalid={Boolean(errors.contentLink)}
            aria-describedby={errors.contentLink ? 'contentLink-error' : undefined}
            className={cn(
              errors.contentLink && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          {errors.contentLink && (
            <p id="contentLink-error" className="text-sm text-destructive">
              {errors.contentLink}
            </p>
          )}
        </div>
        {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default DMCA;
