import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { levels, Level } from "@/data/levels";

interface MiniGolfGameProps {
  onExit: () => void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Vec2 {
  x: number;
  y: number;
}

export const MiniGolfGame = ({ onExit }: MiniGolfGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Vec2>({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState<Vec2>({ x: 0, y: 0 });
  const [gameWon, setGameWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [powerBoostActive, setPowerBoostActive] = useState(false);
  const [cheatInput, setCheatInput] = useState("");

  const ballRef = useRef<Ball>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 10,
  });

  const ballTrailRef = useRef<Vec2[]>([]);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const playSound = useCallback((type: 'hit' | 'bounce' | 'win') => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn("Sound playback failed");
    }
  }, [soundEnabled]);

  const level = levels[currentLevel];

  const resetBall = useCallback(() => {
    if (!level) return;
    ballRef.current = {
      x: level.start.x,
      y: level.start.y,
      vx: 0,
      vy: 0,
      radius: 10,
    };
    ballTrailRef.current = [];
  }, [level]);

  useEffect(() => {
    resetBall();
    setStrokes(0);
    setGameWon(false);
  }, [currentLevel, resetBall]);

  const checkCollision = useCallback((ball: Ball, level: Level): boolean => {
    // Wall collisions
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx) * 0.7;
      playSound('bounce');
      return true;
    }
    if (ball.x + ball.radius > 800) {
      ball.x = 800 - ball.radius;
      ball.vx = -Math.abs(ball.vx) * 0.7;
      playSound('bounce');
      return true;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy) * 0.7;
      playSound('bounce');
      return true;
    }
    if (ball.y + ball.radius > 600) {
      ball.y = 600 - ball.radius;
      ball.vy = -Math.abs(ball.vy) * 0.7;
      playSound('bounce');
      return true;
    }

    // Obstacle collisions
    let collided = false;
    level.obstacles.forEach(obstacle => {
      if (obstacle.type === 'rect') {
        const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));
        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < ball.radius) {
          const normal = { x: distanceX / distance, y: distanceY / distance };
          ball.x = closestX + normal.x * ball.radius;
          ball.y = closestY + normal.y * ball.radius;
          
          const dotProduct = ball.vx * normal.x + ball.vy * normal.y;
          ball.vx = (ball.vx - 2 * dotProduct * normal.x) * 0.7;
          ball.vy = (ball.vy - 2 * dotProduct * normal.y) * 0.7;
          
          if (!collided) {
            playSound('bounce');
            collided = true;
          }
        }
      }
    });

    return collided;
  }, [playSound]);

  const checkHoleCollision = useCallback((ball: Ball, level: Level): boolean => {
    const dx = ball.x - level.hole.x;
    const dy = ball.y - level.hole.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    
    return distance < level.hole.radius && speed < 3;
  }, []);

  const updatePhysics = useCallback((deltaTime: number) => {
    const ball = ballRef.current;
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

    if (speed < 0.05) {
      ball.vx = 0;
      ball.vy = 0;
      return;
    }

    // Apply friction
    const friction = level.friction || 0.98;
    ball.vx *= friction;
    ball.vy *= friction;

    // Update position
    ball.x += ball.vx * deltaTime * 60;
    ball.y += ball.vy * deltaTime * 60;

    // Add to trail
    if (speed > 1) {
      ballTrailRef.current.push({ x: ball.x, y: ball.y });
      if (ballTrailRef.current.length > 15) {
        ballTrailRef.current.shift();
      }
    }

    // Check collisions
    checkCollision(ball, level);

    // Check win condition
    if (checkHoleCollision(ball, level)) {
      ball.vx = 0;
      ball.vy = 0;
      
      if (!gameWon) {
        setGameWon(true);
        playSound('win');
        
        const newTotal = totalStrokes + strokes;
        setTotalStrokes(newTotal);

        if (currentLevel < levels.length - 1) {
          toast.success(`Level ${currentLevel + 1} Complete!`, {
            description: `Strokes: ${strokes} | Total: ${newTotal}`,
          });
          setTimeout(() => {
            setCurrentLevel(prev => prev + 1);
          }, 2000);
        } else {
          toast.success(`🎉 Game Complete!`, {
            description: `Total strokes: ${newTotal}. Amazing!`,
          });
        }
      }
    }
  }, [level, checkCollision, checkHoleCollision, gameWon, currentLevel, strokes, totalStrokes, playSound]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 800, 600);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Level background
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, 800, 600);

    // Grid pattern
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 600);
      ctx.stroke();
    }
    for (let i = 0; i < 600; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }

    // Render obstacles
    level.obstacles.forEach(obstacle => {
      if (obstacle.type === 'rect') {
        ctx.save();
        ctx.fillStyle = obstacle.color || '#1f2937';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.restore();

        // Highlight edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });

    // Render hole
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(level.hole.x, level.hole.y, level.hole.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hole flag
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(level.hole.x - 2, level.hole.y - level.hole.radius - 30, 4, 30);
    ctx.beginPath();
    ctx.moveTo(level.hole.x + 2, level.hole.y - level.hole.radius - 30);
    ctx.lineTo(level.hole.x + 20, level.hole.y - level.hole.radius - 20);
    ctx.lineTo(level.hole.x + 2, level.hole.y - level.hole.radius - 10);
    ctx.fill();

    // Ball trail
    ballTrailRef.current.forEach((pos, index) => {
      const alpha = index / ballTrailRef.current.length * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ball
    const ball = ballRef.current;
    ctx.save();
    ctx.fillStyle = '#fefefe';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ball shine
    const shineGradient = ctx.createRadialGradient(
      ball.x - 3,
      ball.y - 3,
      0,
      ball.x,
      ball.y,
      ball.radius
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Aiming arrow
    if (isDragging && ball.vx === 0 && ball.vy === 0) {
      const dx = dragStart.x - dragEnd.x;
      const dy = dragStart.y - dragEnd.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxPower = 200;
      const power = Math.min(distance, maxPower);
      const angle = Math.atan2(dy, dx);

      // Arrow line
      const arrowLength = power;
      const endX = ball.x + Math.cos(angle) * arrowLength;
      const endY = ball.y + Math.sin(angle) * arrowLength;

      ctx.save();
      const powerRatio = power / maxPower;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + powerRatio * 0.5})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();

      // Arrow head
      const headLength = 15;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Power indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Power: ${Math.round(powerRatio * 100)}%`, ball.x - 40, ball.y - 30);
    }

    // Win animation
    if (gameWon) {
      ctx.save();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.beginPath();
      ctx.arc(level.hole.x, level.hole.y, level.hole.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [level, isDragging, dragStart, dragEnd, gameWon]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    updatePhysics(deltaTime);
    render();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [updatePhysics, render]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ball = ballRef.current;
    if (ball.vx !== 0 || ball.vy !== 0 || gameWon) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragEnd({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const ball = ballRef.current;
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const powerMultiplier = powerBoostActive ? 1.5 : 1;
      const power = Math.min(distance / 20, 10) * powerMultiplier;
      const angle = Math.atan2(dy, dx);

      ball.vx = Math.cos(angle) * power;
      ball.vy = Math.sin(angle) * power;

      setStrokes(prev => prev + 1);
      playSound('hit');
    }

    setIsDragging(false);
  };

  const handleRestart = () => {
    resetBall();
    setStrokes(0);
    setGameWon(false);
  };

  // Cheat code handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newInput = (cheatInput + e.key.toUpperCase()).slice(-9);
      setCheatInput(newInput);

      if (newInput === "GOLFPOWER") {
        setPowerBoostActive(true);
        toast.success("⚡ Power Boost Activated!", {
          description: "Extra shot power for 10 seconds!",
        });
        
        setTimeout(() => {
          setPowerBoostActive(false);
          toast("Power boost expired");
        }, 10000);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [cheatInput]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-golf-sky to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button onClick={onExit} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button onClick={handleRestart} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="sm"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            {powerBoostActive && (
              <div className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold animate-pulse-glow">
                ⚡ POWER BOOST
              </div>
            )}
            <div className="px-4 py-2 bg-card rounded-lg shadow-md">
              <span className="text-sm text-muted-foreground">Level:</span>
              <span className="ml-2 text-xl font-bold text-foreground">
                {currentLevel + 1}/{levels.length}
              </span>
            </div>
            <div className="px-4 py-2 bg-card rounded-lg shadow-md">
              <span className="text-sm text-muted-foreground">Strokes:</span>
              <span className="ml-2 text-xl font-bold text-foreground">{strokes}</span>
            </div>
            <div className="px-4 py-2 bg-card rounded-lg shadow-md">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="ml-2 text-xl font-bold text-primary">{totalStrokes + strokes}</span>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
              className="bg-golf-green rounded-2xl shadow-2xl cursor-crosshair border-4 border-golf-green-dark"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {gameWon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-card/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl animate-bounce-in">
                  <h2 className="text-3xl font-bold text-primary mb-2">Hole in {strokes}! 🎉</h2>
                  <p className="text-muted-foreground text-center">
                    {currentLevel < levels.length - 1 ? "Next level loading..." : "Game Complete!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Level Info */}
        <div className="mt-4 text-center">
          <p className="text-lg text-foreground font-medium">{level.name}</p>
        </div>
      </div>
    </div>
  );
};
