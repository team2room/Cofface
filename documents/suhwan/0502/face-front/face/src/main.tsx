import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as tf from '@tensorflow/tfjs';

// TensorFlow.js 초기화
async function initializeTensorFlow() {
  // WebGL 백엔드 설정
  await tf.setBackend('webgl');
  console.log('TensorFlow.js 초기화 완료:', tf.getBackend());
}

// 앱 렌더링
async function renderApp() {
  try {
    // TensorFlow.js 초기화
    await initializeTensorFlow();
    
    // 루트 요소 찾기
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('루트 요소를 찾을 수 없습니다.');
    }
    
    // React 앱 렌더링
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('앱 초기화 오류:', error);
    // 에러 화면 표시
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="text-align: center; margin-top: 40px; font-family: sans-serif;">
          <h2>애플리케이션 초기화 오류</h2>
          <p>애플리케이션을 초기화하는 중에 오류가 발생했습니다.</p>
          <p style="color: red;">${error instanceof Error ? error.message : '알 수 없는 오류'}</p>
          <button onclick="window.location.reload()">다시 시도</button>
        </div>
      `;
    }
  }
}

// 앱 시작
renderApp();