
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const systemPrompt = `You are a task breakdown assistant. Your job is to break down goals into EXACTLY the specified number of daily tasks.

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${durationDays} tasks - no more, no less
2. Each task should be achievable in 30 minutes
3. Tasks must progress logically from basic to advanced
4. Each task must have a clear description and detailed instructions
5. Return ONLY a JSON array with ${durationDays} objects
6. Each object MUST have "description" and "instructions" fields
7. Format must be a plain JSON array, no markdown or code blocks

Example format for response (but with ${durationDays} tasks):
[
  {
    "description": "Clear task title",
    "instructions": "Detailed step-by-step instructions"
  }
]`;

    const maxRetries = 3;
    let attempt = 0;
    let tasks = null;

    while (attempt < maxRetries && !tasks) {
      attempt++;
      console.log(`Attempt ${attempt} to generate tasks`);

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
                content: `Create a detailed task breakdown for this ${durationDays}-day goal: ${goalDescription}
                Remember: I need EXACTLY ${durationDays} tasks, each with clear instructions.`
              }
            ],
            temperature: Math.max(0.2, 0.7 - (attempt * 0.2)), // Decrease temperature with each retry
            max_tokens: 4000, // Increased token limit for longer responses
            presence_penalty: 0.1,
            frequency_penalty: 0.1
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

        let content = data.choices[0].message.content.trim();
        
        // Remove any markdown code blocks if present
        content = content.replace(/```json\n?|\n?```/g, '');
        
        // Try to find and extract JSON if it's not already valid JSON
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }

        console.log(`Cleaned content for attempt ${attempt}:`, content);
        
        const parsedTasks = JSON.parse(content);
        
        if (!Array.isArray(parsedTasks)) {
          console.error(`Invalid response format (attempt ${attempt}): not an array`);
          continue;
        }

        if (parsedTasks.length !== durationDays) {
          console.error(`Wrong number of tasks (attempt ${attempt}): got ${parsedTasks.length}, expected ${durationDays}`);
          continue;
        }

        // Validate each task
        const validTasks = parsedTasks.every((task: any, index: number) => {
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
