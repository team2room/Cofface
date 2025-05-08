import React from 'react';
import FaceRecognition from './components/FaceRecognition/index';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>얼굴 등록 시스템</h1>
      <FaceRecognition />
    </div>
  );
};

export default App;