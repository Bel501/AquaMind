import { useCallback, useEffect, useMemo, useState } from 'react';
import type { z } from 'zod';

export type FieldErrorMap<T extends Record<string, string>> = Partial<Record<keyof T, string>>;
export type FieldTouchedMap<T extends Record<string, string>> = Partial<Record<keyof T, boolean>>;

interface UseZodFormValidationOptions<
  TValues extends Record<string, string>,
  TSchema extends z.ZodObject<Record<keyof TValues, z.ZodTypeAny>>,
> {
  schema: TSchema;
  initialValues: TValues;
  fieldOrder: Array<keyof TValues>;
}

export function useZodFormValidation<
  TValues extends Record<string, string>,
  TSchema extends z.ZodObject<Record<keyof TValues, z.ZodTypeAny>>,
>({ schema, initialValues, fieldOrder }: UseZodFormValidationOptions<TValues, TSchema>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [touched, setTouched] = useState<FieldTouchedMap<TValues>>({});
  const [errors, setErrors] = useState<FieldErrorMap<TValues>>({});
  const [externalErrors, setExternalErrors] = useState<FieldErrorMap<TValues>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const schemaCheck = useMemo(() => schema.safeParse(values), [schema, values]);
  const isSchemaValid = schemaCheck.success;

  // Effect keeps touched/submitted fields validated in real time (including locale changes)
  useEffect(() => {
    const nextErrors: FieldErrorMap<TValues> = {};
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof TValues | undefined;
        if (key && (touched[key] || hasSubmitted) && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
    }

    for (const field of fieldOrder) {
      if (!nextErrors[field] && externalErrors[field]) {
        nextErrors[field] = externalErrors[field];
      }
    }

    setErrors(nextErrors);
  }, [schema, values, touched, hasSubmitted, externalErrors, fieldOrder]);

  const validateSingleField = useCallback(
    (field: keyof TValues, value: string): string | undefined => {
      const fieldSchema = schema.shape[field];
      const result = fieldSchema.safeParse(value);
      return result.success ? undefined : result.error.issues[0]?.message;
    },
    [schema]
  );

  const handleChange = useCallback(
    (field: keyof TValues, nextValue: string) => {
      setValues((prev) => ({ ...prev, [field]: nextValue }));
      setExternalErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      if (!touched[field] && nextValue.length > 0) {
        setTouched((prev) => ({ ...prev, [field]: true }));
      }
    },
    [touched]
  );

  const handleBlur = useCallback(
    (field: keyof TValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldError = validateSingleField(field, values[field]);
      setErrors((prev) => {
        if (fieldError) {
          return { ...prev, [field]: fieldError };
        }
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    },
    [validateSingleField, values]
  );

  const validateForm = useCallback(():
    | { success: true; data: z.infer<TSchema> }
    | { success: false; firstInvalidField: keyof TValues | null } => {
    setHasSubmitted(true);
    const allTouched: FieldTouchedMap<TValues> = {};
    for (const field of fieldOrder) {
      allTouched[field] = true;
    }
    setTouched(allTouched);
    setExternalErrors({});

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrorMap<TValues> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof TValues | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      const firstInvalidField = fieldOrder.find((field) => Boolean(nextErrors[field])) ?? null;
      return { success: false, firstInvalidField };
    }

    setErrors({});
    return { success: true, data: parsed.data };
  }, [schema, values, fieldOrder]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setExternalErrors({});
    setHasSubmitted(false);
  }, [initialValues]);

  return {
    values,
    touched,
    errors,
    isSchemaValid,
    handleChange,
    handleBlur,
    validateForm,
    setExternalErrors,
    resetForm,
  };
}
