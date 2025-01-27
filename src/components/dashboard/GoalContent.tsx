import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GoalContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Your Goal</h3>
          <p className="text-muted-foreground">Learn to play the guitar</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Expected Completion</h3>
          <p className="text-muted-foreground">December 31, 2024</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Daily Commitment</h3>
          <p className="text-muted-foreground">30 minutes per day</p>
        </div>
      </CardContent>
    </Card>
  );
};