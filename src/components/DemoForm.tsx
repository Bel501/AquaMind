import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export function DemoForm() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<{ name: string; company: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedCompany = company.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedCompany || !sector) {
      setError('Veuillez renseigner votre nom, votre entreprise et votre secteur.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Veuillez saisir une adresse email professionnelle valide.');
      return;
    }

    setSubmitted({ name: trimmedName, company: trimmedCompany });
    setName('');
    setCompany('');
    setSector('');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="lead-name" className="text-xs font-medium text-slate-300">
            Nom complet
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Camille Laurent"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[#05121F]/85 border border-[#22D3EE]/24 text-slate-100 placeholder:text-slate-500 text-sm focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lead-company" className="text-xs font-medium text-slate-300">
            Entreprise / Exploitation
          </label>
          <input
            id="lead-company"
            name="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Domaine des Roches"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[#05121F]/85 border border-[#22D3EE]/24 text-slate-100 placeholder:text-slate-500 text-sm focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="lead-sector" className="text-xs font-medium text-slate-300">
            Secteur
          </label>
          <select
            id="lead-sector"
            name="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[#05121F]/85 border border-[#22D3EE]/24 text-slate-100 text-sm focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
          >
            <option value="" disabled>
              Choisir un secteur
            </option>
            <option value="agriculture">Exploitation agricole</option>
            <option value="hotellerie">Hôtellerie &amp; Resort</option>
            <option value="industrie">Industrie</option>
            <option value="autre">Collectivité / Autre</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lead-email" className="text-xs font-medium text-slate-300">
            Email professionnel
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="camille@entreprise.fr"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[#05121F]/85 border border-[#22D3EE]/24 text-slate-100 placeholder:text-slate-500 text-sm focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-[#FB7185]/12 border border-[#FB7185]/45 text-[#FB7185] text-sm"
        >
          {error}
        </div>
      )}

      <div className="pt-1">
        <MagneticButton type="submit" variant="primary" className="w-full">
          Demander ma démonstration
        </MagneticButton>
      </div>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="px-4 py-3.5 rounded-xl bg-[#2DD4BF]/12 border border-[#2DD4BF]/45 text-[#2DD4BF] text-sm flex items-start gap-2.5"
        >
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Merci {submitted.name} ! Votre demande pour <strong>{submitted.company}</strong> est
            enregistrée. Un ingénieur AquaMind vous contactera sous 24h ouvrées.
          </span>
        </div>
      )}
    </form>
  );
}
