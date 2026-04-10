/**
 * 应用程序入口组件
 * Application Entry Component
 * 
 * 用于独立运行配置编辑器
 * Used for running the configuration editor standalone
 */

import React from 'react';
import { ConfigEditor } from './ConfigEditor';
import './styles.css';

/**
 * 应用程序组件
 * Application component
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <ConfigEditor />
    </div>
  );
};

export default App;
