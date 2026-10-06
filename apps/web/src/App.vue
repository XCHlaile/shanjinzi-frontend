<template>
  <el-config-provider :locale="zhCn">
    <div id="app-root">
      <Navbar />
      <main class="main-content">
        <router-view />
      </main>
      <Footer />
    </div>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
}
</style>
