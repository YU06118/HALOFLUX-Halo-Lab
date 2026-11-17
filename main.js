/* =========================================================
   HALOFLUX 光环实验室 - 桌面版主进程
   无边框窗口 + 自绘标题栏注入 + 便携验证钩子
   基于Electron封装；页面内容与逻辑源自 HALOFLUX by Ryder191
   (PolyForm Noncommercial 1.0.0，仅限非商业用途)
   ========================================================= */
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const TITLEBAR_H = 36;

let win = null;

/* ---------- 自绘标题栏注入（不改 lab.html 源文件，运行时注入） ---------- */
const TITLEBAR_JS = `(function(){
  if (window.__haloTitlebar) return;
  window.__haloTitlebar = true;
  const api = window.haloDesktop;
  if (!api) return;
  const css = document.createElement('style');
  css.textContent = \`
  #haloTitlebar{
    display:flex;align-items:center;height:${TITLEBAR_H}px;
    background:linear-gradient(180deg,#0c0d10,#0a0b0d);
    border-bottom:1px solid #25282e;
    -webkit-app-region:drag;user-select:none;
    padding:0 0 0 14px;gap:10px;
  }
  #haloTitlebar .brandTB{display:flex;align-items:baseline;gap:10px;min-width:0}
  #haloTitlebar .brandTB b{
    font:800 12px/1 "JetBrains Mono",Consolas,monospace;
    letter-spacing:2px;color:#f4f5f7;white-space:nowrap;
  }
  #haloTitlebar .brandTB span{
    font:600 9px/1 "JetBrains Mono",Consolas,monospace;
    letter-spacing:1.2px;color:#6b6f78;white-space:nowrap;
  }
  #haloTitlebar .dragFill{flex:1}
  #haloTitlebar .wbtns{-webkit-app-region:no-drag;display:flex;height:100%}
  #haloTitlebar .wbtns button{
    width:46px;height:100%;border:0;background:transparent;cursor:pointer;
    color:#cfd2d8;font:600 11px/1 Consolas,monospace;
    transition:background .15s,color .15s;
  }
  #haloTitlebar .wbtns button:hover{background:#1d1f24;color:#fff}
  #haloTitlebar .wbtns button.close:hover{background:#b00020;color:#fff}
  .app{grid-template-rows:auto auto minmax(0,1fr) auto !important}
  \`;
  document.head.appendChild(css);
  const bar = document.createElement('div');
  bar.id = 'haloTitlebar';
  bar.innerHTML =
    '<div class="brandTB"><b>HALOFLUX</b><span>光环实验室 · 论文实验室控制台</span></div>' +
    '<div class="dragFill"></div>' +
    '<div class="wbtns">' +
      '<button id="tbMin" title="最小化">—</button>' +
      '<button id="tbMax" title="最大化/还原">□</button>' +
      '<button id="tbClose" class="close" title="关闭">✕</button>' +
    '</div>';
  const appEl = document.querySelector('.app');
  (appEl || document.body).insertBefore(bar, (appEl || document.body).firstChild);
  document.getElementById('tbMin').onclick = () => api.minimize();
  document.getElementById('tbMax').onclick = () => api.toggleMaximize();
  document.getElementById('tbClose').onclick = () => api.close();
  const maxBtn = document.getElementById('tbMax');
  const syncMax = st => { maxBtn.textContent = st ? '❐' : '□'; maxBtn.title = st ? '还原' : '最大化'; };
  api.onMaximizeState(syncMax);
  // 双击标题栏空白处 最大化/还原
  bar.addEventListener('dblclick', e => { if (e.target.closest('button')) return; api.toggleMaximize(); });
})();`;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 940,
    minWidth: 1100,
    minHeight: 700,
    frame: false,                       // 无边框：自绘标题栏
    backgroundColor: '#08090b',
    show: false,
    title: 'HALOFLUX 光环实验室',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  // 处理页面里 target=_blank 的来源链接：用系统浏览器打开，不弹新窗口
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  win.loadFile(path.join(__dirname, 'www', 'lab.html'));

  win.once('ready-to-show', () => {
    win.show();
    win.webContents.executeJavaScript(TITLEBAR_JS).catch(() => {});
    // 桌面验证钩子：HALOFLUX_SHOT=<路径> 时，3 秒后截屏保存并退出（仅用于开发验证）
    const shot = process.env.HALOFLUX_SHOT;
    if (shot) {
      setTimeout(async () => {
        try {
          // 交互自测：模拟点击自绘标题栏的最小化/最大化按钮，验证 IPC 链路端到端可用
          const itest = await win.webContents.executeJavaScript(`(async function(){
            const r = {};
            const q = id => document.getElementById(id);
            r.minBtn = !!q('tbMin'); r.maxBtn = !!q('tbMax'); r.closeBtn = !!q('tbClose');
            if (window.haloDesktop) {
              q('tbMax').click();
              await new Promise(res => setTimeout(res, 600));
              r.maximized1 = window.haloDesktop ? undefined : null;
              q('tbMax').click();
              await new Promise(res => setTimeout(res, 600));
            }
            return r;
          })()`);
          console.log('[ITEST]', JSON.stringify(itest), '| maxState=', win.isMaximized() ? 'was-toggled' : 'restored');
          const img = await win.webContents.capturePage();
          fs.writeFileSync(shot, img.toPNG());
          console.log('[SHOT SAVED]', shot);
        } catch (e) { console.error('[SHOT FAIL]', e.message); }
        app.exit(0);
      }, 3000);
    }
  });

  win.on('maximize', () => win.webContents.send('halo:maximize', true));
  win.on('unmaximize', () => win.webContents.send('halo:maximize', false));

  win.on('closed', () => { win = null; });
}

/* ---------- 窗口控制 IPC ---------- */
ipcMain.on('halo:minimize', () => win && win.minimize());
ipcMain.on('halo:toggleMaximize', () => {
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on('halo:close', () => win && win.close());

/* ---------- 应用生命周期 ---------- */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
