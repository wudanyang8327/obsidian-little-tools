import { App, PluginSettingTab, Setting } from 'obsidian';
import LittleToolsPlugin from './main';

export interface LittleToolsSettings {
	fillBlankLinesWithSpace: boolean;
	skipSpaceBeforeTables: boolean;
	rememberCursorOnSwitch: boolean;
}

export const DEFAULT_SETTINGS: LittleToolsSettings = {
	fillBlankLinesWithSpace: true,
	skipSpaceBeforeTables: true,
	rememberCursorOnSwitch: true,
};

export class LittleToolsSettingTab extends PluginSettingTab {
	plugin: LittleToolsPlugin;

	constructor(app: App, plugin: LittleToolsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('空行添加空格占位')
			.setDesc('开启后可使用命令一键给空行写入占位符（防止阅读模式隐藏空行）。')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.fillBlankLinesWithSpace)
					.onChange(async (value) => {
						this.plugin.settings.fillBlankLinesWithSpace = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('表格前一行不添加占位符')
			.setDesc('避免影响 Markdown 表格解析。')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.skipSpaceBeforeTables)
					.onChange(async (value) => {
						this.plugin.settings.skipSpaceBeforeTables = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('切换文档时记住光标位置')
			.setDesc('切换到其他 Markdown 文档时，恢复该文档上次的光标位置（避免总是落到第一行）。')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.rememberCursorOnSwitch)
					.onChange(async (value) => {
						this.plugin.settings.rememberCursorOnSwitch = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
