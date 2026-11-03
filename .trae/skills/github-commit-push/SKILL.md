---
name: github-commit-push
description: 将当前项目的全部改动提交并推送到 GitHub 仓库 Lbwyyds，涵盖仓库初始化、暂存、提交、SSH 推送与结果校验。当用户说提交到github、commit 并 push、把项目同步到远程仓库时使用。不用于拉取、合并、切换分支或解决冲突。
---

# GitHub 提交与推送

把工作目录 `D:\网页设计` 的全部改动提交并推送到 `github.com/xiaoanyyds78/Lbwyyds`。优先使用本机已配置的 SSH 公钥（`git@github.com:xiaoanyyds78/Lbwyyds.git`），仅在 SSH 不可用时回退 HTTPS。

## 执行流程

1. 定位 git。本机 git 可能不在 PATH，按顺序查找：`Get-Command git` → `C:\Program Files\Git\cmd\git.exe` → `C:\Program Files (x86)\Git\cmd\git.exe` → `%LOCALAPPDATA%\Programs\Git\cmd\git.exe`。全部不存在时先安装 `winget install --id Git.Git -e`，安装后仍用绝对路径调用。
2. 检查仓库状态：`git -C "D:\网页设计" rev-parse --is-inside-work-tree`、`git remote -v`、`git branch --show-current`、`git status --short`。
3. 仓库不存在时执行 `git init -b main`，并设置远程为 `ssh://git@ssh.github.com:443/xiaoanyyds78/Lbwyyds.git`。
4. 本机 22 端口被拒（`connect to host github.com port 22: Connection refused`），必须走 443 通道，且远程地址要带上端口（`ssh://git@ssh.github.com:443/...`）；同时指定私钥：

```powershell
$env:GIT_SSH_COMMAND="ssh -i `"$env:USERPROFILE\.ssh\id_ed25519`" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
```

认证成功时 ssh 会返回 `Hi xiaoanyyds78! You've successfully authenticated`（退出码 1 属正常）。若返回 `Permission denied (publickey)`，说明私钥没挂到 `xiaoanyyds78` 账号，直接向用户索取或改用 PAT，不要反复重试。
5. 确认 `.gitignore` 至少忽略 `node_modules/`、`*.log`、`.DS_Store`、`.env`。不要创建 `.gitignore` 之外的新文件。
6. 暂存：`git add -A`。若包含疑似密钥（`.env`、`*.pem`、`id_rsa`、含 token 的配置）先停下并告知用户，不要提交。
7. 提交：`git commit -m "<中文摘要>"`。摘要说明本次改动的目的，例如 `更新课堂练习页面与图标资源`；无改动时跳过提交并说明。
8. 推送：`git push -u origin main`；远程已有内容且被拒绝时先 `git pull --rebase origin main` 再推送，禁止 `push --force`。
9. 校验：`git log -1 --oneline`、`git status -sb`，确认工作区干净且分支与 origin 同步，再向用户报告提交哈希。

## 约束

- 不修改 `user.name` / `user.email`；缺失时提示用户自行配置，不要写入全局配置。
- 不跳过钩子，不使用 `--no-verify`，不强制推送。
- 推送属于外发操作：只在用户明确要求提交推送时执行。
- 认证失败时不要反复重试，直接把错误原文和缺失的公钥/凭据告知用户。

## 脚本

命令细节固定在 [scripts/commit-push.ps1](scripts/commit-push.ps1)，可直接执行以完成 1–9 步：

```powershell
powershell -ExecutionPolicy Bypass -File "D:\网页设计\.trae\skills\github-commit-push\scripts\commit-push.ps1" -Message "更新课堂练习页面与图标资源"
```
