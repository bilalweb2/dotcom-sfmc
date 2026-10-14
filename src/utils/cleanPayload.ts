export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  const cleanedPayload: Partial<T> = {};
  const emptyFields: string[] = [];

  for (const [key, value] of Object.entries(payload)) {
    if (value === "" || value === null || value === undefined) {
      emptyFields.push(key);
    } else {
      cleanedPayload[key as keyof T] = value as T[keyof T];
    }
  }

  return {
    cleanedPayload,
    emptyFields,
  };
}
