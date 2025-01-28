import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { goalDescription, durationDays } = await req.json();
    
    if (!goalDescription || !durationDays) {
      throw new Error('Goal description and duration are required');
    }

    console.log('Calling OpenAI API with:', { goalDescription, durationDays });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',  // Updated to use the correct model name
        messages: [
          {
            role: 'system',
            content: `You are a comprehensive task breakdown expert who provides complete, self-contained instructions without referring users to external resources.

For each task:
1. Break down complex skills into detailed, step-by-step instructions
2. Include ALL necessary information within the instructions
3. Provide specific exercises or practice routines
4. NEVER tell users to "look up" or "search for" information online
5. If the task involves learning something, include the actual content to learn

For fitness goals specifically:
1. Include specific exercise routines with reps and sets
2. Add form instructions and safety tips
3. Include warm-up and cool-down routines
4. Specify duration for each exercise
5. Add progression guidelines

The number of tasks should be proportional to both the complexity of the goal and the timeframe:
- Simple goals (1-7 days): 3-5 tasks
- Medium goals (8-30 days): 5-10 tasks
- Complex goals (31+ days): 10-15 tasks

Each task should have:
1. A clear, concise description (max 100 characters)
2. Detailed, self-contained instructions (max 500 characters per step)

IMPORTANT: Your response must be a valid JSON array of objects, each with 'description' and 'instructions' properties.
Example format:
[
  {
    "description": "Task description here",
    "instructions": "Step 1 instructions\\nStep 2 instructions"
  }
]`
          },
          {
            role: 'user',
            content: `Goal: ${goalDescription}\nTimeframe: ${durationDays} days`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    const tasksContent = data.choices[0].message.content;
    console.log('Raw tasks content:', tasksContent);
    
    let tasks;
    try {
      tasks = JSON.parse(tasksContent);
      console.log('Parsed tasks:', tasks);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw content that failed to parse:', tasksContent);
      throw new Error('Failed to parse AI response into valid JSON. Please try again.');
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.error('Invalid tasks format:', tasks);
      throw new Error('Invalid tasks format received from AI');
    }

    // Validate task structure
    const isValidTask = (task: any) => 
      typeof task === 'object' && 
      typeof task.description === 'string' && 
      typeof task.instructions === 'string';

    if (!tasks.every(isValidTask)) {
      console.error('Invalid task structure:', tasks);
      throw new Error('Tasks received from AI do not match required format');
    }

    return new Response(
      JSON.stringify({ tasks }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate tasks',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});