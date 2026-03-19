<template>
  <div>
    <h2>群 / 会话绑定</h2>
    <p class="tip">将企业微信的 chatid（群或单聊）与扣子 Bot 绑定；未绑定时使用 .env 中的默认 COZE_BOT_ID。</p>
    <el-button type="primary" @click="showAdd">新增绑定</el-button>
    <el-table :data="list" style="margin-top: 16px">
      <el-table-column prop="wecomChatId" label="企微 ChatId" width="200" />
      <el-table-column prop="chatType" label="类型" width="80" />
      <el-table-column prop="botId" label="Bot ID" />
      <el-table-column prop="enabled" label="启用" width="80">
        <template #default="{ row }">{{ row.enabled ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button type="primary" link @click="showEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑绑定' : '新增绑定'" width="400px" @close="resetForm">
      <el-form :model="form" label-width="100px">
        <el-form-item label="企微 ChatId" required>
          <el-input v-model="form.wecomChatId" placeholder="群聊 chatid 或单聊标识" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.chatType" placeholder="group / single">
            <el-option label="群聊" value="group" />
            <el-option label="单聊" value="single" />
          </el-select>
        </el-form-item>
        <el-form-item label="Bot ID" required>
          <el-input v-model="form.botId" placeholder="扣子 Bot ID" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
        <el-form-item v-if="editId" label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { api } from '@/api';
import { ElMessage } from 'element-plus';

interface Row {
  id: number;
  wecomChatId: string;
  chatType: string;
  botId: string;
  enabled: boolean;
  remark?: string;
}

const list = ref<Row[]>([]);
const dialogVisible = ref(false);
const editId = ref<number | null>(null);
const saving = ref(false);

const form = reactive({
  wecomChatId: '',
  chatType: 'group',
  botId: '',
  remark: '',
  enabled: true,
});

async function load() {
  const { data } = await api.get<Row[]>('/group-binding');
  list.value = data;
}

async function showAdd() {
  editId.value = null;
  resetForm();
  try {
    const { data } = await api.get<{ botId: string }>('/config/bot');
    if (data?.botId) form.botId = data.botId;
  } catch {
    /* ignore */
  }
  dialogVisible.value = true;
}

function showEdit(row: Row) {
  editId.value = row.id;
  form.wecomChatId = row.wecomChatId;
  form.chatType = row.chatType;
  form.botId = row.botId;
  form.remark = row.remark ?? '';
  form.enabled = row.enabled;
  dialogVisible.value = true;
}

function resetForm() {
  form.wecomChatId = '';
  form.chatType = 'group';
  form.botId = '';
  form.remark = '';
  form.enabled = true;
}

async function submit() {
  if (!form.wecomChatId || !form.botId) {
    ElMessage.warning('请填写企微 ChatId 和 Bot ID');
    return;
  }
  saving.value = true;
  try {
    if (editId.value != null) {
      await api.put(`/group-binding/${editId.value}`, {
        botId: form.botId,
        enabled: form.enabled,
        remark: form.remark || undefined,
      });
      ElMessage.success('已更新');
    } else {
      await api.post('/group-binding', {
        wecomChatId: form.wecomChatId,
        chatType: form.chatType,
        botId: form.botId,
        remark: form.remark || undefined,
      });
      ElMessage.success('已添加');
    }
    dialogVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('确定删除该绑定？')) return;
  await api.delete(`/group-binding/${id}`);
  ElMessage.success('已删除');
  load();
}

onMounted(load);
</script>

<style scoped>
.tip {
  color: #666;
  font-size: 13px;
  margin: 8px 0 16px;
}
</style>
