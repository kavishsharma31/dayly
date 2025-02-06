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

    const systemPrompt = `You are a task breakdown assistant. Your role is to break down goals into daily tasks.

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${durationDays} tasks
2. Each task should be completable in 30 minutes
3. Tasks should progress logically
4. Each task needs a description and instructions
5. Return a JSON array with ${durationDays} objects
6. Each object must have "description" and "instructions" fields
7. No extra text or formatting

Format your response as a JSON array:
[
  {
    "description": "Task description",
    "instructions": "Task instructions"
  }
]

IMPORTANT: Your response MUST contain EXACTLY ${durationDays} tasks. Count them multiple times before responding.`;

    console.log('Sending request to OpenAI...');
    
    // First attempt with regular temperature
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Break down this goal into EXACTLY ${durationDays} tasks: ${goalDescription}. You MUST generate EXACTLY ${durationDays} tasks, no more, no less.`
          }
        ],
        temperature: 0.1, // Very low temperature for consistency
      }),
    });

    let data = await response.json();
    
    // If first attempt fails, try again with different parameters
    let attempts = 1;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const content = data.choices[0].message.content.trim();
        const cleanContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        console.log('Attempt', attempts, 'content:', cleanContent);
        
        const tasks = JSON.parse(cleanContent);
        
        if (!Array.isArray(tasks)) {
          throw new Error('Generated content is not an array');
        }

        console.log(`Attempt ${attempts}: Generated ${tasks.length} tasks`);
        
        // If we have exactly the right number of tasks, validate and return them
        if (tasks.length === durationDays) {
          const validatedTasks = tasks.map((task, index) => {
            if (!task.description || !task.instructions) {
              throw new Error(`Task ${index + 1} is missing required fields`);
            }
            return {
              description: String(task.description).trim(),
              instructions: String(task.instructions).trim()
            };
          });

          console.log(`Successfully validated ${validatedTasks.length} tasks`);
          return new Response(
            JSON.stringify({ tasks: validatedTasks }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            },
          );
        }
        
        // If we don't have the right number of tasks, try again
        throw new Error(`Generated ${tasks.length} tasks instead of ${durationDays}`);
      } catch (error) {
        console.log(`Attempt ${attempts} failed:`, error.message);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate exactly ${durationDays} tasks after ${maxAttempts} attempts`);
        }
        
        // Try again with adjusted parameters
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `This is attempt ${attempts}. You MUST generate EXACTLY ${durationDays} tasks for this goal: ${goalDescription}. Previous attempts failed because they didn't generate exactly ${durationDays} tasks. Count your tasks carefully.`
              }
            ],
            temperature: 0.1 * attempts, // Slightly increase temperature with each attempt
          }),
        });
        
        data = await response.json();
      }
    }

    throw new Error(`Failed to generate exactly ${durationDays} tasks after ${maxAttempts} attempts`);

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