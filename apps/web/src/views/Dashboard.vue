<template>
  <div class="workspace-page">
    <section class="workspace-hero">
      <div class="container workspace-hero-grid">
        <div class="hero-copy">
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>

        <aside class="context-panel" aria-label="当前数据范围">
          <span>{{ roleLabel }} · 当前数据范围</span>
          <strong>{{ contextTitle }}</strong>
          <p>{{ contextDesc }}</p>
        </aside>
      </div>
    </section>

    <main class="workspace-main">
      <div class="container workspace-stack">
        <section class="focus-panel" aria-labelledby="focus-task-title">
          <div class="focus-copy">
            <h2 id="focus-task-title">{{ primaryTask.title }}</h2>
            <p>{{ primaryTask.description }}</p>
          </div>
          <router-link :to="primaryTask.path" class="btn focus-action">
            {{ primaryTask.action }}
          </router-link>
          <nav v-if="quickItems.length" class="quick-actions" aria-label="常用操作">
            <span>也可以</span>
            <router-link v-for="item in quickItems" :key="item.path" :to="item.path">
              {{ item.label }}
            </router-link>
          </nav>
        </section>

        <section v-if="cards.length" class="overview-section" aria-labelledby="overview-title">
          <header class="section-heading">
            <h2 id="overview-title">工作概览</h2>
            <p>当前数据范围内的最新概况。</p>
          </header>
          <dl class="overview-list">
            <div v-for="card in cards" :key="card.label">
              <dt>{{ card.label }}</dt>
              <dd>{{ card.value }}</dd>
              <small>{{ card.note }}</small>
            </div>
          </dl>
        </section>

        <section class="workspace-directory" aria-labelledby="directory-title">
          <header class="section-heading">
            <h2 id="directory-title">全部工作</h2>
            <p>已按当前角色的任务场景分组，个人资料可从顶部账户菜单进入。</p>
          </header>

          <div class="work-groups">
            <section v-for="group in navGroups" :key="group.label" class="work-group">
              <h3>{{ group.label }}</h3>
              <div class="work-links">
                <router-link v-for="item in group.items" :key="item.path" :to="item.path">
                  <span class="work-link-copy">
                    <strong>{{ item.label }}</strong>
                    <small>{{ moduleCopy[item.path] || '进入对应模块处理日常业务。' }}</small>
                  </span>
                  <span class="work-link-action">进入</span>
                </router-link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  DASHBOARD_MODULE_COPY as moduleCopy,
  useDashboard
} from '@/features/dashboard/index.js'
import {
  navigationForRole,
  navigationGroupsForRole
} from '@/app/router/accessPolicy.js'

const {
  cards,
  contextDesc,
  contextTitle,
  description,
  initialize,
  navGroups,
  primaryTask,
  quickItems,
  roleLabel,
  title
} = useDashboard({
  navigationForRole,
  navigationGroupsForRole
})

onMounted(initialize)
</script>

<style scoped>
.workspace-page { min-height: 100%; background: #f7fafc; }
.workspace-hero { padding: 118px 0 46px; background: #17324d; color: white; }
.workspace-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 360px); gap: 48px; align-items: end; }
.hero-copy { max-width: 700px; }
.hero-copy h1 { max-width: 18ch; margin-bottom: 14px; font-size: clamp(2.2rem, 4vw, 3.3rem); line-height: 1.12; letter-spacing: -0.035em; }
.hero-copy p { max-width: 58ch; color: #c9dce5; font-size: 1rem; line-height: 1.75; }
.context-panel { padding: 22px; border-radius: 12px; background: #fbfdfe; box-shadow: 0 18px 44px rgba(9, 33, 51, 0.24); color: #17324d; }
.context-panel span { display: block; margin-bottom: 10px; color: #9b4d34; font-size: 0.78rem; font-weight: 720; }
.context-panel strong { display: block; margin-bottom: 8px; font-size: 1.15rem; line-height: 1.4; }
.context-panel p { color: #526b7f; font-size: 0.86rem; line-height: 1.65; }
.workspace-main { padding: 40px 0 72px; }
.workspace-stack { display: grid; gap: 32px; }
.focus-panel { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px 32px; align-items: center; padding: 30px 32px; border: 1px solid #f1d4c8; border-radius: 14px; background: #fff0e9; }
.focus-copy h2 { margin-bottom: 8px; color: #17324d; font-size: clamp(1.45rem, 2.4vw, 2rem); line-height: 1.25; letter-spacing: -0.025em; }
.focus-copy p { max-width: 66ch; color: #526b7f; line-height: 1.7; }
.focus-action { min-height: 46px; justify-content: center; padding: 0.75rem 1.25rem; background: #b9573a; color: white; box-shadow: 0 8px 20px rgba(185, 87, 58, 0.2); }
.focus-action:visited { color: white; }
.focus-action:hover { background: #9b4d34; color: white; box-shadow: 0 12px 28px rgba(155, 77, 52, 0.24); transform: translateY(-1px); }
.quick-actions { grid-column: 1 / -1; display: flex; align-items: center; gap: 10px 16px; padding-top: 18px; border-top: 1px solid #f1d4c8; flex-wrap: wrap; }
.quick-actions span { color: #7b6259; font-size: 0.8rem; }
.quick-actions a { color: #7f402e; font-size: 0.86rem; font-weight: 680; }
.quick-actions a:hover { color: #5f2f22; text-decoration: underline; text-underline-offset: 4px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
.section-heading h2 { color: #17324d; font-size: 1.35rem; letter-spacing: -0.02em; }
.section-heading p { max-width: 55ch; color: #6c8292; font-size: 0.86rem; line-height: 1.6; text-align: right; }
.overview-section { padding: 4px 0; }
.overview-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); border-top: 1px solid #d5e3ea; border-bottom: 1px solid #d5e3ea; }
.overview-list > div { min-width: 0; padding: 20px 18px; border-right: 1px solid #d5e3ea; }
.overview-list > div:last-child { border-right: 0; }
.overview-list dt { color: #526b7f; font-size: 0.82rem; }
.overview-list dd { margin: 8px 0 5px; color: #17324d; font-size: 1.8rem; font-weight: 760; line-height: 1.1; overflow-wrap: anywhere; }
.overview-list small { color: #6c8292; font-size: 0.74rem; line-height: 1.5; }
.work-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.work-group { padding: 22px; border: 1px solid #d5e3ea; border-radius: 12px; background: #fbfdfe; }
.work-group h3 { margin-bottom: 12px; color: #205781; font-size: 0.93rem; }
.work-links { display: grid; }
.work-links > a { display: flex; min-height: 72px; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 0; border-bottom: 1px solid #e7f0f4; color: #17324d; }
.work-links > a:last-child { border-bottom: 0; }
.work-links > a:hover strong { color: #205781; }
.work-link-copy { display: grid; min-width: 0; gap: 4px; }
.work-link-copy strong { font-size: 0.92rem; transition: color 160ms ease; }
.work-link-copy small { color: #6c8292; font-size: 0.78rem; line-height: 1.55; }
.work-link-action { flex: 0 0 auto; color: #2d72ad; font-size: 0.8rem; font-weight: 700; }

@media (prefers-color-scheme: dark) {
  .workspace-page { background: #102431; }
  .workspace-hero { background: #0e202c; }
  .context-panel,
  .work-group { border-color: #315064; background: #132b3a; color: #edf6fa; }
  .context-panel strong,
  .focus-copy h2,
  .section-heading h2,
  .overview-list dd,
  .work-links > a { color: #edf6fa; }
  .context-panel p,
  .focus-copy p,
  .section-heading p,
  .overview-list dt,
  .overview-list small,
  .work-link-copy small { color: #a9bfca; }
  .focus-panel { border-color: #684237; background: #402b28; }
  .quick-actions { border-color: #684237; }
  .quick-actions span { color: #d4b6ad; }
  .quick-actions a { color: #f4b39c; }
  .overview-list { border-color: #315064; }
  .overview-list > div,
  .work-links > a { border-color: #315064; }
  .work-group h3,
  .work-link-action { color: #91c4df; }
}

@media (max-width: 900px) {
  .workspace-hero { padding-top: 104px; }
  .workspace-hero-grid { grid-template-columns: 1fr; gap: 28px; }
  .context-panel { max-width: 520px; }
  .work-groups { grid-template-columns: 1fr; }
  .overview-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .overview-list > div:nth-child(2n) { border-right: 0; }
  .overview-list > div:nth-child(n + 3) { border-top: 1px solid #d5e3ea; }
}

@media (max-width: 600px) {
  .workspace-hero { padding: 96px 0 34px; }
  .hero-copy h1 { font-size: 2rem; }
  .workspace-main { padding: 24px 0 52px; }
  .workspace-stack { gap: 26px; }
  .focus-panel { grid-template-columns: 1fr; padding: 24px 20px; }
  .focus-action { width: 100%; }
  .quick-actions { grid-column: auto; }
  .section-heading { display: grid; gap: 7px; }
  .section-heading p { text-align: left; }
  .overview-list { grid-template-columns: 1fr; }
  .overview-list > div,
  .overview-list > div:nth-child(2n) { border-right: 0; }
  .overview-list > div:nth-child(n + 2) { border-top: 1px solid #d5e3ea; }
  .work-group { padding: 18px; }
  .work-links > a { align-items: flex-start; }
}
</style>
