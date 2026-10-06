<template>
  <div class="case-page">
    <PublicPageHero
      :title="heroTitle"
      :description="heroDesc"
      image="/kechuang.webp"
      image-alt="幼儿园科技创作与实践课堂"
    />

    <section class="section case-overview">
      <div class="container overview-layout">
        <div class="overview-copy">
          <img src="/dongfang.png" alt="东方幼儿园" class="case-logo">
          <h2>东方幼儿园</h2>
          <p class="case-meta">南昌理工学院附属幼儿园</p>
          <p>{{ introText }}</p>
        </div>

        <dl class="proof-list">
          <div v-for="item in highlights" :key="item.term">
            <dt>{{ item.term }}</dt>
            <dd>{{ item.description }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section curriculum-section">
      <div class="container">
        <div class="section-heading">
          <h2>课程体系</h2>
          <p>贯通式科学启蒙，将科学实验、科技制作与实践研学放进可持续的学习路径。</p>
        </div>

        <div class="curriculum-grid">
          <article v-for="course in courses" :key="course.title" class="curriculum-block">
            <h3>{{ course.title }}</h3>
            <div class="table-scroll">
              <table class="curriculum-table">
                <caption>{{ course.title }}</caption>
                <thead>
                  <tr><th>{{ course.categoryLabel }}</th><th>课程内容</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in course.rows" :key="row.name">
                    <td>{{ row.name }}</td>
                    <td>{{ row.content }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div class="practice-heading">
          <h3>研学与实践，每学期 2 次</h3>
          <p>课堂之外仍有清晰的体验节奏，让孩子在真实科技场景和亲子协作中巩固收获。</p>
        </div>
        <div class="practice-grid">
          <article v-for="practice in practices" :key="practice.title">
            <h4>{{ practice.title }}</h4>
            <p>{{ practice.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section team-section">
      <div class="container team-layout">
        <div class="team-copy">
          <div class="section-heading section-heading-left">
            <h2>三师教学团队</h2>
            <p>学前科技教育的核心不在设备数量，而在于谁来教、如何教，以及课堂内外如何衔接。</p>
          </div>
          <div class="team-list">
            <article v-for="member in team" :key="member.title">
              <h3>{{ member.title }}</h3>
              <p>{{ member.description }}</p>
            </article>
          </div>
        </div>
        <img src="/teacher-team.webp" alt="教师团队共同研讨幼儿科技课程" width="800" height="533" loading="lazy" decoding="async">
      </div>
    </section>

    <section class="section base-section">
      <div class="container">
        <div class="section-heading section-heading-left">
          <h2>园内低空 AI 学前科创基地</h2>
          <p>四个功能分区承担不同的探索任务，也为日常教学、作品展示和自主阅读提供固定场所。</p>
        </div>
        <div class="base-list">
          <article v-for="base in bases" :key="base.title">
            <h3>{{ base.title }}</h3>
            <p>{{ base.description }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PublicPageHero from '@/components/PublicPageHero.vue'
import { usePublicPage } from '@/features/content/index.js'

const { loadPublicPage, publicPage } = usePublicPage('case')
const heroTitle = computed(() => publicPage.value?.title || '合作案例')
const heroDesc = computed(() => publicPage.value?.summary || publicPage.value?.description || '东方幼儿园与山巾子科技携手，打造江西首个低空+AI学前科技教育示范园。')
const introText = computed(() => publicPage.value?.contentMarkdown || '南昌理工学院东方幼儿园作为高校附属幼儿园，具有学术氛围浓厚、家长素质高、品牌辐射力强的天然优势。此次合作，双方携手打造江西省首个融合低空与人工智能科技的学前示范幼儿园，为江西省学前科技教育提供可复制、可推广的实践范本。')

const highlights = [
  { term: '首创', description: '江西首个低空+AI学前科技教育示范园' },
  { term: '专业', description: '南航副教授团队与三师课堂共同支撑' },
  { term: '系统', description: '课程、基地、共育、赛事与生态形成闭环' },
  { term: '延续', description: '覆盖幼儿园至高中贯通成长路径' }
]

const courses = [
  {
    title: '科学实验模块',
    categoryLabel: '课程类别',
    rows: [
      { name: '物理与自然现象探索', content: '力学、光学、电学等基础科学实验' },
      { name: '太空与天文科普', content: '太阳系模型、火箭原理、星座认知等' },
      { name: '动手制作系列', content: '月球探索车、风向标、净化装置等项目' }
    ]
  },
  {
    title: '科技制作模块',
    categoryLabel: '课程系列',
    rows: [
      { name: '无人机启蒙系列', content: '无人机结构与飞行原理、基础组装与操控练习' },
      { name: 'AI 与编程启蒙系列', content: '图形化编程入门、智能硬件互动体验' },
      { name: '电子百拼与机器人', content: '电子百拼图基础电路搭建、机器人任务挑战' }
    ]
  }
]

const practices = [
  { title: '第一次：主题科技研学', description: '学期周中走进高校实验室、科技馆、航空基地等真实科技场景，由专家导师带领开展沉浸式科技探秘。东方幼儿园毗邻南昌理工学院，可优先利用高校科研资源，让孩子近距离接触大学实验室和科技设施。' },
  { title: '第二次：亲子科技日', description: '学期末以亲子科技嘉年华形式收尾，安排学生作品展、亲子科技挑战赛、无人机表演和科学实验秀，邀请家长共同参与，见证孩子的成长与收获。' }
]

const team = [
  { title: '专家组', description: '由南昌航空大学相关领域专家、博士团队及科技教育研究员组成，负责课程体系顶层设计、教学标准制定、教师培训及赛事指导。' },
  { title: '授课老师', description: '山巾子专职科技教师具备理工科背景和幼儿教育经验，负责日常课程一线授课，带领孩子完成科学实验与科技制作。' },
  { title: '协助老师', description: '东方幼儿园配班教师协同教学，负责课堂秩序维护、幼儿观察记录和家园沟通衔接。' }
]

const bases = [
  { title: '飞行体验区', description: '配置玩具无人机、模拟飞行器、飞行地垫和障碍设施，幼儿在安全环境中体验飞行操控、完成简单任务。' },
  { title: 'AI 互动探索区', description: '配置机器狗、智能语音设备、互动屏幕和编程积木，幼儿与 AI 设备互动，初步感知人工智能。' },
  { title: '作品展示区', description: '配置作品展示柜、成果墙和创意陈列架，展示幼儿科技作品，增强成就感与荣誉感。' },
  { title: '科学阅读角', description: '配置科技主题绘本、科普图书和航空航天画册，支持日常自由探索，培养科技阅读兴趣。' }
]

onMounted(loadPublicPage)
</script>

<style scoped>
.case-page { background: #fbfdfe; }
.section-heading { max-width: 46rem; margin: 0 auto 3rem; text-align: center; }
.section-heading-left { margin-right: 0; margin-left: 0; text-align: left; }
.section-heading h2,
.overview-copy h2 { margin-bottom: 1rem; color: #17324d; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.section-heading p { color: #526b7f; font-size: 1.02rem; line-height: 1.8; }

.case-overview { background: #fbfdfe; }
.overview-layout { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(20rem, 0.92fr); gap: clamp(3rem, 8vw, 7rem); align-items: center; }
.case-logo { width: min(100%, 20rem); max-height: 8rem; margin-bottom: 2rem; object-fit: contain; object-position: left center; }
.overview-copy h2 { margin-bottom: 0.35rem; font-size: clamp(2rem, 3vw, 2.75rem); }
.case-meta { margin-bottom: 1.35rem; color: #205781; font-weight: 680; }
.overview-copy > p:last-child { max-width: 45rem; color: #526b7f; line-height: 1.85; }
.proof-list { border-top: 1px solid #d5e3ea; }
.proof-list > div { display: grid; grid-template-columns: 6rem minmax(0, 1fr); gap: 1.25rem; padding: 1.35rem 0; border-bottom: 1px solid #d5e3ea; }
.proof-list dt { color: #e87955; font-size: 1.3rem; font-weight: 760; }
.proof-list dd { color: #526b7f; line-height: 1.65; }

.curriculum-section { background: #eef6fa; }
.curriculum-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
.curriculum-block { overflow: hidden; border-radius: 16px; background: #fbfdfe; }
.curriculum-block h3 { padding: 1.5rem 1.65rem 1.2rem; color: #17324d; font-size: 1.3rem; }
.table-scroll { overflow-x: auto; }
.curriculum-table { width: 100%; min-width: 31rem; border-collapse: collapse; }
.curriculum-table caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.curriculum-table th,
.curriculum-table td { padding: 1rem 1.65rem; border-top: 1px solid #e1ebf0; text-align: left; vertical-align: top; }
.curriculum-table th { background: #f4f8fa; color: #526b7f; font-size: 0.78rem; font-weight: 720; }
.curriculum-table td { color: #526b7f; font-size: 0.88rem; line-height: 1.65; }
.curriculum-table td:first-child { width: 42%; color: #27465e; font-weight: 650; }
.practice-heading { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 2rem; margin-top: 4rem; padding-top: 2.25rem; border-top: 1px solid #c9dce5; }
.practice-heading h3 { color: #17324d; font-size: clamp(1.55rem, 3vw, 2.1rem); letter-spacing: -0.025em; }
.practice-heading p { color: #526b7f; line-height: 1.75; }
.practice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; margin-top: 1.75rem; }
.practice-grid article { padding: clamp(1.5rem, 3vw, 2.25rem); border-radius: 16px; background: #205781; }
.practice-grid article:last-child { background: #fff0e9; }
.practice-grid h4 { margin-bottom: 0.9rem; color: #fff; font-size: 1.2rem; }
.practice-grid p { color: #d8e8ef; font-size: 0.92rem; line-height: 1.8; }
.practice-grid article:last-child h4 { color: #8d402c; }
.practice-grid article:last-child p { color: #754432; }

.team-section { background: #fbfdfe; }
.team-layout { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(22rem, 0.96fr); gap: clamp(3rem, 7vw, 6rem); align-items: center; }
.team-layout > img { width: 100%; min-height: 38rem; border-radius: 16px; object-fit: cover; }
.team-list { border-top: 1px solid #d5e3ea; }
.team-list article { padding: 1.4rem 0; border-bottom: 1px solid #d5e3ea; }
.team-list h3 { margin-bottom: 0.55rem; color: #205781; font-size: 1.12rem; }
.team-list p { color: #526b7f; font-size: 0.92rem; line-height: 1.75; }

.base-section { background: #dceef7; }
.base-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #b9d3df; border-left: 1px solid #b9d3df; }
.base-list article { min-height: 13rem; padding: clamp(1.5rem, 4vw, 2.6rem); border-right: 1px solid #b9d3df; border-bottom: 1px solid #b9d3df; }
.base-list h3 { margin-bottom: 0.8rem; color: #17324d; font-size: 1.25rem; }
.base-list p { color: #526b7f; line-height: 1.75; }

@media (prefers-color-scheme: dark) {
  .case-page,
  .case-overview,
  .team-section { background: #102431; }
  .curriculum-section { background: #0e202c; }
  .base-section { background: #173242; }
  .section-heading h2,
  .overview-copy h2,
  .curriculum-block h3,
  .practice-heading h3,
  .base-list h3 { color: #edf6fa; }
  .section-heading p,
  .overview-copy > p:last-child,
  .proof-list dd,
  .practice-heading p,
  .team-list p,
  .base-list p { color: #b7cad5; }
  .case-meta,
  .team-list h3 { color: #91c4df; }
  .proof-list,
  .proof-list > div,
  .practice-heading,
  .team-list,
  .team-list article { border-color: #315064; }
  .curriculum-block { background: #173242; }
  .curriculum-table th { background: #1a3849; color: #bfd1da; }
  .curriculum-table th,
  .curriculum-table td { border-color: #315064; }
  .curriculum-table td,
  .curriculum-table td:first-child { color: #d8e8ef; }
  .base-list { border-color: #42677b; }
  .base-list article { border-color: #42677b; }
}

@media (max-width: 900px) {
  .overview-layout,
  .team-layout { grid-template-columns: 1fr; }
  .team-layout > img { min-height: 24rem; }
}

@media (max-width: 700px) {
  .curriculum-grid,
  .practice-grid,
  .base-list { grid-template-columns: 1fr; }
  .practice-heading { grid-template-columns: 1fr; gap: 0.75rem; }
  .proof-list > div { grid-template-columns: 5rem minmax(0, 1fr); }
}
</style>
