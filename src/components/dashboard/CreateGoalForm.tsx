import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Task {
  description: string;
  instructions: string;
  isCompleted: boolean;
}

export const CreateGoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const [goalDescription, setGoalDescription] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const { toast } = useToast();

  // This is a mock of what would later be AI-generated tasks
  const sampleTasks: Task[] = [
    {
      description: "Learn basic guitar chords (A, D, G)",
      instructions: "1. Position your guitar comfortably on your lap\n2. Start with the A chord: place your index, middle, and ring fingers on the 2nd fret of the B, G, and D strings\n3. Strum slowly and ensure each string rings clearly\n4. Practice transitioning between these three chords for 15-20 minutes",
      isCompleted: false
    },
    {
      description: "Practice transitioning between chords smoothly",
      instructions: "1. Set a metronome to 60 BPM\n2. Practice changing between A and D chords on every 4th beat\n3. Focus on maintaining rhythm while changing chords\n4. Gradually increase speed as you get comfortable",
      isCompleted: false
    },
    {
      description: "Learn the basic rhythm pattern of Smoke on the Water",
      instructions: "1. Listen to the original song several times\n2. Watch tutorial videos to understand the basic rhythm\n3. Practice the strumming pattern without changing chords\n4. Start very slowly and focus on timing",
      isCompleted: false
    },
    {
      description: "Practice the main riff slowly",
      instructions: "1. Break down the riff into smaller sections\n2. Practice each section at 50% speed\n3. Use a metronome to maintain timing\n4. Record yourself and compare with the original",
      isCompleted: false
    },
    {
      description: "Gradually increase speed while maintaining accuracy",
      instructions: "1. Start at 60% of the original tempo\n2. Practice for 10 minutes at this speed\n3. If you can play it perfectly 3 times in a row, increase speed by 5%\n4. Repeat until you reach full speed",
      isCompleted: false
    }
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
    localStorage.setItem("currentGoal", goalDescription);
    localStorage.setItem("tasks", JSON.stringify(sampleTasks));
    localStorage.setItem("progress", "0");
    localStorage.setItem("streak", "0");
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
              <ul className="space-y-4">
                {sampleTasks.map((task, index) => (
                  <li key={index} className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{task.description}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {task.instructions}
                    </p>
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