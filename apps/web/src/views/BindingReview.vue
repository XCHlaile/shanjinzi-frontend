<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <div class="page-heading">
          <p>校方管理员</p>
          <h1>家长绑定审核</h1>
          <span>六方亲属名额、解绑、冻结和重新绑定都必须记录操作日志。</span>
        </div>

        <div class="unsupported-panel">
          <strong>绑定审核接口未提供</strong>
          <p>4openapi.json 仅提供家长查询本人绑定和使用绑定码绑定学生的接口，没有校方查询待审核记录、审核通过、拒绝、解绑或冻结接口。</p>
          <code>待后端提供：校方绑定审核列表与审核操作 API</code>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.plain-page { padding-top:64px; }
.page-heading { margin-bottom:20px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); }
.unsupported-panel { padding:28px; border:1px dashed #f59e0b; border-radius:8px; background:#fffbeb; display:grid; gap:10px; }
.unsupported-panel strong { color:#92400e; font-size:1.05rem; }
.unsupported-panel p { color:#78350f; line-height:1.7; }
.unsupported-panel code { color:#92400e; white-space:normal; }
</style>
