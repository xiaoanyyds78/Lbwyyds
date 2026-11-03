<#
  将 D:\网页设计 的全部改动提交并推送到 GitHub 仓库 Lbwyyds。
  用法：
    powershell -ExecutionPolicy Bypass -File commit-push.ps1 -Message "更新课堂练习页面与图标资源"
#>
param(
    [string]$RepoPath = "D:\网页设计",
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# 1. 定位 git（本机常不在 PATH）
$git = (Get-Command git -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source)
if (-not $git) {
    foreach ($c in @(
            "C:\Program Files\Git\cmd\git.exe",
            "C:\Program Files (x86)\Git\cmd\git.exe",
            "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe")) {
        if (Test-Path $c) { $git = $c; break }
    }
}
if (-not $git) { throw "未找到 git，请先安装：winget install --id Git.Git -e" }

$sshRemote = "ssh://git@ssh.github.com:443/xiaoanyyds78/Lbwyyds.git"
$httpsRemote = "https://github.com/xiaoanyyds78/Lbwyyds.git"
$branch = "main"

function Invoke-Git {
    param([string[]]$GitArgs)
    & $git -C $RepoPath @GitArgs
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') 失败（退出码 $LASTEXITCODE）" }
}

# 2. 仓库与远程
$isRepo = (& $git -C $RepoPath rev-parse --is-inside-work-tree 2>$null)
if ($LASTEXITCODE -ne 0 -or $isRepo -ne "true") {
    Invoke-Git @("init", "-b", $branch)
}

$origin = (& $git -C $RepoPath remote get-url origin 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $origin) {
    Invoke-Git @("remote", "add", "origin", $sshRemote)
} else {
    # 4. 统一成 SSH
    if ($origin -notmatch "git@github\.com") {
        Invoke-Git @("remote", "set-url", "origin", $sshRemote)
    }
}

# 5. .gitignore 最小保障
$ignoreFile = Join-Path $RepoPath ".gitignore"
if (-not (Test-Path $ignoreFile)) {
    Set-Content -Path $ignoreFile -Encoding UTF8 -Value @("node_modules/", "*.log", ".DS_Store", ".env")
}

# 6/7. 暂存与提交
Invoke-Git @("add", "-A")
$staged = (& $git -C $RepoPath diff --cached --name-only)
if (-not $staged) {
    Write-Host "没有需要提交的改动。"
} else {
    if (-not $Message) {
        $Message = "更新项目文件 $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    Invoke-Git @("commit", "-m", $Message)
}

# 8. 推送（22 端口不通，走 443；失败再回退 HTTPS，且不强制推送）
$env:GIT_SSH_COMMAND = "ssh -i `"$env:USERPROFILE\.ssh\id_ed25519`" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20"
$env:GIT_TERMINAL_PROMPT = "0"

$currentBranch = (& $git -C $RepoPath branch --show-current)
if (-not $currentBranch) { Invoke-Git @("checkout", "-b", $branch) }

& $git -C $RepoPath push -u origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "SSH 推送失败，尝试 HTTPS 远程地址…"
    Invoke-Git @("remote", "set-url", "origin", $httpsRemote)
    & $git -C $RepoPath pull --rebase origin $currentBranch
    if ($LASTEXITCODE -ne 0) { throw "拉取失败，请先解决冲突后再推送。" }
    & $git -C $RepoPath push -u origin $currentBranch
    if ($LASTEXITCODE -ne 0) { throw "推送失败，请检查 SSH 公钥或 HTTPS 凭据。" }
}

# 9. 校验
& $git -C $RepoPath log -1 --oneline
& $git -C $RepoPath status -sb
