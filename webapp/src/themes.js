import { createMuiTheme } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from './media-queries'

const colorBrand = '#0E6BA8'
const colorBrandLight = '#479ED3'
const colorBrandDark = '#0A4970'

const colorSecondary = '#001C55'
const colorSecondaryLight = '#0A2472'
const colorSecondaryDark = '#00072D'

const colorTertiary = '#A6E1FA'

const createTheme = isDark =>
  createMuiTheme({
    palette: {
      type: isDark ? 'dark' : undefined,
      primary: {
        light: colorBrandLight,
        main: colorBrand,
        dark: colorBrandDark
      },
      secondary: {
        light: colorSecondaryLight,
        main: colorSecondary,
        dark: colorSecondaryDark
      },
      tertiary: {
        main: colorTertiary
      },
      background: {
        default: colorSecondaryDark
      },
      paper: {
        hover: {
          shadow: isDark ? '#FFF' : '#000'
        },
        selected: {
          shadow: isDark ? '#FFF' : '#000'
        }
      }
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            WebkitFontSmoothing: 'auto'
          },
          a: {
            color: isDark ? colorBrandLight : colorBrand,
            textDecoration: 'none'
          },
          strong: {
            fontWeight: 600
          },
          blockquote: {
            margin: '1rem',
            padding: '0.2rem 0.2rem 0.2rem 1rem',
            borderLeft: `4px solid ${isDark ? '#5a5a5a' : '#b7b7b7'}`,
            background: isDark ? '#383838' : '#d9d9d9'
          }
        }
      },
      MuiCardContent: {
        root: {
          [mediaQueryForTabletsOrBelow]: {
            '&, &:last-child': {
              padding: '0.5rem'
            }
          }
        }
      }
    }
  })

export const lightTheme = createTheme(false)
export const darkTheme = createTheme(true)
