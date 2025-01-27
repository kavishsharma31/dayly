import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const DashboardContent = () => {
  const [hasGoal, setHasGoal] = useState(false);

  return (
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
            <Button onClick={() => setHasGoal(true)}>Create Goal</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">Today's Task</h3>
            <p className="text-muted-foreground">
              Complete 30 minutes of focused work on your goal
            </p>
            <Button>Mark as Complete</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};