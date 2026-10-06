import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canDownloadOperationExport,
  displayOperationValue,
  formatOperationTime,
  operationActionLabel,
  operationActionOptions,
  operationExportStatusLabel,
  operationModuleLabel,
  operationModuleOptions,
  operationOperatorLabel,
  operationPageItems,
  operationRiskClass,
  operationRiskLabel,
  operationRoleLabel,
  operationScopeLabel,
  operationTargetLabel,
  operationTaskTypeLabel,
  operationUserName
} from '../index.js'

test('operations view model centralizes labels and filter options', () => {
  assert.equal(operationModuleLabel('content_report'), '内容举报')
  assert.equal(operationActionLabel('reset_password'), '重置密码')
  assert.equal(operationRoleLabel('teacher'), '教师')
  assert.equal(operationRiskLabel('critical'), '严重风险')
  assert.equal(operationTaskTypeLabel('audit_logs'), '审计日志')
  assert.equal(operationScopeLabel('platform'), '全平台')
  assert.equal(operationExportStatusLabel('success'), '已完成')
  assert.equal(operationModuleLabel('unknown'), '其他模块')
  assert.equal(operationActionLabel(), '-')
  assert.ok(operationModuleOptions.some(option => option.value === 'AUDIT'))
  assert.ok(operationActionOptions.some(option => option.value === 'EXPORT'))
})

test('operations view model describes audit users and targets', () => {
  const userNames = { 7: '山老师', 8: '林家长' }

  assert.equal(operationUserName({ realName: '山老师', phone: '10086' }), '山老师')
  assert.equal(operationTargetLabel({ targetType: 'USER', targetId: 8 }, userNames), '林家长')
  assert.equal(operationTargetLabel({ targetType: 'STUDENT' }, userNames), '学生')
  assert.equal(operationTargetLabel({ targetName: '春季运动会' }, userNames), '春季运动会')
  assert.equal(operationOperatorLabel({ operatorUserId: 7 }, userNames), '山老师')
  assert.equal(operationOperatorLabel({}, userNames), '系统')
  assert.equal(displayOperationValue({ enabled: true }), '{\n  "enabled": true\n}')
  assert.equal(displayOperationValue(''), '-')
  assert.equal(formatOperationTime('not-a-date'), 'not-a-date')
})

test('operations view model normalizes pages and action availability', () => {
  assert.deepEqual(operationPageItems([{ id: 1 }]), [{ id: 1 }])
  assert.deepEqual(operationPageItems({ records: [{ id: 2 }] }), [{ id: 2 }])
  assert.deepEqual(operationPageItems(), [])
  assert.equal(operationRiskClass('HIGH'), 'risk-high')
  assert.equal(operationRiskClass('MEDIUM'), 'risk-medium')
  assert.equal(operationRiskClass('LOW'), '')
  assert.equal(canDownloadOperationExport({ status: 'COMPLETED' }), true)
  assert.equal(canDownloadOperationExport({ fileId: 9 }), true)
  assert.equal(canDownloadOperationExport({ status: 'PROCESSING' }), false)
})
