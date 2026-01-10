import MyPlugin from '../main';
import { registerFillBlankLinesCommand } from './fillBlankLines';

export function registerCommands(plugin: MyPlugin) {
	registerFillBlankLinesCommand(plugin);
}
