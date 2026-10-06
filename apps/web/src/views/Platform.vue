<template>
  <div class="platform-page">
    <PublicPageHero
      :title="heroTitle"
      :description="heroDesc"
      image="/platform-hero.webp"
      image-alt="家长陪伴孩子进行科技探索"
    />

    <section class="section role-section">
      <div class="container role-layout">
        <div class="role-intro">
          <div>
            <h2>四种身份，共用一条成长链路</h2>
            <p>从园所管理、课堂记录到家庭反馈，每个人只看与自己相关的信息，也能在同一套流程中顺畅协作。</p>
          </div>
          <img src="/platform-bg.webp" alt="老师与家长共同关注孩子成长" width="800" height="533" loading="lazy" decoding="async">
        </div>

        <div class="role-list">
          <article v-for="role in roles" :key="role.name" class="role-item">
            <h3>{{ role.name }}</h3>
            <p>{{ role.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section module-section">
      <div class="container">
        <div class="section-heading section-heading-left">
          <h2>四个核心板块，覆盖日常使用</h2>
          <p>把课堂、赛事、交流和资讯放进清晰的任务入口，让家长更容易找到正在发生的事。</p>
        </div>

        <div class="module-grid">
          <article v-for="(mod, index) in modules" :key="mod.title" class="module-item">
            <div class="module-copy">
              <h3>{{ mod.title }}</h3>
              <p>{{ mod.desc }}</p>
              <ul>
                <li v-for="item in mod.features" :key="item">{{ item }}</li>
              </ul>
            </div>
            <img v-if="index === 0" src="/steam-bg.webp" alt="孩子参与科技课堂活动" width="800" height="533" loading="lazy" decoding="async">
          </article>
        </div>
      </div>
    </section>

    <section class="section tech-section">
      <div class="container tech-layout">
        <div class="tech-media">
          <img src="/tech-bg.webp" alt="数字平台支持园所日常工作" width="800" height="533" loading="lazy" decoding="async">
        </div>
        <div class="tech-copy">
          <div class="section-heading section-heading-left">
            <h2>稳定、安全，也为后续连接留出空间</h2>
            <p>从底层架构到业务逻辑，为学前科技教育的长期使用量身打造。</p>
          </div>
          <div class="tech-list">
            <article v-for="tech in techFeatures" :key="tech.title">
              <h3>{{ tech.title }}</h3>
              <p>{{ tech.desc }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import PublicPageHero from '@/components/PublicPageHero.vue'

const heroTitle = '平台介绍'
const heroDesc = '连接园所、教师、家长与品牌方，为学前科技教育提供一体化数字平台。'

const roles = [
  { name: '超级管理员', desc: '平台级管理权限，可自由切换所有园所后台，管理内容审核、数据看板、系统配置等。' },
  { name: '校方管理员', desc: '本园所最高权限，管理教师账号、赛事审批、论坛版主任命、本园数据查看。' },
  { name: '教师', desc: '发布幼儿动态、管理班级、发布赛事通知、跟课记录、与家长定向沟通。' },
  { name: '家长', desc: '查看孩子成长动态、赛事报名、参与论坛讨论、接收园所通知与资讯。' }
]

const modules = [
  { title: '幼儿动态', desc: '教师发布课堂动态，家长点赞评论互动，记录成长轨迹。', features: ['课堂图文动态发布', '家长点赞与评论互动', '成长档案自动汇总'] },
  { title: '赛事专区', desc: '浏览各级赛事并在线报名，管理参赛状态。', features: ['国家、省、市级赛事展示', '在线填写报名信息', '已报名赛事资讯查看'] },
  { title: '家长论坛', desc: '发帖交流育儿经验，回复互动，参与话题讨论。', features: ['育儿经验分享与交流', '课程反馈与建议', '同城家长社群认识'] },
  { title: '新闻资讯', desc: '阅读管理员发布的行业动态与品牌新闻。', features: ['行业政策解读', '科技前沿动态', '品牌活动公告'] }
]

const techFeatures = [
  { title: '底层技术架构', desc: '基于微服务架构构建，支持高并发、高可用，确保平台稳定运行。' },
  { title: '数据智能引擎', desc: '内置数据分析引擎，支持多维度数据采集与分析，实现个性化推荐。' },
  { title: '安全合规体系', desc: '符合国家信息安全等级保护要求，采用多重安全机制保障数据安全。' },
  { title: '开放平台生态', desc: '提供标准 API 接口，支持与第三方系统无缝对接。' }
]
</script>

<style scoped>
.platform-page { background: #fbfdfe; }

.section-heading { max-width: 42rem; margin: 0 auto 3rem; text-align: center; }
.section-heading-left { margin-right: 0; margin-left: 0; text-align: left; }
.section-heading h2,
.role-intro h2 { margin-bottom: 1rem; color: #17324d; font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.section-heading p,
.role-intro > div > p { color: #526b7f; font-size: 1.02rem; line-height: 1.8; }

.role-section { background: #fbfdfe; }
.role-layout { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: clamp(3rem, 7vw, 7rem); align-items: start; }
.role-intro { display: grid; gap: 2rem; position: sticky; top: 7rem; }
.role-intro img { width: 100%; aspect-ratio: 5 / 3; border-radius: 16px; object-fit: cover; }
.role-list { border-top: 1px solid #d5e3ea; }
.role-item { display: grid; grid-template-columns: minmax(8rem, 0.38fr) minmax(0, 1fr); gap: 1.5rem; padding: 1.7rem 0; border-bottom: 1px solid #d5e3ea; }
.role-item h3 { color: #205781; font-size: 1.15rem; }
.role-item p { color: #526b7f; line-height: 1.75; }

.module-section { background: #eef6fa; }
.module-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
.module-item { min-height: 20rem; overflow: hidden; border-radius: 16px; background: #fbfdfe; }
.module-item:first-child { display: grid; grid-column: 1 / -1; grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr); min-height: 25rem; background: #205781; color: #fff; }
.module-item:nth-child(3) { background: #fff0e9; }
.module-copy { padding: clamp(1.75rem, 4vw, 3rem); }
.module-item h3 { margin-bottom: 0.8rem; color: #17324d; font-size: 1.45rem; }
.module-item p { margin-bottom: 1.3rem; color: #526b7f; line-height: 1.75; }
.module-item ul { display: grid; gap: 0.6rem; }
.module-item li { position: relative; padding-left: 1.15rem; color: #526b7f; font-size: 0.9rem; }
.module-item li::before { position: absolute; top: 0.55em; left: 0; width: 5px; height: 5px; border-radius: 50%; background: #e87955; content: ''; }
.module-item:first-child h3 { color: #fff; font-size: clamp(1.8rem, 3vw, 2.6rem); }
.module-item:first-child p,
.module-item:first-child li { color: #d8e8ef; }
.module-item:first-child img { width: 100%; height: 100%; object-fit: cover; }

.tech-section { background: #fbfdfe; }
.tech-layout { display: grid; grid-template-columns: minmax(20rem, 0.82fr) minmax(0, 1.18fr); gap: clamp(3rem, 7vw, 6rem); align-items: center; }
.tech-media img { width: 100%; min-height: 34rem; border-radius: 16px; object-fit: cover; }
.tech-list { border-top: 1px solid #d5e3ea; }
.tech-list article { display: grid; grid-template-columns: minmax(8.5rem, 0.4fr) minmax(0, 1fr); gap: 1.4rem; padding: 1.3rem 0; border-bottom: 1px solid #d5e3ea; }
.tech-list h3 { color: #205781; font-size: 1rem; }
.tech-list p { color: #526b7f; font-size: 0.9rem; line-height: 1.7; }

@media (prefers-color-scheme: dark) {
  .platform-page,
  .role-section,
  .tech-section { background: #102431; }
  .module-section { background: #0e202c; }
  .section-heading h2,
  .role-intro h2,
  .module-item h3 { color: #edf6fa; }
  .section-heading p,
  .role-intro > div > p,
  .role-item p,
  .module-item p,
  .module-item li,
  .tech-list p { color: #b7cad5; }
  .role-list,
  .role-item,
  .tech-list,
  .tech-list article { border-color: #315064; }
  .role-item h3,
  .tech-list h3 { color: #91c4df; }
  .module-item { background: #173242; }
  .module-item:nth-child(3) { background: #3a2926; }
}

@media (max-width: 900px) {
  .role-layout,
  .tech-layout { grid-template-columns: 1fr; }
  .role-intro { position: static; }
  .tech-media { order: 2; }
  .tech-media img { min-height: 22rem; }
}

@media (max-width: 680px) {
  .module-grid { grid-template-columns: 1fr; }
  .module-item:first-child { grid-column: auto; grid-template-columns: 1fr; }
  .module-item:first-child img { min-height: 14rem; }
  .role-item,
  .tech-list article { grid-template-columns: 1fr; gap: 0.55rem; }
}
</style>
