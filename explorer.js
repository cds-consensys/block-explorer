const blockQuery = async args => {
  const api = require('./api')(args)

  return {
    totalTransferred: 0
  }
}

const displayReport = db => {
  console.log('This is not the report you were looking for.')
}

module.exports = {
  blockQuery,
  displayReport
}
