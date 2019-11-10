import React from 'react'
import PropTypes from 'prop-types'

const NotFound = ({ staticContext }) => {
  if (staticContext) {
    staticContext.notFound = true
  }
  return <div>Not found</div>
}

NotFound.propTypes = {
  staticContext: PropTypes.object
}

export default NotFound
