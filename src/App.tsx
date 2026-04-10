import { useCallback, useMemo, useState } from 'react';
import { RotateItemConfig, initialRotateConfig, LauncherConfigLogic, ValidationError } from './launcher_config';
import { ConfigEditor } from './components/ConfigEditor';
import { LivePreviewPanel } from './components/LivePreviewPanel';

function App() {
  const [configs, setConfigs] = useState<RotateItemConfig[]>(initialRotateConfig);
  
  const errors = useMemo<ValidationError[]>(() => {
    return LauncherConfigLogic.validateConfig(configs);
  }, [configs]);

  const [exportJson, setExportJson] = useState('');
  const [showExport, setShowExport] = useState(false);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(configs, null, 2);
    setExportJson(json);
    setShowExport(true);
  }, [configs]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      alert('已复制到剪贴板!');
    } catch (err) {
      console.error('复制失败', err);
    }
  }, [exportJson]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🕐 旋转时钟配置编辑器
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                配置 20 个图层的参数，实时预览时钟效果
              </p>
            </div>
            <div className="flex items-center gap-3">
              {errors.length > 0 && (
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-700 text-sm font-medium">
                    ⚠️ 配置存在 {errors.length} 个验证错误
                  </span>
                </div>
              )}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📤 导出配置
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          <div className="overflow-hidden">
            <ConfigEditor
              configs={configs}
              onChange={setConfigs}
              errors={errors}
            />
          </div>

          <div className="overflow-hidden">
            <LivePreviewPanel configs={configs} />
          </div>
        </div>
      </main>

      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">导出配置 JSON</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  复制到剪贴板
                </button>
                <button
                  onClick={() => setShowExport(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  关闭
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto font-mono">
                {exportJson}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
