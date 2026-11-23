const adminService = require('../services/adminService')
const asyncHandler = require('../utils/asyncHandler')

const getStats = asyncHandler(async (req, res) => {
  const data = await adminService.getStats()
  res.json({ ok: true, data })
})

module.exports = { getStats }
