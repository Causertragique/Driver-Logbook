import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  CarFront,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  DollarSign,
  Download,
  FileImage,
  Fuel,
  Gauge,
  LayoutDashboard,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

type Platform = 'Uber' | 'Lyft' | 'Both' | 'Personal';
type Unit = 'km' | 'mi';
type Currency = 'CAD' | 'USD';
type Language = 'en' | 'fr';
type LogMode = 'kilometers' | 'fuel';
type Range = 'day' | 'week' | 'month' | 'year';

type LogEntry = {
  id: string;
  date: string;
  startOdometer: number;
  endOdometer: number;
  distanceKm: number;
  fuelLiters: number;
  fuelCost: number;
  station: string;
  platform: Platform;
  odometerPhoto?: string;
  receiptPhoto?: string;
  notes: string;
  createdAt: string;
};

type Settings = {
  driverName: string;
  unit: Unit;
  currency: Currency;
  carYear: string;
  carMake: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  platforms: ('Uber' | 'Lyft')[];
  language: Language;
};

type Copy = Record<string, string>;

const queryClient = new QueryClient();
const LOGS_KEY = 'driver-logbook-logs';
const SETTINGS_KEY = 'driver-logbook-settings';
const defaultSettings: Settings = {
  driverName: '',
  unit: 'km',
  currency: 'CAD',
  carYear: '',
  carMake: '',
  carModel: '',
  carColor: '',
  licensePlate: '',
  platforms: ['Uber'],
  language: 'en',
};

const copy: Record<Language, Copy> = {
  en: {
    dashboard: 'Dashboard',
    kilometers: 'Kilometers',
    fuel: 'Gas expenses',
    profile: 'Profile',
    workspace: 'Workspace',
    ready: 'Ready when you are',
    deviceOnly: 'Your data stays on this device',
    pocketCopilot: 'Your pocket co-pilot',
    lessAdmin: 'A little less admin.',
    paperTrail: "Keep moving. We'll keep the paper trail.",
    overview: 'Overview',
    atAGlance: 'at a glance',
    workingForYou: 'Keep your miles working for you.',
    quietTax: 'Good records make tax time quieter. Log a drive while it’s still fresh.',
    addLog: 'Add a log',
    distance: 'Distance',
    fuelUsed: 'Fuel used',
    fuelCost: 'Fuel cost',
    thisPeriod: 'this period',
    fillUp: 'fill-up',
    fillUps: 'fill-ups',
    tracked: 'tracked this period',
    recentActivity: 'Recent activity',
    latestLogs: 'Your latest logs',
    viewAll: 'View all',
    noDrives: 'No drives logged yet',
    firstEntry: 'Your first entry takes less than a minute. Add the trip you just finished.',
    addFirst: 'Add your first log',
    quickNote: 'quick note',
    hey: 'Hey',
    smallEntries: 'Small entries add up.',
    photoTip: 'A photo of your odometer or receipt now can save a search through old camera rolls later.',
    tunePreferences: 'Tune your preferences',
    periodDay: 'Day',
    periodWeek: 'Week',
    periodMonth: 'Month',
    periodYear: 'Year',
    today: 'Today',
    everyStop: 'Every stop, accounted for',
    yourKilometers: 'Your kilometers',
    yourGas: 'Your gas expenses',
    storedOnDevice: 'stored on this device.',
    entries: 'entries',
    entry: 'entry',
    searchKilometers: 'Search platform or notes...',
    searchFuel: 'Search station, platform or notes...',
    all: 'All',
    uber: 'Uber',
    lyft: 'Lyft',
    both: 'Both',
    personal: 'Personal',
    noMatching: 'No matching records',
    tryFilter: 'Try a different search or platform filter.',
    readyToLogKm: 'Your kilometer log is ready',
    readyToLogFuel: 'Your gas log is ready',
    startTrip: 'Start with the trip you just finished. We’ll keep every detail close at hand.',
    startFuel: 'Save your next fuel stop while the receipt is still in your hand.',
    noPhotos: 'No photos attached',
    photosAttached: 'Photos attached',
    unlabeledStop: 'Unlabeled stop',
    addKilometers: 'Log kilometers',
    addFuel: 'Log gas expense',
    editLog: 'Edit this log',
    addALog: 'Add a log',
    date: 'Date',
    platform: 'Platform',
    odometerReading: 'Odometer reading',
    start: 'Start',
    end: 'End',
    kmLogged: 'km logged',
    endGreater: 'End reading must be greater than start',
    fuelAdded: 'Fuel added · litres',
    fuelCostLabel: 'Fuel cost',
    station: 'Station or location (optional)',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Anything worth remembering...',
    odometerPhoto: 'Odometer photo',
    receiptPhoto: 'Fuel receipt photo',
    tapPhoto: 'Tap to add photo',
    cameraLibrary: 'Camera or library',
    cancel: 'Cancel',
    saveLog: 'Save log',
    saveChanges: 'Save changes',
    logSaved: 'Log saved',
    logUpdated: 'Log updated',
    logDeleted: 'Log deleted',
    deleteLog: 'Delete this log? This cannot be undone.',
    profileIntro: 'Keep your driver, car, and app preferences together.',
    driverProfile: 'Driver profile',
    yourName: 'Your name',
    namePlaceholder: 'How should we greet you?',
    vehicle: 'Vehicle',
    carYear: 'Year',
    carMake: 'Make',
    carModel: 'Model',
    carColor: 'Color',
    licensePlate: 'License plate',
    vehiclePlaceholder: 'e.g. Toyota',
    platformTitle: 'Driving platforms',
    platformHelp: 'Select the platforms you drive with.',
    appLanguage: 'App language',
    english: 'English',
    french: 'Français',
    distanceUnit: 'Distance unit',
    kilometres: 'Kilometres',
    miles: 'Miles',
    currencyFuel: 'Currency for fuel',
    canadianDollar: 'Canadian dollar',
    usDollar: 'US dollar',
    savePreferences: 'Save preferences',
    preferencesSaved: 'Preferences saved',
    yourData: 'Your data',
    exportBackup: 'Export a backup',
    exportText: 'Download your logs and preferences as JSON.',
    exportDownloaded: 'Export downloaded',
    resetData: 'Reset local data',
    resetText: 'Permanently remove all logs from this device.',
    resetConfirm: 'Reset Driver Logbook? All logs and preferences on this device will be deleted.',
    resetDone: 'All local data reset',
    privateByDefault: 'Private by default · no account or cloud required',
    drive: 'drive',
    drives: 'drives',
    fuelRecorded: 'fuel cost recorded',
    litres: 'L',
    noStation: '—',
    wrongTurn: '404 / wrong turn',
    roadEnds: 'That road ends here.',
    backOverview: 'Back to overview',
    unitKm: 'km',
    unitMi: 'mi',
  },
  fr: {
    dashboard: 'Tableau de bord',
    kilometers: 'Kilomètres',
    fuel: 'Dépenses d’essence',
    profile: 'Profil',
    workspace: 'Espace de travail',
    ready: 'Prêt quand vous l’êtes',
    deviceOnly: 'Vos données restent sur cet appareil',
    pocketCopilot: 'Votre copilote de poche',
    lessAdmin: 'Un peu moins d’administration.',
    paperTrail: 'Continuez votre route. Nous gardons vos traces.',
    overview: 'Aperçu',
    atAGlance: 'en un coup d’œil',
    workingForYou: 'Faites travailler vos kilomètres pour vous.',
    quietTax: 'De bons registres simplifient les impôts. Notez votre trajet pendant qu’il est frais.',
    addLog: 'Ajouter',
    distance: 'Distance',
    fuelUsed: 'Essence utilisée',
    fuelCost: 'Coût de l’essence',
    thisPeriod: 'pour cette période',
    fillUp: 'plein',
    fillUps: 'pleins',
    tracked: 'suivi pour cette période',
    recentActivity: 'Activité récente',
    latestLogs: 'Vos derniers registres',
    viewAll: 'Tout voir',
    noDrives: 'Aucun trajet enregistré',
    firstEntry: 'Votre première entrée prend moins d’une minute. Ajoutez le trajet que vous venez de terminer.',
    addFirst: 'Ajouter mon premier registre',
    quickNote: 'note rapide',
    hey: 'Bonjour',
    smallEntries: 'Chaque entrée compte.',
    photoTip: 'Une photo de votre odomètre ou reçu maintenant évite de fouiller votre pellicule plus tard.',
    tunePreferences: 'Préférences',
    periodDay: 'Jour',
    periodWeek: 'Semaine',
    periodMonth: 'Mois',
    periodYear: 'Année',
    today: 'Aujourd’hui',
    everyStop: 'Chaque arrêt, bien comptabilisé',
    yourKilometers: 'Vos kilomètres',
    yourGas: 'Vos dépenses d’essence',
    storedOnDevice: 'enregistrés sur cet appareil.',
    entries: 'entrées',
    entry: 'entrée',
    searchKilometers: 'Rechercher une plateforme ou une note...',
    searchFuel: 'Rechercher une station, plateforme ou note...',
    all: 'Tous',
    uber: 'Uber',
    lyft: 'Lyft',
    both: 'Les deux',
    personal: 'Personnel',
    noMatching: 'Aucun résultat',
    tryFilter: 'Essayez une autre recherche ou un autre filtre.',
    readyToLogKm: 'Votre registre de kilomètres est prêt',
    readyToLogFuel: 'Votre registre d’essence est prêt',
    startTrip: 'Commencez avec le trajet que vous venez de terminer. Chaque détail restera à portée de main.',
    startFuel: 'Enregistrez votre prochain plein pendant que le reçu est encore dans votre main.',
    noPhotos: 'Aucune photo jointe',
    photosAttached: 'Photos jointes',
    unlabeledStop: 'Arrêt sans nom',
    addKilometers: 'Noter les kilomètres',
    addFuel: 'Noter une dépense',
    editLog: 'Modifier ce registre',
    addALog: 'Ajouter un registre',
    date: 'Date',
    platform: 'Plateforme',
    odometerReading: 'Lecture de l’odomètre',
    start: 'Début',
    end: 'Fin',
    kmLogged: 'km enregistrés',
    endGreater: 'La lecture finale doit être supérieure au début',
    fuelAdded: 'Essence ajoutée · litres',
    fuelCostLabel: 'Coût de l’essence',
    station: 'Station ou lieu (facultatif)',
    notes: 'Notes (facultatif)',
    notesPlaceholder: 'Un détail à retenir...',
    odometerPhoto: 'Photo de l’odomètre',
    receiptPhoto: 'Photo du reçu d’essence',
    tapPhoto: 'Touchez pour ajouter une photo',
    cameraLibrary: 'Caméra ou galerie',
    cancel: 'Annuler',
    saveLog: 'Enregistrer',
    saveChanges: 'Enregistrer les changements',
    logSaved: 'Registre enregistré',
    logUpdated: 'Registre mis à jour',
    logDeleted: 'Registre supprimé',
    deleteLog: 'Supprimer ce registre? Cette action est irréversible.',
    profileIntro: 'Gardez votre profil, votre voiture et vos préférences au même endroit.',
    driverProfile: 'Profil du conducteur',
    yourName: 'Votre nom',
    namePlaceholder: 'Comment devons-nous vous saluer?',
    vehicle: 'Véhicule',
    carYear: 'Année',
    carMake: 'Marque',
    carModel: 'Modèle',
    carColor: 'Couleur',
    licensePlate: 'Plaque d’immatriculation',
    vehiclePlaceholder: 'ex. Toyota',
    platformTitle: 'Plateformes de conduite',
    platformHelp: 'Sélectionnez les plateformes avec lesquelles vous conduisez.',
    appLanguage: 'Langue de l’application',
    english: 'English',
    french: 'Français',
    distanceUnit: 'Unité de distance',
    kilometres: 'Kilomètres',
    miles: 'Milles',
    currencyFuel: 'Devise pour l’essence',
    canadianDollar: 'Dollar canadien',
    usDollar: 'Dollar américain',
    savePreferences: 'Enregistrer les préférences',
    preferencesSaved: 'Préférences enregistrées',
    yourData: 'Vos données',
    exportBackup: 'Exporter une sauvegarde',
    exportText: 'Téléchargez vos registres et préférences en JSON.',
    exportDownloaded: 'Export téléchargé',
    resetData: 'Réinitialiser les données',
    resetText: 'Supprime définitivement tous les registres de cet appareil.',
    resetConfirm: 'Réinitialiser Driver Logbook? Tous les registres et préférences de cet appareil seront supprimés.',
    resetDone: 'Toutes les données locales ont été réinitialisées',
    privateByDefault: 'Privé par défaut · aucun compte ni nuage requis',
    drive: 'trajet',
    drives: 'trajets',
    fuelRecorded: 'coût d’essence enregistré',
    litres: 'L',
    noStation: '—',
    wrongTurn: '404 / mauvaise route',
    roadEnds: 'Cette route s’arrête ici.',
    backOverview: 'Retour à l’aperçu',
    unitKm: 'km',
    unitMi: 'mi',
  },
};

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function useSettings() {
  const [stored, setStored] = useStored<Partial<Settings>>(SETTINGS_KEY, defaultSettings);
  const settings: Settings = {
    ...defaultSettings,
    ...stored,
    platforms: Array.isArray(stored.platforms) && stored.platforms.length > 0 ? stored.platforms : defaultSettings.platforms,
    language: stored.language === 'fr' ? 'fr' : 'en',
  };
  return [settings, setStored] as const;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(value: number, currency: Currency, language: Language) {
  return new Intl.NumberFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency,
  }).format(value);
}

function displayDistance(km: number, unit: Unit) {
  return unit === 'mi' ? km * 0.621371 : km;
}

function formatDistance(km: number, unit: Unit, language: Language) {
  const value = displayDistance(km, unit).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA', {
    maximumFractionDigits: 1,
  });
  return `${value} ${unit}`;
}

function dateLabel(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function monthLabel(language: Language) {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-[14px] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-[3px_3px_0_hsl(var(--primary))]">
        <CarFront size={21} strokeWidth={2.3} />
      </div>
      {!compact && (
        <div>
          <p className="display-font text-[17px] font-extrabold leading-none text-[hsl(var(--sidebar-foreground))]">
            Driver<span className="text-[hsl(var(--accent))]">Logbook</span>
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[.22em] text-[hsl(var(--sidebar-foreground)/.55)]">
            Your pocket co-pilot
          </p>
        </div>
      )}
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
        active
          ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]'
          : mobile
            ? 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
            : 'text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-accent)/.7)] hover:text-[hsl(var(--sidebar-foreground))]'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
      <span>{label}</span>
      {active && <span className="ml-auto size-1.5 rounded-full bg-[hsl(var(--accent))]" />}
    </Link>
  );
}

function Shell({ children, settings }: { children: ReactNode; settings: Settings }) {
  const [location] = useLocation();
  const c = copy[settings.language];
  const page = location.startsWith('/kilometers') || location === '/log' ? c.kilometers : location.startsWith('/fuel') ? c.fuel : location.startsWith('/profile') || location.startsWith('/settings') ? c.profile : c.dashboard;
  const initial = settings.driverName.trim().slice(0, 1).toUpperCase() || 'D';
  const links = [
    { href: '/', label: c.dashboard, icon: LayoutDashboard },
    { href: '/kilometers', label: c.kilometers, icon: Gauge },
    { href: '/fuel', label: c.fuel, icon: Fuel },
    { href: '/profile', label: c.profile, icon: SettingsIcon },
  ];
  return (
    <div className="app-shell flex">
      <aside className="hidden w-[244px] shrink-0 flex-col bg-[hsl(var(--sidebar))] px-4 py-5 md:flex">
        <div className="px-2"><AppLogo /></div>
        <div className="mt-12 flex flex-1 flex-col gap-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.35)]">{c.workspace}</p>
          {links.map((link) => <NavItem key={link.href} {...link} active={page === link.label} />)}
        </div>
        <div className="rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.55)] p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent))]"><CircleHelp size={17} /></div>
          <p className="text-xs font-bold text-[hsl(var(--sidebar-foreground))]">{c.lessAdmin}</p>
          <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--sidebar-foreground)/.55)]">{c.paperTrail}</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] px-5 backdrop-blur md:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Driver Logbook</p>
            <h1 className="display-font mt-1 text-xl font-extrabold text-[hsl(var(--foreground))]">{page}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[hsl(var(--foreground))]">{c.ready}</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{c.deviceOnly}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-sm font-extrabold text-[hsl(var(--primary))]">{initial}</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1240px] px-5 py-7 md:px-10 md:py-10">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[72px] items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.96)] px-2 backdrop-blur md:hidden">
        {links.map((link) => <NavItem key={link.href} {...link} active={page === link.label} mobile />)}
      </nav>
    </div>
  );
}

function EmptyState({
  title,
  body,
  buttonLabel,
  onAdd,
}: {
  title: string;
  body: string;
  buttonLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="soft-grid flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/.25)] text-[hsl(var(--primary))]"><Gauge size={23} /></div>
      <h3 className="display-font text-lg font-extrabold text-[hsl(var(--foreground))]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p>
      {onAdd && buttonLabel && <button onClick={onAdd} data-testid="button-empty-add-log" className="press mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_4px_0_hsl(var(--primary)/.2)]"><Plus size={16} /> {buttonLabel}</button>}
    </div>
  );
}

function rangeStart(range: Range) {
  const date = new Date();
  if (range === 'day') return date.toISOString().slice(0, 10);
  if (range === 'week') {
    date.setDate(date.getDate() - 6);
  } else if (range === 'month') {
    date.setDate(1);
  } else {
    date.setMonth(0, 1);
  }
  return date.toISOString().slice(0, 10);
}

function Dashboard({ logs, settings }: { logs: LogEntry[]; settings: Settings }) {
  const [, setLocation] = useLocation();
  const c = copy[settings.language];
  const [range, setRange] = useState<Range>('month');
  const start = rangeStart(range);
  const current = logs.filter((log) => log.date >= start && log.date <= today());
  const km = current.reduce((sum, log) => sum + log.distanceKm, 0);
  const fuel = current.reduce((sum, log) => sum + log.fuelLiters, 0);
  const cost = current.reduce((sum, log) => sum + log.fuelCost, 0);
  const recent = [...current].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const firstName = settings.driverName.trim().split(' ')[0] || (settings.language === 'fr' ? 'Conducteur' : 'Driver');
  const rangeLabels: Record<Range, string> = { day: c.periodDay, week: c.periodWeek, month: c.periodMonth, year: c.periodYear };
  return (
    <div className="space-y-8">
      <section className="fade-up flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mono-font text-xs font-medium text-[hsl(var(--muted-foreground))]">{monthLabel(settings.language)} / {c.atAGlance}</p>
          <h2 className="display-font mt-2 max-w-xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[.98] text-[hsl(var(--foreground))]">{c.workingForYou.split(' ').slice(0, 3).join(' ')}<br /><span className="text-[hsl(166_38%_42%)]">{c.workingForYou.split(' ').slice(3).join(' ')}</span></h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{c.quietTax}</p>
        </div>
        <button onClick={() => setLocation('/kilometers?new=1')} data-testid="button-add-log-dashboard" className="press group flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_4px_0_hsl(var(--primary)/.25)]"><Plus size={18} className="transition-transform group-hover:rotate-90" /> {c.addLog} <ArrowRight size={16} /></button>
      </section>
      <section className="fade-up flex flex-wrap items-center gap-2">
        {(Object.keys(rangeLabels) as Range[]).map((item) => <button key={item} onClick={() => setRange(item)} data-testid={`button-range-${item}`} className={`press rounded-full px-4 py-2 text-xs font-bold transition-colors ${range === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'}`}>{rangeLabels[item]}</button>)}
        <span className="ml-1 text-xs text-[hsl(var(--muted-foreground))]">{range === 'day' ? c.today : c.thisPeriod}</span>
      </section>
      <section className="fade-up fade-up-delay-1 grid gap-3 sm:grid-cols-3">
        <StatCard label={c.distance} value={formatDistance(km, settings.unit, settings.language)} helper={c.thisPeriod} icon={BarChart3} />
        <StatCard label={c.fuelUsed} value={`${fuel.toLocaleString(settings.language === 'fr' ? 'fr-CA' : 'en-CA', { maximumFractionDigits: 1 })} L`} helper={`${current.length} ${current.length === 1 ? c.fillUp : c.fillUps}`} icon={Fuel} tone="gold" />
        <StatCard label={c.fuelCost} value={formatMoney(cost, settings.currency, settings.language)} helper={c.tracked} icon={DollarSign} tone="mint" />
      </section>
      <section className="fade-up fade-up-delay-2 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{c.recentActivity}</p><h3 className="display-font mt-1 text-xl font-extrabold">{c.latestLogs}</h3></div><Link href="/kilometers" data-testid="link-view-all-logs" className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:text-[hsl(166_38%_42%)]">{c.viewAll} <ArrowRight size={14} /></Link></div>
          {recent.length === 0 ? <EmptyState title={c.noDrives} body={c.firstEntry} buttonLabel={c.addFirst} onAdd={() => setLocation('/kilometers?new=1')} /> : <div className="space-y-2">{recent.map((log) => <LogRow key={log.id} log={log} settings={settings} onClick={() => setLocation(`/kilometers?view=${log.id}`)} />)}</div>}
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]"><div className="relative z-10"><div className="mb-8 flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent))]"><Zap size={20} /></div><span className="mono-font text-[10px] uppercase tracking-[.18em] opacity-45">{c.quickNote}</span></div><p className="display-font text-2xl font-extrabold leading-tight">{c.hey}, {firstName}.<br />{c.smallEntries}</p><p className="mt-3 text-sm leading-6 opacity-65">{c.photoTip}</p><Link href="/profile" data-testid="link-dashboard-profile" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))]">{c.tunePreferences} <ArrowRight size={14} /></Link></div><div className="absolute -bottom-14 -right-10 size-52 rounded-full border-[32px] border-[hsl(var(--accent)/.12)]" /><div className="absolute -right-1 top-20 size-20 rounded-full border border-[hsl(var(--accent)/.18)]" /></div>
      </section>
    </div>
  );
}

function StatCard({ label, value, helper, icon: Icon, tone = 'dark' }: { label: string; value: string; helper: string; icon: typeof Gauge; tone?: 'dark' | 'gold' | 'mint' }) {
  const styles = tone === 'gold' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--primary))]' : tone === 'mint' ? 'bg-[hsl(166_38%_42%)] text-[hsl(40_35%_96%)]' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]';
  return <div className={`relative overflow-hidden rounded-2xl p-5 ${styles}`} data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-start justify-between"><p className="text-[11px] font-bold uppercase tracking-[.14em] opacity-65">{label}</p><Icon size={19} strokeWidth={1.8} className="opacity-70" /></div><p className="display-font mt-7 text-[30px] font-extrabold tracking-[-.06em]">{value}</p><p className="mt-1 text-xs font-medium opacity-65">{helper}</p><div className="absolute -bottom-8 -right-5 size-28 rounded-full border-[18px] border-current opacity-[.07]" /></div>;
}

function LogRow({ log, settings, onClick }: { log: LogEntry; settings: Settings; onClick: () => void }) {
  const c = copy[settings.language];
  return <button onClick={onClick} data-testid={`row-log-${log.id}`} className="press group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--background))]"><div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><span className="text-[10px] font-bold uppercase">{new Intl.DateTimeFormat(settings.language === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short' }).format(new Date(`${log.date}T12:00:00`))}</span><span className="display-font text-lg font-extrabold leading-4">{new Date(`${log.date}T12:00:00`).getDate()}</span></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[hsl(var(--foreground))]">{log.station || log.platform} <span className="ml-1 rounded-md bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{log.platform}</span></p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{formatDistance(log.distanceKm, settings.unit, settings.language)} · {log.fuelLiters} {c.litres}</p></div><div className="text-right"><p className="mono-font text-sm font-medium text-[hsl(var(--foreground))]">{formatMoney(log.fuelCost, settings.currency, settings.language)}</p><ArrowRight size={14} className="ml-auto mt-1 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" /></div></button>;
}

function PhotoPicker({ label, value, onChange, icon: Icon, c }: { label: string; value?: string; onChange: (value?: string) => void; icon: typeof Gauge; c: Copy }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  return <div><p className="mb-2 text-xs font-bold text-[hsl(var(--foreground))]">{label}</p>{value ? <div className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]"><img src={value} alt={label} className="h-28 w-full object-cover" /><button type="button" onClick={() => onChange(undefined)} data-testid={`button-remove-${label.toLowerCase().replaceAll(' ', '-')}`} className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.85)] text-white"><X size={14} /></button></div> : <button type="button" onClick={() => inputRef.current?.click()} data-testid={`button-upload-${label.toLowerCase().replaceAll(' ', '-')}`} className="press flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"><Icon size={22} strokeWidth={1.7} /><span className="text-[11px] font-bold">{c.tapPhoto}</span><span className="text-[10px]">{c.cameraLibrary}</span></button>}<input ref={inputRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => handleFile(event.target.files?.[0])} /></div>;
}

const emptyForm = { date: today(), startOdometer: '', endOdometer: '', fuelLiters: '', fuelCost: '', station: '', platform: 'Uber' as Platform, notes: '', odometerPhoto: undefined as string | undefined, receiptPhoto: undefined as string | undefined };

function LogForm({ initial, mode, onSave, onCancel, settings }: { initial?: LogEntry; mode: LogMode; onSave: (log: LogEntry) => void; onCancel: () => void; settings: Settings }) {
  const c = copy[settings.language];
  const [form, setForm] = useState(() => initial ? { date: initial.date, startOdometer: String(initial.startOdometer || ''), endOdometer: String(initial.endOdometer || ''), fuelLiters: String(initial.fuelLiters || ''), fuelCost: String(initial.fuelCost || ''), station: initial.station, platform: initial.platform, notes: initial.notes, odometerPhoto: initial.odometerPhoto, receiptPhoto: initial.receiptPhoto } : emptyForm);
  const set = (key: keyof typeof form, value: string | undefined) => setForm((current) => ({ ...current, [key]: value }));
  const distance = Math.max(0, (Number(form.endOdometer) || 0) - (Number(form.startOdometer) || 0));
  const valid = Boolean(form.date && (mode === 'kilometers' ? Number(form.endOdometer) >= Number(form.startOdometer) && Number(form.endOdometer) > 0 : Number(form.fuelLiters) > 0 || Number(form.fuelCost) > 0));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSave({ id: initial?.id || makeId(), date: form.date, startOdometer: mode === 'kilometers' ? Number(form.startOdometer) : initial?.startOdometer || 0, endOdometer: mode === 'kilometers' ? Number(form.endOdometer) : initial?.endOdometer || 0, distanceKm: mode === 'kilometers' ? distance : initial?.distanceKm || 0, fuelLiters: mode === 'fuel' ? Number(form.fuelLiters) || 0 : initial?.fuelLiters || 0, fuelCost: mode === 'fuel' ? Number(form.fuelCost) || 0 : initial?.fuelCost || 0, station: mode === 'fuel' ? form.station.trim() : initial?.station || '', platform: form.platform, notes: form.notes.trim(), odometerPhoto: mode === 'kilometers' ? form.odometerPhoto : initial?.odometerPhoto, receiptPhoto: mode === 'fuel' ? form.receiptPhoto : initial?.receiptPhoto, createdAt: initial?.createdAt || new Date().toISOString() });
  };
  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2"><Field label={c.date}><input data-testid="input-log-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field><Field label={c.platform}><select data-testid="select-log-platform" value={form.platform} onChange={(e) => set('platform', e.target.value)}>{(['Uber', 'Lyft', 'Both', 'Personal'] as Platform[]).map((item) => <option key={item}>{item}</option>)}</select></Field></div>
    {mode === 'kilometers' ? <><div><p className="mb-2 text-xs font-bold text-[hsl(var(--foreground))]">{c.odometerReading} <span className="font-normal text-[hsl(var(--muted-foreground))]">· {settings.unit}</span></p><div className="grid grid-cols-2 gap-3"><Field label={c.start}><input data-testid="input-start-odometer" inputMode="decimal" type="number" min="0" step="0.1" placeholder="12,480" value={form.startOdometer} onChange={(e) => set('startOdometer', e.target.value)} /></Field><Field label={c.end}><input data-testid="input-end-odometer" inputMode="decimal" type="number" min="0" step="0.1" placeholder="12,532" value={form.endOdometer} onChange={(e) => set('endOdometer', e.target.value)} /></Field></div>{form.endOdometer && <p className={`mt-2 text-xs font-bold ${valid ? 'text-[hsl(166_38%_42%)]' : 'text-[hsl(var(--destructive))]'}`}>{valid ? `${distance.toLocaleString()} ${c.kmLogged}` : c.endGreater}</p>}</div><PhotoPicker label={c.odometerPhoto} value={form.odometerPhoto} onChange={(value) => set('odometerPhoto', value)} icon={Gauge} c={c} /></> : <><div className="grid gap-4 sm:grid-cols-2"><Field label={c.fuelAdded}><input data-testid="input-fuel-liters" inputMode="decimal" type="number" min="0" step="0.01" placeholder="42.5" value={form.fuelLiters} onChange={(e) => set('fuelLiters', e.target.value)} /></Field><Field label={c.fuelCostLabel}><input data-testid="input-fuel-cost" inputMode="decimal" type="number" min="0" step="0.01" placeholder="78.40" value={form.fuelCost} onChange={(e) => set('fuelCost', e.target.value)} /></Field></div><Field label={c.station}><input data-testid="input-station" placeholder="Petro-Canada · Main & 4th" value={form.station} onChange={(e) => set('station', e.target.value)} /></Field><PhotoPicker label={c.receiptPhoto} value={form.receiptPhoto} onChange={(value) => set('receiptPhoto', value)} icon={Receipt} c={c} /></>}
    <Field label={c.notes}><textarea data-testid="input-log-notes" rows={3} placeholder={c.notesPlaceholder} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
    <div className="flex gap-3 border-t border-[hsl(var(--border))] pt-5"><button type="button" onClick={onCancel} data-testid="button-cancel-log" className="press flex-1 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))]">{c.cancel}</button><button type="submit" disabled={!valid} data-testid="button-save-log" className="press flex-[1.5] rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:cursor-not-allowed disabled:opacity-40">{initial ? c.saveChanges : c.saveLog}</button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-bold text-[hsl(var(--muted-foreground))]">{label}<div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[hsl(var(--input))] [&_input]:bg-[hsl(var(--background))] [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:font-medium [&_input]:text-[hsl(var(--foreground))] [&_input]:outline-none [&_input]:transition-colors [&_input]:focus:border-[hsl(var(--primary))] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[hsl(var(--input))] [&_select]:bg-[hsl(var(--background))] [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[hsl(var(--foreground))] [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[hsl(var(--input))] [&_textarea]:bg-[hsl(var(--background))] [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:text-[hsl(var(--foreground))] [&_textarea]:outline-none [&_textarea]:focus:border-[hsl(var(--primary))]">{children}</div></label>;
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--primary)/.48)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true"><div className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl sm:rounded-[24px] sm:p-7 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}><div className="mb-6 flex items-start justify-between"><div><p className="mono-font text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Driver Logbook</p><h2 className="display-font mt-1 text-2xl font-extrabold">{title}</h2></div><button onClick={onClose} data-testid="button-close-modal" className="press flex size-9 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><X size={17} /></button></div>{children}</div></div>;
}

function Detail({ log, settings, mode, onEdit, onDelete, onClose }: { log: LogEntry; settings: Settings; mode: LogMode; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const c = copy[settings.language];
  return <Modal title={dateLabel(log.date, settings.language)} onClose={onClose} wide><div className="grid gap-6 sm:grid-cols-[1fr_1fr]"><div><div className="rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]"><div className="flex items-center justify-between"><span className="rounded-lg bg-[hsl(var(--accent)/.2)] px-2.5 py-1 text-[11px] font-bold text-[hsl(var(--accent))]">{log.platform}</span><span className="mono-font text-xs opacity-60">{mode === 'kilometers' ? formatDistance(log.distanceKm, settings.unit, settings.language) : `${log.fuelLiters} ${c.litres}`}</span></div><p className="display-font mt-7 text-4xl font-extrabold">{mode === 'kilometers' ? formatDistance(log.distanceKm, settings.unit, settings.language) : formatMoney(log.fuelCost, settings.currency, settings.language)}</p><p className="mt-1 text-xs opacity-60">{mode === 'kilometers' ? c.distance : c.fuelRecorded}</p></div><div className="mt-4 grid grid-cols-2 gap-2">{mode === 'kilometers' ? <><DetailStat label={c.start} value={log.startOdometer.toLocaleString()} /><DetailStat label={c.end} value={log.endOdometer.toLocaleString()} /></> : <><DetailStat label={c.fuelAdded} value={`${log.fuelLiters} ${c.litres}`} /><DetailStat label={c.station} value={log.station || c.noStation} /></>}</div></div><div className="space-y-3">{log.notes && <div className="rounded-xl bg-[hsl(var(--secondary))] p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{c.notes}</p><p className="mt-2 text-sm leading-6">{log.notes}</p></div>}{(mode === 'kilometers' ? log.odometerPhoto : log.receiptPhoto) ? <img src={(mode === 'kilometers' ? log.odometerPhoto : log.receiptPhoto) as string} alt={mode === 'kilometers' ? c.odometerPhoto : c.receiptPhoto} className="h-40 w-full rounded-xl object-cover" /> : <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] text-center text-xs text-[hsl(var(--muted-foreground))]"><FileImage size={20} className="mb-2 opacity-60" />{c.noPhotos}</div>}<div className="flex gap-2 pt-2"><button onClick={onEdit} data-testid="button-edit-log-detail" className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))]"><Pencil size={14} /> {c.editLog}</button><button onClick={onDelete} data-testid="button-delete-log-detail" className="press flex size-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--destructive))]"><Trash2 size={16} /></button></div></div></div></Modal>;
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{label}</p><p className="mt-1 truncate text-sm font-bold">{value}</p></div>;
}

function Logbook({ logs, settings, updateLogs, mode }: { logs: LogEntry[]; settings: Settings; updateLogs: (logs: LogEntry[]) => void; mode: LogMode }) {
  const [location, setLocation] = useLocation();
  const c = copy[settings.language];
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<'All' | Platform>('All');
  const [modal, setModal] = useState<'new' | 'edit' | 'detail' | null>(null);
  const [selected, setSelected] = useState<LogEntry | undefined>();
  const [flash, setFlash] = useState('');
  const matchingMode = useMemo(() => logs.filter((log) => mode === 'kilometers' ? log.distanceKm > 0 : log.fuelLiters > 0 || log.fuelCost > 0), [logs, mode]);
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const viewId = params.get('view');
    if (params.get('new') === '1') setModal('new');
    if (viewId) { setSelected(logs.find((log) => log.id === viewId)); setModal('detail'); }
  }, [location, logs]);
  const filtered = useMemo(() => [...matchingMode].sort((a, b) => b.date.localeCompare(a.date)).filter((log) => (platform === 'All' || log.platform === platform) && `${log.station} ${log.platform} ${log.notes}`.toLowerCase().includes(query.toLowerCase())), [matchingMode, platform, query]);
  const close = () => { setModal(null); setSelected(undefined); if (location.includes('?')) setLocation(mode === 'kilometers' ? '/kilometers' : '/fuel'); };
  const save = (entry: LogEntry) => { updateLogs(logs.some((log) => log.id === entry.id) ? logs.map((log) => log.id === entry.id ? entry : log) : [entry, ...logs]); setFlash(logs.some((log) => log.id === entry.id) ? c.logUpdated : c.logSaved); close(); window.setTimeout(() => setFlash(''), 2200); };
  const deleteLog = (entry: LogEntry) => { if (!window.confirm(c.deleteLog)) return; updateLogs(logs.filter((log) => log.id !== entry.id)); setFlash(c.logDeleted); close(); window.setTimeout(() => setFlash(''), 2200); };
  const isKm = mode === 'kilometers';
  return <div className="space-y-7">
    <section className="fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mono-font text-xs text-[hsl(var(--muted-foreground))]">{c.everyStop}</p><h2 className="display-font mt-2 text-3xl font-extrabold">{isKm ? c.yourKilometers : c.yourGas}</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{matchingMode.length} {matchingMode.length === 1 ? c.entry : c.entries} {c.storedOnDevice}</p></div><button onClick={() => setModal('new')} data-testid={`button-add-${mode}`} className="press flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><Plus size={17} /> {isKm ? c.addKilometers : c.addFuel}</button></section>
    {flash && <div data-testid="status-log-feedback" className="fade-up fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-lg md:bottom-7"><Check size={15} className="text-[hsl(var(--accent))]" />{flash}</div>}
    <section className="fade-up fade-up-delay-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-3.5 text-[hsl(var(--muted-foreground))]" /><input data-testid={`input-search-${mode}`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isKm ? c.searchKilometers : c.searchFuel} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] py-3 pl-10 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label><div className="relative"><select data-testid={`select-filter-${mode}`} value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} className="w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] py-3 pl-3 pr-9 text-sm font-semibold outline-none md:w-40"><option value="All">{c.all}</option><option>Uber</option><option>Lyft</option><option>Both</option><option>Personal</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]\" /></div></div></section>
    <section className="fade-up fade-up-delay-2">{filtered.length === 0 ? <EmptyState title={matchingMode.length ? c.noMatching : (isKm ? c.readyToLogKm : c.readyToLogFuel)} body={matchingMode.length ? c.tryFilter : (isKm ? c.startTrip : c.startFuel)} buttonLabel={matchingMode.length ? undefined : (isKm ? c.addKilometers : c.addFuel)} onAdd={matchingMode.length ? undefined : () => setModal('new')} /> : <div className="space-y-2">{filtered.map((log) => <div key={log.id} className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-shadow hover:shadow-md"><div className="flex items-center gap-3"><button onClick={() => { setSelected(log); setModal('detail'); }} data-testid={`button-view-log-${log.id}`} className="flex min-w-0 flex-1 items-center gap-3 text-left"><div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><span className="text-[10px] font-bold uppercase">{new Intl.DateTimeFormat(settings.language === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short' }).format(new Date(`${log.date}T12:00:00`))}</span><span className="display-font text-lg font-extrabold leading-4">{new Date(`${log.date}T12:00:00`).getDate()}</span></div><div className="min-w-0"><p className="truncate text-sm font-bold">{isKm ? `${formatDistance(log.distanceKm, settings.unit, settings.language)}` : (log.station || c.unlabeledStop)}</p><p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{log.platform} · {isKm ? formatDistance(log.distanceKm, settings.unit, settings.language) : `${log.fuelLiters} ${c.litres}`}</p></div></button><div className="hidden text-right sm:block"><p className="mono-font text-sm font-medium">{isKm ? `${log.startOdometer.toLocaleString()} → ${log.endOdometer.toLocaleString()}` : formatMoney(log.fuelCost, settings.currency, settings.language)}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{isKm ? (log.odometerPhoto ? c.photosAttached : c.noPhotos) : (log.receiptPhoto ? c.photosAttached : c.noPhotos)}</p></div><button onClick={() => { setSelected(log); setModal('edit'); }} data-testid={`button-edit-log-${log.id}`} className="press flex size-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]"><Pencil size={15} /></button><button onClick={() => deleteLog(log)} data-testid={`button-delete-log-${log.id}`} className="press flex size-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(5_63%_52%/.1)] hover:text-[hsl(var(--destructive))]"><Trash2 size={15} /></button></div></div>)}</div>}</section>
    {modal === 'new' && <Modal title={isKm ? c.addKilometers : c.addFuel} onClose={close}><LogForm mode={mode} settings={settings} onSave={save} onCancel={close} /></Modal>}{modal === 'edit' && selected && <Modal title={c.editLog} onClose={close}><LogForm mode={mode} settings={settings} initial={selected} onSave={save} onCancel={close} /></Modal>}{modal === 'detail' && selected && <Detail log={selected} settings={settings} mode={mode} onEdit={() => setModal('edit')} onDelete={() => deleteLog(selected)} onClose={close} />}
  </div>;
}

function ProfilePage({ settings, updateSettings, logs, updateLogs }: { settings: Settings; updateSettings: (settings: Settings) => void; logs: LogEntry[]; updateLogs: (logs: LogEntry[]) => void }) {
  const c = copy[settings.language];
  const [draft, setDraft] = useState(settings);
  const [flash, setFlash] = useState('');
  useEffect(() => setDraft(settings), [settings]);
  const save = () => { updateSettings(draft); setFlash(copy[draft.language].preferencesSaved); window.setTimeout(() => setFlash(''), 2200); };
  const exportData = () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings, logs }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `driver-logbook-${today()}.json`; link.click(); URL.revokeObjectURL(url); setFlash(c.exportDownloaded); window.setTimeout(() => setFlash(''), 2200); };
  const reset = () => { if (window.confirm(c.resetConfirm)) { updateLogs([]); updateSettings(defaultSettings); setDraft(defaultSettings); setFlash(c.resetDone); window.setTimeout(() => setFlash(''), 2200); } };
  const togglePlatform = (platform: 'Uber' | 'Lyft') => setDraft({ ...draft, platforms: draft.platforms.includes(platform) ? draft.platforms.filter((item) => item !== platform) : [...draft.platforms, platform] });
  return <div className="mx-auto max-w-3xl space-y-7">
    <section className="fade-up"><p className="mono-font text-xs text-[hsl(var(--muted-foreground))]">{c.profile}</p><h2 className="display-font mt-2 text-3xl font-extrabold">{c.profile}</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{c.profileIntro}</p></section>
    {flash && <div data-testid="status-profile-feedback" className="fade-up fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-lg md:bottom-7"><Check size={15} className="text-[hsl(var(--accent))]" />{flash}</div>}
    <section className="fade-up fade-up-delay-1 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] px-5 py-4"><p className="text-xs font-bold uppercase tracking-[.14em]">{c.driverProfile}</p></div><div className="space-y-5 p-5 md:p-6"><Field label={c.yourName}><input data-testid="input-driver-name" value={draft.driverName} placeholder={c.namePlaceholder} onChange={(e) => setDraft({ ...draft, driverName: e.target.value })} /></Field><div><p className="mb-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">{c.vehicle}</p><div className="grid gap-4 sm:grid-cols-2"><Field label={c.carYear}><input data-testid="input-car-year" inputMode="numeric" value={draft.carYear} placeholder="2022" onChange={(e) => setDraft({ ...draft, carYear: e.target.value })} /></Field><Field label={c.carMake}><input data-testid="input-car-make" value={draft.carMake} placeholder={c.vehiclePlaceholder} onChange={(e) => setDraft({ ...draft, carMake: e.target.value })} /></Field><Field label={c.carModel}><input data-testid="input-car-model" value={draft.carModel} placeholder="Corolla" onChange={(e) => setDraft({ ...draft, carModel: e.target.value })} /></Field><Field label={c.carColor}><input data-testid="input-car-color" value={draft.carColor} placeholder="White" onChange={(e) => setDraft({ ...draft, carColor: e.target.value })} /></Field><Field label={c.licensePlate}><input data-testid="input-license-plate" value={draft.licensePlate} placeholder="ABC 123" onChange={(e) => setDraft({ ...draft, licensePlate: e.target.value })} /></Field></div></div><div><p className="mb-1 text-xs font-bold text-[hsl(var(--muted-foreground))]">{c.platformTitle}</p><p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">{c.platformHelp}</p><div className="grid grid-cols-2 gap-2">{(['Uber', 'Lyft'] as const).map((platform) => <button key={platform} type="button" onClick={() => togglePlatform(platform)} data-testid={`button-platform-${platform.toLowerCase()}`} className={`press rounded-xl border px-4 py-3 text-sm font-bold ${draft.platforms.includes(platform) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'}`}>{platform}<span className="mt-1 block text-[10px] font-medium opacity-65">{draft.platforms.includes(platform) ? c.both : c.personal}</span></button>)}</div></div><div><p className="mb-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">{c.appLanguage}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setDraft({ ...draft, language: 'en' })} data-testid="button-language-en" className={`press rounded-xl border px-4 py-3 text-sm font-bold ${draft.language === 'en' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'}`}>{c.english}</button><button type="button" onClick={() => setDraft({ ...draft, language: 'fr' })} data-testid="button-language-fr" className={`press rounded-xl border px-4 py-3 text-sm font-bold ${draft.language === 'fr' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'}`}>{c.french}</button></div></div><div className="grid gap-5 sm:grid-cols-2"><div><p className="mb-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">{c.distanceUnit}</p><div className="grid grid-cols-2 gap-2">{(['km', 'mi'] as Unit[]).map((unit) => <button key={unit} type="button" onClick={() => setDraft({ ...draft, unit })} data-testid={`button-unit-${unit}`} className={`press rounded-xl border px-4 py-3 text-sm font-bold ${draft.unit === unit ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'}`}>{unit === 'km' ? c.kilometres : c.miles}<span className="mt-1 block text-[10px] font-medium opacity-65">{unit}</span></button>)}</div></div><div><p className="mb-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">{c.currencyFuel}</p><div className="grid grid-cols-2 gap-2">{(['CAD', 'USD'] as Currency[]).map((currency) => <button key={currency} type="button" onClick={() => setDraft({ ...draft, currency })} data-testid={`button-currency-${currency.toLowerCase()}`} className={`press rounded-xl border px-4 py-3 text-sm font-bold ${draft.currency === currency ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'}`}>{currency}<span className="mt-1 block text-[10px] font-medium opacity-65">{currency === 'CAD' ? c.canadianDollar : c.usDollar}</span></button>)}</div></div></div><button onClick={save} data-testid="button-save-profile" className="press flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><Check size={16} /> {c.savePreferences}</button></div></section>
    <section className="fade-up fade-up-delay-2 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] px-5 py-4"><p className="text-xs font-bold uppercase tracking-[.14em]">{c.yourData}</p></div><div className="divide-y divide-[hsl(var(--border))]"><button onClick={exportData} data-testid="button-export-data" className="press flex w-full items-center gap-4 px-5 py-5 text-left hover:bg-[hsl(var(--background))]"><div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(166_38%_42%/.12)] text-[hsl(166_38%_42%)]"><Download size={18} /></div><div className="flex-1"><p className="text-sm font-bold">{c.exportBackup}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{c.exportText}</p></div><ArrowDownToLine size={17} className="text-[hsl(var(--muted-foreground))]" /></button><button onClick={reset} data-testid="button-reset-data" className="press flex w-full items-center gap-4 px-5 py-5 text-left hover:bg-[hsl(5_63%_52%/.05)]"><div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(5_63%_52%/.1)] text-[hsl(var(--destructive))]"><RotateCcw size={18} /></div><div className="flex-1"><p className="text-sm font-bold text-[hsl(var(--destructive))]">{c.resetData}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{c.resetText}</p></div><Trash2 size={17} className="text-[hsl(var(--destructive))]" /></button></div></section>
    <p className="flex items-center justify-center gap-2 pb-4 text-center text-[11px] text-[hsl(var(--muted-foreground))]"><Upload size={13} /> {c.privateByDefault}</p>
  </div>;
}

function NotFound({ settings }: { settings: Settings }) {
  const c = copy[settings.language];
  return <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center"><p className="mono-font text-xs text-[hsl(var(--muted-foreground))]">{c.wrongTurn}</p><h2 className="display-font mt-3 text-3xl font-extrabold">{c.roadEnds}</h2><Link href="/" data-testid="link-back-overview" className="mt-5 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">{c.backOverview}</Link></div>;
}

function Router() {
  const [logs, setLogs] = useStored<LogEntry[]>(LOGS_KEY, []);
  const [settings, setSettings] = useSettings();
  const updateSettings = (next: Settings) => setSettings(next);
  return <Shell settings={settings}><Switch><Route path="/"><Dashboard logs={logs} settings={settings} /></Route><Route path="/kilometers"><Logbook logs={logs} settings={settings} updateLogs={setLogs} mode="kilometers" /></Route><Route path="/log"><Logbook logs={logs} settings={settings} updateLogs={setLogs} mode="kilometers" /></Route><Route path="/fuel"><Logbook logs={logs} settings={settings} updateLogs={setLogs} mode="fuel" /></Route><Route path="/profile"><ProfilePage settings={settings} updateSettings={updateSettings} logs={logs} updateLogs={setLogs} /></Route><Route path="/settings"><ProfilePage settings={settings} updateSettings={updateSettings} logs={logs} updateLogs={setLogs} /></Route><Route component={() => <NotFound settings={settings} />} /></Switch></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;