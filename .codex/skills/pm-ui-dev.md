# Skill: pm-ui-dev（清晰版）

目的：以“先澄清 → 出文档 → 你确认 → 再编码”的方式完成一个功能/需求。

适用：新增功能、改功能、做小范围重构（非紧急线上事故）。

---

## 全局硬规则（Approval Gate）

- **在用户明确回复“YES / 批准 / 开始写代码”之前：禁止修改任何代码或文件。**
  - 包括新增/修改/删除任何源文件、配置文件、脚本、测试文件等
  - 包括运行可能改动文件的命令（如 `lint --fix`、格式化、代码生成器）
- 允许做的事：阅读/分析/提问/写文档/输出计划/给出建议
- 如果用户要求“直接写代码”，也必须先输出最小方案与风险，并请求确认

---

## 产出目录约定

- 需求文档：`docs/PRD.md`（若仓库没有 `docs/` 则输出到根目录 `PRD.md`）
- UI 说明：`docs/UI_SPEC.md`（可选）
- 技术方案：`docs/TECH_SPEC.md`
- 测试计划：`docs/TEST_PLAN.md`
- 实施计划：`docs/IMPLEMENTATION_PLAN.md`
- 其他：如需 API 文档/架构图，使用 `.codex/templates/` 生成

---

## Phase 0 — Repo Scan（仓库扫描）

调用：`.codex/agents/techlead.md`（仅用于扫描/理解，不进入实现）

目标：
- 识别技术栈、目录结构、构建/测试命令、现有规范
- 标注与需求相关的模块/文件位置

输出（简短）：
- 项目结构摘要（3~8条）
- 可能影响的模块清单
- 推荐的验证方式（如何跑 tests/build）

---

## Phase 1 — PM Clarify（需求澄清）

调用：`.codex/agents/pm.md`

目标：
- 把需求从“想法”变成可验收的描述
- 明确范围、边界、验收标准、优先级、约束

输出：
- 仅进行需求澄清与总结（不写实现）
- 最终生成 **需求摘要**（1页以内）

进入下一阶段条件：
- 用户已回答 PM 阶段问题
- 需求摘要已确认“方向正确”

---

## Phase 2 — UI/UX Clarify（界面与交互澄清，可选）

触发条件（满足任一则进入）：
- 需求涉及新增/修改界面、交互、表单、可视化
- 需求涉及流程/状态（loading/empty/error/success）或多页面导航

调用：`.codex/agents/ui.md`

输出：
- 页面/入口清单
- 关键交互流程（含状态）
- 关键字段校验/提示文案建议（如适用）

跳过条件：
- 纯后端/纯逻辑/纯脚本任务，经用户确认可跳过

---

## Phase 3 — Technical Design（技术方案设计）

调用：`.codex/agents/techlead.md`

目标：
- 定义模块改动点、数据结构、接口契约、迁移策略、风险

输出：
- 技术方案摘要
- 关键数据结构/接口草案
- 风险点与替代方案
- 验证路径（如何证明做对了）

---

## Phase 4 — Documents（文档生成）

使用模板：`.codex/templates/*`

必须生成：
- PRD（产品需求）
- TECH_SPEC（技术设计）
- TEST_PLAN（测试计划）
- IMPLEMENTATION_PLAN（实施计划）

按需生成：
- UI_SPEC（有 UI 时）
- API_DOC（有接口时）
- ARCHITECTURE（有明显模块/数据流变更时）

---

## Phase 5 — Approval（确认闸门）

必须询问用户并等待明确回复：

> 是否批准开始写代码？（YES/NO）

- NO：只能修改文档与计划，不得进入实现
- YES：进入 Phase 6

---

## Phase 6 — Implementation（编码实现）

调用：`.codex/agents/dev.md`

要求：
- 按实施计划分步骤实现（小步可验证）
- 每一步后运行最小验证（build/test/lint 中至少一项，按仓库约定）
- 若实现过程中发现需求不明确：暂停实现，回到 Phase 1/2 补充澄清

---

## Phase 7 — Testing & Review（测试与审查）

调用：`.codex/agents/reviewer.md`

要求：
- 补齐/更新单元测试或集成测试（按仓库能力）
- 运行测试并汇报结果
- 输出自查清单（安全/性能/回归点/已知限制）
- 如需要：生成 commit message / PR 描述（参考 `.codex/scripts/`）

---

## Phase 8 — Wrap-up（交付总结）

输出：
- 变更摘要（做了什么）
- 如何验证（命令与步骤）
- 可能的后续优化（可选）
- 更新文档索引（如 README 指向 docs）