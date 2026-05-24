import {
  SEMANTIC_TOKENS,
  PRIMITIVE_TOKEN_VALUES,
  LIGHT_THEME_MAPPING,
  DARK_THEME_MAPPING,
  BRAND_COLORS,
  TYPOGRAPHY_TOKENS,
  TYPOGRAPHY_ROLE_MAPPING,
} from '../tokens/tokens.js';

describe('Token architecture — primitive values', () => {
  it('primary maps to approved brand color', () => {
    expect(PRIMITIVE_TOKEN_VALUES['--primitive-blue-800']).toBe('#0B4873');
  });

  it('primary-strong maps to approved brand color', () => {
    expect(PRIMITIVE_TOKEN_VALUES['--primitive-blue-900']).toBe('#163B58');
  });

  it('success maps to approved brand color', () => {
    expect(PRIMITIVE_TOKEN_VALUES['--primitive-green-500']).toBe('#63B964');
  });

  it('warning maps to approved brand color', () => {
    expect(PRIMITIVE_TOKEN_VALUES['--primitive-amber-500']).toBe('#FBA627');
  });

  it('info maps to approved brand color', () => {
    expect(PRIMITIVE_TOKEN_VALUES['--primitive-teal-500']).toBe('#30A9A8');
  });
});

describe('Token architecture — brand color constants', () => {
  it('exposes all five approved brand colors', () => {
    expect(BRAND_COLORS.primary).toBe('#0B4873');
    expect(BRAND_COLORS.primaryStrong).toBe('#163B58');
    expect(BRAND_COLORS.success).toBe('#63B964');
    expect(BRAND_COLORS.warning).toBe('#FBA627');
    expect(BRAND_COLORS.info).toBe('#30A9A8');
  });
});

describe('Token architecture — semantic token names', () => {
  it('declares all required brand intent tokens', () => {
    expect(SEMANTIC_TOKENS).toHaveProperty('primary');
    expect(SEMANTIC_TOKENS).toHaveProperty('primaryStrong');
    expect(SEMANTIC_TOKENS).toHaveProperty('success');
    expect(SEMANTIC_TOKENS).toHaveProperty('warning');
    expect(SEMANTIC_TOKENS).toHaveProperty('info');
    expect(SEMANTIC_TOKENS).toHaveProperty('danger');
  });

  it('declares all required text intent tokens', () => {
    expect(SEMANTIC_TOKENS).toHaveProperty('textDefault');
    expect(SEMANTIC_TOKENS).toHaveProperty('textSubtle');
    expect(SEMANTIC_TOKENS).toHaveProperty('textHeading');
    expect(SEMANTIC_TOKENS).toHaveProperty('textDisabled');
    expect(SEMANTIC_TOKENS).toHaveProperty('textOnPrimary');
    expect(SEMANTIC_TOKENS).toHaveProperty('textInverse');
    expect(SEMANTIC_TOKENS).toHaveProperty('textLink');
  });

  it('declares all required surface intent tokens', () => {
    expect(SEMANTIC_TOKENS).toHaveProperty('surfaceDefault');
    expect(SEMANTIC_TOKENS).toHaveProperty('surfaceSubtle');
    expect(SEMANTIC_TOKENS).toHaveProperty('surfaceRaised');
    expect(SEMANTIC_TOKENS).toHaveProperty('surfaceOverlay');
  });

  it('declares all required border intent tokens', () => {
    expect(SEMANTIC_TOKENS).toHaveProperty('borderDefault');
    expect(SEMANTIC_TOKENS).toHaveProperty('borderStrong');
    expect(SEMANTIC_TOKENS).toHaveProperty('borderFocus');
  });

  it('semantic token names follow CSS custom-property format', () => {
    Object.values(SEMANTIC_TOKENS).forEach((name) => {
      expect(name).toMatch(/^--color-/);
    });
  });
});

describe('Token architecture — light theme mapping', () => {
  it('primary resolves to the approved primary blue primitive', () => {
    const primitive = LIGHT_THEME_MAPPING['--color-primary'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#0B4873');
  });

  it('primary-strong resolves to the approved primary-strong blue primitive', () => {
    const primitive = LIGHT_THEME_MAPPING['--color-primary-strong'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#163B58');
  });

  it('success resolves to the approved success green primitive', () => {
    const primitive = LIGHT_THEME_MAPPING['--color-success'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#63B964');
  });

  it('warning resolves to the approved warning amber primitive', () => {
    const primitive = LIGHT_THEME_MAPPING['--color-warning'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#FBA627');
  });

  it('info resolves to the approved info teal primitive', () => {
    const primitive = LIGHT_THEME_MAPPING['--color-info'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#30A9A8');
  });

  it('every light-theme semantic token maps to a known primitive', () => {
    Object.entries(LIGHT_THEME_MAPPING).forEach(([semantic, primitive]) => {
      expect(PRIMITIVE_TOKEN_VALUES).toHaveProperty(
        primitive,
        expect.any(String),
      );
    });
  });
});

describe('Token architecture — dark theme mapping', () => {
  it('every dark-theme semantic token maps to a known primitive', () => {
    Object.entries(DARK_THEME_MAPPING).forEach(([semantic, primitive]) => {
      expect(PRIMITIVE_TOKEN_VALUES).toHaveProperty(
        primitive,
        expect.any(String),
      );
    });
  });

  it('dark primary resolves to a lighter blue hue (brand identity preserved)', () => {
    const primitive = DARK_THEME_MAPPING['--color-primary'];
    // The dark-mode primary must be a different (lighter) step than the light-mode primary
    expect(primitive).not.toBe(LIGHT_THEME_MAPPING['--color-primary']);
    // And must still be within the blue family
    expect(primitive).toMatch(/^--primitive-blue-/);
  });

  it('dark surface-default is a dark neutral', () => {
    const primitive = DARK_THEME_MAPPING['--color-surface-default'];
    expect(primitive).toMatch(/^--primitive-dark-/);
  });

  it('dark text-heading has high contrast (resolves to near-white primitive)', () => {
    const primitive = DARK_THEME_MAPPING['--color-text-heading'];
    // near-white dark neutral
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('#F8FAFC');
  });
});

describe('Token architecture — typography tokens', () => {
  it('declares all 6 required roles', () => {
    const roles = ['title', 'heading', 'subheading', 'body', 'bodySm', 'label'];
    roles.forEach((role) => {
      const sizeKey   = `${role}Size`;
      const weightKey = `${role}Weight`;
      const lhKey     = `${role}LineHeight`;
      expect(TYPOGRAPHY_TOKENS).toHaveProperty(sizeKey);
      expect(TYPOGRAPHY_TOKENS).toHaveProperty(weightKey);
      expect(TYPOGRAPHY_TOKENS).toHaveProperty(lhKey);
    });
  });

  it('exposes font-family tokens', () => {
    expect(TYPOGRAPHY_TOKENS).toHaveProperty('fontSans');
    expect(TYPOGRAPHY_TOKENS).toHaveProperty('fontMono');
  });

  it('all typography token names follow --typography-* naming', () => {
    Object.entries(TYPOGRAPHY_TOKENS)
      .filter(([key]) => !['fontSans', 'fontMono'].includes(key))
      .forEach(([, name]) => {
        expect(name).toMatch(/^--typography-/);
      });
  });

  it('every typography role token maps to a known primitive', () => {
    Object.entries(TYPOGRAPHY_ROLE_MAPPING).forEach(([semantic, primitive]) => {
      expect(PRIMITIVE_TOKEN_VALUES).toHaveProperty(
        primitive,
        expect.any(String),
      );
    });
  });

  it('title uses the largest font size (4xl = 36px)', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-title-size'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('36px');
  });

  it('title uses bold weight', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-title-weight'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('700');
  });

  it('heading uses semibold weight', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-heading-weight'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('600');
  });

  it('body uses base font size (16px)', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-body-size'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('16px');
  });

  it('body uses regular weight', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-body-weight'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('400');
  });

  it('label uses medium weight (heavier than body, lighter than headings)', () => {
    const primitive = TYPOGRAPHY_ROLE_MAPPING['--typography-label-weight'];
    expect(PRIMITIVE_TOKEN_VALUES[primitive]).toBe('500');
  });

  it('label and body-sm share the same font size (14px)', () => {
    const labelPrimitive  = TYPOGRAPHY_ROLE_MAPPING['--typography-label-size'];
    const bodySmPrimitive = TYPOGRAPHY_ROLE_MAPPING['--typography-body-sm-size'];
    expect(PRIMITIVE_TOKEN_VALUES[labelPrimitive]).toBe('14px');
    expect(PRIMITIVE_TOKEN_VALUES[bodySmPrimitive]).toBe('14px');
  });

  it('heading and title both use tight line-height', () => {
    const titleLh   = TYPOGRAPHY_ROLE_MAPPING['--typography-title-line-height'];
    const headingLh = TYPOGRAPHY_ROLE_MAPPING['--typography-heading-line-height'];
    expect(PRIMITIVE_TOKEN_VALUES[titleLh]).toBe('1.25');
    expect(PRIMITIVE_TOKEN_VALUES[headingLh]).toBe('1.25');
  });

  it('body and body-sm use normal line-height', () => {
    const bodyLh   = TYPOGRAPHY_ROLE_MAPPING['--typography-body-line-height'];
    const bodySmLh = TYPOGRAPHY_ROLE_MAPPING['--typography-body-sm-line-height'];
    expect(PRIMITIVE_TOKEN_VALUES[bodyLh]).toBe('1.5');
    expect(PRIMITIVE_TOKEN_VALUES[bodySmLh]).toBe('1.5');
  });
});
