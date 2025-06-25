
import React, { useEffect, useState } from 'react';

interface ConfettiWelcomeProps {
  userName: string;
}

const ConfettiWelcome = ({ userName }: ConfettiWelcomeProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `translateY(${100 + Math.random() * 50}vh) rotate(${Math.random() * 360}deg)`
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Welcome Message */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 animate-pulse" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            👋 Welcome back, {userName}!
          </h1>
          <p className="text-xl text-yellow-300 font-medium">
            Ready to connect and learn something amazing today?
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfettiWelcome;
