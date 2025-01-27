import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const ProgressContent = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={33} />
            <p className="text-sm text-muted-foreground">33% Complete</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5 Days</div>
          <p className="text-sm text-muted-foreground">Keep up the great work!</p>
        </CardContent>
      </Card>
    </div>
  );
};