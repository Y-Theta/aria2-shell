export default {
    addTask: {
        batchUrl: '批量 URL',
        batchUrlDesc: '添加多个下载链接',
        batchUrlsPlaceholder: '请输入多个链接，每行一个',
        change: '更改',
        customPath: '自定义',
        downloadUrl: '下载链接',
        downloadUrlPlaceholder: '请输入下载链接，例如：magnet:?xt=urn:btih:...',
        linkSupported: '支持 HTTP(S)/FTP/Magnet 链接',
        noFileSelected: '未选择文件',
        regexAdd: '正则添加',
        regexAddDesc: '通过正则匹配链接',
        regexPattern: '正则表达式',
        regexPatternPlaceholder: '请输入正则表达式',
        regexUrlTemplate: 'URL 模板',
        regexUrlTemplatePlaceholder: '请输入 URL 模板，使用 $1, $2, $3 等引用匹配组',
        savePathPlaceholder: '请输入保存路径',
        saveTo: '保存到',
        selectTorrentFile: '选择种子文件',
        selectTorrentFileDesc: '点击或拖拽文件到此处',
        selectedFile: '已选择文件',
        singleUrl: '单个 URL',
        singleUrlDesc: '添加单个下载链接',
        startNow: '立即添加',
        subtitle: '支持多种方式添加下载链接或种子文件',
        title: '新增下载任务',
        uploadTorrent: '上传种子文件',
        uploadTorrentDesc: '从本地选择种子文件',
        urlRequired: '请输入下载链接',
        useProxy: '使用代理'
    },
    common: {
        appName: 'aria2-shell',
        cancel: '取消',
        close: '关闭',
        confirm: '确认',
        confirmLogoutMessage: '确定要退出登录吗？',
        confirmLogoutTitle: '确认退出',
        dark: '深色',
        language: '语言',
        light: '浅色',
        loading: '加载中...',
        logout: '退出登录',
        theme: '主题'
    },
    connection: {
        checkingDesc: '请稍候，正在校验 aria2 连接状态...',
        checkingTitle: '正在连接 aria2 ',
        connected: '已连接',
        disconnected: '未连接',
        failedDesc: '请检查 aria2 是否已启动，或网络连接是否正常。',
        failedTitle: ' aria2 连接失败',
        retry: '重新连接'
    },
    fileSelector: {
        confirm: '选择',
        createFolder: '新建文件夹',
        createFolderTitle: '新建文件夹',
        empty: '目录为空',
        error: '加载失败，请重试',
        folderName: '文件夹名称',
        loading: '加载中...',
        subtitle: '从文件系统中选择保存位置',
        title: '选择路径'
    },
    login: {
        footerText: 'Powered by Aria2',
        login: '登录',
        password: '密码',
        passwordPlaceholder: '请输入密码',
        register: '注册',
        subtitle: '高效的下载管理器',
        username: '用户名',
        usernamePlaceholder: '请输入用户名'
    },
    nav: {
        home: '首页',
        settings: '设置'
    },
    settings: {
        about: {
            appDesc: '一个简洁的下载任务管理工具',
            appName: 'Download Manager',
            build: '构建类型',
            buildValue: 'Desktop/Web',
            status: '状态',
            statusValue: '运行正常',
            title: '关于应用',
            version: '当前版本',
            versionValue: '1.0.0'
        },
        actions: {
            resetDefault: '恢复默认',
            save: '保存设置',
            select: '选择'
        },
        appearance: {
            appName: {
                desc: '自定义浏览器标签页显示的名称',
                label: '网页名称',
                placeholder: '请输入网页名称'
            },
            language: {
                desc: '选择界面显示语言',
                enUS: 'English',
                label: '语言',
                zhCN: '简体中文'
            },
            showRegister: {
                desc: '在登录页面显示注册按钮',
                label: '显示注册入口'
            },
            theme: {
                dark: '深色模式',
                desc: '选择应用显示主题',
                label: '主题模式',
                light: '浅色模式',
                system: '跟随系统'
            }
        },
        aria2: {
            autoReconnect: {
                desc: '连接断开后自动尝试重新连接',
                label: '自动重连'
            },
            btMaxUploadSpeed: {
                desc: 'BT 任务最大上传速度限制，0 表示不限速，单位 KB/s',
                label: 'BT 最大上传速度'
            },
            btMinSeedRatio: {
                desc: 'BT 任务达到该分享率后可停止做种',
                label: '最小分享率'
            },
            btMinSeedTime: {
                desc: 'BT 任务最少做种时间，单位分钟',
                label: '最小做种时间'
            },
            btSection: 'BT 设置',
            btTrackerUrl: {
                desc: '可选，自定义 BT Tracker 服务器地址，每个地址一行',
                label: 'BT Tracker 地址',
                placeholder: '例如：udp://tracker.example.com:6969/announce'
            },
            httpProxyPassword: {
                desc: '如果代理需要认证，填写密码',
                label: '代理密码',
                placeholder: '可选'
            },
            httpProxySection: 'HTTP 代理设置',
            httpProxyUrl: {
                desc: '支持 HTTP/HTTPS/SOCKS5 代理，格式：http://host:port',
                label: '代理地址',
                placeholder: 'http://127.0.0.1:7890'
            },
            httpProxyUser: {
                desc: '如果代理需要认证，填写用户名',
                label: '代理用户名',
                placeholder: '可选'
            },
            proxyTestFailed: '代理连接失败',
            proxyTestNetworkError: '网络请求失败，请检查后端服务是否正常',
            proxyTestSuccess: '代理连接成功！响应时间：{elapsed}，HTTP 状态：{status}',
            proxyTestUrl: {
                desc: '用于测试代理连接是否正常的目标地址',
                label: '测试服务器地址',
                placeholder: 'https://www.google.com/generate_204'
            },
            secret: {
                desc: '用于连接 aria2 服务的认证密钥',
                label: 'RPC 密钥',
                placeholder: '请输入密钥'
            },
            serverUrl: {
                desc: '用于连接下载服务的 API 地址',
                label: '后端服务地址',
                placeholder: 'http://127.0.0.1:8080'
            },
            testProxyConnection: {
                buttonText: '测试连接',
                desc: '测试通过代理连接指定服务器是否正常',
                label: '测试代理连接'
            },
            timeout: {
                desc: '请求后端接口的最大等待时间，单位秒',
                label: '连接超时时间'
            }
        },
        confirmReset: {
            message: '此操作将把所有设置恢复为默认值，确定要继续吗？',
            title: '确认恢复默认设置'
        },
        download: {
            addPath: '添加保存位置',
            defaultPathLabel: '默认',
            defaultSavePaths: '默认保存位置',
            downloadLimit: {
                desc: '设置为 0 表示不限制速度，单位 KB/s',
                label: '全局下载速度限制'
            },
            keepSeeding: {
                desc: 'BT 任务下载完成后继续上传分享',
                label: '任务完成后继续做种'
            },
            maxActiveDownloads: {
                desc: '限制同时处于下载状态的任务数量',
                label: '最大同时下载任务数'
            },
            maxConnections: {
                desc: '单个服务器最大连接数，启用多线程下载，范围 1-16',
                label: '下载线程数'
            },
            pathLabelPlaceholder: '标签',
            pathPlaceholder: '路径',
            uploadLimit: {
                desc: '设置为 0 表示不限速，单位 KB/s',
                label: '上传速度限制'
            }
        },
        general: {
            autoStart: {
                desc: '系统启动后自动打开下载管理器',
                label: '开机自动启动'
            },
            downloadPath: {
                desc: '新建下载任务时默认保存的位置',
                label: '默认保存路径',
                placeholder: '请选择下载路径'
            },
            minimizeToTray: {
                desc: '点击关闭按钮后程序继续在后台运行',
                label: '关闭窗口时最小化到托盘'
            },
            reset: {
                desc: '将所有设置恢复为默认值'
            }
        },
        sections: {
            appearance: '外观设置',
            connection: '连接设置',
            download: '下载设置',
            general: '常规设置'
        },
        subtitle: '管理应用、下载、连接和界面偏好',
        tabs: {
            about: '关于',
            appearance: '外观',
            aria2: 'Aria2',
            download: '下载',
            user: '用户'
        },
        title: '设置',
        user: {
            changePassword: '修改密码',
            changePasswordError: '修改密码失败，请重试',
            confirmPassword: '确认新密码',
            confirmPasswordDesc: '请再次输入您的新密码',
            confirmPasswordPlaceholder: '请再次输入新密码',
            newPassword: '新密码',
            newPasswordDesc: '请输入您的新密码（至少6位）',
            newPasswordPlaceholder: '请输入新密码',
            newPasswordRequired: '请输入新密码',
            newPasswordTooShort: '新密码至少需要6位',
            oldPassword: '旧密码',
            oldPasswordDesc: '请输入您当前的密码',
            oldPasswordPlaceholder: '请输入旧密码',
            oldPasswordRequired: '请输入旧密码',
            passwordNotMatch: '两次输入的密码不一致',
            updatePassword: '更新密码'
        }
    },
    sidebar: {
        active: '下载中',
        all: '全部任务',
        category: '分类',
        categoryAll: '全部',
        categoryAudio: '音频',
        categoryDoc: '文档',
        categorySoftware: '软件',
        categoryVideo: '视频',
        categoryZip: '压缩包',
        completed: '已完成',
        downloading: '下载中',
        error: '出错',
        features: '功能',
        menu: '菜单',
        paused: '已暂停',
        seeding: '做种中',
        settings: '设置',
        status: '状态',
        title: '下载器',
        torrents: '种子'
    },
    taskPage: {
        actions: '操作',
        addTask: '添加任务',
        availableSpace: '可用空间',
        batchOperation: '批量操作',
        collapse: '收起',
        completed: '已完成',
        completedSize: '已下载',
        delete: '删除',
        deleteAllTasks: '删除所有任务',
        deleteAllTasksConfirm: '确定要删除当前列表中的所有任务吗？此操作不可撤销。',
        deleteLocalFile: '同时删除本地文件',
        deleteSelected: '删除选中',
        deleteSelectedTasks: '删除选中任务',
        deleteSelectedTasksConfirm: '确定要删除选中的 {count} 个任务吗？此操作不可撤销。',
        deleteTask: '删除任务',
        deleteTaskConfirm: '确定要删除这个任务吗？此操作不可撤销。',
        downloadSpeed: '下载速度',
        downloading: '下载中',
        downloadingCount: '正在下载',
        error: '错误',
        expand: '展开',
        fileName: '文件名',
        openFile: '打开文件',
        openFolder: '打开文件夹',
        pause: '暂停',
        pauseSelected: '暂停选中',
        paused: '已暂停',
        pieces: '分片进度',
        progress: '进度',
        search: '搜索任务',
        selectedCount: '已选 {count} 项',
        size: '大小',
        speed: '速度',
        start: '开始',
        startSelected: '开始选中',
        status: '状态',
        torrentFileList: '种子文件列表',
        totalSize: '总大小',
        totalTasks: '总任务',
        uploadSpeed: '上传速度',
        waiting: '等待中'
    }
}