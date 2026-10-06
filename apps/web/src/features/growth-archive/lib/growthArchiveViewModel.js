export const GROWTH_ARCHIVE_FILTERS = ['全部', '动态', '图片', '视频', '赛事', '教师评价']

const eventTypeLabels = {
  MOMENT: '动态',
  IMAGE: '图片',
  VIDEO: '视频',
  COMPETITION: '赛事',
  COMPETITION_REGISTRATION: '赛事报名',
  EVALUATION: '教师评价',
  TEACHER_EVALUATION: '教师评价',
  MANUAL: '人工记录'
}

const sourceTypeLabels = {
  MOMENT: '幼儿动态',
  IMAGE: '幼儿动态图片',
  VIDEO: '幼儿动态视频',
  COMPETITION: '赛事',
  COMPETITION_REGISTRATION: '赛事报名',
  EVALUATION: '教师评价',
  TEACHER_EVALUATION: '教师评价',
  MANUAL: '人工记录'
}

export function growthArchiveEventLabel(record = {}) {
  return eventTypeLabels[record.eventType]
    || eventTypeLabels[record.sourceType]
    || '其他记录'
}

export function growthArchiveSourceLabel(record = {}) {
  return sourceTypeLabels[record.sourceType]
    || sourceTypeLabels[record.eventType]
    || `${growthArchiveEventLabel(record)}来源`
}

export function growthArchiveSourceRoute(record = {}) {
  const sourceId = record.sourceId
  if (sourceId === undefined || sourceId === null || sourceId === '') return null
  const sourceType = String(record.sourceType || record.eventType || '').toUpperCase()
  if (['MOMENT', 'IMAGE', 'VIDEO'].includes(sourceType)) {
    return { path: '/activities', query: { momentId: sourceId } }
  }
  if (['COMPETITION', 'COMPETITION_REGISTRATION'].includes(sourceType)) {
    return { path: '/competitions', query: { competitionId: sourceId } }
  }
  return null
}

export function formatGrowthArchiveDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function normalizeGrowthArchiveRecord(record = {}) {
  return {
    id: record.profileEventId || record.id || record.sourceId,
    date: formatGrowthArchiveDate(record.occurredAt || record.createdAt),
    type: growthArchiveEventLabel(record),
    title: record.title || '成长记录',
    summary: record.summary || '',
    source: growthArchiveSourceLabel(record),
    sourceTo: growthArchiveSourceRoute(record)
  }
}

export function growthArchiveItems(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.students || payload?.records || []
}

export function growthArchiveClassIds(payload) {
  return growthArchiveItems(payload)
    .map(item => item.classId ?? item.id)
    .filter(id => id !== null && id !== undefined && id !== '')
    .map(String)
}

export function scopeGrowthArchiveStudentsToClasses(students = [], classIds = []) {
  const allowedClassIds = new Set(classIds.map(String))
  if (!allowedClassIds.size) return []
  return students.filter(student => {
    const primaryClass = student.primaryClass || {}
    return [primaryClass, ...(student.classes || [])]
      .map(item => item?.classId ?? item?.id)
      .filter(id => id !== null && id !== undefined && id !== '')
      .some(id => allowedClassIds.has(String(id)))
  })
}

export function normalizeGrowthArchiveStudent(student = {}) {
  const primaryClass = student.primaryClass
    || student.classes?.find(item => item.primary)
    || student.classes?.[0]
    || {}
  const id = student.id ?? student.studentId
  const name = student.name || '未命名学生'
  const studentNo = student.studentNo || ''
  const className = student.className || primaryClass.className || ''
  const details = [studentNo ? `学号 ${studentNo}` : '', className].filter(Boolean)
  return {
    id: String(id),
    name,
    label: details.length ? `${name}（${details.join(' · ')}）` : name
  }
}
