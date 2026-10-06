export const DASHBOARD_MODULE_COPY = {
  '/student-switcher': '多学生家庭可切换当前学生上下文。',
  '/growth-archive': '按时间线查看动态、照片、赛事和评价。',
  '/activities': '查看当前学生可见的班级动态。',
  '/competitions': '查看赛事、报名状态并提交报名。',
  '/school/students': '查看后端返回的学生名册与接口能力状态。',
  '/school/classes': '维护本校班级、班主任与学生成员。',
  '/school/teachers': '管理本校教师账号与使用状态。',
  '/school/parents': '查看家长账号及其学生关联。',
  '/school/bindings': '查看绑定审核接口的接入状态。',
  '/school/operations': '查看审计记录并处理数据导出。',
  '/teacher/classes': '查看负责班级、学生和家长联系方式。',
  '/messages': '按学校和班级边界进行私信沟通。',
  '/forum': '参与家长、教师与园所间的主题交流。',
  '/news': '查看平台新闻、课程资讯与活动信息。'
}

export function dashboardPrimaryTask(role, currentStudent) {
  const studentName = currentStudent?.name || currentStudent?.studentName
  const hasCurrentStudent = Boolean(
    currentStudent?.id
    || currentStudent?.studentId
    || currentStudent?.currentStudentId
  )

  if (role === 'parent' && !hasCurrentStudent) {
    return {
      path: '/student-switcher',
      action: '选择学生',
      title: '先选择今天要查看的孩子',
      description: '成长档案、班级动态和赛事信息都会跟随当前学生切换。',
      quickPaths: ['/messages', '/competitions']
    }
  }

  if (role === 'parent') {
    return {
      path: '/growth-archive',
      action: '查看成长档案',
      title: studentName ? `继续关注 ${studentName} 的成长` : '继续关注孩子的成长',
      description: '从最新动态、照片与赛事记录中，看见孩子每一次探索。',
      quickPaths: ['/activities', '/competitions']
    }
  }

  if (role === 'teacher') {
    return {
      path: '/teacher/classes',
      action: '查看班级学生',
      title: '从负责班级开始今天的工作',
      description: '先确认班级和学生情况，再发布动态或回复家校消息。',
      quickPaths: ['/activities', '/messages']
    }
  }

  return {
    path: '/school/students',
    action: '管理学生名册',
    title: '先处理本校学生与班级数据',
    description: '从学生名册进入日常校务，并按需维护班级和成员关系。',
    quickPaths: ['/school/classes', '/school/operations']
  }
}

export function dashboardCardsFromSummary(summary = {}) {
  const stats = summary.stats || {}
  if (!Object.keys(stats).length) return null
  return [
    {
      label: '绑定学生',
      value: String(stats.boundStudentCount ?? 0),
      note: '当前账号关联学生'
    },
    {
      label: '最新动态',
      value: String(stats.latestMomentCount ?? 0),
      note: '近期班级动态'
    },
    {
      label: '可报名赛事',
      value: String(stats.availableCompetitionCount ?? 0),
      note: '当前学生可见赛事'
    },
    {
      label: '当前学生',
      value: summary.currentStudent?.name || '-',
      note: summary.currentStudent?.schoolName || '学生上下文'
    }
  ]
}

export function teacherDashboardCardsFromSummary(summary = {}) {
  const stats = summary.stats || {}
  if (!Object.keys(stats).length) return null
  return [
    {
      label: '负责班级',
      value: String(stats.classCount ?? 0),
      note: '当前教师负责的班级'
    },
    {
      label: '班级学生',
      value: String(stats.studentCount ?? 0),
      note: '负责班级内学生总数'
    },
    {
      label: '今日动态',
      value: String(stats.todayMomentCount ?? 0),
      note: '今日发布的班级动态'
    },
    {
      label: '未读消息',
      value: String(stats.unreadMessageCount ?? 0),
      note: '待查看的家校消息'
    },
    {
      label: '未读通知',
      value: String(stats.unreadNotificationCount ?? 0),
      note: '待查看的系统通知'
    },
    {
      label: '可用赛事',
      value: String(stats.availableCompetitionCount ?? 0),
      note: '当前可参与的赛事'
    }
  ]
}

export function normalizeDashboardStudent(student = {}) {
  const primaryClass = student.primaryClass
    || student.classes?.find(item => item.primary)
    || student.classes?.[0]
    || {}
  return {
    ...student,
    id: student.id || student.studentId,
    name: student.name || student.studentName,
    schoolName: student.schoolName || '-',
    className: student.className || primaryClass.className || primaryClass.name || '-'
  }
}

export function dashboardTitle(role, currentStudent) {
  const hasCurrentStudent = Boolean(
    currentStudent?.id
    || currentStudent?.studentId
    || currentStudent?.currentStudentId
  )
  return ({
    parent: hasCurrentStudent
      ? `正在查看 ${currentStudent.name} 的成长数据`
      : '请选择当前查看的学生',
    teacher: '教师工作台',
    school: '校方管理员工作台'
  })[role] || '工作台'
}

export function dashboardDescription(role) {
  return ({
    parent: '动态、赛事和成长档案会跟随当前学生切换。',
    teacher: '查看班级学生并处理日常家校协同内容。',
    school: '查看本校已接入的真实数据；未提供接口的模块会明确标注。'
  })[role] || '查看平台业务。'
}

export function dashboardContext(role, currentStudent) {
  const hasCurrentStudent = Boolean(
    currentStudent?.id
    || currentStudent?.studentId
    || currentStudent?.currentStudentId
  )
  return role === 'parent'
    ? {
        title: hasCurrentStudent
          ? `${currentStudent.schoolName || '-'} / ${currentStudent.className || '-'}`
          : '未选择学生',
        description: '家长仅能查看已绑定学生相关数据。'
      }
    : {
        title: '本校数据边界',
        description: '页面仅展示当前角色授权范围内的数据。'
      }
}
