/**
 * Token constants — Socially Design System
 *
 * JS mirror of the semantic token names and primitive raw values.
 * Used for testing and for any runtime token lookups.
 */

/**
 * Primitive token raw values keyed by CSS custom-property name.
 * These must match the values declared in primitive.css.
 */
export const PRIMITIVE_TOKEN_VALUES = {
  /* Blue */
  '--primitive-blue-900': '#163B58',
  '--primitive-blue-800': '#0B4873',
  '--primitive-blue-700': '#0D5A8E',
  '--primitive-blue-600': '#1565A8',
  '--primitive-blue-400': '#4A9FD4',
  '--primitive-blue-200': '#A8D4EF',
  '--primitive-blue-100': '#D3EAF7',
  '--primitive-blue-50':  '#EBF4FB',

  /* Green */
  '--primitive-green-700': '#3A7E3B',
  '--primitive-green-500': '#63B964',
  '--primitive-green-300': '#9DD89E',
  '--primitive-green-50':  '#E8F7E8',

  /* Amber */
  '--primitive-amber-700': '#C47A00',
  '--primitive-amber-500': '#FBA627',
  '--primitive-amber-300': '#FDCC7E',
  '--primitive-amber-50':  '#FEF3E2',

  /* Teal */
  '--primitive-teal-700': '#1D7877',
  '--primitive-teal-500': '#30A9A8',
  '--primitive-teal-300': '#7FCECD',
  '--primitive-teal-50':  '#E0F4F4',

  /* Red */
  '--primitive-red-700': '#B91C1C',
  '--primitive-red-500': '#EF4444',
  '--primitive-red-300': '#FCA5A5',
  '--primitive-red-50':  '#FEF2F2',

  /* Neutral (light) */
  '--primitive-neutral-0':   '#FFFFFF',
  '--primitive-neutral-50':  '#F9FAFB',
  '--primitive-neutral-100': '#F3F4F6',
  '--primitive-neutral-200': '#E5E7EB',
  '--primitive-neutral-300': '#D1D5DB',
  '--primitive-neutral-400': '#9CA3AF',
  '--primitive-neutral-500': '#6B7280',
  '--primitive-neutral-600': '#4B5563',
  '--primitive-neutral-700': '#374151',
  '--primitive-neutral-800': '#1F2937',
  '--primitive-neutral-900': '#111827',

  /* Neutral (dark) */
  '--primitive-dark-50':  '#F8FAFC',
  '--primitive-dark-100': '#E2E8F0',
  '--primitive-dark-200': '#94A3B8',
  '--primitive-dark-300': '#64748B',
  '--primitive-dark-400': '#475569',
  '--primitive-dark-500': '#334155',
  '--primitive-dark-600': '#1E293B',
  '--primitive-dark-700': '#0F172A',
  '--primitive-dark-800': '#090E1A',
};

/**
 * Semantic token CSS custom-property names.
 * Grouped by intent category.
 */
export const SEMANTIC_TOKENS = {
  /* Brand */
  primary:        '--color-primary',
  primaryStrong:  '--color-primary-strong',
  primarySubtle:  '--color-primary-subtle',
  primaryHover:   '--color-primary-hover',

  success:        '--color-success',
  successSubtle:  '--color-success-subtle',

  warning:        '--color-warning',
  warningSubtle:  '--color-warning-subtle',

  info:           '--color-info',
  infoSubtle:     '--color-info-subtle',

  danger:         '--color-danger',
  dangerSubtle:   '--color-danger-subtle',

  /* Text */
  textDefault:    '--color-text-default',
  textSubtle:     '--color-text-subtle',
  textHeading:    '--color-text-heading',
  textDisabled:   '--color-text-disabled',
  textOnPrimary:  '--color-text-on-primary',
  textInverse:    '--color-text-inverse',
  textLink:       '--color-text-link',

  /* Surface */
  surfaceDefault: '--color-surface-default',
  surfaceSubtle:  '--color-surface-subtle',
  surfaceRaised:  '--color-surface-raised',
  surfaceOverlay: '--color-surface-overlay',

  /* Border */
  borderDefault:  '--color-border-default',
  borderStrong:   '--color-border-strong',
  borderFocus:    '--color-border-focus',
};

/**
 * Semantic → primitive mapping for the light theme.
 * Source of truth for token resolution tests.
 */
export const LIGHT_THEME_MAPPING = {
  '--color-primary':        '--primitive-blue-800',
  '--color-primary-strong': '--primitive-blue-900',
  '--color-primary-subtle': '--primitive-blue-50',
  '--color-primary-hover':  '--primitive-blue-700',

  '--color-success':        '--primitive-green-500',
  '--color-success-subtle': '--primitive-green-50',

  '--color-warning':        '--primitive-amber-500',
  '--color-warning-subtle': '--primitive-amber-50',

  '--color-info':           '--primitive-teal-500',
  '--color-info-subtle':    '--primitive-teal-50',

  '--color-danger':         '--primitive-red-500',
  '--color-danger-subtle':  '--primitive-red-50',

  '--color-text-default':    '--primitive-neutral-700',
  '--color-text-subtle':     '--primitive-neutral-500',
  '--color-text-heading':    '--primitive-neutral-900',
  '--color-text-disabled':   '--primitive-neutral-400',
  '--color-text-on-primary': '--primitive-neutral-0',
  '--color-text-inverse':    '--primitive-neutral-0',
  '--color-text-link':       '--primitive-blue-800',

  '--color-surface-default': '--primitive-neutral-0',
  '--color-surface-subtle':  '--primitive-neutral-50',
  '--color-surface-raised':  '--primitive-neutral-0',
  '--color-surface-overlay': '--primitive-neutral-100',

  '--color-border-default':  '--primitive-neutral-200',
  '--color-border-strong':   '--primitive-neutral-300',
  '--color-border-focus':    '--primitive-blue-800',
};

/**
 * Semantic → primitive mapping for the dark theme.
 */
export const DARK_THEME_MAPPING = {
  '--color-primary':        '--primitive-blue-400',
  '--color-primary-strong': '--primitive-blue-200',
  '--color-primary-subtle': '--primitive-dark-600',
  '--color-primary-hover':  '--primitive-blue-200',

  '--color-success':        '--primitive-green-300',
  '--color-success-subtle': '--primitive-dark-600',

  '--color-warning':        '--primitive-amber-300',
  '--color-warning-subtle': '--primitive-dark-600',

  '--color-info':           '--primitive-teal-300',
  '--color-info-subtle':    '--primitive-dark-600',

  '--color-danger':         '--primitive-red-300',
  '--color-danger-subtle':  '--primitive-dark-600',

  '--color-text-default':    '--primitive-dark-200',
  '--color-text-subtle':     '--primitive-dark-300',
  '--color-text-heading':    '--primitive-dark-50',
  '--color-text-disabled':   '--primitive-dark-400',
  '--color-text-on-primary': '--primitive-dark-700',
  '--color-text-inverse':    '--primitive-dark-700',
  '--color-text-link':       '--primitive-blue-400',

  '--color-surface-default': '--primitive-dark-700',
  '--color-surface-subtle':  '--primitive-dark-600',
  '--color-surface-raised':  '--primitive-dark-500',
  '--color-surface-overlay': '--primitive-dark-600',

  '--color-border-default':  '--primitive-dark-500',
  '--color-border-strong':   '--primitive-dark-400',
  '--color-border-focus':    '--primitive-blue-400',
};

/** All approved brand color hex values. */
export const BRAND_COLORS = {
  primary:       '#0B4873',
  primaryStrong: '#163B58',
  success:       '#63B964',
  warning:       '#FBA627',
  info:          '#30A9A8',
};
