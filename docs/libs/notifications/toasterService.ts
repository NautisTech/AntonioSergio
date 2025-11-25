import { toast, type ToastOptions } from 'react-toastify'

export interface ToastConfig {
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
    autoClose?: number | false
    hideProgressBar?: boolean
    closeOnClick?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
}

class ToastService {
    private defaultConfig: ToastOptions = {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    }

    success(message: string, config?: ToastConfig) {
        if (typeof window === 'undefined') return
        toast.success(message, { ...this.defaultConfig, ...config })
    }

    error(message: string, config?: ToastConfig) {
        if (typeof window === 'undefined') return
        toast.error(message, { ...this.defaultConfig, ...config })
    }

    warning(message: string, config?: ToastConfig) {
        if (typeof window === 'undefined') return
        toast.warning(message, { ...this.defaultConfig, ...config })
    }

    info(message: string, config?: ToastConfig) {
        if (typeof window === 'undefined') return
        toast.info(message, { ...this.defaultConfig, ...config })
    }

    // Métodos específicos para API
    apiSuccess(message: string = 'Operação realizada com sucesso!') {
        this.success(message)
    }

    apiError(error: any, defaultMessage: string = 'Ocorreu um erro. Tente novamente.') {
        const message = error?.response?.data?.message || error?.message || defaultMessage
        this.error(message, { autoClose: 7000 })
    }

    apiWarning(message: string) {
        this.warning(message)
    }

    // Métodos para operações específicas
    saveSuccess(entity: string = 'Registo') {
        this.success(`${entity} salvo(a) com sucesso!`)
    }

    updateSuccess(entity: string = 'Registo') {
        this.success(`${entity} atualizado(a) com sucesso!`)
    }

    deleteSuccess(entity: string = 'Registo') {
        this.success(`${entity} excluído(a) com sucesso!`)
    }

    saveError(entity: string = 'Registo') {
        this.error(`Erro ao salvar ${entity.toLowerCase()}`)
    }

    updateError(entity: string = 'Registo') {
        this.error(`Erro ao atualizar ${entity.toLowerCase()}`)
    }

    deleteError(entity: string = 'Registo') {
        this.error(`Erro ao excluir ${entity.toLowerCase()}`)
    }

    // Notificações de validação
    validationError(message: string = 'Por favor, verifique os campos obrigatórios.') {
        this.warning(message)
    }

    // Notificações de loading (com promise)
    async promise<T>(
        promise: Promise<T>,
        messages: {
            pending: string
            success: string
            error: string
        }
    ): Promise<T> {
        if (typeof window === 'undefined') return promise
        return toast.promise(promise, {
            pending: messages.pending,
            success: messages.success,
            error: messages.error,
        })
    }
}

export const toastService = new ToastService()