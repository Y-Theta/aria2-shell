import {
    FetchLike,
    JsonRpcId, 
    JsonRpcRequest, 
    JsonRpcResponse,
    JsonRpcSuccess, 
    Aria2ClientConfig,
    Aria2File,
    Aria2Gid,
    Aria2GlobalStat,
    Aria2HttpError,
    Aria2Method,
    Aria2MulticallItem,
    Aria2OptionMap,
    Aria2Options,
    Aria2Params,
    Aria2Peer,
    Aria2PositionHow,
    Aria2Result,
    Aria2RpcError,
    Aria2Server,
    Aria2SessionInfo,
    Aria2Status,
    Aria2StatusKey,
    Aria2Uri,
    Aria2Version,
    BatchCall,
} from '../types/aria2';

export class Aria2Client {
    private readonly url: string;
    private readonly secret?: string;
    private readonly fetchImpl: FetchLike;
    private readonly autoToken: boolean;
    private readonly timeoutMs: number;
    private readonly headers: Record<string, string>;
    private readonly idGenerator: () => JsonRpcId;

    constructor(config: Aria2ClientConfig = {}) {
        this.url = config.url ?? "http://localhost:6800/jsonrpc";
        this.secret = config.secret;
        this.fetchImpl = config.fetch ?? fetch.bind(globalThis);
        this.autoToken = config.autoToken ?? true;
        this.timeoutMs = config.timeoutMs ?? 0;
        this.headers = config.headers ?? {};
        this.idGenerator =
            config.idGenerator ??
            (() => `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    }

    /**
     * 原始 JSON-RPC 调用，强类型。
     *
     * 如果配置了 secret，会自动在 params 前插入 token:secret。
     */
    async call<TMethod extends Aria2Method>(
        method: TMethod,
        ...params: Aria2Params<TMethod>
    ): Promise<Aria2Result<TMethod>> {
        const id = this.idGenerator();

        const body: JsonRpcRequest<TMethod, unknown[]> = {
            jsonrpc: "2.0",
            id,
            method,
            params: this.injectSecret(params),
        };

        const response = await this.post<JsonRpcResponse<Aria2Result<TMethod>>>(
            body
        );

        if ("error" in response) {
            throw new Aria2RpcError(response);
        }

        return response.result;
    }

    /**
     * 调用任意方法。
     *
     * 适合 aria2 新版本增加了方法，但当前类型还没覆盖的情况。
     */
    async callRaw<TResult = unknown>(
        method: string,
        params: unknown[] = []
    ): Promise<TResult> {
        const body: JsonRpcRequest<string, unknown[]> = {
            jsonrpc: "2.0",
            id: this.idGenerator(),
            method,
            params: this.injectSecret(params),
        };

        const response = await this.post<JsonRpcResponse<TResult>>(body);

        if ("error" in response) {
            throw new Aria2RpcError(response);
        }

        return response.result;
    }

    /**
     * JSON-RPC batch 请求。
     *
     * 注意：
     * - 这是 JSON-RPC 规范中的批量请求，body 是数组。
     * - 返回顺序理论上不保证一定与请求顺序一致，所以这里返回原始响应数组。
     */
    async batch(
        calls: BatchCall[]
    ): Promise<Array<JsonRpcResponse<unknown>>> {
        const body: JsonRpcRequest[] = calls.map((item) => ({
            jsonrpc: "2.0",
            id: item.id ?? this.idGenerator(),
            method: item.method,
            params: this.injectSecret(item.params ?? []),
        }));

        const response = await this.post<Array<JsonRpcResponse<unknown>>>(body);

        for (const item of response) {
            if ("error" in item) {
                throw new Aria2RpcError(item);
            }
        }

        return response;
    }

    /**
     * JSON-RPC batch 请求，并按 id 返回 Map。
     */
    async batchMap(
        calls: BatchCall[]
    ): Promise<Map<JsonRpcId, JsonRpcSuccess<unknown>>> {
        const responses = await this.batch(calls);
        const map = new Map<JsonRpcId, JsonRpcSuccess<unknown>>();

        for (const item of responses) {
            if ("result" in item) {
                map.set(item.id, item);
            }
        }

        return map;
    }

    /**
     * aria2.addUri(uris[, options[, position]])
     *
     * 添加 HTTP/FTP/SFTP/BitTorrent Magnet URI。
     */
    addUri(
        uris: string[],
        options?: Aria2Options,
        position?: number
    ): Promise<Aria2Gid> {
        return this.call("aria2.addUri", uris, options, position);
    }

    /**
     * aria2.addTorrent(torrent[, uris[, options[, position]]])
     *
     * torrent 需要是 base64 编码后的 .torrent 文件内容。
     */
    addTorrent(
        torrent: string,
        uris?: string[],
        options?: Aria2Options,
        position?: number
    ): Promise<Aria2Gid> {
        return this.call("aria2.addTorrent", torrent, uris, options, position);
    }

    /**
     * aria2.addMetalink(metalink[, options[, position]])
     *
     * metalink 需要是 base64 编码后的 metalink 文件内容。
     */
    addMetalink(
        metalink: string,
        options?: Aria2Options,
        position?: number
    ): Promise<Aria2Gid[]> {
        return this.call("aria2.addMetalink", metalink, options, position);
    }

    /**
     * aria2.remove(gid)
     *
     * 删除下载任务。
     */
    remove(gid: Aria2Gid): Promise<Aria2Gid> {
        return this.call("aria2.remove", gid);
    }

    /**
     * aria2.forceRemove(gid)
     *
     * 强制删除下载任务。
     */
    forceRemove(gid: Aria2Gid): Promise<Aria2Gid> {
        return this.call("aria2.forceRemove", gid);
    }

    /**
     * aria2.pause(gid)
     *
     * 暂停任务。
     */
    pause(gid: Aria2Gid): Promise<Aria2Gid> {
        return this.call("aria2.pause", gid);
    }

    /**
     * aria2.pauseAll()
     *
     * 暂停所有任务。
     */
    pauseAll(): Promise<"OK"> {
        return this.call("aria2.pauseAll");
    }

    /**
     * aria2.forcePause(gid)
     *
     * 强制暂停任务。
     */
    forcePause(gid: Aria2Gid): Promise<Aria2Gid> {
        return this.call("aria2.forcePause", gid);
    }

    /**
     * aria2.forcePauseAll()
     *
     * 强制暂停所有任务。
     */
    forcePauseAll(): Promise<"OK"> {
        return this.call("aria2.forcePauseAll");
    }

    /**
     * aria2.unpause(gid)
     *
     * 恢复任务。
     */
    unpause(gid: Aria2Gid): Promise<Aria2Gid> {
        return this.call("aria2.unpause", gid);
    }

    /**
     * aria2.unpauseAll()
     *
     * 恢复所有任务。
     */
    unpauseAll(): Promise<"OK"> {
        return this.call("aria2.unpauseAll");
    }

    /**
     * aria2.tellStatus(gid[, keys])
     *
     * 获取任务状态。
     */
    tellStatus(
        gid: Aria2Gid,
        keys?: Aria2StatusKey[] | string[]
    ): Promise<Aria2Status> {
        return this.call("aria2.tellStatus", gid, keys);
    }

    /**
     * aria2.getUris(gid)
     *
     * 获取任务 URI。
     */
    getUris(gid: Aria2Gid): Promise<Aria2Uri[]> {
        return this.call("aria2.getUris", gid);
    }

    /**
     * aria2.getFiles(gid)
     *
     * 获取任务文件列表。
     */
    getFiles(gid: Aria2Gid): Promise<Aria2File[]> {
        return this.call("aria2.getFiles", gid);
    }

    /**
     * aria2.getPeers(gid)
     *
     * 获取 BitTorrent peer 列表。
     */
    getPeers(gid: Aria2Gid): Promise<Aria2Peer[]> {
        return this.call("aria2.getPeers", gid);
    }

    /**
     * aria2.getServers(gid)
     *
     * 获取服务器连接信息。
     */
    getServers(gid: Aria2Gid): Promise<Aria2Server[]> {
        return this.call("aria2.getServers", gid);
    }

    /**
     * aria2.tellActive([keys])
     *
     * 获取活动任务。
     */
    tellActive(keys?: Aria2StatusKey[] | string[]): Promise<Aria2Status[]> {
        return this.call("aria2.tellActive", keys);
    }

    /**
     * aria2.tellWaiting(offset, num[, keys])
     *
     * 获取等待任务。
     */
    tellWaiting(
        offset: number,
        num: number,
        keys?: Aria2StatusKey[] | string[]
    ): Promise<Aria2Status[]> {
        return this.call("aria2.tellWaiting", offset, num, keys);
    }

    /**
     * aria2.tellStopped(offset, num[, keys])
     *
     * 获取停止任务。
     */
    tellStopped(
        offset: number,
        num: number,
        keys?: Aria2StatusKey[] | string[]
    ): Promise<Aria2Status[]> {
        return this.call("aria2.tellStopped", offset, num, keys);
    }

    /**
     * aria2.changePosition(gid, pos, how)
     *
     * 修改任务队列位置。
     */
    changePosition(
        gid: Aria2Gid,
        pos: number,
        how: Aria2PositionHow
    ): Promise<number> {
        return this.call("aria2.changePosition", gid, pos, how);
    }

    /**
     * aria2.changeUri(gid, fileIndex, delUris, addUris[, position])
     *
     * 修改任务 URI。
     *
     * 返回：[删除数量, 添加数量]
     */
    changeUri(
        gid: Aria2Gid,
        fileIndex: number,
        delUris: string[],
        addUris: string[],
        position?: number
    ): Promise<[number, number]> {
        return this.call(
            "aria2.changeUri",
            gid,
            fileIndex,
            delUris,
            addUris,
            position
        );
    }

    /**
     * aria2.getOption(gid)
     *
     * 获取任务配置。
     */
    getOption(gid: Aria2Gid): Promise<Aria2OptionMap> {
        return this.call("aria2.getOption", gid);
    }

    /**
     * aria2.changeOption(gid, options)
     *
     * 修改任务配置。
     */
    changeOption(gid: Aria2Gid, options: Aria2Options): Promise<"OK"> {
        return this.call("aria2.changeOption", gid, options);
    }

    /**
     * aria2.getGlobalOption()
     *
     * 获取全局配置。
     */
    getGlobalOption(): Promise<Aria2OptionMap> {
        return this.call("aria2.getGlobalOption");
    }

    /**
     * aria2.changeGlobalOption(options)
     *
     * 修改全局配置。
     */
    changeGlobalOption(options: Aria2Options): Promise<"OK"> {
        return this.call("aria2.changeGlobalOption", options);
    }

    /**
     * aria2.getGlobalStat()
     *
     * 获取全局统计信息。
     */
    getGlobalStat(): Promise<Aria2GlobalStat> {
        return this.call("aria2.getGlobalStat");
    }

    /**
     * aria2.purgeDownloadResult()
     *
     * 清理已完成、错误、删除的结果。
     */
    purgeDownloadResult(): Promise<"OK"> {
        return this.call("aria2.purgeDownloadResult");
    }

    /**
     * aria2.removeDownloadResult(gid)
     *
     * 移除某个下载结果。
     */
    removeDownloadResult(gid: Aria2Gid): Promise<"OK"> {
        return this.call("aria2.removeDownloadResult", gid);
    }

    /**
     * aria2.getVersion()
     *
     * 获取 aria2 版本和启用特性。
     */
    getVersion(): Promise<Aria2Version> {
        return this.call("aria2.getVersion");
    }

    /**
     * aria2.getSessionInfo()
     *
     * 获取 session 信息。
     */
    getSessionInfo(): Promise<Aria2SessionInfo> {
        return this.call("aria2.getSessionInfo");
    }

    /**
     * aria2.shutdown()
     *
     * 正常关闭 aria2。
     */
    shutdown(): Promise<"OK"> {
        return this.call("aria2.shutdown");
    }

    /**
     * aria2.forceShutdown()
     *
     * 强制关闭 aria2。
     */
    forceShutdown(): Promise<"OK"> {
        return this.call("aria2.forceShutdown");
    }

    /**
     * aria2.saveSession()
     *
     * 保存当前 session。
     */
    saveSession(): Promise<"OK"> {
        return this.call("aria2.saveSession");
    }

    /**
     * system.multicall
     *
     * aria2 也支持 system.multicall。
     *
     * 注意：
     * - methodName 使用 aria2.xxx
     * - 如果启用 secret，本方法会为每个子调用自动注入 token。
     */
    async multicall<T = unknown>(
        methods: Aria2MulticallItem[]
    ): Promise<T[]> {
        const normalized = methods.map((item) => ({
            methodName: item.methodName,
            params: this.injectSecret(item.params ?? []),
        }));

        return this.callRaw<T[]>("system.multicall", [normalized]);
    }

    /**
     * system.listMethods()
     *
     * 列出支持的方法。
     */
    listMethods(): Promise<string[]> {
        return this.call("system.listMethods");
    }

    /**
     * system.listNotifications()
     *
     * 列出通知。
     */
    listNotifications(): Promise<string[]> {
        return this.call("system.listNotifications");
    }

    private injectSecret(params: unknown[]): unknown[] {
        if (!this.secret || !this.autoToken) {
            return this.cleanUndefinedTail(params);
        }

        const cleaned = this.cleanUndefinedTail(params);

        if (
            typeof cleaned[0] === "string" &&
            cleaned[0].startsWith("token:")
        ) {
            return cleaned;
        }

        return [`token:${this.secret}`, ...cleaned];
    }

    /**
     * 去掉尾部 undefined，避免可选参数传成 JSON null。
     *
     * 例如：
     * addUri(["url"], undefined, undefined)
     * 应该发送：
     * [["url"]]
     *
     * 而不是：
     * [["url"], null, null]
     */
    private cleanUndefinedTail<T extends unknown[]>(params: T): unknown[] {
        const arr = [...params];

        while (arr.length > 0 && typeof arr[arr.length - 1] === "undefined") {
            arr.pop();
        }

        return arr;
    }

    private async post<TResponse>(body: unknown): Promise<TResponse> {
        const controller =
            this.timeoutMs > 0 ? new AbortController() : undefined;

        const timer =
            controller && this.timeoutMs > 0
                ? setTimeout(() => controller.abort(), this.timeoutMs)
                : undefined;

        try {
            const response = await this.fetchImpl(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...this.headers,
                },
                body: JSON.stringify(body),
                signal: controller?.signal,
            });

            if (!response.ok) {
                let bodyText: string | undefined;

                try {
                    bodyText = await response.text();
                } catch {
                    bodyText = undefined;
                }

                throw new Aria2HttpError(
                    response.status,
                    response.statusText,
                    bodyText
                );
            }

            return (await response.json()) as TResponse;
        } finally {
            if (timer) {
                clearTimeout(timer);
            }
        }
    }
}