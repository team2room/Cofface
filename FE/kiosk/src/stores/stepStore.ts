import { create } from 'zustand'

type Step = 'main' | 'menu' | 'place' | 'pay' // | 'complete'

interface StepState {
  step: Step
  originStep: Step | null
  setStep: (step: Step, originStep?: Step | null) => void
  resetStep: () => void
}

export const useStepStore = create<StepState>((set) => ({
  step: 'main',
  originStep: null,
  setStep: (step, originStep = null) => set({ step, originStep }),
  resetStep: () => set({ step: 'main', originStep: null }),
}))
