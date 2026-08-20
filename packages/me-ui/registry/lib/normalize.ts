/** Everything that is not a digit, removed. */
export const digits = (value: string) => value.replace(/\D/g, "");
