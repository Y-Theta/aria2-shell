export default {
    addTask: {
        batchUrl: 'Batch URLs',
        batchUrlDesc: 'Add multiple download links',
        batchUrlsPlaceholder: 'Enter multiple links, one per line',
        change: 'Change',
        customPath: 'Custom',
        downloadUrl: 'Download URL',
        downloadUrlPlaceholder: 'Enter download link, e.g.: magnet:?xt=urn:btih:...',
        linkSupported: 'HTTP(S)/FTP/Magnet links are supported',
        noFileSelected: 'No file selected',
        regexAdd: 'Regex Add',
        regexAddDesc: 'Match links using regular expressions',
        regexPattern: 'Regex Pattern',
        regexPatternPlaceholder: 'Enter regular expression',
        regexUrlTemplate: 'URL Template',
        regexUrlTemplatePlaceholder: 'Enter URL template, use $1, $2, $3, etc. to reference match groups',
        savePathPlaceholder: 'Enter save path',
        saveTo: 'Save To',
        selectTorrentFile: 'Select Torrent File',
        selectTorrentFileDesc: 'Click or drag file here',
        selectedFile: 'Selected File',
        singleUrl: 'Single URL',
        singleUrlDesc: 'Add a single download link',
        startNow: 'Add Now',
        subtitle: 'Support multiple ways to add download links or torrent files',
        title: 'Add New Download Task',
        uploadTorrent: 'Upload Torrent',
        uploadTorrentDesc: 'Select torrent file from local',
        urlRequired: 'Please enter download URL',
        useProxy: 'Use Proxy'
    },
    common: {
        appName: 'aria2-shell',
        cancel: 'Cancel',
        close: 'Close',
        confirm: 'Confirm',
        confirmLogoutMessage: 'Are you sure you want to logout?',
        confirmLogoutTitle: 'Confirm Logout',
        dark: 'Dark',
        language: 'Language',
        light: 'Light',
        loading: 'Loading...',
        logout: 'Logout',
        theme: 'Theme'
    },
    connection: {
        checkingDesc: 'Please wait while the connection status is being checked...',
        checkingTitle: 'Connecting to aria2 ',
        connected: 'Connected',
        disconnected: 'Disconnected',
        failedDesc: 'Please check whether the aria2 service is running or the network is available.',
        failedTitle: 'Connect to aria2 failed',
        retry: 'Retry'
    },
    fileSelector: {
        confirm: 'Select',
        createFolder: 'New Folder',
        createFolderTitle: 'New Folder',
        empty: 'Directory is empty',
        error: 'Failed to load, please try again',
        folderName: 'Folder Name',
        loading: 'Loading...',
        subtitle: 'Choose a save location from the file system',
        title: 'Select Path'
    },
    login: {
        footerText: 'Powered by Aria2',
        login: 'Login',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        register: 'Register',
        subtitle: 'Efficient Download Manager',
        username: 'Username',
        usernamePlaceholder: 'Enter your username'
    },
    nav: {
        home: 'Home',
        settings: 'Settings'
    },
    settings: {
        about: {
            appDesc: 'A clean and simple download task management tool',
            appName: 'Download Manager',
            build: 'Build Type',
            buildValue: 'Desktop/Web',
            status: 'Status',
            statusValue: 'Running Normally',
            title: 'About App',
            version: 'Version',
            versionValue: '1.0.0'
        },
        actions: {
            resetDefault: 'Reset to Default',
            save: 'Save Settings',
            select: 'Select'
        },
        appearance: {
            appName: {
                desc: 'Customize the browser tab title',
                label: 'Page Title',
                placeholder: 'Enter page title'
            },
            language: {
                desc: 'Select the interface display language',
                enUS: 'English',
                label: 'Language',
                zhCN: '简体中文'
            },
            showRegister: {
                desc: 'Show registration button on login page',
                label: 'Show Registration'
            },
            theme: {
                dark: 'Dark Mode',
                desc: 'Select the app display theme',
                label: 'Theme Mode',
                light: 'Light Mode',
                system: 'Follow System'
            }
        },
        aria2: {
            autoReconnect: {
                desc: 'Automatically attempt to reconnect after the connection is lost',
                label: 'Auto Reconnect'
            },
            btMaxUploadSpeed: {
                desc: 'BT task maximum upload speed limit, 0 means unlimited, unit KB/s',
                label: 'BT Max Upload Speed'
            },
            btMinSeedRatio: {
                desc: 'BT task can stop seeding after reaching this ratio',
                label: 'Minimum Seed Ratio'
            },
            btMinSeedTime: {
                desc: 'BT task minimum seeding time, unit minutes',
                label: 'Minimum Seed Time'
            },
            btSection: 'BT Settings',
            btTrackerUrl: {
                desc: 'Optional, custom BT Tracker server address, one address per line',
                label: 'BT Tracker URL',
                placeholder: 'e.g.: udp://tracker.example.com:6969/announce'
            },
            httpProxyPassword: {
                desc: 'Fill in password if proxy requires authentication',
                label: 'Proxy Password',
                placeholder: 'Optional'
            },
            httpProxySection: 'HTTP Proxy Settings',
            httpProxyUrl: {
                desc: 'Supports HTTP/HTTPS/SOCKS5 proxy, format: http://host:port',
                label: 'Proxy URL',
                placeholder: 'http://127.0.0.1:7890'
            },
            httpProxyUser: {
                desc: 'Fill in username if proxy requires authentication',
                label: 'Proxy Username',
                placeholder: 'Optional'
            },
            proxyTestFailed: 'Proxy connection failed',
            proxyTestNetworkError: 'Network request failed, please check if backend service is running',
            proxyTestSuccess: 'Proxy connection successful! Response time: {elapsed}, HTTP status: {status}',
            proxyTestUrl: {
                desc: 'Target URL to test proxy connectivity',
                label: 'Test Server URL',
                placeholder: 'https://www.google.com/generate_204'
            },
            secret: {
                desc: 'Authentication secret for connecting to aria2 service',
                label: 'RPC Secret',
                placeholder: 'Enter secret'
            },
            serverUrl: {
                desc: 'API address for connecting to download service',
                label: 'Backend Service URL',
                placeholder: 'http://127.0.0.1:8080'
            },
            testProxyConnection: {
                buttonText: 'Test Connection',
                desc: 'Test if can connect to specified server through proxy',
                label: 'Test Proxy Connection'
            },
            timeout: {
                desc: 'Maximum wait time for backend API requests, in seconds',
                label: 'Connection Timeout'
            }
        },
        confirmReset: {
            message: 'This action will reset all settings to their default values. Are you sure you want to continue?',
            title: 'Confirm Reset to Default'
        },
        download: {
            addPath: 'Add Save Path',
            defaultPathLabel: 'Default',
            defaultSavePaths: 'Default Save Paths',
            downloadLimit: {
                desc: 'Set to 0 for no limit, unit KB/s',
                label: 'Global Download Limit'
            },
            keepSeeding: {
                desc: 'Continue uploading and sharing after BT tasks are completed',
                label: 'Keep Seeding After Completion'
            },
            maxActiveDownloads: {
                desc: 'Limit the number of tasks in downloading state at the same time',
                label: 'Max Active Downloads'
            },
            maxConnections: {
                desc: 'Max connections per server for multi-threaded downloading, range 1-16',
                label: 'Download Threads'
            },
            pathLabelPlaceholder: 'Label',
            pathPlaceholder: 'Path',
            uploadLimit: {
                desc: 'Set to 0 for unlimited, unit KB/s',
                label: 'Upload Speed Limit'
            }
        },
        general: {
            autoStart: {
                desc: 'Automatically open the download manager after system startup',
                label: 'Auto-start on Boot'
            },
            downloadPath: {
                desc: 'The default location for new download tasks',
                label: 'Default Save Path',
                placeholder: 'Please select a download path'
            },
            minimizeToTray: {
                desc: 'Keep the program running in the background after clicking the close button',
                label: 'Minimize to Tray on Close'
            },
            reset: {
                desc: 'Reset all settings to their default values'
            }
        },
        sections: {
            appearance: 'Appearance Settings',
            connection: 'Connection Settings',
            download: 'Download Settings',
            general: 'General Settings'
        },
        subtitle: 'Manage app, download, connection, and appearance preferences',
        tabs: {
            about: 'About',
            appearance: 'Appearance',
            aria2: 'Aria2',
            download: 'Download',
            user: 'User'
        },
        title: 'Settings',
        user: {
            changePassword: 'Change Password',
            changePasswordError: 'Failed to change password, please try again',
            confirmPassword: 'Confirm New Password',
            confirmPasswordDesc: 'Enter your new password again',
            confirmPasswordPlaceholder: 'Enter new password again',
            newPassword: 'New Password',
            newPasswordDesc: 'Enter your new password (at least 6 characters)',
            newPasswordPlaceholder: 'Enter new password',
            newPasswordRequired: 'New password is required',
            newPasswordTooShort: 'New password must be at least 6 characters',
            oldPassword: 'Old Password',
            oldPasswordDesc: 'Enter your current password',
            oldPasswordPlaceholder: 'Enter old password',
            oldPasswordRequired: 'Old password is required',
            passwordNotMatch: 'Passwords do not match',
            updatePassword: 'Update Password'
        }
    },
    sidebar: {
        active: 'Active',
        all: 'All Tasks',
        category: 'Categories',
        categoryAll: 'All',
        categoryAudio: 'Audio',
        categoryDoc: 'Document',
        categorySoftware: 'Software',
        categoryVideo: 'Video',
        categoryZip: 'Archive',
        completed: 'Completed',
        downloading: 'Downloading',
        error: 'Error',
        features: 'Features',
        menu: 'Menu',
        paused: 'Paused',
        seeding: 'Seeding',
        settings: 'Settings',
        status: 'Status',
        title: 'Downloader',
        torrents: 'Torrents'
    },
    taskPage: {
        actions: 'Actions',
        addTask: 'Add Task',
        availableSpace: 'Available Space',
        batchOperation: 'Batch Operation',
        collapse: 'Collapse',
        completed: 'Completed',
        completedSize: 'Downloaded',
        delete: 'Delete',
        deleteAllTasks: 'Delete All Tasks',
        deleteAllTasksConfirm: 'Are you sure you want to delete all tasks in this list? This action cannot be undone.',
        deleteLocalFile: 'Also delete local files',
        deleteSelected: 'Delete Selected',
        deleteSelectedTasks: 'Delete Selected Tasks',
        deleteSelectedTasksConfirm: 'Are you sure you want to delete {count} selected tasks? This action cannot be undone.',
        deleteTask: 'Delete Task',
        deleteTaskConfirm: 'Are you sure you want to delete this task? This action cannot be undone.',
        downloadSpeed: 'Download Speed',
        downloading: 'Downloading',
        downloadingCount: 'Downloading',
        error: 'Error',
        expand: 'Expand',
        fileName: 'File Name',
        openFile: 'Open File',
        openFolder: 'Open Folder',
        pause: 'Pause',
        pauseSelected: 'Pause Selected',
        paused: 'Paused',
        pieces: 'Piece Progress',
        progress: 'Progress',
        search: 'Search tasks',
        selectedCount: '{count} items selected',
        size: 'Size',
        speed: 'Speed',
        start: 'Start',
        startSelected: 'Start Selected',
        status: 'Status',
        torrentFileList: 'Torrent File List',
        totalSize: 'Total Size',
        totalTasks: 'Total Tasks',
        uploadSpeed: 'Upload Speed',
        waiting: 'Waiting'
    }
}