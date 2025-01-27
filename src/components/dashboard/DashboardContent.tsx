import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CreateGoalForm } from "./CreateGoalForm";
import { useNavigate } from "react-router-dom";
import ReactConfetti from "react-confetti";
import { useToast } from "@/hooks/use-toast";

export const DashboardContent = () => {
  const [hasGoal, setHasGoal] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>("");
  const [currentTaskInstructions, setCurrentTaskInstructions] = useState<string>("");
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedGoal = localStorage.getItem("currentGoal");
    const savedTasks = localStorage.getItem("tasks");
    
    if (savedGoal && savedTasks) {
      setHasGoal(true);
      const tasks = JSON.parse(savedTasks);
      setCurrentTask(tasks[currentTaskIndex].description);
      setCurrentTaskInstructions(tasks[currentTaskIndex].instructions);
    }
  }, [currentTaskIndex]);

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    setHasGoal(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      setCurrentTask(tasks[0].description);
      setCurrentTaskInstructions(tasks[0].instructions);
    }
  };

  const handleTaskComplete = () => {
    // Show confetti
    setShowConfetti(true);

    // Update progress in localStorage
    const currentProgress = parseInt(localStorage.getItem("progress") || "0");
    const newProgress = Math.min(currentProgress + 20, 100);
    localStorage.setItem("progress", newProgress.toString());

    // Update streak
    const currentStreak = parseInt(localStorage.getItem("streak") || "0");
    localStorage.setItem("streak", (currentStreak + 1).toString());

    // Show success message
    toast({
      title: "Task Completed! 🎉",
      description: "Great job! Keep up the momentum!",
    });

    // Get tasks from localStorage
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      if (currentTaskIndex < tasks.length - 1) {
        // Move to next task
        setCurrentTaskIndex(prevIndex => prevIndex + 1);
      } else {
        // All tasks completed
        toast({
          title: "Congratulations! 🎯",
          description: "You've completed all tasks for this goal!",
        });
      }
    }

    // Remove confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
      // Navigate to progress tab
      navigate("/dashboard?tab=progress");
    }, 3000);
  };

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      {showGoalForm ? (
        <CreateGoalForm onGoalCreated={handleGoalCreated} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daily Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasGoal ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-4">No Goal Set</h3>
                <p className="text-muted-foreground mb-6">
                  Start by setting your goal and we'll help you break it down into daily tasks
                </p>
                <Button onClick={() => setShowGoalForm(true)}>Create Goal</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Today's Task</h3>
                  <p className="text-muted-foreground">{currentTask}</p>
                </div>
                <div>
                  <h3 className="font-semibold">How to Complete This Task</h3>
                  <p className="text-muted-foreground">{currentTaskInstructions}</p>
                </div>
                <Button onClick={handleTaskComplete}>Mark as Complete</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};