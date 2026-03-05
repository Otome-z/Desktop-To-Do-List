# Codex Agent 入口配置

本仓库的 AI 工作流配置存放在 `.codex` 目录。

在执行任何任务前，AI Agent 必须加载并遵守：

- .codex/rules.md
- .codex/SKILLS.md
- .codex/agents/*

文档模板位于：

- .codex/templates/

自动化脚本位于：

- .codex/scripts/

工作指南位于：

- .codex/guides/

默认工作流程：

需求 → PM 澄清 → UI 设计 → 技术方案 → 用户确认 → 开发实现 → 测试 → 代码审查 → 文档更新