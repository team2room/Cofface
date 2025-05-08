import { useState, useRef } from 'react';
import { TIMER_SETTINGS } from '../utils/constants';

interface UseTimerProps {
  onTimerComplete: () => void;
}

export const useTimer = ({ onTimerComplete }: UseTimerProps) => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [stateTimer, setStateTimer] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(0);
  
  const timerRef = useRef<number | null>(null);
  const timerActiveRef = useRef<boolean>(false); // 타이머 활성화 상태
  const timerInProgressRef = useRef<boolean>(false); // 타이머 진행 중 상태

  // 타이머 시작 함수
  const startTimer = (): void => {
    // 이미 타이머가 진행 중이면 중복 호출 무시
    if (timerInProgressRef.current) {
      console.log('이미 타이머가 진행 중입니다. 중복 호출 무시');
      return;
    }

    // 이미 처리 중이면 무시
    if (processing) {
      console.log('이미 처리 중으로 인한 타이머 미작동');
      return;
    }

    console.log('타이머 시작 함수 호출됨');

    // 기존 타이머가 있으면 제거
    if (timerRef.current) {
      clearInterval(timerRef.current);
      console.log('기존 타이머 제거');
    }

    // 타이머 활성화 상태 설정
    timerActiveRef.current = true;
    timerInProgressRef.current = true;

    // 처리 중 상태 설정
    setProcessing(true);
    console.log('타이머 시작: 처리 중 상태 설정');

    // 3초 카운트다운
    let count = 3;
    let progress = 0;
    setStateTimer(count);
    setTimerProgress(progress);

    // 50ms 단위로 진행도 업데이트 (부드러운 애니메이션)
    const updateInterval = TIMER_SETTINGS.INTERVAL;
    const totalDuration = TIMER_SETTINGS.DURATION;
    const totalSteps = totalDuration / updateInterval;
    let currentStep = 0;

    const interval = setInterval(() => {
      // 타이머 진행 중 얼굴 위치와 방향이 유효하지 않으면
      if (!timerInProgressRef.current) {
        clearInterval(interval);
        timerRef.current = null;
        console.log('타이머 중단: 얼굴 위치/방향 변경');
        resetTimer();
        return;
      }

      currentStep++;
      progress = currentStep / totalSteps;
      setTimerProgress(progress);

      if (currentStep % (totalSteps / 3) === 0) {
        // 1초마다 카운트 감소
        count--;
        setStateTimer(count);
        console.log(`타이머 카운트: ${count}`);
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        timerRef.current = null;
        console.log('타이머 완료: 콜백 호출');

        // 타이머 완료 후 콜백 호출
        onTimerComplete();

        resetTimer();
      }
    }, updateInterval);

    // 타이머 ID 저장
    timerRef.current = interval as unknown as number;

    console.log('타이머 설정 완료');
  };

  // 타이머 중지 및 초기화
  const resetTimer = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    timerActiveRef.current = false;
    timerInProgressRef.current = false;
    setProcessing(false);
    setStateTimer(0);
    setTimerProgress(0);
  };

  // 타이머 강제 중지 (얼굴이 원 밖으로 나가거나 방향이 틀렸을 때)
  const stopTimer = (): void => {
    if (timerInProgressRef.current) {
      console.log('타이머 강제 중지');
      timerInProgressRef.current = false;
      resetTimer();
    }
  };

  return {
    processing,
    stateTimer,
    timerProgress,
    timerActiveRef,
    timerInProgressRef,
    startTimer,
    resetTimer,
    stopTimer
  };
};