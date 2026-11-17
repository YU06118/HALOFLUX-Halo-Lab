# HALOFLUX 光环实验室（桌面版）

> **English Notice — Source & License**
> This is a **non-commercial, bilingual (Chinese-first) desktop edition** built with Electron on top of
> **HALOFLUX** — Original project: [HALOFLUX by Ryder191](https://github.com/Ryder191/haloflux),
> © 2026 Ryder191 (RYDER CODE / Ms MAIKEBAIs CAT). All rights reserved.
> Licensed under the **PolyForm Noncommercial License 1.0.0** (see [LICENSE](LICENSE)).
> **Noncommercial use only — ANY COMMERCIAL USE IS STRICTLY PROHIBITED.**
> This repository redistributes a modified version with the original copyright notice, license text
> and source attribution preserved, as required by the license. 音频与视觉设计版权归原作所有。

**HALOFLUX 光环实验室** 是 [HALOFLUX 论文实验室控制台](https://github.com/Ryder191/haloflux)（原作为运行在浏览器中的单文件可视化页面）的 **Windows 桌面封装版**：用 Electron 提供独立无边框窗口、自绘标题栏与应用图标，并把界面改造为「中文 + (英文原文)」双语呈现，同时做了渲染性能优化与帧率锁定。

本仓库包含：桌面应用源码（本目录即 Electron 工程根）+ 使用文档（[docs/USAGE.md](docs/USAGE.md)）+ 免安装便携版（见 [Releases](https://github.com/YU06118/HALOFLUX-Halo-Lab/releases)）。

## ✨ 功能特性

| 特性 | 说明 |
|---|---|
| 桌面化封装 | Electron 45：无边框深色窗口 + 自绘标题栏（可拖动、最小化/最大化/关闭），专用应用图标，单实例锁 |
| 中英双语界面 | 每条界面文案均为「中文主行 + 下一行 (英文原文)」双层呈现 |
| 论文实验室控制台 | 全屏 Canvas 科幻光环可视化：偏心弧形光环、编织光场、多层光束爆发、节拍驱动动画 |
| 调参控制台 | 22 项可视化参数（分 5 组）、3 个预设（MINE / A / B）、参数 JSON 导出/导入、持久化 |
| 帧率锁定 | 默认锁定 60 FPS（相位累加门控，任意 ≥60Hz 刷新率下精确 60），`L` 键或控制台可切 30/60/120/不限 |
| 渲染性能优化 | 低分辨率预模糊、面板 30Hz 节流、对象复用、定时器 rAF 化；`?perf=1` 内置性能面板 |
| 背景音乐 | 内置 `sw421k.mp3`（源自原仓库）循环播放，音量可调，开关状态持久化 |
| 便携版 | 免安装单文件夹，解压即用，不写注册表，可整体拷贝到其他 Windows 电脑 |

## ⌨️ 快捷键

| 按键 | 功能 |
|---|---|
| `C` | 打开 / 关闭调参控制台 |
| `F` 或 双击页面 | 全屏切换 |
| `L` | 帧率上限 60 ⇄ 不限（也可在控制台选 30/60/120/∞） |
| `M` | 背景音乐开 / 关 |

## 📦 安装

### 方式一：下载便携版（推荐，免安装）

1. 前往 [Releases](https://github.com/YU06118/HALOFLUX-Halo-Lab/releases) 下载 `HALOFLUX-Halo-Lab-v1.0.0-portable-win-x64.zip`（并核对 Release 说明中公布的 SHA256）
2. 解压到任意目录（建议 Windows 10 1803+，或使用 7-Zip/WinRAR 解压）
3. 双击 `HALOFLUX 光环实验室.exe` 运行
4. 首次运行如被 Windows SmartScreen 拦截：点击「更多信息 → 仍要运行」（应用未做代码签名，属预期，详见[故障排查](docs/USAGE.md#5-故障排查)）

系统要求：Windows 10/11 x64。应用内嵌 Chromium 运行时，无其他依赖。

### 方式二：源码运行

前置：Node.js ≥ 18 与 npm。

```bash
git clone https://github.com/YU06118/HALOFLUX-Halo-Lab.git
cd HALOFLUX-Halo-Lab
npm install     # 安装 electron ^45.3.3
npm start
```

## 🔧 构建便携版

1. `npm install` 安装 Electron
2. 复制 Electron 发行包（`node_modules/electron/dist/` 全部内容）作为应用目录
3. 把 `electron.exe` 改名为 `HALOFLUX 光环实验室.exe`，并将本工程全部文件（`main.js`、`preload.js`、`package.json`、`icon.ico`、`www/`）复制到 `resources/app/`
4. 可用 [rcedit](https://github.com/electron/rcedit) 为 exe 写入图标：`rcedit-x64.exe <exe> --set-icon icon.ico`
5. 整个目录打 zip 即为便携版。逐步说明见 [docs/USAGE.md · 构建便携版](docs/USAGE.md#6-构建便携版)

## ⚙️ 配置说明

### 持久化（localStorage）

| 键 | 作用 |
|---|---|
| `paperlab.cfg.v2` | 调参台全部参数值与当前预设名 |
| `paperlab.bgm.v1` | 背景音乐开关状态与音量 |

清除方式：应用内 DevTools（`Ctrl+Shift+I`）→ Application → Local Storage → 删除对应键。

### URL / 加载参数（`?preset=a|b` 等）

| 参数 | 取值 | 说明 |
|---|---|---|
| `?preset=` | `MINE` / `A` / `B` | 启动时覆盖预设（优先于 localStorage） |
| `?fps=` | `0` / `30` / `60` / `120` | 覆盖帧率上限（0 = 不限，不写入持久化） |
| `?perf=1` | 1 | 显示性能面板（FPS 与 p50/p95/p99 帧时间） |

参数追加在 `www/lab.html` 之后；桌面版可通过 DevTools 的 location 修改，或临时改 `main.js` 中 `loadFile` 的路径。

### main.js 可调常量

| 常量 | 默认值 | 说明 |
|---|---|---|
| `TITLEBAR_H` | `36` | 自绘标题栏高度（px） |
| 窗口尺寸 | `1600×940`（最小 `1100×700`） | `new BrowserWindow` 参数 |

## 📁 目录结构

```
HALOFLUX-Halo-Lab/
├── README.md            # 本文件
├── docs/USAGE.md        # 使用文档（界面/控制台/帧率/音频/故障排查/构建）
├── LICENSE              # PolyForm Noncommercial 1.0.0 全文
├── .gitignore / .gitattributes
├── package.json         # Electron 工程清单（npm start 即可运行）
├── main.js              # Electron 主进程：无边框窗口、自绘标题栏注入、IPC、单例锁
├── preload.js           # 预加载桥：白名单 IPC API
├── icon.ico             # 应用图标
└── www/                 # 页面资源（由 main.js 加载）
    ├── lab.html         # 单文件可视化页面（双语化 + 性能优化版）
    ├── LICENSE          # 许可全文（lab.html 头部注释引用）
    └── audio/sw421k.mp3 # 背景音乐
```

## 📄 许可证与来源

- **原作 / Original project**：[HALOFLUX by Ryder191](https://github.com/Ryder191/haloflux) — © 2026 Ryder191 (RYDER CODE / Ms MAIKEBAIs CAT)
- 本仓库为**非商业修改版**（双语化、性能优化、Electron 桌面封装），按 **PolyForm Noncommercial License 1.0.0** 授权，全文见 [LICENSE](LICENSE)
- **仅限非商业用途，严禁任何商业用途**；再分发或二次修改须保留原作版权声明、许可全文与来源链接
- 第三方组件：Chromium/Electron 相关第三方许可见便携版内的 `LICENSES.chromium.html`

## 📸 截图（待补）

> 可在应用运行时用 DevTools 或系统截图工具截取；后续版本补充至 `docs/img/`。
