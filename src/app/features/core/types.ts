export type Toast = {
    message: string,
    type: 'error' | 'info' | 'success' | 'warning',
    closeBtn?: 'close' | 'ok',
    delay?: number
}