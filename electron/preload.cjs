const { contextBridge } = require('electron');

const apiUrl = process.env.BAKASUB_API_URL || 'http://127.0.0.1:8080/api/v1';

contextBridge.exposeInMainWorld('BAKASUB_RUNTIME_CONFIG', Object.freeze({
  apiUrl,
}));