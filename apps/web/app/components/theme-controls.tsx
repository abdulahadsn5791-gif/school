'use client';

import { type ThemeChoice, useTheme } from '@ecomerece/frontend/theme';
import { IconButton, SegmentedControl, Switch } from '@ecomerece/ui';
import { Monitor, Moon, Sun } from 'lucide-react';

const ORDER: ThemeChoice[] = ['auto', 'light', 'dark'];

const ICONS = { auto: Monitor, light: Sun, dark: Moon } as const;
const LABELS = { auto: 'Auto', light: 'Light', dark: 'Dark' } as const;

/** Compact nav control: click cycles Auto → Light → Dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { choice, setTheme } = useTheme();
  const Icon = ICONS[choice];
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];

  return (
    <IconButton
      label={`Theme: ${LABELS[choice]} (switch to ${LABELS[next]})`}
      className={className}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" aria-hidden="true" />
    </IconButton>
  );
}

/** Full appearance controls for the account/settings surface. */
export function ThemePreferences() {
  const { choice, glass, setTheme, setGlass } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Theme</p>
          <p className="text-xs text-ink-3">Follow the system or pin light or dark.</p>
        </div>
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
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Glass</p>
          <p className="text-xs text-ink-3">
            Frosted chrome on floating surfaces. {glass ? 'On' : 'Off'}.
          </p>
        </div>
        <Switch checked={glass} onCheckedChange={setGlass} label="Glass" />
      </div>
    </div>
  );
}
