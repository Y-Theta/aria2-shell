/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * aria2 JSON-RPC TypeScript Client
 *
 * 默认 RPC 地址：
 * http://localhost:6800/jsonrpc
 *
 * 如果 aria2 启动时设置了：
 * --rpc-secret=your_secret
 *
 * 那么 JSON-RPC params 第一个参数需要是：
 * token:your_secret
 */

export type JsonRpcVersion = "2.0";

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest<
  TMethod extends string = string,
  TParams extends unknown[] = unknown[]
> {
  jsonrpc: JsonRpcVersion;
  id: JsonRpcId;
  method: TMethod;
  params?: TParams;
}

export interface JsonRpcSuccess<TResult = unknown> {
  jsonrpc: JsonRpcVersion;
  id: JsonRpcId;
  result: TResult;
}

export interface JsonRpcFailure {
  jsonrpc: JsonRpcVersion;
  id: JsonRpcId;
  error: JsonRpcErrorObject;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
}

export type JsonRpcResponse<TResult = unknown> =
  | JsonRpcSuccess<TResult>
  | JsonRpcFailure;

export type Awaitable<T> = T | Promise<T>;

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export interface Aria2ClientConfig {
  /**
   * aria2 JSON-RPC 地址
   *
   * @default "http://localhost:6800/jsonrpc"
   */
  url?: string;

  /**
   * aria2 RPC Secret
   *
   * 启动 aria2 时：
   * aria2c --enable-rpc=true --rpc-secret=xxx
   */
  secret?: string;

  /**
   * 自定义 fetch
   *
   * Node.js 18+ 和浏览器默认都有 fetch。
   * 如果你在 Node.js 16，可传入 node-fetch / undici。
   */
  fetch?: FetchLike;

  /**
   * 是否自动注入 token:secret
   *
   * @default true
   */
  autoToken?: boolean;

  /**
   * 请求超时时间，单位 ms
   *
   * @default 0 不超时
   */
  timeoutMs?: number;

  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;

  /**
   * 自定义 id 生成器
   */
  idGenerator?: () => JsonRpcId;
}

export class Aria2RpcError extends Error {
  public readonly code: number;
  public readonly response: JsonRpcFailure;

  constructor(response: JsonRpcFailure) {
    super(response.error.message);
    this.name = "Aria2RpcError";
    this.code = response.error.code;
    this.response = response;
  }
}

export class Aria2HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly bodyText?: string;

  constructor(status: number, statusText: string, bodyText?: string) {
    super(`HTTP Error: ${status} ${statusText}`);
    this.name = "Aria2HttpError";
    this.status = status;
    this.statusText = statusText;
    this.bodyText = bodyText;
  }
}

/**
 * aria2 GID
 */
export type Aria2Gid = string;

/**
 * aria2 中很多数字都以字符串返回
 *
 * 例如：
 * totalLength: "1024"
 * downloadSpeed: "100"
 */
export type Aria2NumericString = string;

/**
 * aria2 中很多布尔值以字符串返回
 */
export type Aria2BooleanString = "true" | "false";

/**
 * aria2 任务状态
 */
export type Aria2DownloadStatus =
  | "active"
  | "waiting"
  | "paused"
  | "error"
  | "complete"
  | "removed";

/**
 * changePosition 的 how 参数
 */
export type Aria2PositionHow = "POS_SET" | "POS_CUR" | "POS_END";

/**
 * URI 状态
 */
export type Aria2UriStatus = "used" | "waiting";

/**
 * 常见 aria2 option 值类型
 *
 * 注意：aria2 RPC 中 option value 通常是 string。
 * 为了方便使用，这里允许 string | number | boolean。
 * 发送前不会强制转换，aria2 通常也能接受字符串形式。
 */
export type Aria2OptionValue = string | number | boolean;

export type Aria2Options = Record<string, Aria2OptionValue>;

export type Aria2OptionMap = Record<string, string>;

export interface Aria2Uri {
  uri: string;
  status: Aria2UriStatus | string;
}

export interface Aria2File {
  /**
   * 文件索引，从 1 开始，字符串
   */
  index: string;

  /**
   * 文件路径
   */
  path: string;

  /**
   * 文件大小，字节，字符串
   */
  length: Aria2NumericString;

  /**
   * 已完成大小，字节，字符串
   */
  completedLength: Aria2NumericString;

  /**
   * 是否选中下载
   */
  selected: Aria2BooleanString;

  /**
   * URI 列表
   */
  uris: Aria2Uri[];
}

export interface Aria2Peer {
  peerId?: string;
  ip: string;
  port: string;

  bitfield?: string;

  amChoking: Aria2BooleanString;
  peerChoking: Aria2BooleanString;

  downloadSpeed: Aria2NumericString;
  uploadSpeed: Aria2NumericString;

  seeder?: Aria2BooleanString;
}

export interface Aria2Server {
  index: string;
  servers: Array<{
    uri: string;
    currentUri: string;
    downloadSpeed: Aria2NumericString;
  }>;
}

export interface Aria2BtFileMode {
  mode?: "single" | "multi";
}

export interface Aria2BtAnnounceList {
  announceList?: string[][];
}

export interface Aria2BtInfo {
  name?: string;
}

export interface Aria2Bittorrent {
  announceList?: string[][];
  comment?: string;
  creationDate?: string;
  mode?: "single" | "multi";
  info?: Aria2BtInfo;
}

/**
 * tellStatus 返回结构
 *
 * aria2 实际返回字段与任务类型、状态、请求 keys 有关。
 */
export interface Aria2Status {
  gid: Aria2Gid;

  status: Aria2DownloadStatus;

  totalLength: Aria2NumericString;
  completedLength: Aria2NumericString;
  uploadLength: Aria2NumericString;

  bitfield?: string;

  downloadSpeed: Aria2NumericString;
  uploadSpeed: Aria2NumericString;

  infoHash?: string;
  numSeeders?: Aria2NumericString;
  seeder?: Aria2BooleanString;

  pieceLength?: Aria2NumericString;
  numPieces?: Aria2NumericString;

  connections: Aria2NumericString;

  errorCode?: string;
  errorMessage?: string;

  followedBy?: Aria2Gid[];
  following?: Aria2Gid;
  belongsTo?: Aria2Gid;

  dir: string;

  files: Aria2File[];

  bittorrent?: Aria2Bittorrent;

  verifiedLength?: Aria2NumericString;
  verifyIntegrityPending?: Aria2BooleanString;
}

/**
 * tellStatus / tellActive / tellWaiting / tellStopped 可选择返回的 keys
 */
export type Aria2StatusKey =
  | "gid"
  | "status"
  | "totalLength"
  | "completedLength"
  | "uploadLength"
  | "bitfield"
  | "downloadSpeed"
  | "uploadSpeed"
  | "infoHash"
  | "numSeeders"
  | "seeder"
  | "pieceLength"
  | "numPieces"
  | "connections"
  | "errorCode"
  | "errorMessage"
  | "followedBy"
  | "following"
  | "belongsTo"
  | "dir"
  | "files"
  | "bittorrent"
  | "verifiedLength"
  | "verifyIntegrityPending";

export interface Aria2GlobalStat {
  downloadSpeed: Aria2NumericString;
  uploadSpeed: Aria2NumericString;
  numActive: Aria2NumericString;
  numWaiting: Aria2NumericString;
  numStopped: Aria2NumericString;
  numStoppedTotal: Aria2NumericString;
}

export interface Aria2Version {
  version: string;
  enabledFeatures: string[];
}

export interface Aria2SessionInfo {
  sessionId: string;
}

export interface Aria2MulticallItem {
  methodName: Aria2Method | string;
  params?: unknown[];
}

export type Aria2MulticallResult<T = unknown> = T[];

/**
 * aria2 JSON-RPC 方法名
 */
export type Aria2Method =
  | "aria2.addUri"
  | "aria2.addTorrent"
  | "aria2.addMetalink"
  | "aria2.remove"
  | "aria2.forceRemove"
  | "aria2.pause"
  | "aria2.pauseAll"
  | "aria2.forcePause"
  | "aria2.forcePauseAll"
  | "aria2.unpause"
  | "aria2.unpauseAll"
  | "aria2.tellStatus"
  | "aria2.getUris"
  | "aria2.getFiles"
  | "aria2.getPeers"
  | "aria2.getServers"
  | "aria2.tellActive"
  | "aria2.tellWaiting"
  | "aria2.tellStopped"
  | "aria2.changePosition"
  | "aria2.changeUri"
  | "aria2.getOption"
  | "aria2.changeOption"
  | "aria2.getGlobalOption"
  | "aria2.changeGlobalOption"
  | "aria2.getGlobalStat"
  | "aria2.purgeDownloadResult"
  | "aria2.removeDownloadResult"
  | "aria2.getVersion"
  | "aria2.getSessionInfo"
  | "aria2.shutdown"
  | "aria2.forceShutdown"
  | "aria2.saveSession"
  | "system.multicall"
  | "system.listMethods"
  | "system.listNotifications";

/**
 * 方法参数映射
 */
export interface Aria2MethodParamsMap {
  "aria2.addUri": [
    uris: string[],
    options?: Aria2Options,
    position?: number
  ];

  "aria2.addTorrent": [
    torrent: string,
    uris?: string[],
    options?: Aria2Options,
    position?: number
  ];

  "aria2.addMetalink": [
    metalink: string,
    options?: Aria2Options,
    position?: number
  ];

  "aria2.remove": [gid: Aria2Gid];
  "aria2.forceRemove": [gid: Aria2Gid];

  "aria2.pause": [gid: Aria2Gid];
  "aria2.pauseAll": [];
  "aria2.forcePause": [gid: Aria2Gid];
  "aria2.forcePauseAll": [];

  "aria2.unpause": [gid: Aria2Gid];
  "aria2.unpauseAll": [];

  "aria2.tellStatus": [gid: Aria2Gid, keys?: Aria2StatusKey[] | string[]];

  "aria2.getUris": [gid: Aria2Gid];
  "aria2.getFiles": [gid: Aria2Gid];
  "aria2.getPeers": [gid: Aria2Gid];
  "aria2.getServers": [gid: Aria2Gid];

  "aria2.tellActive": [keys?: Aria2StatusKey[] | string[]];

  "aria2.tellWaiting": [
    offset: number,
    num: number,
    keys?: Aria2StatusKey[] | string[]
  ];

  "aria2.tellStopped": [
    offset: number,
    num: number,
    keys?: Aria2StatusKey[] | string[]
  ];

  "aria2.changePosition": [
    gid: Aria2Gid,
    pos: number,
    how: Aria2PositionHow
  ];

  /**
   * changeUri(gid, fileIndex, delUris, addUris, position?)
   *
   * fileIndex 是从 1 开始的文件索引。
   */
  "aria2.changeUri": [
    gid: Aria2Gid,
    fileIndex: number,
    delUris: string[],
    addUris: string[],
    position?: number
  ];

  "aria2.getOption": [gid: Aria2Gid];

  "aria2.changeOption": [gid: Aria2Gid, options: Aria2Options];

  "aria2.getGlobalOption": [];

  "aria2.changeGlobalOption": [options: Aria2Options];

  "aria2.getGlobalStat": [];

  "aria2.purgeDownloadResult": [];

  "aria2.removeDownloadResult": [gid: Aria2Gid];

  "aria2.getVersion": [];

  "aria2.getSessionInfo": [];

  "aria2.shutdown": [];

  "aria2.forceShutdown": [];

  "aria2.saveSession": [];

  "system.multicall": [methods: Aria2MulticallItem[]];

  "system.listMethods": [];

  "system.listNotifications": [];
}

/**
 * 方法返回值映射
 */
export interface Aria2MethodResultMap {
  /**
   * 返回新任务 gid
   */
  "aria2.addUri": Aria2Gid;

  /**
   * 返回新任务 gid
   */
  "aria2.addTorrent": Aria2Gid;

  /**
   * 返回新增任务 gid 数组
   */
  "aria2.addMetalink": Aria2Gid[];

  /**
   * remove / forceRemove 返回被移除任务 gid
   */
  "aria2.remove": Aria2Gid;
  "aria2.forceRemove": Aria2Gid;

  /**
   * pause / forcePause / unpause 返回 gid
   */
  "aria2.pause": Aria2Gid;
  "aria2.forcePause": Aria2Gid;
  "aria2.unpause": Aria2Gid;

  /**
   * pauseAll / forcePauseAll / unpauseAll 返回 OK
   */
  "aria2.pauseAll": "OK";
  "aria2.forcePauseAll": "OK";
  "aria2.unpauseAll": "OK";

  "aria2.tellStatus": Aria2Status;

  "aria2.getUris": Aria2Uri[];

  "aria2.getFiles": Aria2File[];

  "aria2.getPeers": Aria2Peer[];

  "aria2.getServers": Aria2Server[];

  "aria2.tellActive": Aria2Status[];

  "aria2.tellWaiting": Aria2Status[];

  "aria2.tellStopped": Aria2Status[];

  /**
   * 返回新位置
   */
  "aria2.changePosition": number;

  /**
   * changeUri 返回：
   * [删除的 URI 数量, 添加的 URI 数量]
   */
  "aria2.changeUri": [number, number];

  "aria2.getOption": Aria2OptionMap;

  "aria2.changeOption": "OK";

  "aria2.getGlobalOption": Aria2OptionMap;

  "aria2.changeGlobalOption": "OK";

  "aria2.getGlobalStat": Aria2GlobalStat;

  "aria2.purgeDownloadResult": "OK";

  "aria2.removeDownloadResult": "OK";

  "aria2.getVersion": Aria2Version;

  "aria2.getSessionInfo": Aria2SessionInfo;

  "aria2.shutdown": "OK";

  "aria2.forceShutdown": "OK";

  "aria2.saveSession": "OK";

  "system.multicall": unknown[];

  "system.listMethods": string[];

  "system.listNotifications": string[];
}

export type Aria2Params<TMethod extends Aria2Method> =
  Aria2MethodParamsMap[TMethod];

export type Aria2Result<TMethod extends Aria2Method> =
  Aria2MethodResultMap[TMethod];

export interface BatchCall<TMethod extends Aria2Method = Aria2Method> {
  method: TMethod;
  params?: Aria2Params<TMethod>;
  id?: JsonRpcId;
}

export interface BatchResult<T = unknown> {
  id: JsonRpcId;
  result: T;
}
