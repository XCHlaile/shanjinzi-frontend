<template>
  <div class="auth-page">
    <div :class="['auth-layout', { 'auth-layout-wide': wide }]">
      <aside class="auth-story">
        <img :src="image" :alt="imageAlt">
        <div class="auth-story-copy">
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
      </aside>

      <section class="auth-card" :aria-label="panelLabel">
        <slot />
      </section>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imageAlt: { type: String, required: true },
  panelLabel: { type: String, required: true },
  wide: { type: Boolean, default: false }
})
</script>

<style>
.auth-page {
  min-height: calc(100vh - 72px);
  padding: 7.5rem 1.5rem 3.5rem;
  background:
    radial-gradient(circle at 9% 24%, rgba(232, 121, 85, 0.13), transparent 24rem),
    #eef6fa;
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(20rem, 0.92fr) minmax(0, 1.08fr);
  width: min(100%, 68rem);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 16px;
  background: #fbfdfe;
  box-shadow: 0 1.5rem 4.5rem rgba(35, 83, 112, 0.16);
}

.auth-layout-wide {
  grid-template-columns: minmax(19rem, 0.78fr) minmax(0, 1.22fr);
  width: min(100%, 72rem);
}

.auth-story {
  position: relative;
  min-height: 38rem;
  overflow: hidden;
  background: #205781;
}

.auth-story::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(16, 36, 49, 0.04) 22%, rgba(16, 36, 49, 0.84) 100%);
  content: '';
}

.auth-story img {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
}

.auth-story-copy {
  position: absolute;
  z-index: 1;
  right: clamp(1.6rem, 4vw, 2.75rem);
  bottom: clamp(1.75rem, 5vw, 3rem);
  left: clamp(1.6rem, 4vw, 2.75rem);
  color: #fff;
}

.auth-story-copy h1 {
  max-width: 9ch;
  margin-bottom: 0.9rem;
  font-size: clamp(2.1rem, 4vw, 3.35rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.auth-story-copy p {
  max-width: 32rem;
  color: #d8e8ef;
  line-height: 1.75;
}

.auth-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4.5rem);
  background: #fbfdfe;
}

.auth-layout-wide .auth-card { justify-content: flex-start; }

.auth-header { margin-bottom: 1.75rem; }
.auth-brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.6rem; color: #205781; font-size: 0.88rem; font-weight: 720; }
.auth-logo { width: 42px; height: 42px; flex: 0 0 auto; overflow: hidden; border-radius: 10px; }
.auth-logo img { width: 100%; height: 100%; object-fit: contain; }
.auth-header h2 { margin-bottom: 0.55rem; color: #17324d; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 780; letter-spacing: -0.025em; }
.auth-header > p { max-width: 34rem; color: #526b7f; font-size: 0.94rem; line-height: 1.7; }

.auth-form { display: grid; gap: 1rem; }
.auth-page .form-group { display: grid; gap: 0.45rem; }
.auth-page .form-group label { color: #27465e; font-size: 0.86rem; font-weight: 680; }
.auth-page .form-group input,
.auth-page .form-group select {
  width: 100%;
  min-height: 46px;
  padding: 0.7rem 0.85rem;
  border: 1px solid #c9dce5;
  border-radius: 10px;
  outline: none;
  background: #fff;
  color: #17324d;
  font: inherit;
  font-size: 0.94rem;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.auth-page .form-group input::placeholder { color: #708797; }
.auth-page .form-group input:focus,
.auth-page .form-group select:focus { border-color: #2d72ad; box-shadow: 0 0 0 3px rgba(45, 114, 173, 0.14); }
.auth-page .form-group select:disabled,
.auth-page .form-group input:disabled { cursor: not-allowed; background: #edf3f6; color: #6c8292; }

.code-row { display: flex; gap: 0.65rem; }
.code-row input { flex: 1; min-width: 0; }
.btn-code {
  min-height: 46px;
  flex: 0 0 auto;
  padding: 0.7rem 0.9rem;
  border: 1px solid #c9dce5;
  border-radius: 10px;
  background: #eef6fa;
  color: #205781;
  cursor: pointer;
  font: inherit;
  font-size: 0.83rem;
  font-weight: 680;
  white-space: nowrap;
  transition: background-color 160ms ease, border-color 160ms ease;
}
.btn-code:hover:not(:disabled) { border-color: #2d72ad; background: #dceef7; }
.btn-code:disabled { cursor: not-allowed; opacity: 0.58; }

.auth-page .btn-block { min-height: 46px; width: 100%; justify-content: center; padding: 0.72rem 1rem; font-size: 0.95rem; }
.auth-page .btn:disabled { cursor: not-allowed; opacity: 0.58; transform: none; }
.mode-switch { margin-top: -0.25rem; }

.binding-box {
  display: grid;
  gap: 0.9rem;
  margin: 0.35rem 0;
  padding: 1.25rem 0;
  border-top: 1px solid #d5e3ea;
  border-bottom: 1px solid #d5e3ea;
}
.binding-box > strong { color: #17324d; font-size: 1rem; }
.binding-box > p { color: #526b7f; font-size: 0.86rem; line-height: 1.65; }

.field-error { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; color: #b42318; font-size: 0.8rem; line-height: 1.5; }
.field-error button { flex: 0 0 auto; padding: 0; border: 0; background: transparent; color: #205781; cursor: pointer; font: inherit; font-weight: 680; }
.field-error button:disabled { cursor: not-allowed; opacity: 0.55; }

.auth-error,
.auth-msg { padding: 0.7rem 0.8rem; border-radius: 10px; font-size: 0.84rem; line-height: 1.55; }
.auth-error { background: #fef2f2; color: #a63a32; }
.auth-msg { background: #eaf8f1; color: #176b4d; }

.auth-switch { margin-top: 1.35rem; color: #526b7f; font-size: 0.86rem; line-height: 1.65; text-align: center; }
.auth-switch-split { display: flex; align-items: center; justify-content: space-between; gap: 1rem; text-align: left; }
.auth-switch a { font-weight: 680; white-space: nowrap; }
.admin-login-link { display: block; margin-top: 1rem; color: #6c8292; font-size: 0.8rem; text-align: center; }
.admin-login-link:hover { color: #205781; }

@media (prefers-color-scheme: dark) {
  .auth-page { background: #0e202c; }
  .auth-layout,
  .auth-card { background: #132b3a; }
  .auth-header h2,
  .binding-box > strong { color: #edf6fa; }
  .auth-brand { color: #91c4df; }
  .auth-header > p,
  .auth-switch,
  .binding-box > p { color: #b7cad5; }
  .auth-page .form-group label { color: #d8e8ef; }
  .auth-page .form-group input,
  .auth-page .form-group select { border-color: #315064; background: #102431; color: #edf6fa; }
  .auth-page .form-group input::placeholder { color: #94aab7; }
  .auth-page .form-group select:disabled,
  .auth-page .form-group input:disabled { background: #1a3849; color: #94aab7; }
  .btn-code { border-color: #315064; background: #1a3849; color: #b7def1; }
  .btn-code:hover:not(:disabled) { border-color: #5ba0c9; background: #23485d; }
  .binding-box { border-color: #315064; }
  .auth-error { background: #3a2022; color: #ffc1bb; }
  .auth-msg { background: #16382d; color: #a9e4c9; }
  .admin-login-link { color: #94aab7; }
}

@media (max-width: 900px) {
  .auth-page { padding: 6.5rem 1rem 2rem; }
  .auth-layout,
  .auth-layout-wide { grid-template-columns: 1fr; max-width: 38rem; }
  .auth-story { min-height: 15rem; }
  .auth-story img { min-height: 15rem; }
  .auth-story-copy h1 { max-width: 14ch; font-size: 2.15rem; }
  .auth-story-copy p { font-size: 0.9rem; }
}

@media (max-width: 520px) {
  .auth-page { padding-right: 0.75rem; padding-left: 0.75rem; }
  .auth-story { min-height: 12rem; }
  .auth-story img { min-height: 12rem; }
  .auth-story-copy { right: 1.25rem; bottom: 1.25rem; left: 1.25rem; }
  .auth-story-copy h1 { margin-bottom: 0.45rem; font-size: 1.8rem; }
  .auth-story-copy p { display: none; }
  .auth-card { padding: 1.65rem 1.25rem 2rem; }
  .auth-switch-split { align-items: flex-start; flex-direction: column; gap: 0.45rem; }
  .code-row { align-items: stretch; }
  .btn-code { padding-right: 0.7rem; padding-left: 0.7rem; }
}
</style>
