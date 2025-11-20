import { useState, useEffect } from "react";
import { MiniGolfGame } from "@/components/MiniGolfGame";
import { Button } from "@/components/ui/button";
import { PlayCircle, Trophy, Info } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Preload sounds
    const sounds = ['/sounds/hit.mp3', '/sounds/bounce.mp3', '/sounds/win.mp3'];
    sounds.forEach(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
    });
  }, []);

  if (gameStarted) {
    return <MiniGolfGame onExit={() => setGameStarted(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-golf-sky to-golf-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-golf-green rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-golf-sand rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-card/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-golf-green/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-golf-green to-golf-green-dark rounded-2xl mb-4 shadow-lg">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2 bg-gradient-to-r from-golf-green to-golf-blue bg-clip-text text-transparent">
              Mini Golf Shooter
            </h1>
            <p className="text-xl text-muted-foreground">
              Aim, shoot, and conquer the course!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Button
              onClick={() => setGameStarted(true)}
              className="w-full py-6 text-xl bg-gradient-to-r from-golf-green to-golf-green-dark hover:from-golf-green-dark hover:to-golf-green transition-all duration-300 shadow-lg hover:shadow-xl"
              size="lg"
            >
              <PlayCircle className="w-6 h-6 mr-2" />
              Start Game
            </Button>

            <Button
              onClick={() => setShowInstructions(!showInstructions)}
              variant="outline"
              className="w-full py-6 text-lg border-2 border-golf-green/30 hover:bg-golf-green/10"
              size="lg"
            >
              <Info className="w-5 h-5 mr-2" />
              {showInstructions ? "Hide" : "Show"} Instructions
            </Button>
          </motion.div>

          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-golf-green-light/50 rounded-xl border border-golf-green/30"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">How to Play:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-golf-green mr-2">•</span>
                  <span><strong>Click and drag</strong> from the ball to aim and set power</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golf-green mr-2">•</span>
                  <span><strong>Release</strong> to shoot the ball toward the hole</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golf-green mr-2">•</span>
                  <span><strong>Avoid obstacles</strong> and reach the hole in as few strokes as possible</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golf-green mr-2">•</span>
                  <span><strong>Watch out</strong> for moving obstacles and water hazards!</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">⭐</span>
                  <span><strong>Cheat code:</strong> Type "GOLFPOWER" for extra shot power!</span>
                </li>
              </ul>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-foreground/60"
        >
          <p>Works on desktop and mobile • Touch or mouse controls</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
