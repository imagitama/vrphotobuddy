export const searchIndexNames = {}

export const searchIndexNameLabels = {}

function isSearchRoute() {
  return window.location.pathname.includes('search')
}

function getInitialSearchIndexName() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = chunks[2]
    const foundSearchIndex = Object.entries(searchIndexNameLabels).find(
      ([, label]) => label === foundSearchIndexLabel
    )

    if (!foundSearchIndex) {
      throw new Error(
        `Found search index label "${foundSearchIndexLabel}" but no exist: ${Object.values(
          searchIndexNameLabels
        )}`
      )
    }

    return foundSearchIndex[0]
  }

  // TODO: Fix
  return ''
}

function getInitialSearchTerm() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = decodeURIComponent(chunks[3])
    return foundSearchIndexLabel
  }

  return ''
}

const initialState = {
  isMenuOpen: false,
  searchTerm: getInitialSearchTerm(),
  searchIndexName: getInitialSearchIndexName()
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const CHANGE_SEARCH_INDEX_NAME = 'CHANGE_SEARCH_INDEX_NAME'

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MENU:
      return {
        ...state,
        isMenuOpen: true
      }

    case CLOSE_MENU:
      return {
        ...state,
        isMenuOpen: false
      }

    case CHANGE_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload.searchTerm
      }

    case CHANGE_SEARCH_INDEX_NAME:
      return {
        ...state,
        searchIndexName: action.payload.searchIndexName
      }

    default:
      return state
  }
}

// ACTIONS

export const openMenu = () => dispatch => {
  dispatch({
    type: OPEN_MENU
  })
}

export const closeMenu = () => dispatch => {
  dispatch({
    type: CLOSE_MENU
  })
}

export const changeSearchTerm = (searchTerm = '') => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_TERM,
    payload: {
      searchTerm
    }
  })
}

export const changeSearchIndexName = searchIndexName => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_INDEX_NAME,
    payload: {
      searchIndexName
    }
  })
}
