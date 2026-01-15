import { Notice } from 'obsidian';
import LittleToolsPlugin from '../main';
import * as path from 'path';
import * as fs from 'fs';

export function registerSyncOrderDataCommand(plugin: LittleToolsPlugin) {
	plugin.addCommand({
		id: 'sync-order-data',
		name: '同步排序数据到 HTML 文件',
		callback: async () => {
			try {
				// Get vault base path
				const vaultPath = (plugin.app.vault.adapter as any).basePath;
				
				// Define file paths
				const dataJsonPath = path.join(vaultPath, '.obsidian', 'plugins', 'manual-sorting', 'data.json');
				const htmlFilePath = path.join(vaultPath, 'custom-head-content-content.html');

				// Check if data.json exists
				if (!fs.existsSync(dataJsonPath)) {
					new Notice('未找到 manual-sorting/data.json 文件');
					return;
				}

				// Check if HTML file exists
				if (!fs.existsSync(htmlFilePath)) {
					new Notice('未找到 custom-head-content-content.html 文件');
					return;
				}

				// Read data.json
				const dataJsonContent = fs.readFileSync(dataJsonPath, 'utf-8');
				const orderData = JSON.parse(dataJsonContent);

				// Read HTML file
				let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

				// Find and replace order_data value
				// Match: order_data = { ... } until the closing brace before </script>
				// This pattern matches the entire order_data object more reliably
				const orderDataPattern = /order_data\s*=\s*\{[^]*?\n\s*\}(?=\s*<\/script>)/;
				
				if (!orderDataPattern.test(htmlContent)) {
					new Notice('HTML 文件中未找到 order_data 定义');
					return;
				}

				// Format the new order_data string with proper indentation
				const newOrderDataString = `order_data = ${JSON.stringify(orderData, null, 4)}`;

				// Replace the old order_data with new one
				htmlContent = htmlContent.replace(orderDataPattern, newOrderDataString);

				// Write back to HTML file
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
