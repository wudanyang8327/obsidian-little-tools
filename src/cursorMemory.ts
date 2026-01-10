import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import MyPlugin from './main';

type CursorPos = { line: number; ch: number };

type StoredCursor = {
	filePath: string;
	pos: CursorPos;
};

function getMarkdownView(leaf: WorkspaceLeaf | null): MarkdownView | null {
	if (!leaf) return null;
	const view = leaf.view;
	return view instanceof MarkdownView ? view : null;
}

export function registerCursorMemory(plugin: MyPlugin) {
	// In-memory only: avoids growing plugin data; enough to stop "always first line" during a session.
	const cursorByPath = new Map<string, CursorPos>();
	let lastActive: StoredCursor | null = null;

	function snapshotFromLeaf(leaf: WorkspaceLeaf | null) {
		const view = getMarkdownView(leaf);
		if (!view) return;
		const filePath = view.file?.path;
		if (!filePath) return;

		try {
			const pos = view.editor.getCursor();
			cursorByPath.set(filePath, pos);
			lastActive = { filePath, pos };
		} catch {
			// Ignore: editor not ready
		}
	}

	function restoreToLeaf(leaf: WorkspaceLeaf | null) {
		if (!plugin.settings.rememberCursorOnSwitch) return;
		const view = getMarkdownView(leaf);
		if (!view) return;
		const filePath = view.file?.path;
		if (!filePath) return;

		const stored = cursorByPath.get(filePath);
		if (!stored) return;

		// Defer to ensure editor is ready & file content is loaded.
		window.setTimeout(() => {
			try {
				view.editor.setCursor(stored);
			} catch {
				// Ignore
			}
		}, 0);
	}

	// Track switches between leaves (tabs/notes).
	let prevLeaf: WorkspaceLeaf | null = plugin.app.workspace.getMostRecentLeaf();
	if (prevLeaf) snapshotFromLeaf(prevLeaf);

	plugin.registerEvent(
		plugin.app.workspace.on('active-leaf-change', (leaf) => {
			if (prevLeaf && prevLeaf !== leaf) snapshotFromLeaf(prevLeaf);
			prevLeaf = leaf;
			restoreToLeaf(leaf);
		})
	);

	// Also snapshot when opening a file directly.
	plugin.registerEvent(
		plugin.app.workspace.on('file-open', () => {
			const leaf = plugin.app.workspace.getMostRecentLeaf();
			restoreToLeaf(leaf);
		})
	);

	// Best-effort: when unloading, store current active cursor in-memory (no-op effectively).
	plugin.register(() => {
		if (lastActive) cursorByPath.set(lastActive.filePath, lastActive.pos);
	});
}
