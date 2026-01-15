import { Notice } from 'obsidian';
import LittleToolsPlugin from '../main';


export function registerSyncOrderDataCommand(plugin: LittleToolsPlugin) {
	plugin.addCommand({
		id: 'sync-order-data',
		name: '同步排序数据到 HTML 文件',
		callback: async () => {
			// 仅桌面端支持
			if ('isMobile' in plugin.app && plugin.app.isMobile) {
				new Notice('该命令仅支持桌面端 Obsidian');
				return;
			}

			// 动态引入 Node.js 模块
			let fs: typeof import('fs');
			let path: typeof import('path');
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				fs = window.require('fs');
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				path = window.require('path');
			} catch {
				new Notice('无法加载 Node.js 模块，无法执行。');
				return;
			}

			try {
				// 获取 vault 路径
				const adapter = plugin.app.vault.adapter;
				if (!('basePath' in adapter)) {
					new Notice('无法获取 vault 路径');
					return;
				}
				const vaultPath = (adapter as { basePath: string }).basePath;

				// 获取配置目录
				const configDir = plugin.app.vault.configDir;

				// 构造文件路径
				const dataJsonPath = path.join(vaultPath, configDir, 'plugins', 'manual-sorting', 'data.json');
				const htmlFilePath = path.join(vaultPath, 'custom-head-content-content.html');

				// 检查 data.json 是否存在
				if (!fs.existsSync(dataJsonPath)) {
					new Notice('未找到 manual-sorting/data.json 文件');
					return;
				}

				// 检查 HTML 文件是否存在
				if (!fs.existsSync(htmlFilePath)) {
					new Notice('未找到 custom-head-content-content.html 文件');
					return;
				}

				// 读取 data.json
				const dataJsonContent = fs.readFileSync(dataJsonPath, 'utf-8');
				const orderData = JSON.parse(dataJsonContent) as Record<string, unknown>;

				// 读取 HTML 文件
				let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

				// 查找并替换 order_data
				const orderDataPattern = /order_data\s*=\s*\{[^]*?\n\s*\}(?=\s*<\/script>)/;
				if (!orderDataPattern.test(htmlContent)) {
					new Notice('HTML 文件中未找到 order_data 定义');
					return;
				}

				const newOrderDataString = `order_data = ${JSON.stringify(orderData, null, 4)}`;
				htmlContent = htmlContent.replace(orderDataPattern, newOrderDataString);

				fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

				new Notice('排序数据已成功同步到 HTML 文件');
			} catch (error) {
				console.error('同步排序数据失败:', error);
				const errorMessage = error instanceof Error ? error.message : String(error);
				new Notice(`同步失败: ${errorMessage}`);
			}
		}
	});
}
