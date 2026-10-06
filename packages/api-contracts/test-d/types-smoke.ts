import type { OpenApiOperation, OpenApiSchema } from '../src/index.js'

const passwordLogin: OpenApiSchema<'LoginRequest'> = {
  phone: '13800138000',
  password: 'secret'
}

const studentQuery: OpenApiOperation<'GET /api/public/students'>['parameters']['query'] = {
  page: 1,
  pageSize: 20,
  name: '小山'
}

const studentUpdate: OpenApiOperation<'PATCH /api/public/students/{id}'>['requestBody'] = {
  name: '小山',
  classId: 8
}

void passwordLogin
void studentQuery
void studentUpdate
