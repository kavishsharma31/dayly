import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { CreateGoalForm } from "./CreateGoalForm";
import { useNavigate } from "react-router-dom";
import ReactConfetti from "react-confetti";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  description: string;
  instructions: string;
  is_completed: boolean;
  goal_id: string;
  created_at: string;
}

interface Goal {
  id: string;
  description: string;
  user_id: string;
}

export const DashboardContent = () => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest active goal
  const { data: goal, isLoading: isLoadingGoal } = useQuery({
    queryKey: ['currentGoal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Goal | null;
    }
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', goal?.id],
    queryFn: async () => {
      if (!goal?.id) return null;
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goal.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!goal?.id
  });

  // Get the next incomplete task
  const currentTask = tasks?.find(task => !task.is_completed);

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    queryClient.invalidateQueries({ queryKey: ['currentGoal'] });
  };

  const handleTaskComplete = async () => {
    if (!currentTask) return;

    try {
      // Update task completion status
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', currentTask.id);

      if (taskError) throw taskError;

      // Show confetti
      setShowConfetti(true);

      // Show success message
      toast({
        title: "Task Completed! 🎉",
        description: "Great job! Keep up the momentum!",
        duration: 3000,
      });

      // Check if all tasks are completed
      const remainingTasks = tasks?.filter(task => !task.is_completed && task.id !== currentTask.id);
      const isLastTask = !remainingTasks?.length;

      if (isLastTask) {
        // Update goal as completed
        const { error: goalError } = await supabase
          .from('goals')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', goal?.id);

        if (goalError) throw goalError;

        toast({
          title: "Congratulations! 🎯",
          description: "You've completed all tasks for this goal!",
          duration: 3000,
        });
      }

      // Refresh tasks data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      // Remove confetti and navigate after delay
      setTimeout(() => {
        setShowConfetti(false);
        if (isLastTask) {
          navigate("/dashboard?tab=progress");
        }
      }, 3000);

    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleStartNewProject = async () => {
    if (goal?.id) {
      try {
        // Mark current goal as completed
        const { error } = await supabase
          .from('goals')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', goal.id);

        if (error) throw error;

        // Refresh goals data
        queryClient.invalidateQueries({ queryKey: ['currentGoal'] });
        
        setShowGoalForm(true);
        toast({
          title: "Ready to start a new project!",
          description: "Let's set up your new goal.",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error starting new project:', error);
        toast({
          title: "Error",
          description: "Failed to start new project. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      setShowGoalForm(true);
    }
  };

  const isLoading = isLoadingGoal || isLoadingTasks;
  const hasGoal = !!goal;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">Welcome back! 👋</h1>
        {showGoalForm ? (
          <CreateGoalForm onGoalCreated={handleGoalCreated} />
        ) : (
          <div className="relative">
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
                      <p className="text-muted-foreground">{currentTask?.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">How to Complete This Task</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{currentTask?.instructions}</p>
                    </div>
                    <Button onClick={handleTaskComplete}>Mark as Complete</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {hasGoal && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={handleStartNewProject}
                  variant="secondary"
                >
                  Start New Project
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
