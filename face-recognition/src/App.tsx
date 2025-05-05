import React from 'react';
import FaceRegistration from './components/FaceRegistration';
import FaceRecognition from './components/FaceRecognition';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>얼굴 등록 시스템</h1>
      {/* <FaceRegistration /> */}
      <FaceRecognition />
    </div>
  );
};

export default App;