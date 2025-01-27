import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CreateGoalForm } from "./CreateGoalForm";

export const DashboardContent = () => {
  const [hasGoal, setHasGoal] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>("");

  useEffect(() => {
    const savedGoal = localStorage.getItem("currentGoal");
    const savedTasks = localStorage.getItem("tasks");
    
    if (savedGoal && savedTasks) {
      setHasGoal(true);
      const tasks = JSON.parse(savedTasks);
      setCurrentTask(tasks[0].description);
    }
  }, []);

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    setHasGoal(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      setCurrentTask(tasks[0].description);
    }
  };

  return (
    <>
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
                <h3 className="font-semibold">Today's Task</h3>
                <p className="text-muted-foreground">{currentTask}</p>
                <Button>Mark as Complete</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};