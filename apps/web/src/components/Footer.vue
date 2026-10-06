<template>
  <footer id="contact" class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-icon"><img src="/logo.png" alt="山巾子科技"></span>
            <span>山巾子科技</span>
          </div>
          <p class="footer-desc">连接幼儿园、家庭与高校教研资源，让低空科技与人工智能启蒙更适龄、更清晰、更容易持续。</p>
        </div>

        <nav class="footer-links" aria-label="页脚导航">
          <h2>快速导航</h2>
          <router-link to="/">首页</router-link>
          <router-link to="/platform">平台功能</router-link>
          <router-link to="/case">合作案例</router-link>
          <router-link to="/about">关于我们</router-link>
        </nav>

        <address class="footer-contact">
          <h2>联系我们</h2>
          <p><span>电话</span>0791-XXXXXXXX</p>
          <p><span>邮箱</span>contact@shanjinzi.tech</p>
          <p><span>地址</span>江西省南昌市</p>
        </address>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 山巾子科技教育研究中心 All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid #d5e3ea;
  background: #e9f2f6;
  color: #526b7f;
  padding: 4.5rem 0 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(10rem, 0.65fr) minmax(16rem, 0.85fr);
  gap: clamp(2.5rem, 6vw, 6rem);
  padding-bottom: 3.5rem;
}

.footer-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; color: #17324d; font-size: 1.18rem; font-weight: 780; }
.footer-logo .logo-icon { display: flex; width: 42px; height: 42px; align-items: center; justify-content: center; overflow: hidden; border-radius: 10px; }
.footer-logo .logo-icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
.footer-desc { max-width: 29rem; font-size: 0.92rem; line-height: 1.8; }
.footer-links h2,
.footer-contact h2 { margin-bottom: 1.15rem; color: #17324d; font-size: 0.95rem; }
.footer-links a { display: block; width: fit-content; margin-bottom: 0.7rem; color: #526b7f; font-size: 0.9rem; transition: color 180ms ease; }
.footer-links a:hover { color: #205781; }
.footer-contact { font-style: normal; }
.footer-contact p { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); gap: 0.65rem; margin-bottom: 0.75rem; font-size: 0.9rem; }
.footer-contact p span { color: #17324d; font-weight: 680; }
.footer-bottom { border-top: 1px solid #d5e3ea; padding: 1.4rem 0; color: #6c8292; font-size: 0.8rem; }

@media (prefers-color-scheme: dark) {
  .footer { border-color: #315064; background: #102431; color: #b7cad5; }
  .footer-logo,
  .footer-links h2,
  .footer-contact h2,
  .footer-contact p span { color: #edf6fa; }
  .footer-links a { color: #b7cad5; }
  .footer-links a:hover { color: #edf6fa; }
  .footer-bottom { border-color: #315064; color: #92aab7; }
}

@media (max-width: 760px) {
  .footer { padding-top: 3.5rem; }
  .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; padding-bottom: 2.75rem; }
  .footer-bottom { line-height: 1.7; text-align: left; }
}
</style>
