import 'babel-polyfill'
import express from 'express'
import renderer from './renderer'
import createStore from '../client/helpers/createStore'
import Cookies from 'universal-cookie'
import bodyParser from 'body-parser'
import puppeteer from 'puppeteer'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.post('/scrape', async (req, res) => {
  try {
    const { query } = req.body

    const browser = await puppeteer.launch({
      headless: true
    })
    const page = await browser.newPage()
    await page.goto('https://dev.to/')

    await page.waitFor('#nav-search')
    await page.type('#nav-search', query)
    await page.keyboard.press('Enter')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    const content = await page.$('.single-article')
    if (content !== null) {

      // const articleEl = await page.$$('.single-article h3')

      // const titleEl = await page.$('.single-article h3')
      // const title = await page.evaluate(titleEl => titleEl.textContent, titleEl)

      // const likeCountEl = await page.$('.single-article .reactions-count .engagement-count-number')
      // const likeCount = await page.evaluate(likeCountEl => likeCountEl.textContent, likeCountEl)

      // const commentCountEl = await page.$('.single-article .comments-count .engagement-count-number')
      // const commentCount = await page.evaluate(commentCountEl => commentCountEl.textContent, commentCountEl)

      // const readingTimeEl = await page.$('.single-article .article-reading-time')
      // const readingTime = await page.evaluate(readingTimeEl => readingTimeEl.textContent, readingTimeEl)

      // const articleLinkEl = await page.$('.single-article .index-article-link')
      // const articleLink = await page.evaluate(articleLinkEl => articleLinkEl.href, articleLinkEl)

      const articles = await page.$$('.single-article')
      const posts = []

      for (const article of articles) {
        const title = await article.$eval('h3', element => element.textContent)
        let likeCount = 0
        try {
          likeCount = await article.$eval('.article-engagement-count.reactions-count', element => element.textContent)
        } catch (error) { /* do nothing */ }
        let commentCount = 0
        try {
          commentCount = await article.$eval('.article-engagement-count.comments-count', element => element.textContent)
        } catch (error) { /* do nothing */ }
        const readingTime = await article.$eval('.article-reading-time', element => element.textContent)
        const articleLink = await article.$eval('.index-article-link', element => element.href)

        posts.push({
          title,
          likeCount,
          commentCount,
          readingTime,
          articleLink
        })
      }

      return res.status(200).json({
        data: {
          posts
        }
      })
    } else {
      return res.status(200).json({
        data: {
          posts: []
        }
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: error.message
    })
  }
})

app.get('/cookies', (req, res) => {
  const cookies = new Cookies(req.headers.cookie)
  const allCookies = cookies.getAll()
  res.status(200).end(JSON.stringify(allCookies))
})

// custom middleware to get cookie
app.use((req, res, next) => {
  const cookies = new Cookies(req.headers.cookie)
  req.universalCookies = cookies
  next()
})

// universal route handling
app.get('*', function (req, res) {
  const store = createStore(req)
  const context = {}

  renderer(req.path, context, store, req, res)
})

export default app
