import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export const ProgressContent = () => {
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedProgress = parseInt(localStorage.getItem("progress") || "0");
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    
    setIsAnimating(true);
    
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= savedProgress) {
          clearInterval(progressInterval);
          return savedProgress;
        }
        return prev + 1;
      });
    }, 20);

    // Animate streak counter
    let currentStreak = 0;
    const streakInterval = setInterval(() => {
      if (currentStreak >= savedStreak) {
        clearInterval(streakInterval);
        setIsAnimating(false);
      } else {
        currentStreak += 1;
        setStreak(currentStreak);
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(streakInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progress} className="transition-all duration-500" />
            <p className="text-sm text-muted-foreground">{progress}% Complete</p>
          </div>
        </CardContent>
      </Card>

      <Card className={isAnimating ? "animate-bounce" : ""}>
        <CardHeader>
          <CardTitle>Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streak} Days</div>
          <p className="text-sm text-muted-foreground">Keep up the great work!</p>
        </CardContent>
      </Card>
    </div>
  );
};