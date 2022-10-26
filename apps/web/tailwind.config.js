module.exports = {
  mode: 'jit',
  content: ['./src/**/*.tsx', './stories/**/*.tsx'],
  media: false,
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {},
    colors: {
      $T0: 'rgba(0, 0, 0, .85)',
      $T1: 'rgba(0, 0, 0, .45)',
      $T2: 'rgba(0, 0, 0, .25)',
      $T5: 'rgba(0, 0, 0, .04)',

      $PR0: 'rgba(182, 91, 70, .85)',
    },
    fontSize: {
      sm: ['12px', '20px'],
      base: ['14px', '22px'],
      lg: ['16px', '24px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '38px'],
      '4xl': ['38px', '46px'],
      '5xl': ['46px', '54px'],
      '6xl': ['56px', '64px'],
      '7xl': ['68px', '76px'],
    },
    spacing: {
      ii: '2px',
      mn: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
    boxShadow: {
      DEFAULT:
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
