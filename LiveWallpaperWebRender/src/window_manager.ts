
import { app, BrowserWindow } from 'electron';

export class Status {
    constructor() {
        this.initlized = false;
    }
    initlized: boolean;
}

export interface Wallpaper {
    path: string
}

const windows: { [id: number]: BrowserWindow | undefined; } = {};
const cacheURL: { [id: number]: string | undefined; } = {};
let status: Status = new Status();
app.on('ready', () => {
    status.initlized = true;
})

export default class WindowManager {
    getInfo() {
        return status;
    }
    muteWindow(screenIndexs: string[]) {
        let result = false;
        for (const i in windows) {
            let currentWindow = windows[i];
            if (!currentWindow)
                continue;

            var mute = screenIndexs.indexOf(i) >= 0;
            currentWindow.webContents.setAudioMuted(mute);
        }
        return result;
    }
    closeWallpaper(screenIndexs: string[]) {
        let result = false;
        for (const i of screenIndexs) {
            let tmpIndex = parseInt(i);
            if (isNaN(tmpIndex))
                continue;

            let currentWindow = windows[tmpIndex];
            if (currentWindow) {
                //防止出现黑屏
                // currentWindow.hide();
                // currentWindow.loadURL("");

                // 直接关会黑屏
                currentWindow.setOpacity(0);
                windows[tmpIndex]!.close();
                windows[tmpIndex] = undefined;
                cacheURL[tmpIndex] = undefined;
                result = true;
            }
        }
        return result;
    }
    showWallpaper(wallpaper: Wallpaper, screenIndexs: string[]) {
        const result: { [id: number]: number; } = {};
        for (const i of screenIndexs) {
            let tmpIndex = parseInt(i);
            if (isNaN(tmpIndex))
                continue;
            let window: BrowserWindow | undefined;
            if (!windows[tmpIndex]) {
                window = new BrowserWindow({
                    skipTaskbar: true,
                    frame: false,
                    fullscreen: true,
                });
                windows[tmpIndex] = window;
                window.loadURL(`file://${__dirname}/../html/loading/index.html`);
            }
            else
                window = windows[tmpIndex];

            var currentUrl = cacheURL[tmpIndex];
            if (!currentUrl || currentUrl.indexOf(wallpaper.path) < 0) {
                window!.loadURL(wallpaper.path);
                //地址相同就不加载，防止闪屏
                cacheURL[tmpIndex] = wallpaper.path;
            }
            window!.show();

            let handle = windows[tmpIndex]!.getNativeWindowHandle().readUInt32LE(0);
            result[tmpIndex] = handle;
        }
        return result;
    }
}