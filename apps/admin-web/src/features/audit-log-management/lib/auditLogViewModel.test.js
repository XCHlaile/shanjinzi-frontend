import assert from 'node:assert/strict'
import test from 'node:test'

import {
  auditActionDescription,
  auditExportFilter,
  auditExportTaskDetail,
  auditMessageBroadcastDetail,
  auditOperatorLabel,
  auditReferenceKey,
  auditTargetDescription,
  auditTargetTypeLabel,
  auditTextPreview,
  auditTitledDetail,
  auditUserDetail,
  matchesAuditLog,
  shortAuditDate
} from './auditLogViewModel.js'

test('audit log view model always renders Chinese action and target labels', () => {
  const details = new Map([
    [auditReferenceKey('User', 2), '赵老师（13900000000）'],
    [auditReferenceKey('School', 3), '山前幼儿园']
  ])

  assert.equal(auditTargetTypeLabel('SchoolClass'), '班级')
  assert.equal(auditTargetTypeLabel('Unknown'), '其他对象')
  assert.equal(auditActionDescription({
    action: 'RESET_PASSWORD',
    targetType: 'User',
    targetId: 2
  }, details), '重置赵老师（13900000000）的密码')
  assert.equal(auditActionDescription({
    action: 'UPDATE_STATUS',
    targetType: 'School',
    targetId: 3
  }, details), '更新学校：山前幼儿园的状态')
  assert.equal(auditActionDescription({
    action: 'CUSTOM',
    targetType: 'School'
  }), '其他操作')
  assert.equal(auditTargetDescription({
    targetType: 'School',
    targetId: 3
  }, details), '学校：山前幼儿园')
})

test('audit log view model resolves operator identity and roles', () => {
  const names = new Map([['2', '赵老师']])

  assert.equal(auditOperatorLabel({
    operatorUserId: 2,
    operatorRoleCode: 'TEACHER'
  }, names), '赵老师（教师）')
  assert.equal(auditOperatorLabel({
    actorName: '系统管理员',
    operatorRoleCode: 'SUPER_ADMIN'
  }), '系统管理员（超级管理员）')
  assert.equal(auditOperatorLabel({}), '系统')
})

test('audit log view model filters descriptions and inclusive date ranges', () => {
  const details = new Map([[auditReferenceKey('School', 3), '山前幼儿园']])
  const row = {
    action: 'UPDATE',
    targetType: 'School',
    targetId: 3,
    createdAt: '2026-07-31T12:00:00'
  }

  assert.equal(matchesAuditLog(row, {
    keyword: '山前',
    range: ['2026-07-31', '2026-07-31'],
    objectDetails: details
  }), true)
  assert.equal(matchesAuditLog(row, {
    range: ['2026-08-01', '2026-08-02'],
    objectDetails: details
  }), false)
})

test('audit log view model describes reference records', () => {
  assert.equal(auditTextPreview('  一段   消息  '), '一段 消息')
  assert.equal(auditUserDetail({
    realName: '赵老师',
    phone: '13900000000'
  }), '赵老师（13900000000）')
  assert.equal(auditMessageBroadcastDetail({
    scope: 'SCHOOL',
    content: '学校通知'
  }), '学校消息：“学校通知”')
  assert.equal(auditExportTaskDetail({ taskType: 'AUDIT_LOGS' }), '审计日志导出')
  assert.equal(auditTitledDetail({ title: '平台规则' }), '《平台规则》')
})

test('audit log view model builds export filters and dates', () => {
  assert.deepEqual(auditExportFilter({
    keyword: ' 更新 ',
    range: ['2026-07-01', new Date('2026-07-31T12:00:00Z')]
  }), {
    keyword: '更新',
    startDate: '2026-07-01',
    endDate: '2026-07-31'
  })
  assert.equal(shortAuditDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
})
