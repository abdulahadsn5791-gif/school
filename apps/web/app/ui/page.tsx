'use client';

import { resolveTheme, useTheme, useThemeStore } from '@ecomerece/frontend/theme';
import {
  ActionSheet,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  Chip,
  ConfirmDialog,
  cn,
  Dropdown,
  EmptyState,
  ErrorState,
  Field,
  GroupedList,
  IconButton,
  IconRail,
  IconTile,
  Input,
  ListHeader,
  ListRow,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  SearchField,
  SegmentedControl,
  SegmentedMeter,
  Select,
  Sidebar,
  SidePanel,
  Slider,
  Spinner,
  StatusDot,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  ToastProvider,
  TopBar,
  useToast,
} from '@ecomerece/ui';
import {
  Bell,
  ChevronRight,
  Cloud,
  Cpu,
  Download,
  FileText,
  Home,
  Inbox,
  Link,
  Lock,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Package,
  PenLine,
  Settings,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Users,
  Wifi,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function UIGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function DemoCard({
  title,
  description,
  full,
  children,
}: {
  title: string;
  description?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      title={title}
      description={description}
      className={cn(full ? 'md:col-span-2' : undefined, 'min-h-[7rem] min-w-0')}
    >
      {children}
    </Card>
  );
}

function PhoneFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[320px] shrink-0 overflow-hidden rounded-[2rem] shadow-lg">
      <div className="bg-surface-2">
        <TopBar
          title={title}
          leading={
            <IconButton label="Back">
              <ChevronRight className="size-4 rotate-180" />
            </IconButton>
          }
          trailing={
            <IconButton label="More">
              <MoreHorizontal className="size-4" />
            </IconButton>
          }
        />
      </div>
      <div className="space-y-3 p-3">{children}</div>
      <div className="flex items-center justify-around bg-surface-1/95 px-2 py-2 glass:glass-surface">
        {[
          { icon: Home, label: 'Home', active: true },
          { icon: MessageCircle, label: 'Chat', active: false },
          { icon: Settings, label: 'Settings', active: false },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            className="flex flex-col items-center gap-1 text-[10px] font-medium"
          >
            <item.icon
              className={`size-5 ${item.active ? 'text-accent' : 'text-ink-3'}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ToastDemo() {
  const { push } = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => push({ message: 'System settings saved', tone: 'success' })}
    >
      Save all
    </Button>
  );
}

function SettingsDemo() {
  const [wifi, setWifi] = useState(true);
  const [airplane, setAirplane] = useState(false);
  return (
    <div className="space-y-3">
      <GroupedList inset>
        <ListRow
          icon={Wifi}
          iconTone="accent"
          title="Wi-Fi"
          description="OS Network · 2.4/5 GHz"
          trailing={<Switch checked={wifi} onCheckedChange={setWifi} label="Wi-Fi" />}
        />
        <ListRow
          icon={Smartphone}
          iconTone="success"
          title="Airplane mode"
          trailing={
            <Switch checked={airplane} onCheckedChange={setAirplane} label="Airplane mode" />
          }
        />
        <ListRow
          icon={Sun}
          title="Display"
          description="Adaptive brightness"
          trailing={<ChevronRight className="size-4 text-ink-3" />}
        />
        <ListRow
          icon={SlidersHorizontal}
          title="Sound & vibration"
          trailing={<ChevronRight className="size-4 text-ink-3" />}
        />
        <ListRow
          icon={Moon}
          title="Dark colours"
          description="Follows system"
          trailing={<ChevronRight className="size-4 text-ink-3" />}
        />
        <ListRow
          icon={Smartphone}
          title="About phone"
          trailing={<Badge tone="accent">PICKLE OS</Badge>}
        />
      </GroupedList>
      <ToastDemo />
    </div>
  );
}

function ControlsShowcase() {
  const [seg, setSeg] = useState<'bright' | 'auto' | 'eco'>('auto');
  const [vol, setVol] = useState(62);
  const [sw, setSw] = useState(true);
  const [cb, setCb] = useState(true);
  const [cb2, setCb2] = useState(false);
  const [rad, setRad] = useState('wifi');

  return (
    <UIGrid>
      <DemoCard title="Buttons" full description="Primary, secondary, ghost, danger, loading.">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm">
            Primary
          </Button>
          <Button size="md">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button isLoading loadingText="Saving">
            Save
          </Button>
          <Button disabled>Disabled</Button>
          <IconButton label="Upload">
            <Upload className="size-4" />
          </IconButton>
        </div>
      </DemoCard>

      <DemoCard title="Segmented control" description="Single-choice pill. Keyboard accessible.">
        <SegmentedControl
          aria-label="Colour profile"
          value={seg}
          onChange={setSeg}
          options={[
            { label: 'Bright', value: 'bright' },
            { label: 'Auto', value: 'auto' },
            { label: 'Eco', value: 'eco' },
          ]}
        />
      </DemoCard>

      <DemoCard title="Slider" description="Live value readout.">
        <Slider label="Volume" showValue value={vol} onValueChange={setVol} max={100} />
      </DemoCard>

      <DemoCard title="Switch / Checkbox / Radio" description="Selection controls, one row each.">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Switch checked={sw} onCheckedChange={setSw} label="Bluetooth" />
          <Switch checked={false} disabled label="NFC" onCheckedChange={() => {}} />
          <Checkbox checked={cb} onCheckedChange={setCb} label="Night standby" />
          <Checkbox checked={cb2} indeterminate onCheckedChange={setCb2} label="Doze apps" />
          <Radio
            checked={rad === 'wifi'}
            onCheckedChange={() => setRad('wifi')}
            label="Wi-Fi preferred"
          />
          <Radio
            checked={rad === 'data'}
            onCheckedChange={() => setRad('data')}
            label="Mobile data"
          />
        </div>
      </DemoCard>
    </UIGrid>
  );
}

function FormShowcase() {
  const [q, setQ] = useState('');
  return (
    <UIGrid>
      <DemoCard
        title="Text inputs"
        full
        description="Text, email with validation state, password, search."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" hint="Full name as shown on device">
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field label="Email" error="Enter a valid email">
            <Input type="email" defaultValue="ada@example" invalid placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <Input type="password" placeholder="••••••••" />
          </Field>
          <Field label="Search">
            <SearchField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onClear={() => setQ('')}
              placeholder="Search settings"
            />
          </Field>
        </div>
      </DemoCard>

      <DemoCard title="Select" description="Native select control.">
        <Select defaultValue="ntsc">
          <option value="ntsc">NTSC · 60 Hz</option>
          <option value="pal">PAL · 50 Hz</option>
        </Select>
      </DemoCard>

      <DemoCard title="Textarea" description="Multi-line input.">
        <Textarea rows={3} placeholder="Describe the issue…" />
      </DemoCard>
    </UIGrid>
  );
}

function DataShowcase() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'ram',
    direction: 'desc',
  });

  const rows = useMemo(
    () => [
      { app: 'Phone', cpu: 4, ram: 320, battery: 2 },
      { app: 'Messages', cpu: 2, ram: 180, battery: 1 },
      { app: 'Music', cpu: 1, ram: 96, battery: 4 },
      { app: 'Camera', cpu: 8, ram: 512, battery: 3 },
    ],
    [],
  );

  return (
    <UIGrid>
      <DemoCard title="Progress" description="Determinate bar + segmented meter + spinner.">
        <div className="space-y-3">
          <Progress value={72} />
          <SegmentedMeter
            segments={[
              { value: 120 },
              { value: 80, tone: 'accent' },
              { value: 40, tone: 'warning' },
            ]}
          />
          <div className="flex items-center gap-2">
            <Spinner />
            <span className="text-xs text-ink-2">Syncing…</span>
          </div>
        </div>
      </DemoCard>

      <DemoCard title="Pagination" description="12 pages, previous / next shortcuts.">
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
      </DemoCard>

      <DemoCard title="Table" full description="Dense data table with sortable numeric columns.">
        <Table
          rows={rows}
          rowKey={(r) => r.app}
          density="dense"
          sort={sort}
          onSort={(key, direction) => setSort({ key, direction })}
          columns={[
            { key: 'app', header: 'App', cell: (r) => r.app },
            { key: 'cpu', header: 'CPU', sortKey: 'cpu', align: 'right', cell: (r) => r.cpu },
            { key: 'ram', header: 'RAM (MB)', sortKey: 'ram', align: 'right', cell: (r) => r.ram },
            {
              key: 'battery',
              header: 'Batt %',
              sortKey: 'battery',
              align: 'right',
              cell: (r) => r.battery,
            },
          ]}
        />
      </DemoCard>
    </UIGrid>
  );
}

function FeedbackShowcase() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <UIGrid>
      <DemoCard title="Banners" full description="Warning, info, danger — with optional action.">
        <div className="space-y-2">
          <Banner
            title="Battery saver is on"
            description="Background activity has been paused to extend battery life."
            tone="warning"
          />
          <Banner
            title="Update ready"
            description="Phone OS 24.1 is available. Install when on Wi-Fi."
            tone="info"
            action={
              <Button size="sm" variant="primary">
                Install
              </Button>
            }
          />
          <Banner title="Storage almost full" description="2.1 GB remaining." tone="danger" />
        </div>
      </DemoCard>

      <DemoCard title="Support states" description="Empty + error states with actions.">
        <div className="space-y-2">
          <EmptyState
            icon={Inbox}
            title="No notifications"
            description="You're all caught up. Notifications from apps will appear here."
            action={
              <Button variant="secondary" size="sm" onClick={() => {}}>
                Refresh
              </Button>
            }
          />
          <ErrorState onRetry={() => {}} />
        </div>
      </DemoCard>

      <DemoCard title="Overlay launches" description="Confirm dialog, side panel, toasts.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Confirm dialog
          </Button>
          <Button variant="secondary" onClick={() => setSideOpen(true)}>
            Side panel
          </Button>
          <ToastDemo />
        </div>
      </DemoCard>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        destructive
        title="Erase this device?"
        description="All photos, contacts and apps will be deleted permanently. This can't be undone."
        confirmLabel="Erase device"
        cancelLabel="Cancel"
      />
      <SidePanel
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        title="Data usage"
        description="Cycle · Aug 1 – Aug 31"
      >
        <div className="space-y-3">
          <GroupedList>
            <ListRow
              icon={Cloud}
              title="Mobile data"
              description="4.2 GB used"
              trailing={<Progress value={70} className="w-20" />}
            />
            <ListRow
              icon={Wifi}
              title="Wi-Fi"
              description="18.6 GB used"
              trailing={<Progress value={84} tone="success" className="w-20" />}
            />
            <ListRow
              icon={Download}
              title="Background"
              description="0.8 GB used"
              trailing={<ChevronRight className="size-4 text-ink-3" />}
            />
          </GroupedList>
          <Button variant="primary" fullWidth onClick={() => setSideOpen(false)}>
            Done
          </Button>
        </div>
      </SidePanel>
    </UIGrid>
  );
}

function ListShowcase() {
  return (
    <UIGrid>
      <DemoCard
        title="Grouped list"
        full
        description="Inset rows with icons, tones, selections and actions."
      >
        <GroupedList>
          <ListRow
            icon={Cpu}
            iconTone="accent"
            title="Processor"
            description="Snapdragon 8 Gen 3"
            trailing={<Chip tone="accent">8-core</Chip>}
          />
          <ListRow
            icon={Cloud}
            iconTone="success"
            title="Cloud backup"
            description="Last backup today, 09:41"
            selected
          />
          <ListRow
            icon={Lock}
            iconTone="danger"
            title="Security"
            description="2 locks, 1 fingerprint"
            disabled
          />
          <ListRow
            icon={Users}
            title="Family sharing"
            description="3 members"
            trailing={<ChevronRight className="size-4 text-ink-3" />}
            onClick={() => {}}
          />
        </GroupedList>
      </DemoCard>

      <DemoCard title="Chips & tags" description="Status atoms.">
        <div className="flex flex-wrap items-center gap-2">
          <Chip dot tone="success">
            Online
          </Chip>
          <Chip>5G</Chip>
          <Tag tone="accent">Beta</Tag>
          <Tag tone="warning">Experimental</Tag>
          <Badge tone="danger">New</Badge>
          <StatusDot tone="success" label="Running" />
          <StatusDot tone="neutral" />
        </div>
      </DemoCard>
    </UIGrid>
  );
}

function NavigationShowcase() {
  const [tab, setTab] = useState<'alls' | 'apps' | 'media'>('apps');
  const [active, setActive] = useState('home');

  return (
    <UIGrid>
      <DemoCard title="Tabs" description="Underline tabs, single-choice.">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { label: 'All', value: 'alls' },
            { label: 'Apps', value: 'apps' },
            { label: 'Media', value: 'media' },
          ]}
        />
      </DemoCard>

      <DemoCard title="Icon rail" description="Compact vertical rail, reflows at lg+.">
        <div className="flex overflow-hidden rounded-2xl bg-surface-2">
          <IconRail
            value={active}
            onChange={setActive}
            items={[
              { icon: Home, label: 'Home', value: 'home' },
              { icon: Inbox, label: 'Inbox', value: 'inbox' },
              { icon: PenLine, label: 'Compose', value: 'compose' },
            ]}
          />
          <div className="flex flex-1 items-center justify-center bg-surface-2">
            <p className="px-4 text-sm text-ink-2">Rail reflows with the breakpoint.</p>
          </div>
        </div>
      </DemoCard>
    </UIGrid>
  );
}

function SurfaceShowcase() {
  return (
    <UIGrid>
      <DemoCard title="Cards" full description="Header + content composition.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card
            title="System storage"
            description="Used 84.2 GB of 128 GB"
            headerIcon={Package}
            action={<Badge tone="warning">92%</Badge>}
          >
            <Progress value={92} tone="warning" />
            <p className="mt-3 text-sm text-ink-2">
              Photos, cached media and app data consume the most space.
            </p>
          </Card>
          <Card title="Recommendations" description="Based on your usage" headerIcon={Cpu}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IconTile icon={Cloud} tone="accent" />
                <div>
                  <p className="text-sm font-medium">Cycle charging</p>
                  <p className="text-xs text-ink-3">80% cap for longer battery life</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-ink-3" />
            </div>
          </Card>
        </div>
      </DemoCard>

      <DemoCard title="Icon tiles & avatars" description="Toned tiles + initials avatars.">
        <div className="flex flex-wrap items-center gap-3">
          <IconTile icon={Cpu} tone="accent" size="sm" />
          <IconTile icon={Cloud} tone="success" />
          <IconTile icon={Shield} tone="danger" size="lg" />
          <IconTile icon={Wifi} tone="warning" />
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Katherine Johnson" size="lg" />
          <Avatar size="lg" />
        </div>
      </DemoCard>

      <DemoCard title="Shadow + radius ladder" full description="Token system scale, side by side.">
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: 'shadow-sm', cls: 'shadow-sm' },
              { label: 'shadow', cls: 'shadow' },
              { label: 'shadow-lg', cls: 'shadow-lg' },
            ] as const
          ).map((s) => (
            <div key={s.label} className="space-y-1.5 text-center">
              <div className={`mx-auto h-16 w-full rounded-md bg-surface-2 ${s.cls}`} />
              <p className="font-mono text-xs text-ink-3">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {(
            [
              { label: 'rounded-sm', cls: 'rounded-sm' },
              { label: 'rounded-md', cls: 'rounded-md' },
              { label: 'rounded-lg', cls: 'rounded-lg' },
              { label: 'rounded-xl', cls: 'rounded-xl' },
            ] as const
          ).map((r) => (
            <div key={r.label} className="space-y-1.5 text-center">
              <div className={`mx-auto h-16 w-full bg-surface-4 ${r.cls}`} />
              <p className="font-mono text-xs text-ink-3">{r.label}</p>
            </div>
          ))}
        </div>
      </DemoCard>
    </UIGrid>
  );
}

function AppShellShowcase() {
  const [view, setView] = useState('mail');
  return (
    <div className="h-[26rem] overflow-hidden rounded-2xl bg-surface-1">
      <div className="flex h-full">
        <IconRail
          value={view}
          onChange={setView}
          items={[
            { icon: FileText, label: 'Mail', value: 'mail' },
            { icon: MessageCircle, label: 'Chat', value: 'chat' },
          ]}
        />
        <Sidebar
          value={view}
          onChange={setView}
          className="hidden md:tall:flex"
          header={<span className="px-2 text-sm font-semibold tracking-tight">OS Mail</span>}
          items={[
            { leading: Inbox, label: 'Inbox', value: 'chat', badge: 24 },
            { leading: FileText, label: 'Drafts', value: 'mail' },
            { leading: Trash2, label: 'Trash', value: 'trash' },
          ]}
        />
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface-2 p-4">
          <ListHeader title="Now in the fluid main region" />
          <GroupedList>
            <ListRow
              icon={Users}
              title="Design review"
              description="Re: glass variant"
              trailing={<Badge tone="accent">NEW</Badge>}
            />
            <ListRow
              icon={Bell}
              title="OTA 24.1"
              description="System update ready"
              trailing={<ChevronRight className="size-4 text-ink-3" />}
            />
          </GroupedList>
          <Button variant="primary" size="sm">
            Compose
          </Button>
        </div>
      </div>
    </div>
  );
}

function DropdownDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
        Dropdown menu
      </Button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        className="left-0 top-full"
        items={[
          { label: 'Rename', icon: <PenLine className="size-4" />, onSelect: () => setOpen(false) },
          {
            label: 'Duplicate',
            icon: <FileText className="size-4" />,
            onSelect: () => setOpen(false),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="size-4" />,
            danger: true,
            onSelect: () => setOpen(false),
          },
        ]}
      />
    </div>
  );
}

export default function UiShowcasePage() {
  const { choice, glass, setTheme, setGlass } = useTheme();
  const isInitialized = useThemeStore((s) => s.isInitialized);
  const [confirm, setConfirm] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);

  const resolved = resolveTheme(choice);

  return (
    <ToastProvider>
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">OS Showcase</h1>
          <p className="max-w-[52ch] text-sm text-ink-2">
            Every component wired to the Tailwind v4 theme. Flip theme and glass — both work in
            light and dark. Cards never blur; floating chrome does (§14.1).
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <SegmentedControl
              aria-label="Theme"
              value={choice}
              onChange={setTheme}
              options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
            />
            <div className="flex items-center gap-2 text-sm">
              <Switch checked={glass} onCheckedChange={setGlass} label="Glass" />
              <span className="text-ink-2">{glass ? 'Frosted chrome' : 'Solid'}</span>
            </div>
            {isInitialized && <Badge tone="accent">resolved: {resolved}</Badge>}
          </div>
        </header>

        <div className="space-y-10">
          <section className="space-y-3">
            <ListHeader title="Live app" />
            <div className="flex flex-wrap gap-6">
              <PhoneFrame title="Settings">
                <SettingsDemo />
              </PhoneFrame>
              <div className="min-w-[240px] flex-1 space-y-3">
                <div className="flex h-64 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-info to-success">
                  <div className="flex-1 overflow-y-auto">
                    <TopBar title="Top bar" subtitle="sticky · frosted when glass" />
                    <div className="space-y-2 p-3">
                      <div
                        className="h-16 rounded-xl bg-ink-4/50 backdrop-blur-md"
                        aria-hidden="true"
                      />
                      <div
                        className="h-20 rounded-xl from-accent-ink/25 to-transparent bg-gradient-to-b"
                        aria-hidden="true"
                      />
                      {[
                        { icon: Cpu, title: 'Processor', desc: 'Snapdragon 8 Gen 3' },
                        { icon: Cloud, title: 'Cloud backup', desc: 'Last backup today' },
                        { icon: Lock, title: 'Security', desc: '2 locks, 1 fingerprint' },
                        { icon: Users, title: 'Family sharing', desc: '3 members' },
                        { icon: Wifi, title: 'Wi-Fi', desc: 'OS Network · 2.4/5 GHz' },
                        { icon: Download, title: 'Background data', desc: '0.8 GB this cycle' },
                        { icon: Moon, title: 'Dark colours', desc: 'Follows system' },
                        { icon: Smartphone, title: 'About phone', desc: 'PICKLE OS 24.1' },
                      ].map((row) => (
                        <ListRow
                          key={row.title}
                          className="rounded-xl bg-surface-2/85"
                          icon={row.icon}
                          title={row.title}
                          description={row.desc}
                          trailing={<ChevronRight className="size-4 text-ink-3" />}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-ink-2">
                    The top bar frosts the colour behind it instantly — no scrolling needed. Solid
                    vs glass: toggle in the header above.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <ListHeader title="Controls" />
            <ControlsShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Forms" />
            <FormShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Data display" />
            <DataShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Feedback" />
            <FeedbackShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Lists" />
            <ListShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Navigation" />
            <NavigationShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="Surfaces" />
            <SurfaceShowcase />
          </section>
          <section className="space-y-3">
            <ListHeader title="App shell" />
            <UIGrid>
              <DemoCard
                title="Responsive shell"
                full
                description="Rail + sidebar + fluid main region; sidebar reflows at tall/wide breakpoints."
              >
                <AppShellShowcase />
              </DemoCard>
            </UIGrid>
          </section>
          <section className="space-y-3">
            <ListHeader title="Overlays" />
            <UIGrid>
              <DemoCard
                title="Desktop chrome"
                description="Dropdown menu, modal, action sheet, confirm dialog."
              >
                <div className="flex flex-wrap gap-2">
                  <DropdownDemo />
                  <Button variant="secondary" onClick={() => setConfirm(true)}>
                    Modal
                  </Button>
                  <Button variant="secondary" onClick={() => setSheet(true)}>
                    Action sheet
                  </Button>
                  <Button variant="danger" onClick={() => setDialog(true)}>
                    Confirm dialog
                  </Button>
                </div>
              </DemoCard>
              <DemoCard
                title="Popover"
                description="Trigger-anchored mini surface, also frosted with glass."
              >
                <Popover
                  trigger={
                    <Button variant="secondary">
                      Popover <ChevronRight className="size-4 rotate-90" />
                    </Button>
                  }
                  content={
                    <div className="space-y-2 p-2">
                      <p className="text-sm font-medium">Popover surface</p>
                      <p className="text-xs text-ink-2">Also frosted when glass is on.</p>
                    </div>
                  }
                />
              </DemoCard>
            </UIGrid>
          </section>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Night mode"
        description="Apps use a dark palette after sunset."
        size="sm"
      >
        <p className="text-sm text-ink-2">
          Scheduled from 22:00 to 07:00. Battery savings vary by display type.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setConfirm(false)}>
            Enable
          </Button>
        </div>
      </Modal>

      <ActionSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Share / send"
        options={[
          { label: 'Messages', icon: <MessageCircle className="size-4" />, onSelect: () => {} },
          { label: 'Save to Files', icon: <FileText className="size-4" />, onSelect: () => {} },
          { label: 'Copy link', icon: <Link className="size-4" />, onSelect: () => {} },
          {
            label: 'Delete item',
            icon: <Trash2 className="size-4" />,
            danger: true,
            onSelect: () => {},
          },
        ]}
      />

      <ConfirmDialog
        open={dialog}
        onClose={() => setDialog(false)}
        onConfirm={() => setDialog(false)}
        destructive
        title="Remove this account?"
        description="Your purchases and downloads for this account will be removed from this device."
        confirmLabel="Remove"
      />
    </ToastProvider>
  );
}
