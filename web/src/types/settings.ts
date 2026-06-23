import type {
    SettingValue as CommonSettingValue,
    SavePath as CommonSavePath,
    SettingKey as CommonSettingKey,
    SettingConfig as CommonSettingConfig,
    SettingsState as CommonSettingsState,
} from "../../../common/types";

export type SettingValue = CommonSettingValue;
export interface SavePath extends CommonSavePath {}
export type SettingKey = CommonSettingKey;
export interface SettingConfig extends Omit<CommonSettingConfig, 'created_at'> {
    created_at?: number;
}
export interface SettingsState extends CommonSettingsState {}