import z from "zod";

const fundAccountSchema = z.object({
  balance: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: "Invalid balance value",
    }),
});

export type FundAccountSchema = z.infer<typeof fundAccountSchema>;
export { fundAccountSchema };
