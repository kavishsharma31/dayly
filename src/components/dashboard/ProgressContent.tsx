import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const ProgressContent = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch completed tasks count and total tasks count
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id')
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (goalsError || !goals) return { progress: 0, streak: 0 };

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('is_completed')
        .eq('goal_id', goals.id);

      if (tasksError) return { progress: 0, streak: 0 };

      const completedTasks = tasks.filter(task => task.is_completed).length;
      const totalTasks = tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate streak (completed tasks in consecutive days)
      const { data: completedTasks2, error: streakError } = await supabase
        .from('tasks')
        .select('completed_at')
        .eq('goal_id', goals.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (streakError) return { progress, streak: 0 };

      let streak = 0;
      if (completedTasks2 && completedTasks2.length > 0) {
        const dates = completedTasks2.map(task => 
          new Date(task.completed_at!).toISOString().split('T')[0]
        );
        const uniqueDates = [...new Set(dates)];
        streak = uniqueDates.length;
      }

      return { progress, streak };
    }
  });

  const progress = progressData?.progress ?? 0;
  const streak = progressData?.streak ?? 0;

  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [progress, streak]);

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