# 使用文档 — HALOFLUX 光环实验室（桌面版）

> 原作：[HALOFLUX by Ryder191](https://github.com/Ryder191/haloflux)（PolyForm Noncommercial 1.0.0）。本使用文档对应其非商业桌面修改版。**仅限非商业用途。**

## 1. 界面布局

### 1.1 自绘标题栏

- 无边框窗口顶部 36px 深色条：左侧为 `HALOFLUX · 光环实验室 · 论文实验室控制台` 品牌区（可按住拖动移动窗口），右侧为 `—`（最小化）/ `□`（最大化/还原）/ `✕`（关闭）三枚自绘按钮
- **双击标题栏空白区** = 最大化 / 还原切换
- 默认窗口 `1600×940`，最小 `1100×700`；重复启动会自动聚焦已开窗口（单实例锁）

### 1.2 双语 HUD 与舞台

- 页面顶部为「中文 + (英文原文)」双层文字导航与 KPI 指标；中央为全屏 Canvas 光环可视化（偏心弧环、编织光场、节拍驱动的多层光束爆发）；底部为 8 个实时数据面板（30Hz 节流刷新）

### 1.3 调参控制台

- 按 `C` 或点击界面右上角「控制台 (CONSOLE)」按钮打开
- 22 项参数分 5 组（全局 / 圆环 / 圈内 / 环外 / 界面），改动实时生效并写入 `paperlab.cfg.v2`
- 预设按钮：`MINE`（默认）/ `A` / `B`；`?preset=a|b` 可在启动时覆盖
- 「导出」按钮生成当前参数 JSON；「导入」可粘贴 JSON 恢复；「保存为默认 / 重置」见控制台底部按钮行

## 2. 快捷键总表

| 按键 | 功能 |
|---|---|
| `C` | 开 / 关调参控制台 |
| `F` / 双击页面 | 全屏切换（注意：在输入框内按键不会触发） |
| `L` | 帧率上限 60 ⇄ 不限 |
| `M` | 背景音乐开 / 关 |

## 3. 帧率锁定说明

- 默认**锁定 60 FPS**：采用相位累加截止门控，被跳过的帧时间并入下一次绘制，动画速度与帧率无关
- 切换档位：`L` 键在 60 ⇄ 不限间切换；控制台「帧率上限 (FPS CAP)」按钮组可选 `30 / 60 / 120 / ∞`；启动参数 `?fps=0|30|60|120` 可临时覆盖（不写入持久化）
- `?perf=1` 打开性能面板，显示 FPS 与帧时间 p50/p95/p99（正常锁 60 时 p50 ≈ 16.7ms）

## 4. 音频说明

- 音源为 `www/audio/sw421k.mp3`（源自原仓库），循环播放；`M` 键或 HUD 右上角按钮开关，音量滑条可调
- **首次点击 / 按键前音乐不会出声**——这是 Chromium 的自动播放策略，不是故障
- 开关与音量持久化在 `paperlab.bgm.v1`

## 5. 故障排查

### 5.1 音乐不响
先在窗口内任意点击一次（自动播放策略）；再确认 `M` 键未静音、系统音量正常。仍无声可删 `paperlab.bgm.v1` 后重启。

### 5.2 字体不对 / 离线无字体
页面标题字体为 JetBrains Mono（构建时未内嵌字体文件的版本会在线加载 Google Fonts）；离线时自动回退系统 Consolas / 等宽字体，属预期行为。

### 5.3 杀毒软件误报
便携版 exe 为未签名的 Electron 主程序（内嵌 Chromium），部分杀软会启发式报警。可加入白名单；请先用 Release 说明中公布的 **SHA256** 校验 zip 完整性。

### 5.4 Windows SmartScreen 拦截
「更多信息 → 仍要运行」；同一文件只需处理一次。

### 5.5 白屏 / 启动失败
- 确认解压完整：目录内应有 `locales/`、`resources/`、`*.dll`、`*.pak`、`icudtl.dat` 等（缺失说明 zip 解压中断）
- 显卡驱动过旧可能导致 GPU 加速失败；可尝试在 `cmd` 中用 `HALOFLUX 光环实验室.exe --disable-gpu` 启动排查

## 6. 构建便携版

1. `npm install`（安装 electron ^45.3.3）
2. 复制 Electron 发行包：把 `node_modules/electron/dist/` 的**全部内容**作为便携版目录
3. 将其中 `electron.exe` 改名为 `HALOFLUX 光环实验室.exe`
4. 在便携版目录下建 `resources/app/`，复制本仓库的全部工程文件进去（`main.js`、`preload.js`、`package.json`、`icon.ico`、`www/`）
5. （可选）用 [rcedit](https://github.com/electron/rcedit) 写入图标：`rcedit-x64.exe "HALOFLUX 光环实验室.exe" --set-icon icon.ico`
6. 打包 zip（python 示例，顶层保留一个目录、UTF-8 文件名 flag）：

```bash
python -c "
import zipfile, os, hashlib
src = r'便携版目录'
dst = r'HALOFLUX-Halo-Lab-v1.0.0-portable-win-x64.zip'
with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for root, dirs, files in os.walk(src):
        for f in files:
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, os.path.dirname(src)))
print('SHA256:', hashlib.sha256(open(dst,'rb').read()).hexdigest())
print('Size  :', os.path.getsize(dst))
"
```

7. 发布：GitHub 仓库页 → Releases → Draft a new release → 填 tag `v1.0.0` 与说明（附 SHA256）→ 拖拽上传 zip → Publish

## 7. 开发调试

- `npm start` 以开发模式运行
- 主进程日志：`ELECTRON_ENABLE_LOGGING=1 npm start`
- 截屏验证钩子（main.js 内置）：`HALOFLUX_SHOT=<路径> npm start`，启动 3 秒后自动截屏保存并退出
- 修改 `main.js` / `preload.js` 后需重启；若使用便携版，需同步到 `resources/app/`
