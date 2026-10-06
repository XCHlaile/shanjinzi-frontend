<template>
  <div class="module-page news-page">
    <section class="module-hero news-hero">
      <div class="container">
        <h1>📰 新闻资讯</h1>
        <p>行业政策、科技前沿、品牌动态与园所风采</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="toolbar">
          <div class="filter-group">
            <button
              v-for="category in categoryOptions"
              :key="category.id ?? 'all'"
              :class="['filter-btn', { active: activeCategoryId === category.id }]"
              type="button"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <p v-if="categoryError" class="category-warning">{{ categoryError }}</p>

        <AppStatePanel
          :loading="loading"
          :error="loadFailure || loadError"
          :empty="!loading && !loadError && !newsItems.length"
          empty-title="暂无已发布新闻资讯"
          empty-text="新的资讯发布后会显示在这里。"
          loading-text="正在加载新闻资讯"
          @retry="loadNews"
        />

        <template v-if="!loading && !loadError">
          <article v-for="item in newsItems" :key="item.id" class="news-card" @click="toggleArticle(item)">
            <div class="news-icon">📰</div>
            <div class="news-body">
              <div class="news-labels">
                <span class="news-tag">{{ item.categoryName || '新闻资讯' }}</span>
                <span v-if="item.isPinned" class="news-pinned">置顶</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ expandedId === item.id ? (detailsById[item.id]?.contentText || item.summary) : item.summary }}</p>
              <p v-if="expandedId === item.id && detailLoadingId === item.id" class="detail-state">正在加载正文...</p>
              <p v-if="expandedId === item.id && detailErrors[item.id]" class="detail-state error-text">
                {{ detailErrors[item.id] }}
              </p>
              <div class="news-footer">
                <span class="news-date">📅 {{ formatTime(item.publishAt || item.createdAt) }}</span>
              </div>
            </div>
          </article>
        </template>

        <div v-if="!loading && totalPages > 1" class="pagination">
          <button class="btn btn-outline btn-xs" type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
          <button class="btn btn-outline btn-xs" type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppStatePanel from '@/components/AppStatePanel.vue'
import {
  formatPublicNewsTime as formatTime,
  useNewsDirectory
} from '@/features/content/index.js'

const {
  activeCategoryId,
  categoryError,
  categoryOptions,
  changePage,
  detailErrors,
  detailLoadingId,
  detailsById,
  expandedId,
  initialize,
  loadError,
  loadFailure,
  loadNews,
  loading,
  newsItems,
  page,
  selectCategory,
  toggleArticle,
  total,
  totalPages
} = useNewsDirectory()

onMounted(initialize)
</script>

<style scoped>
.module-hero { position:relative; background:linear-gradient(135deg,#0f172a,#1e293b); color:white; padding:100px 0 40px; }
.module-hero h1 { font-size:1.8rem; margin-bottom:8px; }
.module-hero p { color:#94a3b8; }
.toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
.filter-group { display:flex; gap:6px; flex-wrap:wrap; }
.filter-btn { padding:6px 14px; border:1px solid var(--border); border-radius:20px; background:white; font-size:0.83rem; cursor:pointer; transition:all .2s; }
.filter-btn.active { background:var(--primary); color:white; border-color:var(--primary); }
.filter-btn:hover:not(.active) { border-color:var(--primary); }

.news-card { display:flex; gap:24px; background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:18px; margin-bottom:12px; cursor:pointer; transition:all .2s; content-visibility:auto; contain-intrinsic-size:auto 124px; }
.news-card:hover { box-shadow:var(--shadow-md); }
.news-icon { width:70px; height:70px; background:var(--bg-muted); border-radius:var(--radius); display:flex; align-items:center; justify-content:center; font-size:1.8rem; flex-shrink:0; }
.news-body { flex:1; }
.news-labels { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.news-tag { display:inline-block; padding:2px 10px; border-radius:10px; background:var(--primary); color:white; font-size:0.75rem; }
.news-pinned { padding:2px 8px; border-radius:10px; background:#fff7ed; color:#ea580c; font-size:0.75rem; }
.news-body h3 { font-size:1rem; margin-bottom:4px; }
.news-body p { font-size:0.88rem; color:var(--text-secondary); line-height:1.7; margin-bottom:6px; white-space:pre-wrap; }
.news-footer { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.news-date { font-size:0.8rem; color:#94a3b8; }
.category-warning { margin:-8px 0 16px; color:#b45309; font-size:0.86rem; }
.detail-state { color:#2563eb !important; }
.error-text { color:#dc2626 !important; }
.pagination { display:flex; justify-content:center; align-items:center; gap:14px; margin-top:22px; color:var(--text-secondary); font-size:0.86rem; }
.empty { text-align:center; color:var(--text-secondary); padding:40px 0; font-size:0.95rem; }
@media (max-width:768px) { .news-card { flex-direction:column; } .news-icon { width:100%; height:50px; } }


.module-hero.news-hero > * { position:relative; z-index:1; }
.news-hero::before { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.7); z-index:0; }


</style>



