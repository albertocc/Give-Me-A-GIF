(() => {
  const config = {
    page: 25,
    baseUrl: 'https://www.reddit.com/r/gifs.json',
    currentUrl: '',
    afterUrl: '',
    beforeUrl: ''
  }

  const main = document.querySelector('main')
  const previous = document.querySelector('.arrow.left')
  const next = document.querySelector('.arrow.right')
  const footer = document.querySelector('footer')

  getJson(config.baseUrl)

  function getJson (url) {
    fetch(url)
      .then(response => response.json())
      .then(data => getGifs(data))
      .catch(({ message }) => console.error(`Error: ${message}`))
  }

  function getGifs ({ data }) {
    while (main.firstChild) main.removeChild(main.firstChild)

    for (child of data.children) createPost(child.data)
    config.beforeUrl = `${config.baseUrl}?count=${config.page}&before=${data.before}`
    config.afterUrl = `${config.baseUrl}?count=${config.page}&after=${data.after}`

    if (getComputedStyle(footer).display === 'none') { footer.style.display = 'flex' }
    if (config.page > 25) previous.style.visibility = 'visible'
    else previous.style.visibility = 'hidden'
    window.scrollTo(0, 0)
  }

  function createPost (data) {
    if (data.distinguished === 'moderator') return
    if (data.thumbnail.search(/\.(?:jpg|gif|png)/i) !== -1) {
      const title = document.createElement('header')
      const link = document.createElement('a')
      const post = document.createElement('article')
      let url = data.url.replace('http://', 'https://')
      title.innerText = data.title
      link.href = `https://reddit.com${data.permalink}`
      link.target = '_blank'
      link.rel = 'noopener'
      title.appendChild(link)
      post.appendChild(title)

      switch (true) {
        case url.search(/\.gifv/i) !== -1:
          const video = document.createElement('video')
          const source = document.createElement('source')
          url = url.replace('.gifv', '.mp4')
          source.src = url
          source.type = 'video/mp4'
          video.preload = 'auto'
          video.loop = true
          video.autoplay = true
          video.appendChild(source)
          post.appendChild(video)
          break
        case url.search(/\.(?:jpg|gif)/i) !== -1:
          const img = new Image()
          img.src = url
          post.appendChild(img)
          break
        case url.search(/gfycat\.com\//i) !== -1:
          const iframe = document.createElement('iframe')
          url = `${url.replace('gfycat.com/', 'gfycat.com/ifr/')}?controls=0`
          iframe.width = '100%'
          iframe.height = 600
          iframe.src = url
          post.appendChild(iframe)
          break
        default:
          console.log('unknown source :(', url)
      }
      main.appendChild(post)
    }
  }

  previous.addEventListener('click', e => {
    e.preventDefault()
    config.page -= 25
    config.currentUrl = config.beforeUrl
    getJson(config.beforeUrl)
  })

  next.addEventListener('click', e => {
    e.preventDefault()
    config.page += 25
    config.currentUrl = config.afterUrl
    getJson(config.afterUrl)
  })
})()
