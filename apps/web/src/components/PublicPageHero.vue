<template>
  <section class="public-hero">
    <div class="container public-hero-layout">
      <div class="public-hero-copy">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>

      <div class="public-hero-media">
        <img :src="image" :alt="imageAlt">
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imageAlt: { type: String, required: true }
})
</script>

<style scoped>
.public-hero {
  padding: 8.5rem 0 4.5rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 9% 18%, rgba(232, 121, 85, 0.12), transparent 26rem),
    linear-gradient(135deg, #f7fafc 0%, #eef6fa 62%, #dceef7 100%);
}

.public-hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(28rem, 1.08fr);
  gap: clamp(2.5rem, 7vw, 6.5rem);
  align-items: center;
}

.public-hero-copy { position: relative; z-index: 1; }

.public-hero h1 {
  max-width: 8ch;
  margin-bottom: 1.35rem;
  color: #17324d;
  font-size: clamp(2.75rem, 6vw, 5.25rem);
  font-weight: 820;
  line-height: 0.98;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.public-hero p {
  max-width: 34rem;
  color: #526b7f;
  font-size: clamp(1.05rem, 1.5vw, 1.22rem);
  line-height: 1.8;
}

.public-hero-media {
  position: relative;
  min-height: 23rem;
}

.public-hero-media::before {
  position: absolute;
  top: -1.2rem;
  right: -1.8rem;
  width: 42%;
  height: 38%;
  border-radius: 16px;
  background: #e87955;
  content: '';
  opacity: 0.88;
}

.public-hero-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 1.5rem 3.8rem rgba(35, 83, 112, 0.18);
  object-fit: cover;
}

@media (prefers-color-scheme: dark) {
  .public-hero {
    background:
      radial-gradient(circle at 9% 18%, rgba(232, 121, 85, 0.13), transparent 26rem),
      linear-gradient(135deg, #102431 0%, #173242 62%, #1e4459 100%);
  }

  .public-hero h1 { color: #edf6fa; }
  .public-hero p { color: #bfd1da; }
}

@media (max-width: 900px) {
  .public-hero { padding: 7.5rem 0 3.5rem; }
  .public-hero-layout { grid-template-columns: 1fr; gap: 2.75rem; }
  .public-hero h1 { max-width: none; }
  .public-hero-media { min-height: 20rem; }
}

@media (max-width: 560px) {
  .public-hero { padding-top: 6.8rem; }
  .public-hero h1 { font-size: clamp(2.5rem, 16vw, 3.7rem); }
  .public-hero-media { min-height: 15.5rem; }
  .public-hero-media::before { top: -0.8rem; right: -0.5rem; }
}
</style>
