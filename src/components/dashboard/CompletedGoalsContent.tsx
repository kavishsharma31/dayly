import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Goal {
  id: string;
  description: string;
  completed_at: string;
}

export const CompletedGoalsContent = () => {
  const { data: completedGoals, isLoading } = useQuery({
    queryKey: ['completedGoals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Completed Goals</h2>
      {completedGoals?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No completed goals yet</p>
          </CardContent>
        </Card>
      ) : (
        completedGoals?.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {goal.description}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Completed on: {new Date(goal.completed_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};