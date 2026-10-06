<template>
  <div class="admin-shell" :class="{ 'sidebar-open': menuOpen }">
    <button class="sidebar-scrim" type="button" aria-label="关闭导航" @click="menuOpen = false"></button>

    <aside id="admin-navigation" class="sidebar" aria-label="后台主导航">
      <router-link to="/dashboard" class="brand" @click="menuOpen = false">
        <span class="brand-logo"><img src="/logo.png" alt=""></span>
        <span class="brand-copy">
          <strong>山巾子运营后台</strong>
          <small>教育平台管理中心</small>
        </span>
      </router-link>

      <nav>
        <section v-for="group in navGroups" :key="group.label" class="nav-group">
          <p>{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            @click="menuOpen = false"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </section>
      </nav>

      <div class="sidebar-footer">
        <span class="role-indicator" aria-hidden="true"></span>
        <span>
          <strong>超级管理员</strong>
          <small>全平台数据权限</small>
        </span>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="topbar-leading">
          <button
            class="menu-toggle"
            type="button"
            aria-controls="admin-navigation"
            :aria-expanded="menuOpen"
            :aria-label="menuOpen ? '关闭导航' : '打开导航'"
            @click="menuOpen = !menuOpen"
          >
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-title">
            <strong>{{ currentItem.label }}</strong>
            <span>{{ currentItem.description }}</span>
          </div>
        </div>

        <div class="topbar-actions">
          <span class="scope-badge">全平台视角</span>
          <el-button :icon="SwitchButton" plain @click="logout">退出登录</el-button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChatDotRound,
  Connection,
  DataAnalysis,
  Document,
  Download,
  Medal,
  Notebook,
  Reading,
  School,
  SwitchButton,
  Tickets,
  User,
  Warning
} from '@element-plus/icons-vue'
import { clearSession } from '@/api/client.js'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)

const navGroups = [
  {
    label: '总览',
    items: [
      { path: '/dashboard', label: '数据看板', description: '平台核心指标与近期运营动态', icon: DataAnalysis }
    ]
  },
  {
    label: '组织与成员',
    items: [
      { path: '/schools', label: '学校管理', description: '维护合作园所与联系人信息', icon: School },
      { path: '/users', label: '用户管理', description: '管理平台账号、角色与状态', icon: User },
      { path: '/students', label: '学生监管', description: '核对学生档案与家庭绑定关系', icon: Notebook },
      { path: '/bindings', label: '班级管理', description: '维护班级、教师与学生归属', icon: Connection }
    ]
  },
  {
    label: '内容与运营',
    items: [
      { path: '/competitions', label: '赛事管理', description: '发布赛事并跟踪报名进度', icon: Medal },
      { path: '/messages', label: '消息管理', description: '创建和查看平台消息任务', icon: ChatDotRound },
      { path: '/pages', label: '页面管理', description: '维护公开页面的内容与状态', icon: Document },
      { path: '/news', label: '资讯管理', description: '管理资讯分类、文章与发布计划', icon: Reading }
    ]
  },
  {
    label: '系统治理',
    items: [
      { path: '/content-reports', label: '内容举报', description: '核对举报内容并完成处置', icon: Warning },
      { path: '/audit-logs', label: '审计日志', description: '追踪关键后台操作记录', icon: Tickets },
      { path: '/export-tasks', label: '导出任务', description: '查看数据导出任务与文件状态', icon: Download }
    ]
  }
]

const navItems = navGroups.flatMap(group => group.items)
const currentItem = computed(() => navItems.find(item => route.path.startsWith(item.path)) || {
  label: '运营后台',
  description: '山巾子科技教育平台管理中心'
})

watch(() => route.fullPath, () => {
  menuOpen.value = false
})

function handleEscape(event) {
  if (event.key === 'Escape') menuOpen.value = false
}

function logout() {
  clearSession()
  router.push('/login')
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  height: 100vh;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.15rem 0.9rem;
  background:
    radial-gradient(circle at 12% 2%, rgba(232, 121, 85, 0.16), transparent 14rem),
    #17324d;
  color: #d8e8ef;
}

.brand {
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.55rem 1rem;
  border-bottom: 1px solid rgba(216, 232, 239, 0.16);
  color: #fff;
  text-decoration: none;
}

.brand-logo {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: #fbfdfe;
}

.brand-logo img { width: 100%; height: 100%; object-fit: contain; }
.brand-copy { display: grid; gap: 0.1rem; min-width: 0; }
.brand-copy strong { font-size: 0.98rem; letter-spacing: -0.015em; }
.brand-copy small { color: #a8c1cf; font-size: 0.7rem; font-weight: 520; }

nav { display: grid; gap: 0.9rem; margin-top: 1.1rem; }
.nav-group { display: grid; gap: 0.25rem; }
.nav-group > p { margin: 0 0 0.2rem; padding: 0 0.65rem; color: #86a5b6; font-size: 0.67rem; font-weight: 720; letter-spacing: 0.08em; }

.nav-item {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  color: #c6d8e1;
  font-size: 0.85rem;
  font-weight: 580;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.nav-item svg { width: 17px; height: 17px; flex: 0 0 auto; }
.nav-item:hover { background: rgba(238, 246, 250, 0.1); color: #fff; transform: translateX(2px); }
.nav-item.router-link-active { background: #eef6fa; color: #205781; font-weight: 700; }

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: auto;
  padding: 1.1rem 0.6rem 0.2rem;
  border-top: 1px solid rgba(216, 232, 239, 0.16);
}

.role-indicator { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: #f2a17f; box-shadow: 0 0.25rem 0.7rem rgba(232, 121, 85, 0.35); }
.sidebar-footer > span:last-child { display: grid; gap: 0.1rem; }
.sidebar-footer strong { color: #edf6fa; font-size: 0.78rem; }
.sidebar-footer small { color: #96b1c0; font-size: 0.68rem; }

.workspace { min-width: 0; display: grid; grid-template-rows: 72px minmax(0, 1fr); }
.topbar {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 1.75rem;
  border-bottom: 1px solid var(--line);
  background: rgba(251, 253, 254, 0.96);
}

.topbar-leading,
.topbar-actions { display: flex; align-items: center; gap: 0.8rem; }
.topbar-title { display: grid; gap: 0.15rem; }
.topbar-title strong { color: var(--text); font-size: 0.94rem; }
.topbar-title span { color: var(--muted); font-size: 0.73rem; }
.scope-badge { padding: 0.35rem 0.6rem; border-radius: 8px; background: var(--accent-soft); color: #91462f; font-size: 0.72rem; font-weight: 680; }

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  cursor: pointer;
}
.menu-toggle span { width: 18px; height: 2px; border-radius: 2px; background: var(--text); }

.content { min-width: 0; padding: clamp(1.25rem, 2.5vw, 2rem); }
.sidebar-scrim { display: none; }

@media (max-width: 1080px) {
  .admin-shell { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed;
    left: 0;
    width: min(19rem, calc(100vw - 3rem));
    transform: translateX(-105%);
    transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .sidebar-open .sidebar { transform: translateX(0); }
  .sidebar-scrim {
    position: fixed;
    z-index: 25;
    inset: 0;
    display: block;
    border: 0;
    background: rgba(16, 36, 49, 0.5);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms ease;
  }
  .sidebar-open .sidebar-scrim { opacity: 1; pointer-events: auto; }
  .menu-toggle { display: flex; }
}

@media (max-width: 680px) {
  .workspace { grid-template-rows: 64px minmax(0, 1fr); }
  .topbar { padding: 0 0.9rem; }
  .topbar-title span,
  .scope-badge { display: none; }
  .topbar-actions .el-button { min-width: 42px; padding: 0.5rem; font-size: 0; }
  .topbar-actions .el-button :deep(.el-icon) { margin: 0; font-size: 1rem; }
  .content { padding: 1rem 0.8rem 1.5rem; }
}
</style>
