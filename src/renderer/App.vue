<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <h1>代表事项桌面工具</h1>
        <p>卡片式网格展示所有提醒；通知到点会引导你回到详情。</p>
      </div>
      <button type="button" class="new-task-btn" @click="prepareCreation">
        + 新建任务
      </button>
    </header>

    <section class="floating-card">
      <form class="task-form" @submit.prevent="handleCreate">
        <input
          placeholder="任务标题"
          v-model="form.title"
          required
          maxlength="60"
        />
        <textarea
          rows="2"
          placeholder="任务备注（可选）"
          v-model="form.description"
        ></textarea>
        <input
          type="datetime-local"
          v-model="form.remindAt"
          required
          :min="minTime"
        />
        <button :disabled="submitting" type="submit">
          {{ submitting ? "保存中..." : "保存任务并开始提醒" }}
        </button>
      </form>
    </section>

    <div class="content-area">
      <div class="grid" v-if="tasks.length">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @select="selectTask"
        />
      </div>
      <div v-else class="placeholder">
        暂无任务，点击上方按钮快速创建提醒。
      </div>

      <TaskDetailPanel
        :task="selectedTask"
        @complete="markComplete"
        @snooze="snoozeTask"
        @delete="removeTask"
      />
    </div>

    <div v-if="reminderToast" class="reminder-toast">
      <strong>提醒触发：{{ reminderToast.title }}</strong>
      <p>点击通知以查看详情或在下方处理</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import TaskCard from "./components/TaskCard.vue";
import TaskDetailPanel from "./components/TaskDetailPanel.vue";
import { getAllTasks, saveTask, deleteTask } from "./services/taskStorage";
import { TaskRecord } from "shared/types";

export default defineComponent({
  name: "App",
  components: {
    TaskCard,
    TaskDetailPanel
  },
  setup() {
    const tasks = ref<TaskRecord[]>([]);
    const selectedTask = ref<TaskRecord | null>(null);
    const reminderToast = ref<TaskRecord | null>(null);
    const submitting = ref(false);
    const form = reactive({
      title: "",
      description: "",
      remindAt: ""
    });

    const minTime = computed(() =>
      new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)
    );

    const loadTasks = async () => {
      tasks.value = await getAllTasks();
      if (selectedTask.value) {
        const match = tasks.value.find((task) => task.id === selectedTask.value?.id);
        selectedTask.value = match ?? null;
      }
      syncWithMain();
    };

    const syncWithMain = () => {
      window.electronAPI?.syncTasks(tasks.value);
    };

    const handleCreate = async () => {
      if (!form.title || !form.remindAt) {
        return;
      }

      submitting.value = true;
      const remindAt = new Date(form.remindAt).getTime();
      await saveTask({
        title: form.title.trim(),
        description: form.description.trim(),
        remindAt,
        completed: false
      });
      submitting.value = false;
      resetForm();
      await loadTasks();
    };

    const resetForm = () => {
      form.title = "";
      form.description = "";
      form.remindAt = "";
    };

    const prepareCreation = () => {
      selectedTask.value = null;
      resetForm();
    };

    const selectTask = (task: TaskRecord) => {
      selectedTask.value = task;
    };

    const markComplete = async (task: TaskRecord) => {
      await saveTask({ ...task, completed: true });
      window.electronAPI?.notifyComplete(task.id);
      await loadTasks();
    };

    const snoozeTask = async (task: TaskRecord) => {
      const nextRemind = Date.now() + 5 * 60 * 1000;
      await saveTask({ ...task, remindAt: nextRemind });
      window.electronAPI?.notifySnooze(task.id, 5);
      await loadTasks();
    };

    const removeTask = async (task: TaskRecord) => {
      await deleteTask(task.id);
      await loadTasks();
    };

    const handleTrayAction = (action: "create" | string) => {
      if (action === "create") {
        prepareCreation();
      }
    };

    const handleReminder = (task: TaskRecord) => {
      reminderToast.value = task;
      setTimeout(() => {
        reminderToast.value = null;
      }, 4500);
      selectTask(task);
    };

    const handleNotificationClick = (taskId: string) => {
      const match = tasks.value.find((task) => task.id === taskId);
      if (match) {
        selectTask(match);
      }
    };

    onMounted(async () => {
      await loadTasks();
      window.electronAPI?.onReminder(handleReminder);
      window.electronAPI?.onNotificationClick(handleNotificationClick);
      window.electronAPI?.onTrayAction(handleTrayAction);
    });

    return {
      tasks,
      form,
      submitting,
      selectedTask,
      reminderToast,
      handleCreate,
      selectTask,
      markComplete,
      snoozeTask,
      removeTask,
      prepareCreation,
      minTime
    };
  }
});
</script>

<style scoped>
.new-task-btn {
  border: none;
  border-radius: 999px;
  background: #2f8df4;
  color: #fff;
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
}

.content-area {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.content-area .grid {
  flex: 1;
}

.placeholder {
  flex: 1;
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
}
</style>
