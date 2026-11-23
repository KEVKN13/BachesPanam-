const reportService = require('../services/reportService')
const asyncHandler = require('../utils/asyncHandler')

const list = asyncHandler(async (req, res) => {
  const reports = await reportService.listReports(req.query)

  res.json({ ok: true, count: reports.length, data: reports })
})

const getById = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(req.params.id)

  res.json({ ok: true, data: report })
})

const create = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.body, req.file, req.user)

  res.status(201).json({ ok: true, data: report })
})

const vote = asyncHandler(async (req, res) => {
  const report = await reportService.voteReport(req.params.id, req.user)

  res.json({ ok: true, data: report })
})

const updateStatus = asyncHandler(async (req, res) => {
  const report = await reportService.updateStatus(req.params.id, req.body?.estado, req.user)

  res.json({ ok: true, data: report })
})

module.exports = { list, getById, create, vote, updateStatus }
