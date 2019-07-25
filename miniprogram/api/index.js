const album = require('./album')
const photo = require('./photo')
const image = require('./image')

module.exports = {
    db: {
        ...album,
        ...photo
    },
    image
}