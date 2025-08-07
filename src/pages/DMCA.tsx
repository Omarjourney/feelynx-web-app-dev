import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DMCA = () => {
  const [form, setForm] = useState({
    reporterName: '',
    reporterEmail: '',
    contentLink: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/dmca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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
        <Input
          name="reporterEmail"
          placeholder="Your Email"
          value={form.reporterEmail}
          onChange={handleChange}
        />
        <Input
          name="contentLink"
          placeholder="Content Link"
          value={form.contentLink}
          onChange={handleChange}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default DMCA;
