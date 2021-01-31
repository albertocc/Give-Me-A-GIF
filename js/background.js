var currentCount, currentUrl

var saveCurrentPage = (count, url) => {
  currentUrl = url
  currentCount = count
  setTimeout(() => { currentCount = currentUrl = '' }, 20 * 60000)
}
