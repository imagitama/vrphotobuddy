import { useEffect, useState, useRef } from 'react'
import useDatabaseQuery, {
  getWhereClausesAsString,
  getOrderByAsString,
  options
} from './useDatabaseQuery'

const maxResultsPerPage = 20

function getUpdateResultsDependency(queryResults) {
  if (queryResults === null || !queryResults.length) {
    return null
  }

  return queryResults[0].id
}

function getWhichSnapshotToStartAfter(pageNumber, resultsByPageNumber) {
  if (pageNumber === 1) {
    return undefined
  }

  const prevPageNumber = pageNumber - 1
  const prevPageResults = resultsByPageNumber[prevPageNumber]
  const numberOfResultsForPrevPage = prevPageResults.length

  if (numberOfResultsForPrevPage.length === 0) {
    return undefined
  }

  return prevPageResults[numberOfResultsForPrevPage - 1].snapshot
}

export default (
  overridePageNumber,
  collectionName,
  whereClauses,
  orderBy,
  subscribe = true
) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [resultsByPageNumber, setResultsByPageNumber] = useState({})

  const startAfterSnapshot = getWhichSnapshotToStartAfter(
    pageNumber,
    resultsByPageNumber
  )

  const hydratePage = newResults =>
    setResultsByPageNumber(currentVal => ({
      ...currentVal,
      [pageNumber]: newResults
    }))

  const [isLoading, isErrored, queryResults] = useDatabaseQuery(
    collectionName,
    whereClauses,
    {
      [options.orderBy]: orderBy,
      [options.subscribe]: subscribe,
      [options.limit]: maxResultsPerPage,
      [options.startAfter]: startAfterSnapshot,
      [options.onSubscribe]: hydratePage
    }
  )

  const isChangingPageNumberRef = useRef(false)

  const isAtEndOfQuery = queryResults && queryResults.length === 0
  const isAllowedToChangePageNumber = !isLoading && !isAtEndOfQuery

  useEffect(() => {
    if (Object.keys(resultsByPageNumber).length === 0) {
      return
    }

    setPageNumber(1)
    setResultsByPageNumber({})
  }, [
    collectionName,
    getWhereClausesAsString(whereClauses),
    getOrderByAsString(orderBy)
  ])

  // useEffect(() => {
  //   if (!queryResults) {
  //     return
  //   }

  //   hydratePage()
  // }, [getUpdateResultsDependency(queryResults)])

  const goToNextPage = () => {
    console.debug('Next page')

    isChangingPageNumberRef.current = true
    setPageNumber(currentNum => currentNum + 1)
  }

  useEffect(() => {
    function onScroll() {
      if (!isAllowedToChangePageNumber) {
        console.debug('Cannot change page number')
        return
      }

      const scrollAmount = Math.floor(window.pageYOffset)
      const offsetMinusInner = document.body.offsetHeight - window.innerHeight

      if (offsetMinusInner - scrollAmount <= 5) {
        // prevent edge case when user scrolls HEAPS and React is still re-rendering
        if (isChangingPageNumberRef.current) {
          console.debug('Cannot change page number (changing already)')
          return
        }

        goToNextPage()
      } else {
        isChangingPageNumberRef.current = false
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [isAllowedToChangePageNumber])

  const allResults = Object.entries(resultsByPageNumber).reduce(
    (combinedResults, [, resultsForPage]) =>
      combinedResults.concat(resultsForPage),
    []
  )

  return [isLoading, isErrored, allResults, isAtEndOfQuery, goToNextPage]
}
