/**
 * Layout Token Constants — Socially Design System
 *
 * JS/TS mirror of the CSS custom-property names and values used by
 * layout primitives. Used for testing layout variant contracts and
 * responsive composition behaviour.
 *
 * Spacing values must match the `--space-*` declarations in primitive.css.
 * Max-width values must match the `--layout-max-width-*` declarations in layout.css.
 */

/** Max-width tier token names and their pixel values. */
export const LAYOUT_MAX_WIDTH_TOKENS = {
  sm: { token: '--layout-max-width-sm', value: '640px'  },
  md: { token: '--layout-max-width-md', value: '768px'  },
  lg: { token: '--layout-max-width-lg', value: '1024px' },
  xl: { token: '--layout-max-width-xl', value: '1280px' },
} as const;

export type LayoutMaxWidth = keyof typeof LAYOUT_MAX_WIDTH_TOKENS | 'full';

/** Spacing step → CSS custom-property name. */
export const SPACING_TOKEN_MAP: Record<string, string> = {
  '0':  '--space-0',
  '1':  '--space-1',
  '2':  '--space-2',
  '3':  '--space-3',
  '4':  '--space-4',
  '5':  '--space-5',
  '6':  '--space-6',
  '8':  '--space-8',
  '10': '--space-10',
  '12': '--space-12',
  '16': '--space-16',
};

/** Spacing token raw values. Must match primitive.css. */
export const SPACING_TOKEN_VALUES: Record<string, string> = {
  '--space-1':  '4px',
  '--space-2':  '8px',
  '--space-3':  '12px',
  '--space-4':  '16px',
  '--space-5':  '20px',
  '--space-6':  '24px',
  '--space-8':  '32px',
  '--space-10': '40px',
  '--space-12': '48px',
  '--space-16': '64px',
};

/** Split fraction → CSS grid-template-columns value. */
export const SPLIT_FRACTION_MAP = {
  '1/4': '1fr 3fr',
  '1/3': '1fr 2fr',
  '1/2': '1fr 1fr',
  '2/3': '2fr 1fr',
  '3/4': '3fr 1fr',
} as const;

export type SplitFraction = keyof typeof SPLIT_FRACTION_MAP;

/** Valid spacing step keys accepted by layout components. */
export const SPACING_STEPS = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'] as const;
export type SpacingStep = typeof SPACING_STEPS[number];

/** Allowed section spacing variants and their step mappings. */
export const SECTION_SPACING_MAP = {
  sm: '6',
  md: '8',
  lg: '12',
} as const;

export type SectionSpacing = keyof typeof SECTION_SPACING_MAP;
