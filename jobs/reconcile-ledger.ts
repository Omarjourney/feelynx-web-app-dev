import { createClient } from '@supabase/supabase-js';

interface LedgerEntry {
  id: string;
  amount: number;
  currency: string;
  direction: 'debit' | 'credit';
  created_at: string;
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const run = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: ledgerEntries, error } = await supabase
    .from<LedgerEntry>('ledger_entries')
    .select('*')
    .gte('created_at', since);

  if (error) {
    throw error;
  }

  const credits = ledgerEntries?.filter((entry) => entry.direction === 'credit') ?? [];
  const debits = ledgerEntries?.filter((entry) => entry.direction === 'debit') ?? [];

  const creditSum = credits.reduce((acc, entry) => acc + entry.amount, 0);
  const debitSum = debits.reduce((acc, entry) => acc + entry.amount, 0);
  const diff = Math.abs(creditSum - debitSum);
  const diffPercent = credits.length === 0 ? 0 : diff / creditSum;

  const report = {
    generatedAt: new Date().toISOString(),
    entries: ledgerEntries?.length ?? 0,
    creditSum,
    debitSum,
    diff,
    diffPercent,
    status: diffPercent < 0.001 ? 'pass' : 'investigate'
  };

  console.log(JSON.stringify(report, null, 2));

  await supabase.from('ledger_reconcile_reports').insert({
    report,
    diff_percent: diffPercent,
    status: report.status,
    generated_at: report.generatedAt
  });
};

run().catch((error) => {
  console.error('Ledger reconciliation failed', error);
  process.exitCode = 1;
});
