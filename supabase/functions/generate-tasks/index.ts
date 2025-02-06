import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalDescription, durationDays } = await req.json();
    console.log('Received request:', { goalDescription, durationDays });

    if (!goalDescription || !durationDays) {
      throw new Error('Missing required fields: goalDescription or durationDays');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const maxRetries = 3;
    let attempt = 0;
    let tasks = null;

    while (attempt < maxRetries && !tasks) {
      attempt++;
      console.log(`Attempt ${attempt} to generate tasks`);

      const systemPrompt = `You are a task breakdown assistant. Break down goals into exactly ${durationDays} daily tasks.

Rules:
1. Generate EXACTLY ${durationDays} tasks - no more, no less
2. Each task should take 30 minutes
3. Tasks must progress from basic to advanced
4. Each task needs a description and instructions
5. Return ONLY valid JSON array with ${durationDays} objects
6. Each object must have "description" and "instructions" fields

Example format:
[
  {
    "description": "Task title here",
    "instructions": "Step-by-step instructions here"
  }
]`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: `Create exactly ${durationDays} tasks for this goal: ${goalDescription}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2500,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error (attempt ${attempt}):`, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`OpenAI response for attempt ${attempt}:`, data);

        if (!data.choices?.[0]?.message?.content) {
          console.error(`Invalid OpenAI response format (attempt ${attempt})`);
          continue;
        }

        const content = data.choices[0].message.content.trim();
        console.log(`Raw content for attempt ${attempt}:`, content);

        // Try to extract JSON if it's wrapped in code blocks
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```([\s\S]*?)```/);
        const jsonContent = jsonMatch ? jsonMatch[1].trim() : content.trim();
        
        console.log(`Parsed content for attempt ${attempt}:`, jsonContent);
        
        const parsedTasks = JSON.parse(jsonContent);
        
        if (!Array.isArray(parsedTasks)) {
          console.error(`Invalid response format (attempt ${attempt}): not an array`);
          continue;
        }

        if (parsedTasks.length !== durationDays) {
          console.error(`Wrong number of tasks (attempt ${attempt}): got ${parsedTasks.length}, expected ${durationDays}`);
          continue;
        }

        // Validate each task
        const validTasks = parsedTasks.every((task, index) => {
          if (!task.description || !task.instructions) {
            console.error(`Task ${index + 1} is missing required fields`);
            return false;
          }
          return true;
        });

        if (!validTasks) {
          console.error(`Invalid task format in attempt ${attempt}`);
          continue;
        }

        tasks = parsedTasks;
        console.log(`Successfully generated ${tasks.length} tasks on attempt ${attempt}`);
        break;
      } catch (error) {
        console.error(`Error in attempt ${attempt}:`, error);
      }
    }

    if (!tasks) {
      throw new Error(`Failed to generate valid tasks after ${maxRetries} attempts`);
    }

    return new Response(
      JSON.stringify({ tasks }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});