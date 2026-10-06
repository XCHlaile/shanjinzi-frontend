<template>
  <div class="home">
    <section class="hero" aria-labelledby="home-hero-title">
      <div class="container hero-layout">
        <div class="hero-copy">
          <p class="hero-kicker">面向幼儿园与家庭的科技教育平台</p>
          <h1 id="home-hero-title" class="hero-title">
            让孩子在好奇中<br><span>遇见科技</span>
          </h1>
          <p class="hero-desc">{{ heroDesc }}</p>
          <div class="hero-actions">
            <router-link to="/platform" class="btn btn-primary">查看平台功能</router-link>
            <router-link to="/login" class="btn btn-outline">登录使用</router-link>
          </div>
        </div>

        <div class="hero-visual">
          <img
            src="/kechuang.webp"
            alt="教师带领幼儿体验机器人科技课程"
            width="800"
            height="533"
            fetchpriority="high"
          >
          <div class="hero-note" aria-label="课程适龄范围">
            <strong>3-6 岁</strong>
            <span>适龄课程设计</span>
          </div>
        </div>
      </div>
    </section>

    <section class="audience-section" aria-labelledby="audience-title">
      <div class="container audience-grid">
        <div class="audience-intro">
          <h2 id="audience-title">幼儿园放心开课，家长看见成长</h2>
          <p>把课程实施、成长记录和家校沟通放在同一条清晰链路中，让科技启蒙真正融入日常教育。</p>
        </div>
        <div class="audience-paths">
          <article>
            <h3>给幼儿园</h3>
            <p>获得适龄课程、师资支持与赛事培养方案，形成可持续的园本科技教育特色。</p>
          </article>
          <article>
            <h3>给家长</h3>
            <p>及时了解课堂动态、作品与参赛进度，陪伴孩子把每一次好奇变成成长记录。</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section advantages-section" aria-labelledby="advantages-title">
      <div class="container">
        <header class="section-heading">
          <h2 id="advantages-title">一套能在幼儿园真正落地的科技启蒙体系</h2>
          <p>从课程实施到家校共育，再到赛事与成长档案，关键环节彼此衔接。</p>
        </header>

        <div class="advantages-layout">
          <figure class="advantages-visual">
            <img src="/steam-bg.webp" alt="以校园与创意积木为主题的科技启蒙场景" width="800" height="533" loading="lazy" decoding="async">
          </figure>
          <div class="advantage-list">
            <article v-for="item in advantages" :key="item.title" class="advantage-item">
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section modules-section" aria-labelledby="modules-title">
      <div class="container">
        <header class="section-heading">
          <h2 id="modules-title">学校、教师与家长都能顺手使用</h2>
          <p>四个核心板块覆盖课堂记录、赛事报名、家长交流与行业资讯。</p>
        </header>

        <div class="module-grid">
          <article
            v-for="(mod, index) in modules"
            :key="mod.title"
            class="module-card"
            :class="{ 'module-card-featured': index === 0 }"
          >
            <img
              v-if="index === 0"
              src="/platform-hero.webp"
              alt="家长陪伴孩子使用家庭学习平台"
              width="800"
              height="450"
              loading="lazy"
              decoding="async"
            >
            <div class="module-content">
              <h3>{{ mod.title }}</h3>
              <p>{{ mod.desc }}</p>
              <ul>
                <li v-for="item in mod.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section partner-section" aria-labelledby="partner-title">
      <div class="container partner-layout">
        <div class="partner-main">
          <div class="partner-identity" aria-label="东方幼儿园与山巾子科技合作">
            <img src="/dongfang.png" alt="东方幼儿园标志" width="300" height="300" loading="lazy" decoding="async">
            <span aria-hidden="true">×</span>
            <img src="/logo.png" alt="山巾子科技标志" width="766" height="790" loading="lazy" decoding="async">
          </div>
          <h2 id="partner-title">从一所示范园开始，验证可复制的实践路径</h2>
          <p>携手南昌理工学院东方幼儿园，依托高校教师与幼教团队，共同建设贯通课程、基地、共育与赛事的科学启蒙体系。</p>
          <router-link to="/case" class="btn btn-primary">查看合作案例</router-link>
        </div>

        <dl class="partner-proof">
          <div v-for="proof in partnerProof" :key="proof.term">
            <dt>{{ proof.term }}</dt>
            <dd>{{ proof.desc }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="cta-section" aria-labelledby="cta-title">
      <img src="/xinpianzhang.webp" alt="孩子在阳光下奔跑，享受探索与成长" width="800" height="533" loading="lazy" decoding="async">
      <div class="cta-overlay" aria-hidden="true"></div>
      <div class="container cta-content">
        <div class="cta-panel">
          <h2 id="cta-title">让下一次科技探索，从这里开始</h2>
          <p>加入山巾子科技平台，让幼儿园更好组织课程，让家长更清楚看见孩子的每一步成长。</p>
          <div class="cta-actions">
            <router-link to="/register" class="btn btn-primary btn-lg">立即注册</router-link>
            <router-link to="/about" class="btn btn-outline btn-lg">了解山巾子</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePublicPage } from '@/features/content/index.js'

const { loadPublicPage, publicPage } = usePublicPage('home')
const defaultHeroDesc = '山巾子科技教育研究中心依托高校教研团队，围绕低空科技与人工智能，为幼儿园和家庭提供课程、成长记录与赛事服务。'
const heroDesc = computed(() => publicPage.value?.summary || publicPage.value?.description || publicPage.value?.contentMarkdown || defaultHeroDesc)

onMounted(loadPublicPage)

const advantages = [
  { title: '适龄科技课程', desc: '围绕3-6岁幼儿的认知与动手特点设计低空、AI和电子制作课程，让抽象科技变得可观察、可操作。' },
  { title: '课程赛事衔接', desc: '从课堂学习自然延伸到多层级科技赛事，让孩子在作品展示与真实任务中建立自信。' },
  { title: '家校共同陪伴', desc: '教师记录课堂过程，家长查看动态与成长档案，让教育反馈更及时、更具体。' },
  { title: '高校教研支持', desc: '连接高校教师、幼教团队与科技企业资源，为园所持续更新课程与实践内容。' },
]

const modules = [
  { title: '幼儿动态', desc: '教师发布课堂记录，家长查看、点赞与评论，持续沉淀孩子的成长轨迹。', items: ['课堂图文记录', '家长互动反馈', '成长档案汇总'] },
  { title: '赛事专区', desc: '集中查看各级赛事并在线报名，报名信息与参赛进度更清楚。', items: ['赛事信息浏览', '在线报名', '参赛状态管理'] },
  { title: '家长论坛', desc: '围绕课程体验与家庭陪伴交流经验，让问题得到更有针对性的回应。', items: ['经验分享', '课程反馈', '同园家长交流'] },
  { title: '新闻资讯', desc: '获取政策解读、科技教育趋势和平台活动信息。', items: ['行业政策', '科技前沿', '品牌活动'] },
]

const partnerProof = [
  { term: '示范园实践', desc: '江西低空与AI学前科技教育实践项目' },
  { term: '双重专业支持', desc: '高校教研团队与一线幼教团队共同参与' },
  { term: '完整实施链路', desc: '覆盖课程、基地、共育、赛事与成长记录' },
]
</script>

<style scoped>
.home {
  --home-surface: #f7fafc;
  --home-surface-strong: #eef5f8;
  --home-ink: #17324d;
  --home-muted: #526b7f;
  --home-brand: #2d72ad;
  --home-brand-dark: #205781;
  --home-brand-soft: #dceef7;
  --home-warm: #e87955;
  --home-warm-soft: #fff0e9;
  --home-line: #d5e3ea;
  overflow: hidden;
  background: var(--home-surface);
  color: var(--home-ink);
}

.hero {
  position: relative;
  display: flex;
  min-height: min(50rem, calc(100dvh - 72px));
  align-items: center;
  padding: clamp(7rem, 11vw, 9rem) 0 clamp(4.5rem, 7vw, 6rem);
  background: var(--home-surface);
}

.hero::before {
  position: absolute;
  top: 13%;
  right: -8%;
  width: clamp(22rem, 44vw, 43rem);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--home-brand-soft);
  content: '';
}

.hero-layout {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(27rem, 1.1fr);
  gap: clamp(3rem, 7vw, 7rem);
  align-items: center;
}

.hero-copy { max-width: 38rem; }

.hero-kicker {
  margin-bottom: 1.25rem;
  color: var(--home-brand-dark);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hero-title {
  max-width: 8em;
  margin-bottom: 1.5rem;
  color: var(--home-ink);
  font-size: clamp(3.2rem, 5.4vw, 5.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.04;
  text-wrap: balance;
}

.hero-title span { color: var(--home-brand); }

.hero-desc {
  max-width: 35rem;
  margin-bottom: 2rem;
  color: var(--home-muted);
  font-size: clamp(1rem, 1.3vw, 1.08rem);
  line-height: 1.85;
}

.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-actions .btn,
.cta-actions .btn {
  min-height: 48px;
  justify-content: center;
}

.hero-visual {
  position: relative;
  min-width: 0;
}

.hero-visual > img {
  width: 100%;
  min-height: 31rem;
  border-radius: 28px;
  box-shadow: 0 2rem 5rem rgba(35, 83, 112, 0.2);
  object-fit: cover;
}

.hero-note {
  position: absolute;
  right: -1.25rem;
  bottom: 2rem;
  display: grid;
  min-width: 10.5rem;
  gap: 0.1rem;
  padding: 1.15rem 1.35rem;
  border-radius: 16px;
  background: rgba(250, 253, 255, 0.94);
  box-shadow: 0 1rem 2.5rem rgba(35, 83, 112, 0.16);
  color: var(--home-ink);
}

.hero-note strong { color: var(--home-warm); font-size: 1.35rem; }
.hero-note span { color: var(--home-muted); font-size: 0.82rem; }

.audience-section {
  position: relative;
  padding: clamp(4rem, 7vw, 6rem) 0;
  background: var(--home-brand-soft);
}

.audience-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(3rem, 7vw, 7rem);
  align-items: start;
}

.audience-intro h2,
.section-heading h2,
.partner-main h2,
.cta-panel h2 {
  color: var(--home-ink);
  font-size: clamp(2rem, 3.4vw, 3.35rem);
  font-weight: 780;
  letter-spacing: -0.035em;
  line-height: 1.15;
  text-wrap: balance;
}

.audience-intro p,
.section-heading p,
.partner-main > p,
.cta-panel > p {
  max-width: 42rem;
  color: var(--home-muted);
  font-size: 1rem;
  line-height: 1.8;
}

.audience-intro h2 { margin-bottom: 1.15rem; }

.audience-paths {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}

.audience-paths article {
  padding-top: 1.25rem;
  border-top: 3px solid var(--home-brand);
}

.audience-paths article:last-child { border-top-color: var(--home-warm); }
.audience-paths h3 { margin-bottom: 0.75rem; font-size: 1.28rem; }
.audience-paths p { color: var(--home-muted); font-size: 0.94rem; line-height: 1.75; }

.section { padding: clamp(5.5rem, 9vw, 8rem) 0; }

.section-heading {
  display: grid;
  max-width: 48rem;
  gap: 1.25rem;
  margin-bottom: clamp(2.75rem, 5vw, 4.5rem);
}

.advantages-section { background: var(--home-surface); }

.advantages-layout {
  display: grid;
  grid-template-columns: minmax(22rem, 0.88fr) minmax(0, 1.12fr);
  gap: clamp(3rem, 7vw, 7rem);
  align-items: center;
}

.advantages-visual { margin: 0; }

.advantages-visual img {
  width: 100%;
  min-height: 34rem;
  border-radius: 28px;
  object-fit: cover;
}

.advantage-list { display: grid; }

.advantage-item {
  display: grid;
  grid-template-columns: minmax(9rem, 0.65fr) minmax(0, 1.35fr);
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--home-line);
}

.advantage-item:first-child { border-top: 1px solid var(--home-line); }
.advantage-item h3 { font-size: 1.08rem; line-height: 1.5; }
.advantage-item p { color: var(--home-muted); font-size: 0.92rem; line-height: 1.75; }

.modules-section { background: var(--home-surface-strong); }

.module-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) minmax(20rem, 0.84fr);
  grid-template-rows: repeat(3, minmax(0, auto));
  gap: 1rem;
}

.module-card {
  overflow: hidden;
  border-radius: 20px;
  background: #fbfdfe;
}

.module-card:not(.module-card-featured) { background: #e3f0f5; }
.module-card:nth-child(3) { background: var(--home-warm-soft); }
.module-card:nth-child(4) { background: #f5f0dc; }

.module-card-featured {
  display: grid;
  grid-row: 1 / span 3;
  grid-template-rows: minmax(17rem, 1.15fr) auto;
}

.module-card-featured > img {
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
}

.module-content { padding: 1.75rem; }
.module-card-featured .module-content { padding: 2.25rem; }
.module-content h3 { margin-bottom: 0.55rem; font-size: 1.35rem; }
.module-content > p { color: var(--home-muted); font-size: 0.93rem; line-height: 1.7; }

.module-content ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 1.1rem;
}

.module-content li {
  color: var(--home-brand-dark);
  font-size: 0.82rem;
  font-weight: 650;
}

.partner-section { background: var(--home-surface); }

.partner-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(21rem, 0.92fr);
  gap: clamp(3rem, 8vw, 8rem);
  align-items: end;
}

.partner-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.partner-identity img {
  width: 4rem;
  height: 4rem;
  border-radius: 14px;
  background: #fff;
  object-fit: contain;
}

.partner-identity span { color: var(--home-muted); font-size: 1.5rem; }
.partner-main h2 { margin-bottom: 1.25rem; }
.partner-main > p { margin-bottom: 2rem; }

.partner-proof { margin: 0; }

.partner-proof div {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--home-line);
}

.partner-proof div:first-child { border-top: 1px solid var(--home-line); }
.partner-proof dt { margin-bottom: 0.45rem; color: var(--home-brand); font-size: 1.08rem; font-weight: 750; }
.partner-proof dd { margin: 0; color: var(--home-muted); font-size: 0.92rem; line-height: 1.65; }

.cta-section {
  position: relative;
  display: flex;
  min-height: 38rem;
  align-items: center;
  overflow: hidden;
}

.cta-section > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.cta-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(239, 247, 250, 0.98) 0%, rgba(239, 247, 250, 0.9) 44%, rgba(239, 247, 250, 0.08) 75%);
}

.cta-content { position: relative; }

.cta-panel {
  max-width: 35rem;
  padding: 2.75rem;
  border-radius: 20px;
  background: rgba(251, 253, 254, 0.9);
  box-shadow: 0 1.5rem 4rem rgba(35, 83, 112, 0.14);
  backdrop-filter: blur(12px);
}

.cta-panel h2 { margin-bottom: 1rem; }
.cta-panel > p { margin-bottom: 1.75rem; }

@media (prefers-reduced-motion: no-preference) {
  .hero-copy { animation: hero-copy-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .hero-visual { animation: hero-visual-in 850ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both; }
}

@keyframes hero-copy-in {
  from { opacity: 0; transform: translateY(18px); }
}

@keyframes hero-visual-in {
  from { opacity: 0; transform: translateY(24px) scale(0.985); }
}

@media (prefers-color-scheme: dark) {
  .home {
    --home-surface: #102431;
    --home-surface-strong: #142c3b;
    --home-ink: #edf6fa;
    --home-muted: #b7cad5;
    --home-brand: #79b8df;
    --home-brand-dark: #a8d1e8;
    --home-brand-soft: #193a4c;
    --home-warm: #f29a7a;
    --home-warm-soft: #422a27;
    --home-line: #315064;
  }

  .module-card { background: #173445; }
  .module-card:not(.module-card-featured) { background: #1a3b4d; }
  .module-card:nth-child(3) { background: #402b28; }
  .module-card:nth-child(4) { background: #373522; }
  .hero-note,
  .cta-panel { background: rgba(16, 36, 49, 0.94); }
  .cta-overlay { background: linear-gradient(90deg, rgba(16, 36, 49, 0.98) 0%, rgba(16, 36, 49, 0.9) 44%, rgba(16, 36, 49, 0.12) 75%); }
}

@media (max-width: 960px) {
  .hero { min-height: auto; }
  .hero-layout,
  .audience-grid,
  .advantages-layout,
  .partner-layout { grid-template-columns: 1fr; }
  .hero-layout { gap: 3rem; }
  .hero-copy { max-width: 44rem; }
  .hero-title { max-width: 9em; }
  .hero-visual { max-width: 46rem; }
  .hero-note { right: 1rem; }
  .advantages-visual img { min-height: 26rem; }
  .module-grid { grid-template-columns: 1fr; grid-template-rows: none; }
  .module-card-featured { grid-row: auto; grid-template-rows: minmax(20rem, auto) auto; }
}

@media (max-width: 640px) {
  .hero { padding: 6.75rem 0 4rem; }
  .hero::before { top: 36%; right: -45%; width: 32rem; }
  .hero-layout { gap: 2.5rem; }
  .hero-kicker { margin-bottom: 1rem; font-size: 0.82rem; }
  .hero-title { font-size: clamp(2.65rem, 13vw, 3.35rem); letter-spacing: -0.035em; }
  .hero-desc { font-size: 0.95rem; line-height: 1.75; }
  .hero-actions .btn { flex: 1 1 9.5rem; }
  .hero-visual > img { min-height: 23rem; border-radius: 20px; }
  .hero-note { right: 0.75rem; bottom: 0.75rem; min-width: 8.75rem; padding: 0.85rem 1rem; }
  .audience-section,
  .section { padding: 4.5rem 0; }
  .audience-grid { gap: 2.25rem; }
  .audience-paths { grid-template-columns: 1fr; gap: 1.5rem; }
  .audience-intro h2,
  .section-heading h2,
  .partner-main h2,
  .cta-panel h2 { font-size: clamp(1.9rem, 9vw, 2.5rem); }
  .section-heading { margin-bottom: 2.5rem; }
  .advantages-layout { gap: 2.25rem; }
  .advantages-visual img { min-height: 20rem; border-radius: 20px; }
  .advantage-item { grid-template-columns: 1fr; gap: 0.5rem; padding: 1.25rem 0; }
  .module-card { border-radius: 16px; }
  .module-card-featured { grid-template-rows: 15rem auto; }
  .module-content,
  .module-card-featured .module-content { padding: 1.5rem; }
  .partner-layout { gap: 2.75rem; }
  .partner-identity img { width: 3.25rem; height: 3.25rem; }
  .cta-section { min-height: 36rem; align-items: flex-end; padding: 4rem 0 2rem; }
  .cta-section > img { object-position: 62% center; }
  .cta-overlay { background: linear-gradient(0deg, rgba(239, 247, 250, 0.98) 0%, rgba(239, 247, 250, 0.86) 55%, rgba(239, 247, 250, 0.08) 100%); }
  .cta-panel { padding: 1.5rem; border-radius: 16px; }

  @media (prefers-color-scheme: dark) {
    .cta-overlay { background: linear-gradient(0deg, rgba(16, 36, 49, 0.98) 0%, rgba(16, 36, 49, 0.86) 55%, rgba(16, 36, 49, 0.1) 100%); }
  }
}

@media (max-width: 480px) {
  .hero-actions,
  .cta-actions { flex-direction: column; }
  .hero-actions .btn,
  .cta-actions .btn { width: 100%; flex-basis: auto; }
}
</style>
