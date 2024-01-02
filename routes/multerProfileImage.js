const multer = require('multer');
const {v4:uuidv4} = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/profileImages/')
    },
    filename: function (req, file, cb) {
        const unique = uuidv4()
      cb(null, `${req.user.username}_${unique}${path.extname(file.originalname)}`)
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload