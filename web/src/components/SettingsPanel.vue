<template>
  <teleport to="body">
    <transition name="settings-mask-fade">
      <div
        v-if="visible"
        class="settings-mask"
        @click="close"
      />
    </transition>

    <transition name="settings-slide">
      <aside
        v-if="visible"
        class="settings-drawer"
      >
        <header class="settings-header">
          <div>
            <h2 class="settings-title">设置</h2>
            <p class="settings-subtitle">管理应用、下载、连接和界面偏好</p>
          </div>

          <button class="settings-close" @click="close">
            ×
          </button>
        </header>

        <nav class="settings-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="settings-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span class="settings-tab-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <main class="settings-body">
          <!-- 常规设置 -->
          <section v-if="activeTab === 'general'" class="settings-section">
            <h3 class="section-title">常规设置</h3>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">开机自动启动</div>
                <div class="setting-desc">系统启动后自动打开下载管理器</div>
              </div>
              <label class="switch">
                <input v-model="settings.autoStart" type="checkbox">
                <span />
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">关闭窗口时最小化到托盘</div>
                <div class="setting-desc">点击关闭按钮后程序继续在后台运行</div>
              </div>
              <label class="switch">
                <input v-model="settings.minimizeToTray" type="checkbox">
                <span />
              </label>
            </div>

            <div class="setting-item vertical">
              <div class="setting-info">
                <div class="setting-label">默认保存路径</div>
                <div class="setting-desc">新建下载任务时默认保存的位置</div>
              </div>

              <div class="path-row">
                <input
                  v-model="settings.downloadPath"
                  class="setting-input"
                  type="text"
                  placeholder="请选择下载路径"
                >
                <button class="secondary-button">选择</button>
              </div>
            </div>
          </section>

          <!-- 下载设置 -->
          <section v-if="activeTab === 'download'" class="settings-section">
            <h3 class="section-title">下载设置</h3>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">最大同时下载任务数</div>
                <div class="setting-desc">限制同时处于下载状态的任务数量</div>
              </div>
              <input
                v-model.number="settings.maxActiveDownloads"
                class="number-input"
                type="number"
                min="1"
                max="20"
              >
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">下载速度限制</div>
                <div class="setting-desc">设置为 0 表示不限速，单位 KB/s</div>
              </div>
              <input
                v-model.number="settings.downloadLimit"
                class="number-input"
                type="number"
                min="0"
              >
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">上传速度限制</div>
                <div class="setting-desc">设置为 0 表示不限速，单位 KB/s</div>
              </div>
              <input
                v-model.number="settings.uploadLimit"
                class="number-input"
                type="number"
                min="0"
              >
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">任务完成后继续做种</div>
                <div class="setting-desc">BT 任务下载完成后继续上传分享</div>
              </div>
              <label class="switch">
                <input v-model="settings.keepSeeding" type="checkbox">
                <span />
              </label>
            </div>
          </section>

          <!-- 连接设置 -->
          <section v-if="activeTab === 'connection'" class="settings-section">
            <h3 class="section-title">连接设置</h3>

            <div class="setting-item vertical">
              <div class="setting-info">
                <div class="setting-label">后端服务地址</div>
                <div class="setting-desc">用于连接下载服务的 API 地址</div>
              </div>
              <input
                v-model="settings.serverUrl"
                class="setting-input"
                type="text"
                placeholder="http://127.0.0.1:8080"
              >
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">连接超时时间</div>
                <div class="setting-desc">请求后端接口的最大等待时间，单位秒</div>
              </div>
              <input
                v-model.number="settings.timeout"
                class="number-input"
                type="number"
                min="1"
                max="120"
              >
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">自动重连</div>
                <div class="setting-desc">连接断开后自动尝试重新连接</div>
              </div>
              <label class="switch">
                <input v-model="settings.autoReconnect" type="checkbox">
                <span />
              </label>
            </div>
          </section>

          <!-- 外观设置 -->
          <section v-if="activeTab === 'appearance'" class="settings-section">
            <h3 class="section-title">外观设置</h3>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">主题模式</div>
                <div class="setting-desc">选择应用显示主题</div>
              </div>

              <select v-model="settings.theme" class="setting-select">
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
                <option value="system">跟随系统</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">语言</div>
                <div class="setting-desc">选择界面显示语言</div>
              </div>

              <select v-model="settings.language" class="setting-select">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">紧凑模式</div>
                <div class="setting-desc">减少列表间距，显示更多任务</div>
              </div>
              <label class="switch">
                <input v-model="settings.compactMode" type="checkbox">
                <span />
              </label>
            </div>
          </section>

          <!-- 关于 -->
          <section v-if="activeTab === 'about'" class="settings-section">
            <h3 class="section-title">关于应用</h3>

            <div class="about-card">
              <div class="about-logo">D</div>
              <div>
                <div class="about-title">Download Manager</div>
                <div class="about-desc">一个简洁的下载任务管理工具</div>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span>当前版本</span>
                <strong>1.0.0</strong>
              </div>
              <div class="info-row">
                <span>构建类型</span>
                <strong>Desktop/Web</strong>
              </div>
              <div class="info-row">
                <span>状态</span>
                <strong class="success">运行正常</strong>
              </div>
            </div>
          </section>
        </main>

        <footer class="settings-footer">
          <button class="secondary-button" @click="resetSettings">
            恢复默认
          </button>
          <button class="primary-button" @click="saveSettings">
            保存设置
          </button>
        </footer>
      </aside>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const activeTab = ref('general')

const tabs = [
  {
    key: 'general',
    label: '常规',
    icon: '⚙️',
  },
  {
    key: 'download',
    label: '下载',
    icon: '⬇️',
  },
  {
    key: 'connection',
    label: '连接',
    icon: '🔌',
  },
  {
    key: 'appearance',
    label: '外观',
    icon: '🎨',
  },
  {
    key: 'about',
    label: '关于',
    icon: 'ℹ️',
  },
]

const defaultSettings = {
  autoStart: false,
  minimizeToTray: true,
  downloadPath: '',
  maxActiveDownloads: 5,
  downloadLimit: 0,
  uploadLimit: 0,
  keepSeeding: true,
  serverUrl: 'http://127.0.0.1:8080',
  timeout: 10,
  autoReconnect: true,
  theme: 'light',
  language: 'zh-CN',
  compactMode: false,
}

const settings = reactive({ ...defaultSettings })

watch(
  () => props.visible,
  value => {
    if (value) {
      loadSettings()
    }
  },
)

const close = () => {
  emit('update:visible', false)
}

const loadSettings = () => {
  const localValue = localStorage.getItem('app-settings')

  if (!localValue) return

  try {
    const parsed = JSON.parse(localValue)
    Object.assign(settings, defaultSettings, parsed)
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const saveSettings = () => {
  localStorage.setItem('app-settings', JSON.stringify(settings))
  close()
}

const resetSettings = () => {
  Object.assign(settings, defaultSettings)
}
</script>

<style scoped>
.settings-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(2px);
}

.settings-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2001;
  width: 560px;
  max-width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: -16px 0 40px rgba(15, 23, 42, 0.16);
}

.settings-header {
  flex-shrink: 0;
  min-height: 84px;
  padding: 20px 24px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.settings-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.settings-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
}

.settings-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: #f5f7fa;
  color: #606266;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.settings-close:hover {
  background: #ebeef5;
  color: #303133;
}

.settings-tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 0;
  border-bottom: 1px solid #ebeef5;
  overflow-x: auto;
  scrollbar-width: none;
}

.settings-tabs::-webkit-scrollbar {
  display: none;
}

.settings-tab {
  position: relative;
  flex-shrink: 0;
  height: 44px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.settings-tab::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 3px;
  border-radius: 999px;
  background: transparent;
}

.settings-tab.active {
  color: #409eff;
  font-weight: 600;
}

.settings-tab.active::after {
  background: #409eff;
}

.settings-tab-icon {
  font-size: 15px;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px 96px;
  box-sizing: border-box;
  background: #f8fafc;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 700;
  color: #303133;
}

.setting-item {
  min-height: 72px;
  padding: 16px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.setting-item.vertical {
  align-items: stretch;
  flex-direction: column;
}

.setting-info {
  min-width: 0;
}

.setting-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.setting-desc {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.5;
  color: #909399;
}

.path-row {
  display: flex;
  gap: 10px;
}

.setting-input,
.setting-select,
.number-input {
  height: 38px;
  border: 1px solid #dcdfe6;
  border-radius: 9px;
  padding: 0 12px;
  box-sizing: border-box;
  background: #ffffff;
  color: #303133;
  font-size: 14px;
  outline: none;
}

.setting-input:focus,
.setting-select:focus,
.number-input:focus {
  border-color: #409eff;
}

.setting-input {
  width: 100%;
}

.number-input {
  width: 120px;
}

.setting-select {
  width: 150px;
}

.switch {
  position: relative;
  width: 46px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  display: none;
}

.switch span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #dcdfe6;
  cursor: pointer;
  transition: all 0.2s;
}

.switch span::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: all 0.2s;
}

.switch input:checked + span {
  background: #409eff;
}

.switch input:checked + span::before {
  transform: translateX(20px);
}

.about-card {
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #409eff, #79bbff);
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 14px;
}

.about-logo {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
}

.about-title {
  font-size: 18px;
  font-weight: 700;
}

.about-desc {
  margin-top: 5px;
  font-size: 13px;
  opacity: 0.9;
}

.info-list {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  overflow: hidden;
}

.info-row {
  min-height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row strong {
  color: #303133;
}

.info-row .success {
  color: #67c23a;
}

.settings-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  padding: 14px 24px;
  box-sizing: border-box;
  border-top: 1px solid #ebeef5;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-button,
.secondary-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 9px;
  font-size: 14px;
  cursor: pointer;
}

.primary-button {
  border: none;
  color: #ffffff;
  background: #409eff;
}

.primary-button:hover {
  background: #66b1ff;
}

.secondary-button {
  border: 1px solid #dcdfe6;
  color: #606266;
  background: #ffffff;
}

.secondary-button:hover {
  color: #409eff;
  border-color: #409eff;
}

.settings-mask-fade-enter-active,
.settings-mask-fade-leave-active {
  transition: opacity 0.2s ease;
}

.settings-mask-fade-enter-from,
.settings-mask-fade-leave-to {
  opacity: 0;
}

.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: transform 0.25s ease;
}

.settings-slide-enter-from,
.settings-slide-leave-to {
  transform: translateX(100%);
}

/* 平板适配 */
@media (max-width: 768px) {
  .settings-drawer {
    width: 88vw;
  }

  .settings-header {
    padding: 18px 18px 14px;
  }

  .settings-body {
    padding: 18px 18px 96px;
  }

  .settings-footer {
    padding: 14px 18px;
  }
}

/* 手机适配 */
@media (max-width: 520px) {
  .settings-drawer {
    width: 100vw;
  }

  .settings-header {
    min-height: auto;
    padding: 16px;
  }

  .settings-title {
    font-size: 20px;
  }

  .settings-subtitle {
    font-size: 12px;
  }

  .settings-tabs {
    padding: 8px 10px 0;
    gap: 4px;
  }

  .settings-tab {
    height: 42px;
    padding: 0 10px;
    font-size: 13px;
  }

  .settings-body {
    padding: 16px 12px 92px;
  }

  .setting-item {
    padding: 14px;
    border-radius: 12px;
    align-items: stretch;
    flex-direction: column;
  }

  .setting-item:not(.vertical) {
    gap: 12px;
  }

  .setting-item .switch,
  .setting-item .setting-select,
  .setting-item .number-input {
    align-self: flex-start;
  }

  .path-row {
    flex-direction: column;
  }

  .number-input,
  .setting-select {
    width: 100%;
  }

  .settings-footer {
    height: auto;
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>