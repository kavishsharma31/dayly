import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { goalDescription, durationDays } = await req.json();

    if (!goalDescription || !durationDays) {
      throw new Error('Missing required fields: goalDescription or durationDays');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',  // Using the stable GPT-3.5 model
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI that creates structured task lists for achieving goals. 
            For fitness and health-related goals, create specific, actionable daily tasks that are realistic and progressive.
            Each task should have a clear description and detailed instructions.
            Format the response as a JSON array of objects, each with 'description' and 'instructions' fields.
            Limit the number of tasks based on the provided duration in days.`
          },
          {
            role: 'user',
            content: `Create a task list for this goal: "${goalDescription}" that can be completed in ${durationDays} days.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI Response:', JSON.stringify(data));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    let tasks;
    try {
      tasks = JSON.parse(data.choices[0].message.content);
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});