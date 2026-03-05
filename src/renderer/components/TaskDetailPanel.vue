<template>
  <section class="detail-panel">
    <template v-if="task">
      <header>
        <h2>{{ task.title }}</h2>
        <small>{{ formattedTime }}</small>
      </header>
      <p>{{ task.description || "暂无备注" }}</p>
      <div class="detail-panel__actions">
        <button class="complete" type="button" @click="$emit('complete', task)">
          标记完成
        </button>
        <button class="snooze" type="button" @click="$emit('snooze', task)">
          稍后提醒
        </button>
        <button class="delete" type="button" @click="$emit('delete', task)">
          删除
        </button>
      </div>
    </template>
    <p v-else class="placeholder">点击任意卡片可查看详情与操作</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { TaskRecord } from "shared/types";

export default defineComponent({
  name: "TaskDetailPanel",
  props: {
    task: {
      type: Object as () => TaskRecord | null,
      default: null
    }
  },
  setup(props) {
    const formattedTime = computed(() =>
      props.task ? new Date(props.task.remindAt).toLocaleString() : ""
    );

    return { formattedTime };
  }
});
</script>

<style scoped>
.detail-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  min-height: 220px;
}

.detail-panel header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.detail-panel button {
  border: none;
  border-radius: 10px;
  padding: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.detail-panel button.complete {
  background: #2fb57b;
  color: #fff;
}

.detail-panel button.snooze {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
}

.detail-panel button.delete {
  background: transparent;
  border: 1px solid #d64545;
  color: #ff6b6b;
}

.placeholder {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
}
</style>
