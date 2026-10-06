export function dashboardList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return payload?.items || payload?.records || []
}

export function dashboardPageTotal(payload) {
  const total = Number(payload?.total)
  return Number.isFinite(total) ? total : null
}

export function dashboardStatValue(stats, ...keys) {
  const source = stats || {}
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key]
  }
  return '-'
}

export function dashboardMetrics(stats, schoolAdminCount) {
  const value = (...keys) => dashboardStatValue(stats, ...keys)
  return [
    { label: '总用户数', value: value('totalUsers', 'userCount') },
    { label: '总学校数', value: value('totalSchools', 'schoolCount') },
    { label: '总教师数', value: value('totalTeachers', 'teacherCount') },
    { label: '总家长数', value: value('totalParents', 'parentCount') },
    { label: '总校方管理员数', value: schoolAdminCount ?? '-' },
    { label: '总动态数', value: value('totalActivities', 'momentCount') },
    { label: '总赛事数', value: value('totalCompetitions', 'competitionCount') },
    { label: '总报名数', value: value('totalRegistrations', 'registrationCount') },
    { label: '今日新增用户', value: value('todayUsers', 'todayNewUsers') }
  ]
}

export function trendWidth(item) {
  const value = Number(item.active ?? item.activeUsers ?? item.users ?? item.newUsers ?? 0)
  return `${Math.min(100, value / 6)}%`
}

export function isHighRisk(log) {
  return log.risk === 'HIGH' || log.risk === '高危' || log.riskLevel === 'HIGH'
}
