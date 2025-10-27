import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DMCA = () => {
  type FormField = 'reporterName' | 'reporterEmail' | 'contentLink';

  const [form, setForm] = useState<Record<FormField, string>>({
    reporterName: '',
    reporterEmail: '',
    contentLink: '',
  });
  const [errors, setErrors] = useState<Record<FormField, string>>({
    reporterName: '',
    reporterEmail: '',
    contentLink: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as FormField;
    setForm({ ...form, [fieldName]: value });
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.reporterName.trim();
    const trimmedEmail = form.reporterEmail.trim();
    const trimmedLink = form.contentLink.trim();

    const newErrors: Record<FormField, string> = {
      reporterName: '',
      reporterEmail: '',
      contentLink: '',
    };

    if (!trimmedName) {
      newErrors.reporterName = 'Please provide your name.';
    }

    if (!trimmedEmail) {
      newErrors.reporterEmail = 'Please provide your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.reporterEmail = 'Enter a valid email address.';
    }

    if (!trimmedLink) {
      newErrors.contentLink = 'Please include a link to the content.';
    } else {
      try {
        // Validate that the link is a well-formed URL
        new URL(trimmedLink);
      } catch (err) {
        newErrors.contentLink = 'Enter a valid URL.';
      }
    }

    if (Object.values(newErrors).some((message) => message)) {
      setErrors(newErrors);
      return;
    }

    await fetch('/dmca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterName: trimmedName,
        reporterEmail: trimmedEmail,
        contentLink: trimmedLink,
      }),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Notice submitted</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DMCA Notice</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          name="reporterName"
          placeholder="Your Name"
          value={form.reporterName}
          onChange={handleChange}
        />
        {errors.reporterName && (
          <p className="text-sm text-destructive">{errors.reporterName}</p>
        )}
        <Input
          name="reporterEmail"
          placeholder="Your Email"
          value={form.reporterEmail}
          onChange={handleChange}
        />
        {errors.reporterEmail && (
          <p className="text-sm text-destructive">{errors.reporterEmail}</p>
        )}
        <Input
          name="contentLink"
          placeholder="Content Link"
          value={form.contentLink}
          onChange={handleChange}
        />
        {errors.contentLink && (
          <p className="text-sm text-destructive">{errors.contentLink}</p>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default DMCA;
