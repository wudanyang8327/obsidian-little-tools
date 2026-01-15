import LittleToolsPlugin from '../main';
import { registerFillBlankLinesCommand } from './fillBlankLines';
import { registerSyncOrderDataCommand } from './syncOrderData';

export function registerCommands(plugin: LittleToolsPlugin) {
	registerFillBlankLinesCommand(plugin);
	registerSyncOrderDataCommand(plugin);
}
