import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary']
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary']
  }
}

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#3B82F6' }, // Sky Blue
        secondary: { main: '#34D399' }, // Mint Green
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
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      defaultProps: {
        InputLabelProps: { shrink: true },
        variant: 'outlined',
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
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 160ms ease',
          '&:hover': { filter: 'brightness(0.98)' },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
          },
        },
      ],
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
  },
})

export default theme


