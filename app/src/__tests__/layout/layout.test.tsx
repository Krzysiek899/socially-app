import React from 'react';
import { render, screen } from '@testing-library/react';
import { Page, Section, Stack, Cluster, Split, Grid } from '../../shared/layout/index.tsx';
import {
  LAYOUT_MAX_WIDTH_TOKENS,
  SPACING_TOKEN_MAP,
  SPACING_TOKEN_VALUES,
  SPLIT_FRACTION_MAP,
  SECTION_SPACING_MAP,
  SPACING_STEPS,
} from '../../shared/layout/layout-tokens.ts';

/* ── layout-tokens contract ─────────────────────────────────────────────── */

describe('Layout tokens — max-width tiers', () => {
  it('declares all four max-width tiers', () => {
    expect(Object.keys(LAYOUT_MAX_WIDTH_TOKENS)).toEqual(['sm', 'md', 'lg', 'xl']);
  });

  it('sm tier = 640px', () => {
    expect(LAYOUT_MAX_WIDTH_TOKENS.sm.value).toBe('640px');
  });

  it('md tier = 768px', () => {
    expect(LAYOUT_MAX_WIDTH_TOKENS.md.value).toBe('768px');
  });

  it('lg tier = 1024px', () => {
    expect(LAYOUT_MAX_WIDTH_TOKENS.lg.value).toBe('1024px');
  });

  it('xl tier = 1280px', () => {
    expect(LAYOUT_MAX_WIDTH_TOKENS.xl.value).toBe('1280px');
  });

  it('all token names follow --layout-max-width-* format', () => {
    Object.values(LAYOUT_MAX_WIDTH_TOKENS).forEach(({ token }) => {
      expect(token).toMatch(/^--layout-max-width-/);
    });
  });
});

describe('Layout tokens — spacing', () => {
  it('includes all required spacing steps', () => {
    const requiredSteps = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];
    requiredSteps.forEach((step) => {
      expect(SPACING_TOKEN_MAP).toHaveProperty(step);
    });
  });

  it('spacing token names follow --space-* format', () => {
    Object.values(SPACING_TOKEN_MAP).forEach((name) => {
      if (name !== '--space-0') {
        expect(name).toMatch(/^--space-\d+$/);
      }
    });
  });

  it('every spacing token has a raw value in SPACING_TOKEN_VALUES', () => {
    const keys = Object.values(SPACING_TOKEN_MAP).filter((k) => k !== '--space-0');
    keys.forEach((token) => {
      expect(SPACING_TOKEN_VALUES).toHaveProperty(token);
    });
  });

  it('spacing step 4 = 16px', () => {
    const token = SPACING_TOKEN_MAP['4'];
    expect(SPACING_TOKEN_VALUES[token]).toBe('16px');
  });

  it('spacing step 8 = 32px', () => {
    const token = SPACING_TOKEN_MAP['8'];
    expect(SPACING_TOKEN_VALUES[token]).toBe('32px');
  });

  it('SPACING_STEPS array covers all valid step keys', () => {
    SPACING_STEPS.forEach((step) => {
      expect(SPACING_TOKEN_MAP).toHaveProperty(step);
    });
  });
});

describe('Layout tokens — split fractions', () => {
  it('defines all five fraction ratios', () => {
    expect(Object.keys(SPLIT_FRACTION_MAP)).toEqual(['1/4', '1/3', '1/2', '2/3', '3/4']);
  });

  it('1/2 fraction produces equal columns', () => {
    expect(SPLIT_FRACTION_MAP['1/2']).toBe('1fr 1fr');
  });

  it('1/3 fraction produces narrow-first layout', () => {
    expect(SPLIT_FRACTION_MAP['1/3']).toBe('1fr 2fr');
  });

  it('2/3 fraction produces wide-first layout', () => {
    expect(SPLIT_FRACTION_MAP['2/3']).toBe('2fr 1fr');
  });

  it('1/4 fraction produces narrow-first layout', () => {
    expect(SPLIT_FRACTION_MAP['1/4']).toBe('1fr 3fr');
  });

  it('3/4 fraction produces wide-first layout', () => {
    expect(SPLIT_FRACTION_MAP['3/4']).toBe('3fr 1fr');
  });
});

/* ── Page component ─────────────────────────────────────────────────────── */

describe('Page — variant contract', () => {
  it('renders with data-layout="page"', () => {
    render(<Page>content</Page>);
    const el = document.querySelector('[data-layout="page"]');
    expect(el).toBeInTheDocument();
  });

  it('defaults to maxWidth="lg"', () => {
    render(<Page>content</Page>);
    const el = document.querySelector('[data-max-width="lg"]');
    expect(el).toBeInTheDocument();
  });

  it('applies the lg max-width token via inline style', () => {
    render(<Page maxWidth="lg">content</Page>);
    const el = document.querySelector('[data-layout="page"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-page-max-width')).toBe(
      `var(${LAYOUT_MAX_WIDTH_TOKENS.lg.token})`,
    );
  });

  it('applies the sm max-width token via inline style', () => {
    render(<Page maxWidth="sm">content</Page>);
    const el = document.querySelector('[data-layout="page"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-page-max-width')).toBe(
      `var(${LAYOUT_MAX_WIDTH_TOKENS.sm.token})`,
    );
  });

  it('applies "none" for maxWidth="full"', () => {
    render(<Page maxWidth="full">content</Page>);
    const el = document.querySelector('[data-layout="page"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-page-max-width')).toBe('none');
  });

  it('renders as <div> by default', () => {
    const { container } = render(<Page>content</Page>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as <main> when as="main"', () => {
    render(<Page as="main">content</Page>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

/* ── Section component ──────────────────────────────────────────────────── */

describe('Section — variant contract', () => {
  it('renders with data-layout="section"', () => {
    render(<Section>content</Section>);
    const el = document.querySelector('[data-layout="section"]');
    expect(el).toBeInTheDocument();
  });

  it('renders as <section> by default', () => {
    const { container } = render(<Section>content</Section>);
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });

  it('defaults to spacing="md" (--space-8)', () => {
    render(<Section>content</Section>);
    const el = document.querySelector('[data-spacing="md"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.getPropertyValue('--layout-section-spacing')).toBe(
      `var(${SPACING_TOKEN_MAP[SECTION_SPACING_MAP.md]})`,
    );
  });

  it('applies sm spacing via --space-6 token', () => {
    render(<Section spacing="sm">content</Section>);
    const el = document.querySelector('[data-layout="section"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-section-spacing')).toBe(
      `var(${SPACING_TOKEN_MAP[SECTION_SPACING_MAP.sm]})`,
    );
  });

  it('applies lg spacing via --space-12 token', () => {
    render(<Section spacing="lg">content</Section>);
    const el = document.querySelector('[data-layout="section"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-section-spacing')).toBe(
      `var(${SPACING_TOKEN_MAP[SECTION_SPACING_MAP.lg]})`,
    );
  });

  it('renders as <article> when as="article"', () => {
    const { container } = render(<Section as="article">content</Section>);
    expect(container.firstChild?.nodeName).toBe('ARTICLE');
  });
});

/* ── Stack component ────────────────────────────────────────────────────── */

describe('Stack — variant contract', () => {
  it('renders with data-layout="stack"', () => {
    render(<Stack>content</Stack>);
    const el = document.querySelector('[data-layout="stack"]');
    expect(el).toBeInTheDocument();
  });

  it('defaults to gap="4" (--space-4)', () => {
    render(<Stack>content</Stack>);
    const el = document.querySelector('[data-gap="4"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['4']})`);
  });

  it('applies gap="2" (--space-2)', () => {
    render(<Stack gap="2">content</Stack>);
    const el = document.querySelector('[data-layout="stack"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['2']})`);
  });

  it('applies gap="8" (--space-8)', () => {
    render(<Stack gap="8">content</Stack>);
    const el = document.querySelector('[data-layout="stack"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['8']})`);
  });

  it('sets --layout-align when align prop is provided', () => {
    render(<Stack align="center">content</Stack>);
    const el = document.querySelector('[data-layout="stack"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-align')).toBe('center');
  });

  it('does not set --layout-align when align prop is omitted', () => {
    render(<Stack>content</Stack>);
    const el = document.querySelector('[data-layout="stack"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-align')).toBe('');
  });

  it('renders as <ul> when as="ul"', () => {
    const { container } = render(<Stack as="ul"><li>item</li></Stack>);
    expect(container.firstChild?.nodeName).toBe('UL');
  });
});

/* ── Cluster component ──────────────────────────────────────────────────── */

describe('Cluster — variant contract', () => {
  it('renders with data-layout="cluster"', () => {
    render(<Cluster>content</Cluster>);
    const el = document.querySelector('[data-layout="cluster"]');
    expect(el).toBeInTheDocument();
  });

  it('defaults to gap="2" (--space-2)', () => {
    render(<Cluster>content</Cluster>);
    const el = document.querySelector('[data-gap="2"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['2']})`);
  });

  it('applies gap="4" (--space-4)', () => {
    render(<Cluster gap="4">content</Cluster>);
    const el = document.querySelector('[data-layout="cluster"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['4']})`);
  });

  it('sets --layout-align when align prop is provided', () => {
    render(<Cluster align="flex-end">content</Cluster>);
    const el = document.querySelector('[data-layout="cluster"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-align')).toBe('flex-end');
  });

  it('sets --layout-justify when justify prop is provided', () => {
    render(<Cluster justify="space-between">content</Cluster>);
    const el = document.querySelector('[data-layout="cluster"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-justify')).toBe('space-between');
  });

  it('does not set --layout-justify when justify prop is omitted', () => {
    render(<Cluster>content</Cluster>);
    const el = document.querySelector('[data-layout="cluster"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-justify')).toBe('');
  });
});

/* ── Split component ────────────────────────────────────────────────────── */

describe('Split — variant contract', () => {
  it('renders with data-layout="split"', () => {
    render(<Split><div>A</div><div>B</div></Split>);
    const el = document.querySelector('[data-layout="split"]');
    expect(el).toBeInTheDocument();
  });

  it('defaults to fraction="1/2"', () => {
    render(<Split><div>A</div><div>B</div></Split>);
    const el = document.querySelector('[data-fraction="1/2"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.getPropertyValue('--layout-split-template')).toBe(
      SPLIT_FRACTION_MAP['1/2'],
    );
  });

  it('applies fraction="1/3" template', () => {
    render(<Split fraction="1/3"><div>A</div><div>B</div></Split>);
    const el = document.querySelector('[data-layout="split"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-split-template')).toBe(
      SPLIT_FRACTION_MAP['1/3'],
    );
  });

  it('applies fraction="2/3" template', () => {
    render(<Split fraction="2/3"><div>A</div><div>B</div></Split>);
    const el = document.querySelector('[data-layout="split"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-split-template')).toBe(
      SPLIT_FRACTION_MAP['2/3'],
    );
  });

  it('applies gap via spacing token', () => {
    render(<Split gap="6"><div>A</div><div>B</div></Split>);
    const el = document.querySelector('[data-layout="split"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['6']})`);
  });
});

/* ── Grid component ─────────────────────────────────────────────────────── */

describe('Grid — variant contract', () => {
  it('renders with data-layout="grid"', () => {
    render(<Grid><div>A</div></Grid>);
    const el = document.querySelector('[data-layout="grid"]');
    expect(el).toBeInTheDocument();
  });

  it('defaults to columns=3 via data-columns attribute', () => {
    render(<Grid><div>A</div></Grid>);
    const el = document.querySelector('[data-columns="3"]');
    expect(el).toBeInTheDocument();
  });

  it('sets --layout-columns for a 2-column grid', () => {
    render(<Grid columns={2}><div>A</div></Grid>);
    const el = document.querySelector('[data-layout="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-columns')).toBe('2');
  });

  it('sets --layout-columns for a 4-column grid', () => {
    render(<Grid columns={4}><div>A</div></Grid>);
    const el = document.querySelector('[data-layout="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-columns')).toBe('4');
  });

  it('applies gap via spacing token', () => {
    render(<Grid gap="6"><div>A</div></Grid>);
    const el = document.querySelector('[data-layout="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['6']})`);
  });

  it('defaults to gap="4" (--space-4)', () => {
    render(<Grid><div>A</div></Grid>);
    const el = document.querySelector('[data-layout="grid"]') as HTMLElement;
    expect(el.style.getPropertyValue('--layout-gap')).toBe(`var(${SPACING_TOKEN_MAP['4']})`);
  });
});

/* ── Composability ──────────────────────────────────────────────────────── */

describe('Layout composability', () => {
  it('Stack inside Page renders correctly', () => {
    render(
      <Page>
        <Stack gap="4">
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      </Page>,
    );
    expect(document.querySelector('[data-layout="page"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="stack"]')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('Section wrapping a Split renders both data attributes', () => {
    render(
      <Section>
        <Split>
          <div>Left</div>
          <div>Right</div>
        </Split>
      </Section>,
    );
    expect(document.querySelector('[data-layout="section"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="split"]')).toBeInTheDocument();
  });

  it('Grid inside a Stack renders nested layout primitives', () => {
    render(
      <Stack>
        <Grid columns={2}>
          <div>A</div>
          <div>B</div>
        </Grid>
      </Stack>,
    );
    expect(document.querySelector('[data-layout="stack"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="grid"]')).toBeInTheDocument();
  });

  it('Cluster inside a Split renders correctly', () => {
    render(
      <Split>
        <Cluster gap="2">
          <span>Tag 1</span>
          <span>Tag 2</span>
        </Cluster>
        <div>Main content</div>
      </Split>,
    );
    expect(document.querySelector('[data-layout="cluster"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="split"]')).toBeInTheDocument();
  });

  it('full page shell composes Page > Section > Stack', () => {
    render(
      <Page maxWidth="lg" as="main">
        <Section spacing="md">
          <Stack gap="4">
            <h1>Title</h1>
            <p>Body</p>
          </Stack>
        </Section>
      </Page>,
    );
    expect(document.querySelector('[data-layout="page"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="section"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layout="stack"]')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
