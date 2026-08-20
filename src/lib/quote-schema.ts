import { z } from "zod";

import { digits } from "@/lib/normalize";
import { isValidTckn } from "@/lib/tckn";

export const personalSchema = z.object({
  tckn: z
    .string()
    .min(1, "Kimlik numarası boş bırakılamaz")
    .refine((v) => /^[1-9]\d{10}$/.test(digits(v)), "Kimlik numarası 11 haneli olmalıdır")
    .refine(isValidTckn, "Geçerli bir kimlik numarası giriniz"),
  phone: z
    .string()
    .min(1, "Cep telefonu boş bırakılamaz")
    .refine((v) => /^0?5\d{9}$/.test(digits(v)), "Geçerli bir cep telefonu giriniz"),
  email: z
    .string()
    .min(1, "E-posta adresi boş bırakılamaz")
    .pipe(z.email("Geçerli bir e-posta adresi giriniz")),
  occupation: z.string().min(1, "Mesleğinizi seçiniz"),
});

export const healthSchema = z.object({
  hasDiagnosis: z.enum(["yes", "no"], "Lütfen bir seçim yapınız"),
});

export const quoteSchema = personalSchema.extend(healthSchema.shape);

export type QuoteFormValues = z.infer<typeof quoteSchema>;

const fieldsOf = (schema: z.ZodObject) => Object.keys(schema.shape) as (keyof QuoteFormValues)[];

export const stepFields: readonly (keyof QuoteFormValues)[][] = [
  fieldsOf(personalSchema),
  fieldsOf(healthSchema),
  [],
];

export const quoteDefaultValues: QuoteFormValues = {
  tckn: "",
  phone: "",
  email: "",
  occupation: "" as QuoteFormValues["occupation"],
  hasDiagnosis: "" as QuoteFormValues["hasDiagnosis"],
};
