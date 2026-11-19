---
name: github-push
description: Commit and push this project to GitHub over SSH. Use when the user asks to commit, push, sync, or upload changes to the baiyuhan repo. Do not use for creating pull requests or for code edits.
---

# GitHub Push

把本项目改动提交并推送到 `git@github.com:123byh-yee/baiyuhan.git`（`master` 分支，使用本机已配置的 ed25519 公钥）。

## 前置检查

1. 在项目根目录 `d:\高级网页设计\白雨涵全栈开发` 执行 `git status --short`，确认改动范围。
2. 确认 `.env`、`node_modules/`、`.trae-html-share-packages/` 未被跟踪；若出现，先补进 `.gitignore` 再继续。
3. 首次使用或推送报认证失败时，先验证公钥：

```powershell
ssh -T git@github.com -o BatchMode=yes
# 期望输出 Hi 123byh-yee! You've successfully authenticated
```

## 提交与推送

```powershell
cd "d:\高级网页设计\白雨涵全栈开发"

# 1. 首次使用需先配置远程（已配置则跳过）
git remote get-url origin 2>$null
# 若无输出则执行：
# git remote add origin git@github.com:123byh-yee/baiyuhan.git

# 2. 暂存（按文件名逐个添加，避免误提交敏感文件与产物）
git add Bai_start.bat frontend backend readme.md AGENTS.md Bai_prompt.md .gitignore .trae/skills

# 3. 提交（中文提交信息，概括本次改动）
git commit -m "简述本次改动"

# 4. 推送
git push -u origin master
```

## 收尾验证

```powershell
git status --short      # 应为空
git log --oneline -3    # 确认最新提交
git ls-remote --heads origin master   # 远端提交号应与本地一致
```

## 注意

- 推送前必须确认 `.env` 不在暂存区（含数据库凭据）。
- 远程若已有其他提交导致 `non-fast-forward`，先 `git pull --rebase origin master` 再推送。
- 推送属于远端写操作，仅响应用户明确要求时执行。
- 提交后按 AGENTS.md 规则维护 `Bai_prompt.md`、`Bai_interface.md`、`Bai_database.md` 的追加记录。
