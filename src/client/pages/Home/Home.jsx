import React, { useState } from 'react'
import SEO from 'client/components/common/SEO/SEO'
import axios from 'axios'

import styles from './Home.module.scss'

const Home = () => {
  const [loading, toggleLoading] = useState(false)
  const [submitted, toggleSubmitted] = useState(false)
  const [posts, setPosts] = useState([])

  const handleSubmit = async (e) => {

    try {
      e.preventDefault()
      e.persist()
      toggleLoading(true)
      const formData = new FormData(e.target)
      const response = await axios.post(process.env.PORT || 'http://localhost:3000/scrape', { query: formData.get('query') })
      setPosts(response.data.data.posts)
      toggleSubmitted(true)
      // e.target.reset()
    } catch (error) {
      setPosts([])
      return error
    } finally {
      toggleSubmitted(true)
      toggleLoading(false)
    }

  }

  return (
    <div className={styles.container}>
      <SEO title="Home page" description="Home page description" />
      <h1 className={styles.mainTitle}>Simple scraper</h1>
      <hr className={styles.divider} />
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input type="search" name="query" required autoComplete="off" placeholder="Search..." />
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
      {
        loading ? (
          <div className={styles.resultContainer}>
            <h3>Fetching ...</h3>
          </div>
        ) : !loading && submitted ? (
          posts.length ? (
            posts.map((post, index) => {
              return (
                <div onClick={() => window.open(post.articleLink, '_blank')} className={`${styles.resultContainer} ${styles.withResult}`} key={index}>
                  <h3 className={styles.title}>{post.title}</h3>
                  <p className={styles.likeCount}>{post.likeCount} like{post.likeCount > 1 ? 's' : ''}</p>
                  <p className={styles.commentCount}>{post.commentCount} comment{post.commentCount > 1 ? 's' : ''}</p>
                  <p className={styles.readingTime}>{post.readingTime}</p>
                </div>
              )
            })
          ) : (
              <div className={styles.resultContainer}>
                <h3>No result, please try other keywords</h3>
              </div>
            )
        ) : null
      }
    </div>
  )
}

export default Home
