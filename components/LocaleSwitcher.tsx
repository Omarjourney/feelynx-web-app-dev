import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';

const LocaleSwitcher = () => {
  const { locale, setLocale, availableLocales, t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{t('locale.switch')}</span>
      <div className="flex gap-1">
        {availableLocales.map((code) => (
          <Button
            key={code}
            size="sm"
            className="h-8 px-3"
            variant={code === locale ? 'default' : 'outline'}
            onClick={() => setLocale(code)}
          >
            {code.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LocaleSwitcher;
