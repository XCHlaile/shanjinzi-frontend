<template>
  <div class="about-page">
    <PublicPageHero
      :title="heroTitle"
      :description="heroDesc"
      image="/xieshou.webp"
      image-alt="人与智能科技协同连接"
    />

    <section class="section mission-section">
      <div class="container mission-layout">
        <div class="mission-title">
          <h2>把科技的种子种在幼儿园</h2>
          <p>让江西的孩子从小触达未来。</p>
        </div>
        <div class="mission-copy">
          <p>{{ introText }}</p>
          <p>当前，科技教育已从「可选项」加速转变为「必修课」。国家大力推进人工智能和低空经济战略，教育部持续优化白名单赛事体系。山巾子科技以「从启蒙到特长」的一站式成长路径为核心理念，为 3-18 岁青少年提供贯通式的科技教育服务。</p>
        </div>
      </div>
    </section>

    <section class="section team-section">
      <div class="container team-layout">
        <div class="team-media">
          <img src="/mingxiao.webp" alt="高校科研与教育资源环境" width="800" height="533" loading="lazy" decoding="async">
        </div>
        <div class="team-copy">
          <div class="section-heading section-heading-left">
            <h2>一支围绕教学结果协作的团队</h2>
            <p>高校专家、课程研发与园所服务各自负责清晰，也在同一套课程标准下持续协同。</p>
          </div>
          <div class="team-list">
            <article v-for="member in team" :key="member.name">
              <h3>{{ member.name }}</h3>
              <p class="member-title">{{ member.title }}</p>
              <p>{{ member.description }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section history-section">
      <div class="container history-layout">
        <div class="section-heading section-heading-left">
          <h2>发展历程</h2>
          <p>从课程研发到示范园建设，沿着区域科技教育生态稳步推进。</p>
        </div>
        <div class="history-list">
          <article v-for="item in history" :key="item.year">
            <time>{{ item.year }}</time>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section join-section">
      <div class="container join-layout">
        <div>
          <h2>携手共创未来</h2>
          <p>如果您是幼儿园负责人、教育行业从业者，或对科技教育感兴趣，欢迎与我们联系。</p>
        </div>
        <a href="tel:0791-XXXXXXXX" class="btn btn-accent btn-lg">联系我们</a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PublicPageHero from '@/components/PublicPageHero.vue'
import { usePublicPage } from '@/features/content/index.js'

const { loadPublicPage, publicPage } = usePublicPage('about')
const heroTitle = computed(() => publicPage.value?.title || '关于我们')
const heroDesc = computed(() => publicPage.value?.summary || publicPage.value?.description || '山巾子科技教育研究中心聚焦低空经济与人工智能，打造青少年科技教育生态圈。')
const introText = computed(() => publicPage.value?.contentMarkdown || '山巾子科技教育研究中心依托南昌航空大学无人机与飞控系副教授团队、清华、北大、浙大、同济、北航、北交、西湖大学等优秀高校人才资源，聚焦低空经济与人工智能两大方向，致力于打造江西首个青少年「产、教、学、研、赛」科技生态圈。')

const team = [
  { name: '专家顾问团', title: '南昌航空大学副教授与博士团队', description: '负责课程体系顶层设计、教学标准制定、教师培训及赛事指导，确保教学内容的前沿性和科学性。' },
  { name: '课程研发团队', title: '科技教育研究员与一线教师', description: '专注学前科技启蒙课程研发，结合幼儿认知发展规律，打造游戏化、生活化、探究化的教学体系。' },
  { name: '运营服务团队', title: '教育行业资深运营专家', description: '为合作园所提供招生支持、家长沟通、赛事组织、品牌宣传等全方位的运营服务保障。' }
]

const history = [
  { year: '2025', description: '山巾子科技教育研究中心成立，聚焦低空+AI科技启蒙赛道，完成课程体系1.0版本研发。' },
  { year: '2026', description: '与南昌理工学院东方幼儿园达成战略合作，启动首个「低空+AI」学前科技教育示范园建设。科技教育社区平台1.0上线。' },
  { year: '2027', description: '课程向全园推广，赛事培养成果显现，示范效应向外辐射，平台用户规模持续增长。' },
  { year: '2028+', description: '成为江西学前科技教育标杆，影响全省幼教行业走向，构建完整的区域科技教育生态闭环。' }
]

onMounted(loadPublicPage)
</script>

<style scoped>
.about-page { background: #fbfdfe; }
.section-heading { max-width: 43rem; margin: 0 auto 3rem; text-align: center; }
.section-heading-left { margin-right: 0; margin-left: 0; text-align: left; }
.section-heading h2,
.mission-title h2,
.join-layout h2 { margin-bottom: 1rem; color: #17324d; font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.section-heading p { color: #526b7f; font-size: 1.02rem; line-height: 1.8; }

.mission-section { background: #fbfdfe; }
.mission-layout { display: grid; grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr); gap: clamp(3rem, 9vw, 8rem); align-items: start; }
.mission-title { position: sticky; top: 7rem; }
.mission-title p { color: #e87955; font-size: 1.2rem; font-weight: 720; }
.mission-copy { display: grid; gap: 1.5rem; }
.mission-copy p { color: #526b7f; font-size: 1.02rem; line-height: 1.95; }

.team-section { background: #eef6fa; }
.team-layout { display: grid; grid-template-columns: minmax(22rem, 0.9fr) minmax(0, 1.1fr); gap: clamp(3rem, 7vw, 6.5rem); align-items: center; }
.team-media img { width: 100%; min-height: 42rem; border-radius: 16px; object-fit: cover; }
.team-list { border-top: 1px solid #c9dce5; }
.team-list article { padding: 1.4rem 0; border-bottom: 1px solid #c9dce5; }
.team-list h3 { margin-bottom: 0.25rem; color: #17324d; font-size: 1.2rem; }
.member-title { margin-bottom: 0.65rem; color: #205781 !important; font-size: 0.88rem !important; font-weight: 680; }
.team-list p { color: #526b7f; font-size: 0.92rem; line-height: 1.75; }

.history-section { background: #fbfdfe; }
.history-layout { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr); gap: clamp(3rem, 9vw, 8rem); align-items: start; }
.history-list { border-top: 1px solid #d5e3ea; }
.history-list article { display: grid; grid-template-columns: 6.5rem minmax(0, 1fr); gap: 1.5rem; padding: 1.65rem 0; border-bottom: 1px solid #d5e3ea; }
.history-list time { color: #e87955; font-size: 1.35rem; font-weight: 760; }
.history-list p { color: #526b7f; line-height: 1.8; }

.join-section { background: #205781; }
.join-layout { display: flex; align-items: center; justify-content: space-between; gap: 3rem; }
.join-layout h2 { color: #fff; }
.join-layout p { max-width: 46rem; color: #d8e8ef; font-size: 1.02rem; line-height: 1.75; }
.join-layout .btn { flex: 0 0 auto; }

@media (prefers-color-scheme: dark) {
  .about-page,
  .mission-section,
  .history-section { background: #102431; }
  .team-section { background: #0e202c; }
  .section-heading h2,
  .mission-title h2,
  .team-list h3 { color: #edf6fa; }
  .section-heading p,
  .mission-copy p,
  .team-list p,
  .history-list p { color: #b7cad5; }
  .member-title { color: #91c4df !important; }
  .team-list,
  .team-list article,
  .history-list,
  .history-list article { border-color: #315064; }
}

@media (max-width: 900px) {
  .mission-layout,
  .team-layout,
  .history-layout { grid-template-columns: 1fr; }
  .mission-title { position: static; }
  .team-media img { min-height: 24rem; }
}

@media (max-width: 620px) {
  .history-list article { grid-template-columns: 1fr; gap: 0.5rem; }
  .join-layout { align-items: flex-start; flex-direction: column; }
}
</style>
