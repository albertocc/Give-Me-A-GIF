(() => {
  const config = {
    limit: 7,
    count: 7,
    baseUrl: 'https://www.reddit.com/r/gifs.json',
    afterUrl: '',
    beforeUrl: ''
  }

  const backgroundPage = chrome.extension.getBackgroundPage()
  if (backgroundPage.currentCount) config.count = backgroundPage.currentCount

  const main = document.querySelector('main')
  const footer = document.querySelector('footer')
  const previous = document.querySelector('.arrow.left')
  const next = document.querySelector('.arrow.right')
  const pagination = document.querySelector('.pagination')

  const getJson = (url) => {
    window.fetch(url)
      .then(response => response.json())
      .then(data => getGifs(data))
      .catch(({ message }) => console.error(`Error: ${message}`))
  }

  if (backgroundPage.currentUrl) getJson(backgroundPage.currentUrl)
  else getJson(`${config.baseUrl}?limit=${config.limit}`)

  const getGifs = ({ data }) => {
    while (main.firstChild) main.removeChild(main.firstChild)

    for (const child of data.children) createPost(child.data)
    config.beforeUrl = `${config.baseUrl}?limit=${config.limit}&count=${config.count}&before=${data.before}`
    config.afterUrl = `${config.baseUrl}?limit=${config.limit}&count=${config.count}&after=${data.after}`

    footer.style.display = 'flex'
    if (config.count > config.limit) previous.style.visibility = 'visible'
    else previous.style.visibility = 'hidden'
    pagination.textContent = config.count / config.limit
    window.scrollTo(0, 0)
  }

  const createPost = (data) => {
    if (data.distinguished === 'moderator') return
    if (data.thumbnail.search(/\.(?:jpg|gif|png)/i) !== -1) {
      const title = document.createElement('header')
      const link = document.createElement('a')
      const post = document.createElement('article')
      let url = data.url.replace(/^http:\/\//, 'https://')
      title.innerHTML = data.title
      link.href = `https://reddit.com${data.permalink}`
      link.target = '_blank'
      link.rel = 'noopener'
      title.appendChild(link)
      post.appendChild(title)

      switch (true) {
        case url.search(/\.gifv/i) !== -1: {
          const video = document.createElement('video')
          const source = document.createElement('source')
          url = url.replace(/\.gifv/, '.mp4')
          source.src = url
          source.type = 'video/mp4'
          video.preload = 'auto'
          video.loop = true
          video.autoplay = true
          video.appendChild(source)
          post.appendChild(video)
          break
        }
        case url.search(/\.(?:jpg|gif)/i) !== -1: {
          const img = new window.Image()
          img.src = url
          img.loading = 'lazy'
          img.alt = data.title
          post.appendChild(img)
          break
        }
        case url.search(/gfycat\.com\//i) !== -1: {
          const iframe = document.createElement('iframe')
          url = url.replace(/gfycat\.com/, 'gfycat.com/ifr')
          url = `${url.split('-')[0]}?controls=0`
          iframe.width = '100%'
          iframe.height = 600
          iframe.src = url
          iframe.loading = 'lazy'
          post.appendChild(iframe)
          break
        }
        default:
          console.log('Unknown source :(', url)
      }
      main.appendChild(post)
    }
  }

  previous.addEventListener('click', e => {
    e.preventDefault()
    config.count -= config.limit
    backgroundPage.saveCurrentPage(config.count, config.beforeUrl)
    getJson(config.beforeUrl)
  })

  next.addEventListener('click', e => {
    e.preventDefault()
    config.count += config.limit
    backgroundPage.saveCurrentPage(config.count, config.afterUrl)
    getJson(config.afterUrl)
  })
})()
