import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SettingTab } from './settings';
import { registerCommands } from './commands';
import { registerCursorMemory } from './cursorMemory';

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));
		registerCommands(this);
		registerCursorMemory(this);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
