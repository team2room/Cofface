interface ProgressBarProps {
  currentIndex: number
  totalItems: number
}

export function ProgressBar({ currentIndex, totalItems }: ProgressBarProps) {
  return (
    <div className="w-full px-12 mt-12">
      <div className="relative w-full h-2 flex items-center justify-between">
        {/* 연결선 */}
        <div className="absolute w-full h-2 bg-pink-100 rounded-full" />

        {/* 동그라미들 */}
        {Array.from({ length: totalItems }).map((_, index) => {
          const isActive = index <= currentIndex

          return (
            <div
              key={index}
              className="relative z-10 flex items-center justify-center"
            >
              <div
                className={`w-6 h-6 rounded-full ${
                  isActive ? 'bg-pink-300' : 'bg-pink-100'
                } flex items-center justify-center`}
              >
                {isActive && (
                  <div className="w-4 h-4 rounded-full bg-pink-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
