import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@material-ui/icons/Menu'

import * as routes from '../../routes'
import { openMenu } from '../../modules/app'
import {
  queryForMobiles,
  mediaQueryForMobiles,
  mediaQueryForDesktopsOnly,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import { trackAction } from '../../analytics'

import MobileMenu from '../mobile-menu'
import DesktopAccountMenu from '../desktop-account-menu'
import Searchbar from '../searchbar'
import DesktopMenu from '../desktop-menu'
import logoUrl from '../../assets/images/logo.png'

// when the navigation starts obstructing the logo
const mediaQueryForMenuLogoCollision = '@media (max-width: 1280px)'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    padding: '1rem 1rem 0',
    display: 'flex',
    alignItems: 'center'
  },
  floatingMenu: {},
  searchBar: {
    width: '100%'
  },
  searchBarInner: {
    width: '50%',
    margin: '0.5rem auto 0',
    [mediaQueryForMobiles]: {
      width: '100%',
      marginBottom: '0.5rem'
    }
  },
  desktopMenu: {
    width: '100%'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'start',
    '& img': {
      marginLeft: '1rem',
      width: '60px'
    }
  },
  socialIcons: {
    marginLeft: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.5rem',
      opacity: '0.75',
      transition: 'all 100ms',
      '&:hover': {
        opacity: 1
      }
    },
    '& svg': {
      width: 'auto', // fix patreon icon
      height: '0.75em'
    },
    '& path': {
      fill: '#FFF'
    }
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    fontSize: '200%',
    whiteSpace: 'nowrap',
    '& svg': {
      marginLeft: '0.5rem',
      fontSize: '200%'
    }
  },
  menuToggleButton: {
    position: 'absolute',
    top: 0,
    right: 0,

    [mediaQueryForDesktopsOnly]: {
      display: 'none'
    }
  },
  menuToggleIcon: {
    width: '4rem',
    height: '3rem',
    fill: 'white'
  },
  invisible: {
    visibility: 'hidden'
  },
  homepage: {
    top: '100%'
  }
})

export default () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const dispatchOpenMenu = () => dispatch(openMenu())
  const bannerUrl = useSelector(({ app }) => app.bannerUrl)
  // const location = useLocation()

  const onToggleMobileMenuClick = () => {
    dispatchOpenMenu()
    trackAction('Header', 'Click open mobile menu button')
  }

  return (
    <header className={classes.root}>
      <div className={classes.logoWrapper}>
        <Link
          to={routes.home}
          title="Go to the homepage"
          className={classes.logo}>
          VR Photo Buddy <img src={logoUrl} alt="Logo" />
        </Link>
      </div>

      <div className={classes.searchBar}>
        <div className={classes.searchBarInner}>{/* <Searchbar /> */}</div>
        {!isMobile && (
          <div className={classes.desktopMenu}>
            <DesktopMenu />
          </div>
        )}
      </div>

      <div className={classes.floatingMenu}>
        {!isMobile && <DesktopAccountMenu />}
        {isMobile && (
          <Button
            className={classes.menuToggleButton}
            onClick={onToggleMobileMenuClick}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </Button>
        )}
      </div>

      {isMobile && <MobileMenu />}

      <div
        className={`${classes.background} ${
          bannerUrl ? classes.withBanner : ''
        }`}
      />
    </header>
  )
}
