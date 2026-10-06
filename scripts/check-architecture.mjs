import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const workspaceRoot = process.cwd()
const failures = []

async function exists(relativePath) {
  try {
    await access(path.join(workspaceRoot, relativePath))
    return true
  } catch {
    return false
  }
}

async function sourceFiles(relativeDirectory, extension) {
  const directory = path.join(workspaceRoot, relativeDirectory)
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryDirectory = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name)
    if (entry.isDirectory()) {
      files.push(...await sourceFiles(entryDirectory, extension))
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push({ name: entry.name, relativePath: entryDirectory })
    }
  }

  return files
}

async function rejectPattern(files, pattern, message, allowedFiles = new Set()) {
  for (const file of files) {
    if (allowedFiles.has(file.name)) continue
    const source = await readFile(path.join(workspaceRoot, file.relativePath), 'utf8')
    if (pattern.test(source)) failures.push(`${file.relativePath}: ${message}`)
  }
}

function sourceImports(source) {
  const imports = []
  const importPattern = /\bfrom\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm
  for (const match of source.matchAll(importPattern)) {
    imports.push(match[1] || match[2])
  }
  return imports
}

function resolveSourceImport(sourceFile, specifier) {
  if (specifier.startsWith('@/')) {
    const sourceRoot = sourceFile.startsWith('apps/admin-web/src/')
      ? 'apps/admin-web/src'
      : 'apps/web/src'
    return path.posix.join(sourceRoot, specifier.slice(2))
  }
  if (specifier.startsWith('.')) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), specifier))
  }
  return null
}

const removedWebAdminPaths = [
  'apps/web/src/views/AdminLogin.vue',
  'apps/web/src/views/AdminDashboard.vue',
  'apps/web/src/stores/adminClient.js',
  'apps/web/src/stores/adminSession.js',
  'apps/web/src/stores/adminPayloads.js'
]

for (const relativePath of removedWebAdminPaths) {
  if (await exists(relativePath)) {
    failures.push(`${relativePath}: 用户端不得重新内嵌超级管理后台`)
  }
}

const adminViews = await sourceFiles('apps/admin-web/src/views', '.vue')
await rejectPattern(
  adminViews,
  /(?:from\s+['"]@\/api\/client\.js['"]|\brequest\s*\()/,
  '业务页面必须通过 adminApiClient 访问接口',
  new Set(['AdminLayout.vue', 'Login.vue'])
)

const webViews = await sourceFiles('apps/web/src/views', '.vue')
for (const file of webViews) {
  if (file.relativePath.startsWith('apps/web/src/views/admin/')) {
    failures.push(`${file.relativePath}: 用户端不得重新内嵌超级管理后台`)
  }
}
await rejectPattern(
  webViews,
  /(?:adminClient|adminSession|adminPayloads|views\/admin)/,
  '用户端不得依赖已拆除的管理端实现'
)

for (const appDirectory of ['apps/web/src', 'apps/admin-web/src']) {
  const appSources = [
    ...await sourceFiles(appDirectory, '.js'),
    ...await sourceFiles(appDirectory, '.vue')
  ]
  await rejectPattern(
    appSources,
    /from\s+['"]element-plus['"]/,
    'Element Plus 必须按需引入，反馈组件统一从 shared/ui/feedback.js 导入'
  )
}

const webSources = [
  ...await sourceFiles('apps/web/src', '.js'),
  ...await sourceFiles('apps/web/src', '.vue')
]
if (await exists('apps/web/src/stores/auth.js')) {
  failures.push('apps/web/src/stores/auth.js: 认证会话必须由 features/authentication 维护')
}
for (const file of webSources) {
  const source = await readFile(path.join(workspaceRoot, file.relativePath), 'utf8')
  const isApplicationApiTest = file.relativePath.startsWith('apps/web/src/app/api/applicationApi.')
    && file.relativePath.endsWith('.test.js')
  for (const specifier of sourceImports(source)) {
    const importedFile = resolveSourceImport(file.relativePath, specifier)
    if (importedFile?.startsWith('apps/web/src/stores/')) {
      failures.push(`${file.relativePath}: 不得重新依赖已移除的 stores 层`)
    }
    if (
      importedFile === 'apps/web/src/app/api/applicationApi.js'
      && !isApplicationApiTest
    ) {
      failures.push(`${file.relativePath}: 页面和状态模块必须通过业务 API 端口访问接口`)
    }
  }
}

for (const appDirectory of ['apps/web/src', 'apps/admin-web/src']) {
  const appSources = [
    ...await sourceFiles(appDirectory, '.js'),
    ...await sourceFiles(appDirectory, '.vue')
  ]
  for (const file of appSources) {
    const source = await readFile(path.join(workspaceRoot, file.relativePath), 'utf8')
    for (const specifier of sourceImports(source)) {
      const importedFile = resolveSourceImport(file.relativePath, specifier)
      const moduleMatch = importedFile?.match(
        /^(apps\/(?:web|admin-web)\/src\/(?:features|entities)\/[^/]+)\/.+/
      )
      if (!moduleMatch) continue

      const moduleRoot = moduleMatch[1]
      const importsPublicEntry = importedFile === `${moduleRoot}/index.js`
      const importsUiEntry = file.name.endsWith('.vue')
        && importedFile === `${moduleRoot}/ui/index.js`
      const importsOwnInternals = file.relativePath.startsWith(`${moduleRoot}/`)
      if (!importsPublicEntry && !importsUiEntry && !importsOwnInternals) {
        failures.push(
          `${file.relativePath}: 跨业务模块只能从 ${moduleRoot}/index.js 业务入口或 ui/index.js 组件入口导入`
        )
      }
    }
  }
}

const webRouter = await readFile(path.join(workspaceRoot, 'apps/web/src/app/router/index.js'), 'utf8')
if (/\bmeta:\s*\{\s*requiresAuth/.test(webRouter)) {
  failures.push('apps/web/src/app/router/index.js: 受保护路由必须复用 accessPolicy')
}
if (!webRouter.includes("from './accessPolicy.js'")) {
  failures.push('apps/web/src/app/router/index.js: 路由权限来源必须是 accessPolicy')
}

if (failures.length) {
  console.error('Architecture checks failed:')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log('Architecture checks passed.')
}
