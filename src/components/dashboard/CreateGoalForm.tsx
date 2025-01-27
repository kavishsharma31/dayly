import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Task {
  description: string;
  instructions: string;
  isCompleted: boolean;
}

export const CreateGoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const [goalDescription, setGoalDescription] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter your goal description",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate tasks using OpenAI
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-tasks', {
        body: { goalDescription },
      });

      if (aiError) throw aiError;

      setGeneratedTasks(aiResponse.tasks.map((task: any) => ({
        ...task,
        isCompleted: false
      })));
      setShowTasks(true);
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Insert the goal
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .insert({
          description: goalDescription,
          user_id: user.id
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // Insert tasks for the goal
      const tasksToInsert = generatedTasks.map(task => ({
        goal_id: goalData.id,
        description: task.description,
        instructions: task.instructions,
        is_completed: false
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;

      toast({
        title: "Goal Created!",
        description: "Your goal has been saved and your tasks are ready.",
        duration: 3000,
      });
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Goal</CardTitle>
      </CardHeader>
      <CardContent>
        {!showTasks ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium mb-2">
                Describe your goal in detail
              </label>
              <Textarea
                id="goal"
                placeholder="Example: I want to learn to play Smoke on the Water on guitar without any prior experience..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                "Break Down Goal"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Your Goal</h3>
              <p className="text-muted-foreground">{goalDescription}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Daily Tasks</h3>
              <ul className="space-y-4">
                {generatedTasks.map((task, index) => (
                  <li key={index} className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{task.description}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {task.instructions}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};