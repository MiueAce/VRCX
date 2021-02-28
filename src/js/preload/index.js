const { ipcRenderer } = require('electron');

// only export ipcRenderer. But this is a security issue.
// We have to write a wrapping function or find another way to handle it.
window.electron = {
    ipcRenderer,
};
