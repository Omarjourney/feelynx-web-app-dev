export type FieldErrors<T extends Record<string, unknown>> = Partial<{
  [K in keyof T]: string;
}>;

export const validators = {
  email(value: string): string | null {
    const v = value.trim();
    if (!v) return 'Email is required.';
    // Basic RFC2822-like check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return null;
  },
  password(value: string, { min = 6 } = {}): string | null {
    if (!value) return 'Password is required.';
    if (value.length < min) return `Password must be at least ${min} characters.`;
    return null;
  },
};

export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>,
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  (Object.keys(rules) as Array<keyof T>).forEach((key) => {
    const rule = rules[key];
    if (!rule) return;
    const msg = rule(obj[key]);
    if (msg) errors[key] = msg;
  });
  return errors;
}
