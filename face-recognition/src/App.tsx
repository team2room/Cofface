// App.tsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import FaceLogin from './components/FaceRecognition/FaceLogin';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<FaceRecognition />} />
        <Route path='/login' element={<FaceLogin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const Home: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        얼굴 인식 시스템
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          color: '#aaa',
        }}
      >
        얼굴 인식을 통해 빠르고 안전하게 인증하세요. 최신 인공지능 기술을
        활용하여 보안성과 편의성을 모두 제공합니다.
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <a
          href='/register'
          style={{
            padding: '15px 30px',
            backgroundColor: '#4285F4',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
        >
          얼굴 등록
        </a>
        <a
          href='/login'
          style={{
            padding: '15px 30px',
            backgroundColor: '#00c853',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
        >
          얼굴 로그인
        </a>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const userId = location.state?.user || '사용자';

  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>대시보드</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        환영합니다,{' '}
        <span style={{ color: '#4285F4', fontWeight: 'bold' }}>{userId}</span>
        님!
      </p>
      <p
        style={{
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          color: '#aaa',
        }}
      >
        얼굴 인식을 통해 성공적으로 로그인했습니다. 이 페이지는 로그인 후
        사용자에게 보여지는 대시보드입니다.
      </p>
      <a
        href='/'
        style={{
          padding: '15px 30px',
          backgroundColor: '#555',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
      >
        로그아웃
      </a>
    </div>
  );
};

export default App;
