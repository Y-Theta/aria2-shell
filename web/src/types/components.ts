// 通用选项接口
export interface SelectOption {
    label: string
    value: string | number
}

// 文件系统项接口
export interface FileSystemItem {
    name: string
    path: string
    type: 'file' | 'directory'
    size?: number
    children?: FileSystemItem[]
}

// 设置标签页接口
export interface SettingsTab {
    key: string
    labelKey: string
    icon: string
}

// 通用组件 Props 接口
export interface CustomSelectProps {
    modelValue: string | number
    options: SelectOption[]
}

export interface NumberControlProps {
    modelValue: number
    min?: number
    max?: number
    placeholder?: string
}

export interface SelectControlProps {
    modelValue: string | number
    options: SelectOption[]
}

export interface TextControlProps {
    modelValue: string
    placeholder?: string
    type?: 'text' | 'password'
}

export interface SettingItemProps {
    label: string
    description?: string
    icon?: string
    vertical?: boolean
}

export interface SwitchControlProps {
    modelValue: boolean
}

// 对话框 Props 接口
export interface AddTaskDialogProps {
    visible: boolean
}

export interface ConfirmDialogProps {
    visible: boolean
    title: string
    message: string
}

export interface FileSelectorDialogProps {
    visible: boolean
    initialPath?: string
}

export interface SettingsPanelProps {
    visible: boolean
    inline?: boolean
}