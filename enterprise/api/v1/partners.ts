import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export interface PartnerBranding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface PartnerLicense {
  id: string;
  displayName: string;
  contactEmail: string;
  customDomain: string;
  payoutPercentage: number;
  activeUsers: number;
  mrr: number;
  branding: PartnerBranding;
}

export interface PartnerRegistryState {
  partners: PartnerLicense[];
  lastUpdated: string;
}

const registryPath = path.join(process.cwd(), 'enterprise.config.json');

const fallbackPartners: PartnerLicense[] = [
  {
    id: 'aurora-studios',
    displayName: 'Aurora Studios',
    contactEmail: 'enterprise@aurorastudios.co',
    customDomain: 'aurora.feelynx.live',
    payoutPercentage: 0.32,
    activeUsers: 1845,
    mrr: 86000,
    branding: {
      logoUrl: 'https://cdn.feelynx.live/partners/aurora/logo.png',
      primaryColor: '#7c3aed',
      secondaryColor: '#ec4899',
      accentColor: '#fbbf24',
    },
  },
  {
    id: 'nebula-creative',
    displayName: 'Nebula Creative',
    contactEmail: 'enterprise@nebulacreative.io',
    customDomain: 'nebula.feelynx.live',
    payoutPercentage: 0.28,
    activeUsers: 1390,
    mrr: 67000,
    branding: {
      logoUrl: 'https://cdn.feelynx.live/partners/nebula/logo.png',
      primaryColor: '#14b8a6',
      secondaryColor: '#6366f1',
      accentColor: '#22d3ee',
    },
  },
];

interface EnterpriseConfig {
  brand?: Record<string, unknown>;
  domains?: Array<Record<string, unknown>>;
  partners?: PartnerLicense[];
  payout?: Record<string, unknown>;
  lastUpdated?: string;
}

function loadRegistry(): PartnerRegistryState {
  if (typeof window !== 'undefined') {
    return {
      partners: fallbackPartners,
      lastUpdated: new Date().toISOString(),
    };
  }

  if (!existsSync(registryPath)) {
    return { partners: [], lastUpdated: new Date().toISOString() };
  }

  const raw = readFileSync(registryPath, 'utf8');
  const parsed = JSON.parse(raw) as EnterpriseConfig;

  return {
    partners: parsed.partners ?? [],
    lastUpdated: new Date().toISOString(),
  };
}

function persistRegistry(partners: PartnerLicense[]): void {
  if (typeof window !== 'undefined') {
    return;
  }

  let baseConfig: EnterpriseConfig = {};
  if (existsSync(registryPath)) {
    baseConfig = JSON.parse(readFileSync(registryPath, 'utf8')) as EnterpriseConfig;
  }

  const payload: EnterpriseConfig = {
    ...baseConfig,
    partners,
    lastUpdated: new Date().toISOString(),
  };

  writeFileSync(registryPath, JSON.stringify(payload, null, 2));
}

export function listPartners(): PartnerLicense[] {
  return loadRegistry().partners;
}

export function registerPartner(partner: PartnerLicense): PartnerLicense {
  const registry = loadRegistry();
  const existingIndex = registry.partners.findIndex((item) => item.id === partner.id);

  if (existingIndex >= 0) {
    registry.partners[existingIndex] = partner;
  } else {
    registry.partners.push(partner);
  }

  persistRegistry(registry.partners);
  return partner;
}

export function removePartner(id: string): void {
  const registry = loadRegistry();
  const filtered = registry.partners.filter((partner) => partner.id !== id);
  persistRegistry(filtered);
}

export function calculateRevenueShare(): Record<string, number> {
  const partners = loadRegistry().partners;
  return partners.reduce<Record<string, number>>((acc, partner) => {
    acc[partner.id] = Math.round(partner.mrr * partner.payoutPercentage * 100) / 100;
    return acc;
  }, {});
}

export function snapshotPartnerHealth() {
  const partners = loadRegistry().partners;
  const enterpriseMRR = partners.reduce((acc, partner) => acc + partner.mrr, 0);
  const totalUsers = partners.reduce((acc, partner) => acc + partner.activeUsers, 0);

  return {
    partners,
    enterpriseMRR,
    totalUsers,
    partnerCount: partners.length,
    lastSynced: new Date().toISOString(),
  };
}
