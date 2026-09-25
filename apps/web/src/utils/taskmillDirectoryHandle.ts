const DATABASE_NAME = 'taskmill-browser-state'
const STORE_NAME = 'handles'
const DIRECTORY_KEY = 'active-taskmill-directory'

export type PermissionedTaskmillDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission: (descriptor: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>
  requestPermission: (descriptor: { mode: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Не удалось открыть IndexedDB.'))
    request.onblocked = () => reject(new Error('Открытие IndexedDB заблокировано другой вкладкой.'))
  })
}

export async function saveTaskmillDirectoryHandle(handle: FileSystemDirectoryHandle) {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(handle, DIRECTORY_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Не удалось сохранить папку в IndexedDB.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Сохранение папки в IndexedDB отменено.'))
    })
  } finally {
    database.close()
  }
}

export async function clearTaskmillDirectoryHandle() {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).delete(DIRECTORY_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Не удалось забыть сохранённую папку.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Удаление папки из IndexedDB отменено.'))
    })
  } finally {
    database.close()
  }
}

export async function loadTaskmillDirectoryHandle() {
  const database = await openDatabase()
  let value: unknown
  try {
    value = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly')
      const request = transaction.objectStore(STORE_NAME).get(DIRECTORY_KEY)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Не удалось прочитать сохранённую папку.'))
    })
  } finally {
    database.close()
  }

  if (!value) return undefined
  const handle = value as PermissionedTaskmillDirectoryHandle
  return handle.kind === 'directory' && typeof handle.queryPermission === 'function' ? handle : undefined
}
