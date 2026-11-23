const express = require('express')
const reportController = require('../controllers/reportController')
const { protect, staffOnly } = require('../middlewares/auth')
const upload = require('../middlewares/upload')

const router = express.Router()

router.get('/', reportController.list)
router.get('/:id', reportController.getById)
router.post('/', protect, upload, reportController.create)
router.post('/:id/vote', protect, reportController.vote)
router.patch('/:id/status', protect, staffOnly, reportController.updateStatus)

module.exports = router
