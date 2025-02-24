
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'system',
            content: `Break down this ${durationDays}-day goal into ${durationDays} daily tasks. Each task should be achievable in 30 minutes and include detailed instructions. Return a JSON array with exactly ${durationDays} tasks, where each task has a "description" field for the task title and an "instructions" field for detailed steps.`
          },
          {
            role: 'user',
            content: goalDescription
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to generate tasks');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    let tasks;

    try {
      tasks = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw content:', content);
      // Try to extract JSON from the content if it's wrapped in backticks or contains markdown
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse tasks from OpenAI response');
      }
    }

    if (!Array.isArray(tasks)) {
      throw new Error('Invalid response format: not an array');
    }

    // Ensure we have the correct number of tasks
    if (tasks.length !== durationDays) {
      throw new Error(`Invalid number of tasks: got ${tasks.length}, expected ${durationDays}`);
    }

    // Validate task format
    tasks.forEach((task, index) => {
      if (!task.description || !task.instructions) {
        throw new Error(`Task ${index + 1} is missing required fields`);
      }
    });

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

