<template>
  <article class="task-card" :class="{ completed: task.completed }">
    <header class="task-card__header">
      <div>
        <h3>{{ task.title }}</h3>
        <small>{{ formattedTime }}</small>
      </div>
      <span class="task-card__status" v-if="task.completed">已完成</span>
    </header>
    <p class="task-card__description">
      {{ task.description || "暂无描述" }}
    </p>
    <button class="task-card__action" type="button" @click="$emit('select', task)">
      查看详情
    </button>
  </article>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { TaskRecord } from "shared/types";

export default defineComponent({
  name: "TaskCard",
  props: {
    task: {
      type: Object as () => TaskRecord,
      required: true
    }
  },
  setup(props) {
    const formattedTime = computed(() =>
      new Date(props.task.remindAt).toLocaleString()
    );

    return { formattedTime };
  }
});
</script>

<style scoped>
.task-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card.completed {
  border-color: rgba(46, 204, 113, 0.6);
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-card__header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.task-card__description {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.task-card__action {
  align-self: flex-end;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #f5f5f5;
  border-radius: 999px;
  padding: 0.35rem 1rem;
  cursor: pointer;
}
</style>
