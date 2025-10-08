import { extendTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary']
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary']
  }
}

export const theme = extendTheme({
// @ts-expect-error IDE
  cssVariables: true,
  // Global design tokens
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.06)',
    '0 2px 12px rgba(31,41,55,0.08)',
    '0 4px 20px rgba(31,41,55,0.10)',
    '0 8px 28px rgba(31,41,55,0.12)',
    ...Array(19).fill('0 2px 12px rgba(31,41,55,0.08)')
  ] as any,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#3B82F6' },
        secondary: { main: '#34D399' },
        success: { main: '#10B981' },
        error: { main: '#EF4444' },
        warning: { main: '#FBBF24' },
        info: { main: '#60A5FA' },
        background: { default: '#F9FAFB', paper: '#E5E7EB' },
        text: { primary: '#1F2937', secondary: '#4B5563' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#60A5FA' },
        secondary: { main: '#34D399' },
        success: { main: '#34D399' },
        error: { main: '#F87171' },
        warning: { main: '#FBBF24' },
        info: { main: '#93C5FD' },
        background: { default: '#0F172A', paper: '#111827' },
        text: { primary: '#E5E7EB', secondary: '#9CA3AF' },
      },
    },
  },
  typography: {
    fontFamily: 'InterVariable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.57 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html': {
          scrollBehavior: 'smooth',
        },
        ':root': {
          '--np-bg-gradient': 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
        },
        'html[data-mui-color-scheme="light"]': {
          '--np-bg-gradient': 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
        },
        'html[data-mui-color-scheme="dark"]': {
          '--np-bg-gradient': 'linear-gradient(135deg, #0F172A 0%, #111827 100%)',
        },
        'body[data-mui-color-scheme="light"]': {
          '--np-bg-gradient': 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
        },
        'body[data-mui-color-scheme="dark"]': {
          '--np-bg-gradient': 'linear-gradient(135deg, #0F172A 0%, #111827 100%)',
        },
        'html, body, #root': {
          height: '100%',
          background: 'var(--np-bg-gradient) !important',
          color: 'var(--mui-palette-text-primary) !important',
          transition: 'background-color 200ms ease, color 200ms ease, background 200ms ease',
        },
        // Focus ring (accessibility)
        '*:focus-visible': {
          outline: '2px solid transparent',
          boxShadow: '0 0 0 3px rgba(59,130,246,0.45)',
          borderRadius: '8px',
          transition: 'box-shadow 120ms ease',
        },
        // Scrollbar styling (WebKit)
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(100,116,139,0.35)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(100,116,139,0.55)'
        },
        // Reduced motion support
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important'
          }
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: { shrink: true },
        variant: 'outlined',
        margin: 'normal',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px var(--mui-palette-background-paper) inset',
            WebkitTextFillColor: 'inherit',
            transition: 'background-color 9999s ease-out 0s',
          },
        },
        root: {
          transition: 'border-color 140ms ease, box-shadow 140ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(59,130,246,0.5)'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-primary-main)',
            boxShadow: '0 0 0 3px rgba(59,130,246,0.15)'
          }
        }
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 120ms ease, filter 160ms ease, box-shadow 160ms ease',
          '&:hover': { filter: 'brightness(0.985)' },
          '&:active': { transform: 'translateY(1px)' }
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
            boxShadow: '0 6px 20px rgba(59,130,246,0.25)',
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'background-color 120ms ease, transform 120ms ease',
          '&:hover': { backgroundColor: 'rgba(59,130,246,0.08)' },
          '&:active': { transform: 'scale(0.98)' }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backdropFilter: 'saturate(180%) blur(8px)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
        root: { boxShadow: '0 2px 12px rgba(31,41,55,0.08)' },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 120ms ease',
          '&:hover': { backgroundColor: 'rgba(148,163,184,0.08)' }
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': { fontWeight: 700 }
        }
      }
    },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { fontWeight: 600 }
      }
    }
  },
})

export default theme


