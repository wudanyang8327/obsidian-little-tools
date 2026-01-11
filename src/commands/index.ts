import LittleToolsPlugin from '../main';
import { registerFillBlankLinesCommand } from './fillBlankLines';

export function registerCommands(plugin: LittleToolsPlugin) {
	registerFillBlankLinesCommand(plugin);
}
