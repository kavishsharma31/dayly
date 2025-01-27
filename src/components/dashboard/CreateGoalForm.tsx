import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  description: string;
  isCompleted: boolean;
}

export const CreateGoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const [goalDescription, setGoalDescription] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const { toast } = useToast();

  // This is a mock of what would later be AI-generated tasks
  const sampleTasks: Task[] = [
    { description: "Learn basic guitar chords (A, D, G)", isCompleted: false },
    { description: "Practice transitioning between chords smoothly", isCompleted: false },
    { description: "Learn the basic rhythm pattern of Smoke on the Water", isCompleted: false },
    { description: "Practice the main riff slowly", isCompleted: false },
    { description: "Gradually increase speed while maintaining accuracy", isCompleted: false }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter your goal description",
        variant: "destructive",
      });
      return;
    }
    setShowTasks(true);
  };

  const handleGetStarted = () => {
    // In a real app, this would save the goal and tasks to a database
    localStorage.setItem("currentGoal", goalDescription);
    localStorage.setItem("tasks", JSON.stringify(sampleTasks));
    toast({
      title: "Goal Created!",
      description: "Your goal has been saved and your first task is ready.",
    });
    onGoalCreated();
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
            <Button type="submit">Break Down Goal</Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Your Goal</h3>
              <p className="text-muted-foreground">{goalDescription}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Daily Tasks</h3>
              <ul className="list-disc pl-6 space-y-2">
                {sampleTasks.map((task, index) => (
                  <li key={index} className="text-muted-foreground">
                    {task.description}
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};