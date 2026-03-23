<template>
  <div class="chat-standalone">
    <header class="top-bar">
      <h1 class="title">在线咨询</h1>
    </header>

    <div class="chat-main">
      <p class="tip">与智能助手对话；历史记录按本浏览器访客保存在服务端，打开页面会加载近期记录。</p>
      <div ref="scrollRef" class="messages">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="msg"
          :class="m.role === 'user' ? 'user' : 'assistant'"
        >
          <span class="role">{{ m.role === 'user' ? '我' : '助手' }}</span>
          <div class="bubble bubble-rich" v-html="formatChatBubbleHtml(m.content)"></div>
        </div>
        <div v-if="loading" class="msg assistant">
          <span class="role">助手</span>
          <div class="bubble muted">思考中…</div>
        </div>
        <div ref="bottomAnchor" class="scroll-anchor" aria-hidden="true" />
      </div>
    </div>

    <footer class="input-dock">
      <div class="input-row">
        <el-input
          v-model="input"
          type="textarea"
          :rows="2"
          placeholder="输入消息，Enter 发送（Shift+Enter 换行）"
          @keydown.enter.exact.prevent="send"
        />
        <el-button type="primary" :loading="loading" @click="send">发送</el-button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { isAxiosError } from 'axios';
import { api } from '@/api';
import { ElMessage } from 'element-plus';
import { formatChatBubbleHtml } from '@/utils/chatBubbleHtml';

/** Coze poll can exceed default 15s axios timeout */
const CHAT_TIMEOUT_MS = 180000;

function formatSendError(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as { message?: string | string[]; error?: string } | undefined;
    if (d?.message !== undefined) {
      return Array.isArray(d.message) ? d.message.join(', ') : String(d.message);
    }
    if (d?.error) return String(d.error);
    if (e.code === 'ECONNABORTED' || e.message?.toLowerCase().includes('timeout')) {
      return '请求超时：智能回复较慢，请稍后再试或联系管理员调大超时时间';
    }
    if (e.message) return e.message;
  }
  if (e instanceof Error && e.message) return e.message;
  return '发送失败';
}

interface Msg {
  role: string;
  content: string;
  createdAt?: string;
}

const messages = ref<Msg[]>([]);
const input = ref('');
const loading = ref(false);
const scrollRef = ref<HTMLElement | null>(null);
const bottomAnchor = ref<HTMLElement | null>(null);

function scrollToBottomNow() {
  const wrap = scrollRef.value;
  if (wrap) {
    wrap.scrollTop = wrap.scrollHeight;
  }
  bottomAnchor.value?.scrollIntoView({ block: 'end', behavior: 'instant' });
}

/** After DOM / v-html / images; retry so long history + images still end at bottom */
function scrollToBottomAggressive() {
  const run = () => {
    scrollToBottomNow();
  };
  void nextTick().then(run);
  requestAnimationFrame(run);
  setTimeout(run, 0);
  setTimeout(run, 50);
  setTimeout(run, 150);
  setTimeout(run, 400);
  setTimeout(run, 900);
}

async function loadHistory() {
  try {
    const { data } = await api.get<Msg[]>('/chat/history', { params: { limit: 100 } });
    messages.value = Array.isArray(data) ? data : [];
  } catch {
    messages.value = [];
  } finally {
    scrollToBottomAggressive();
  }
}

async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;
  loading.value = true;
  messages.value.push({ role: 'user', content: text });
  input.value = '';
  scrollToBottomAggressive();
  try {
    const { data } = await api.post<{ reply: string }>(
      '/chat/message',
      { content: text },
      { timeout: CHAT_TIMEOUT_MS },
    );
    messages.value.push({ role: 'assistant', content: data.reply });
  } catch (e: unknown) {
    ElMessage.error(formatSendError(e));
    messages.value.pop();
  } finally {
    loading.value = false;
    scrollToBottomAggressive();
  }
}

watch(messages, () => scrollToBottomAggressive(), { deep: true });

onMounted(() => {
  scrollToBottomAggressive();
  void loadHistory();
});
</script>

<style scoped>
.chat-standalone {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f7fa 0%, #fff 32%);
}
.top-bar {
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
}
.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
}
.chat-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 12px 20px 8px;
  box-sizing: border-box;
}
.tip {
  flex-shrink: 0;
  color: #666;
  font-size: 13px;
  margin: 0 0 10px;
}
.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}
.input-dock {
  flex-shrink: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -4px 16px rgb(0 0 0 / 8%);
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}
.input-dock .input-row {
  max-width: 720px;
  margin: 0 auto;
}
.msg {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.msg.user {
  align-items: flex-end;
}
.role {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg.user .bubble {
  background: #409eff;
  color: #fff;
}
.msg.assistant .bubble {
  background: #fff;
  border: 1px solid #e4e7ed;
}
.bubble-rich :deep(.chat-img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin-top: 8px;
  border-radius: 8px;
  vertical-align: middle;
}
.bubble-rich :deep(br + .chat-img) {
  margin-top: 0;
}
.bubble.muted {
  color: #909399;
  font-style: italic;
}
.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  width: 100%;
}
.input-row .el-input {
  flex: 1;
}
.scroll-anchor {
  width: 100%;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
