import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { goalDescription, durationDays } = await req.json();
    console.log('Received request:', { goalDescription, durationDays });

    if (!goalDescription || !durationDays) {
      throw new Error('Missing required fields: goalDescription or durationDays');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log('Making request to OpenAI API...');
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
            content: `You are a helpful AI that creates structured task lists for achieving goals. Break down goals into specific, actionable tasks that can be completed within ${durationDays} days. Each task should have a clear description and detailed instructions. Format your response as a JSON array of objects, each with 'description' and 'instructions' fields. Aim to create tasks that are progressive and build upon each other.`
          },
          {
            role: 'user',
            content: `Create a task list for this goal that can be completed in ${durationDays} days: "${goalDescription}"`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI Response:', JSON.stringify(data));

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let tasks;
    try {
      // The content should already be in JSON format, but let's handle both cases
      const content = data.choices[0].message.content;
      tasks = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Validate the tasks structure
      if (!Array.isArray(tasks)) {
        throw new Error('Tasks must be an array');
      }
      
      tasks = tasks.map(task => ({
        description: String(task.description || ''),
        instructions: String(task.instructions || '')
      }));
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.log('Raw content:', data.choices[0].message.content);
      throw new Error('Failed to parse tasks from OpenAI response');
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