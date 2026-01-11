import { MarkdownView, Notice } from 'obsidian';
import MyPlugin from '../main';

const FENCE_RE = /^\s*(```|~~~)/;
const PLACEHOLDER = '<span style="color:#000000;">&nbsp;</span>';

function isTableSeparatorRow(line: string): boolean {
	// Matches: | --- | :---: | ---: |
	return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function looksLikeTableHeaderRow(line: string): boolean {
	// Conservative: must contain at least one pipe.
	// (We avoid treating normal text as table header.)
	return line.includes('|');
}

function isTableStartingAt(lines: string[], index: number): boolean {
	// Table start requires header row + separator row.
	if (index < 0 || index >= lines.length) return false;
	if (index + 1 >= lines.length) return false;

	const header = lines[index] ?? '';
	const sep = lines[index + 1] ?? '';

	if (!looksLikeTableHeaderRow(header)) return false;
	if (!isTableSeparatorRow(sep)) return false;

	return true;
}

function shouldSkipPlaceholderBecauseNextIsTable(lines: string[], blankLineIndex: number): boolean {
	const nextLineIndex = blankLineIndex + 1;
	if (nextLineIndex >= lines.length) return false;
	const nextLine = lines[nextLineIndex] ?? '';
	if (nextLine.trim().length === 0) return false;

	return isTableStartingAt(lines, nextLineIndex);
}

export function registerFillBlankLinesCommand(plugin: MyPlugin) {
	plugin.addCommand({
		id: 'fill-blank-lines-with-space',
		name: '给空行添加空格占位（跳过表格前一行）',
		checkCallback: (checking) => {
			if (!plugin.settings.fillBlankLinesWithSpace) return false;
			const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return false;
			if (checking) return true;

			const editor = view.editor;
			const original = editor.getValue();
			const cursor = editor.getCursor();

			const lines = original.split(/\r?\n/);
			let inFence = false;
			let changed = 0;

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i] ?? '';
				if (FENCE_RE.test(line)) {
					inFence = !inFence;
					continue;
				}
				if (inFence) continue;

				if (/^\s*$/.test(line)) {
					if (plugin.settings.skipSpaceBeforeTables && shouldSkipPlaceholderBecauseNextIsTable(lines, i)) {
						// Keep it truly blank
						if (line !== '') {
							lines[i] = '';
							changed++;
						}
						continue;
					}

					// Normalize blank/whitespace-only line into placeholder
					if (line !== PLACEHOLDER) {
						lines[i] = PLACEHOLDER;
						changed++;
					}
				}
			}

			if (changed === 0) {
				new Notice('没有需要处理的空行');
				return true;
			}

			const next = lines.join('\n');
			editor.setValue(next);
			editor.setCursor(cursor);
			new Notice(`已处理 ${changed} 行空行`);
			return true;
		},
	});
}
