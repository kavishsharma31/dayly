import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalDescription } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a task breakdown expert. Given a goal, create 5 detailed, actionable tasks that will help achieve that goal. 
            Each task should have:
            1. A clear, concise description
            2. Detailed step-by-step instructions (4 steps maximum)
            Format the response as a JSON array of objects with 'description' and 'instructions' properties.
            Make sure the tasks are progressive and build upon each other.`
          },
          {
            role: 'user',
            content: goalDescription
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate tasks');
    }

    const data = await response.json();
    const tasksContent = data.choices[0].message.content;
    
    // Parse the JSON string from the AI response
    const tasks = JSON.parse(tasksContent);

    return new Response(
      JSON.stringify({ tasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});