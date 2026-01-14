
export interface Message {
  role: 'user' | 'model';
  content: string;
}

// Define a custom interface for the ipcRenderer that includes the methods we need
interface CustomIpcRenderer {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => Electron.IpcRenderer;
  // Add other methods if you use them, e.g., invoke, removeListener
}

// Extend the Window interface to include our custom ipcRenderer
declare global {
  interface Window {
    ipcRenderer: CustomIpcRenderer;
  }
}
