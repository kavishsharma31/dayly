import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const GoalContent = () => {
  const { data: goal, isLoading } = useQuery({
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
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Your Goal</h3>
          <p className="text-muted-foreground">
            {goal?.description || "No goal set yet"}
          </p>
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