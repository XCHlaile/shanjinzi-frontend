<template>
  <div class="plain-page">
    <section class="section">
      <div class="container">
        <div class="page-heading">
          <p>教师端</p>
          <h1>班级与学生查看</h1>
          <span>展示当前登录教师关联的真实学生数据。</span>
        </div>

        <div class="api-notice">
          <strong>实时数据</strong>
          <span>所带班级来自教师班级接口 GET /api/app/students/my-classes。</span>
          <span>班级学生来自当前用户关联学生接口 GET /api/app/students/my。</span>
          <span>可继续查看学生成长档案，权限范围由后端按当前教师负责班级控制。</span>
        </div>

        <div class="class-panel">
          <div class="class-panel-heading">
            <strong>我所带的班级</strong>
            <span v-if="teacherClasses.length">共 {{ teacherClasses.length }} 个班级</span>
          </div>
          <div v-if="loading" class="class-state">正在加载班级...</div>
          <div v-else-if="!teacherClasses.length" class="class-state">当前教师暂无所带班级</div>
          <div v-else class="class-list">
            <button
              type="button"
              :class="['class-card', { active: activeClassId === '' }]"
              @click="activeClassId = ''"
            >
              <strong>全部班级</strong>
              <span>{{ totalStudentCount }} 名学生</span>
            </button>
            <button
              v-for="classItem in teacherClasses"
              :key="classItem.id"
              type="button"
              :class="['class-card', { active: activeClassId === classItem.id }]"
              @click="activeClassId = classItem.id"
            >
              <strong>{{ classItem.name }}</strong>
              <span>{{ classItem.gradeName }} · {{ classItem.studentCount }} 名学生</span>
              <em v-if="classItem.isHeadTeacher">班主任</em>
            </button>
          </div>
        </div>

        <div class="toolbar">
          <input v-model="keyword" placeholder="按姓名、学号、学校或班级筛选">
        </div>

        <div class="table-panel">
          <table class="data-table">
            <thead>
              <tr><th>学生</th><th>编号</th><th>学校</th><th>班级</th><th>家长数</th><th>状态</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="7" class="table-state">正在从数据库加载班级学生...</td></tr>
              <tr v-else-if="loadError">
                <td colspan="7" class="table-state table-error">
                  {{ loadError }}
                  <button class="link-btn" type="button" @click="loadRoster">重新加载</button>
                </td>
              </tr>
              <tr v-else-if="!teacherClasses.length">
                <td colspan="7" class="table-state">请先为当前教师分配班级</td>
              </tr>
              <tr v-else-if="!students.length">
                <td colspan="7" class="table-state table-error">
                  {{ emptyStudentMessage }}
                </td>
              </tr>
              <tr v-else-if="!filteredStudents.length"><td colspan="7" class="table-state">暂无符合条件的学生</td></tr>
              <tr v-for="student in filteredStudents" v-else :key="student.id">
                <td>{{ student.name }}</td>
                <td>{{ student.code }}</td>
                <td>{{ student.schoolName }}</td>
                <td>{{ student.className }}</td>
                <td>{{ student.guardianCount }}</td>
                <td>{{ student.status }}</td>
                <td><router-link :to="{ path: '/growth-archive', query: { studentId: student.id } }">查看成长档案</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTeacherRosterDirectory } from '@/features/teacher-roster/index.js'

const {
  activeClassId,
  emptyStudentMessage,
  filteredStudents,
  keyword,
  loadError,
  loading,
  loadRoster,
  students,
  teacherClasses,
  totalStudentCount
} = useTeacherRosterDirectory()

onMounted(loadRoster)
</script>

<style scoped>
.plain-page { padding-top:64px; }
.page-heading { margin-bottom:20px; }
.page-heading p { color:var(--primary); font-weight:700; }
.page-heading h1 { font-size:1.8rem; margin:4px 0 6px; }
.page-heading span { color:var(--text-secondary); }
.api-notice { display:grid; gap:5px; margin-bottom:14px; padding:14px 16px; border:1px solid #bfdbfe; border-radius:8px; background:#eff6ff; color:#1e3a8a; font-size:.86rem; }
.class-panel { margin-bottom:14px; padding:14px; border:1px solid var(--border); border-radius:10px; background:white; }
.class-panel-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.class-panel-heading span { color:var(--text-secondary); font-size:.85rem; }
.class-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; }
.class-card { position:relative; display:grid; gap:5px; min-height:76px; padding:12px; border:1px solid var(--border); border-radius:8px; background:#f8fafc; color:var(--text); text-align:left; cursor:pointer; }
.class-card:hover, .class-card.active { border-color:var(--primary); background:#eff6ff; }
.class-card span { color:var(--text-secondary); font-size:.82rem; }
.class-card em { position:absolute; top:8px; right:8px; padding:2px 6px; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:.7rem; font-style:normal; }
.class-state { padding:14px 0; color:var(--text-secondary); text-align:center; }
.toolbar { display:flex; margin-bottom:14px; }
.toolbar input { width:100%; border:1.5px solid var(--border); border-radius:8px; padding:10px 12px; }
.table-panel { background:white; border:1px solid var(--border); border-radius:8px; overflow:auto; }
.table-state { padding:28px 16px; text-align:center; color:var(--text-secondary); }
.table-error { color:#b91c1c; background:#fef2f2; }
.unsupported-cell { color:#b45309; font-size:.82rem; }
.link-btn { margin-left:10px; border:0; background:transparent; color:var(--primary); cursor:pointer; }
</style>
