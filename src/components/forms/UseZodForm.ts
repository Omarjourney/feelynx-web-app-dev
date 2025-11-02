import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z, ZodTypeAny } from 'zod';

export const useZodForm = <T extends ZodTypeAny>(schema: T, options?: UseFormProps<z.infer<T>>) =>
  useForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema),
  });
