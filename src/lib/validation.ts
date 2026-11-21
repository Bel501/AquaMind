import { z } from 'zod';

export const DEMO_SECTORS = ['agriculture', 'hotellerie', 'industrie', 'autre'] as const;

export type DemoSector = (typeof DEMO_SECTORS)[number];

export interface DemoValidationMessages {
  nameMin: string;
  nameMax: string;
  companyMin: string;
  companyMax: string;
  sectorInvalid: string;
  emailInvalid: string;
  messageMin: string;
  messageMax: string;
}

const DEFAULT_MESSAGES: DemoValidationMessages = {
  nameMin: 'Nom requis (2 caractères min.).',
  nameMax: 'Nom trop long (120 caractères max.).',
  companyMin: 'Entreprise requise (2 caractères min.).',
  companyMax: "Nom d'entreprise trop long (160 caractères max.).",
  sectorInvalid: 'Veuillez sélectionner un secteur valide.',
  emailInvalid: 'Adresse email professionnelle invalide.',
  messageMin: 'Précisez votre besoin en quelques mots (10 caractères min.).',
  messageMax: 'Message trop long (1500 caractères max.).',
};

export function createDemoFormSchema(messages: DemoValidationMessages = DEFAULT_MESSAGES) {
  return z.object({
    name: z.string().trim().min(2, messages.nameMin).max(120, messages.nameMax),
    company: z.string().trim().min(2, messages.companyMin).max(160, messages.companyMax),
    sector: z.enum(DEMO_SECTORS, {
      error: messages.sectorInvalid,
    }),
    email: z.string().trim().email(messages.emailInvalid),
    message: z.string().trim().min(10, messages.messageMin).max(1500, messages.messageMax),
  });
}

export const demoFormSchema = createDemoFormSchema();

export type DemoFormValues = z.infer<typeof demoFormSchema>;
