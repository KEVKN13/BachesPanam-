const Report = require('../models/Report')
const User = require('../models/User')

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10)
}

function lastNDays(n) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

async function getStats() {
  const days = lastNDays(14)
  const since14 = new Date(`${days[0]}T00:00:00.000Z`)

  const [
    totalReports,
    totalUsers,
    repairedReports,
    pendingReports,
    byStatus,
    bySeverity,
    reportsPerDay,
    repairedPerWeek,
    usersPerDay,
  ] = await Promise.all([
    Report.countDocuments(),
    User.countDocuments(),
    Report.countDocuments({ estado: 'Reparado' }),
    Report.countDocuments({ estado: { $ne: 'Reparado' } }),
    Report.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]),
    Report.aggregate([{ $group: { _id: '$gravedad', total: { $sum: 1 } } }]),
    Report.aggregate([
      { $match: { createdAt: { $gte: since14 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Report.aggregate([
      { $match: { estado: 'Reparado', updatedAt: { $gte: new Date(Date.now() - 56 * 86400000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-W%V', date: '$updatedAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: since14 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ])

  const mapSeries = (series, keys) => {
    const lookup = new Map(series.map((item) => [item._id, item.total]))
    return keys.map((key) => ({ label: key, total: lookup.get(key) || 0 }))
  }

  return {
    totals: {
      reports: totalReports,
      users: totalUsers,
      repaired: repairedReports,
      pending: pendingReports,
    },
    byStatus: byStatus.map((item) => ({ label: item._id, total: item.total })),
    bySeverity: bySeverity.map((item) => ({ label: item._id, total: item.total })),
    reportsPerDay: mapSeries(reportsPerDay, days),
    usersPerDay: mapSeries(usersPerDay, days),
    repairedPerWeek: repairedPerWeek.map((item) => ({ label: item._id, total: item.total })),
  }
}

module.exports = { getStats }
