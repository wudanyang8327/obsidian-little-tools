import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LittleToolsSettingTab, LittleToolsSettings } from './settings';
import { registerCommands } from './commands';
import { registerCursorMemory } from './cursorMemory';

export default class LittleToolsPlugin extends Plugin {
	settings: LittleToolsSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LittleToolsSettingTab(this.app, this));
		registerCommands(this);
		registerCursorMemory(this);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<LittleToolsSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
