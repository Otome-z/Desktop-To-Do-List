# 技术方案文档
## 架构
- 整体采用 Vite + Vue3 + TypeScript 构建渲染进程，Electron 主进程负责托盘、自动启动、提醒调度和通知交互。
- 主进程启动时完成自动启动注册与托盘创建，维持任务提醒调度器（Timer pool + IndexedDB 心跳）。
- 渲染进程通过 Vue3 卡片网格展示任务，侧边面板提供详情与操作；使用 Electron 的 IPC（ipcRenderer/ipcMain）与主进程通信。
- IndexedDB 在渲染进程中负责持久化任务列表，主进程可通过 preload 暴露 API 读取任务并同步提醒状态。

## 数据结构
- TaskRecord {
  id: string (UUID)，
  title: string，
  description?: string，
  remindAt: number (timestamp)，
  completed: boolean
}
- 所有任务保存在 IndexedDB 中的 tasks store，主进程通过预加载脚本定期读取以维护调度器。
- 为保持一致性，当任务状态变更时，渲染进程将变更通过 IPC 通知主进程重新计算下一个提醒。

## API 设计
- ipcMain.handle('tasks/get')：渲染进程请求所有任务（初始化 + 列表刷新）。
- ipcMain.handle('tasks/save')：提交新增或更新任务；主进程更新调度器并返回最新列表。
- ipcMain.handle('tasks/delete')：删除任务并更新提醒调度器。
- ipcMain.on('reminder/snooze')：通知主进程延迟提醒（例如 +5 分钟）。
- ipcMain.on('reminder/complete')：标记任务为完成并同步到 IndexedDB。
- ipcMain.on('notification/click')：系统通知点击在主进程捕获后通过 IPC 让渲染进程聚焦并展开对应任务。
- ipcMain.on('tray/action')：托盘项触发的行为（打开、创建、退出）由主进程处理，必要时通过 BrowserWindow 操作聚焦窗口。
