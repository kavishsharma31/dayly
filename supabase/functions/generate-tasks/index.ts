import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a task breakdown expert. Given a goal and a timeframe, create an appropriate number of detailed, actionable tasks that will help achieve that goal. 
            The number of tasks should be proportional to both the complexity of the goal and the timeframe provided.
            For simple goals with short timeframes (1-7 days), create 3-5 tasks.
            For medium complexity goals or medium timeframes (8-30 days), create 5-10 tasks.
            For complex goals or longer timeframes (31+ days), create 10-15 tasks.
            
            Each task should have:
            1. A clear, concise description (max 100 characters)
            2. Detailed step-by-step instructions (max 4 steps, each step should be clear and actionable)
            
            Format your response as a JSON array of objects with 'description' and 'instructions' properties.
            Make sure the tasks are progressive and build upon each other.
            
            Example format:
            [
              {
                "description": "Task 1 description",
                "instructions": "1. Step one\\n2. Step two\\n3. Step three"
              }
            ]`
          },
          {
            role: 'user',
            content: `Goal: ${goalDescription}\nTimeframe: ${durationDays} days`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    
    // Parse the JSON string from the AI response
    let tasks;
    try {
      tasks = JSON.parse(tasksContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse AI response into valid JSON');
    }

    // Validate the tasks structure
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Invalid tasks format received from AI');
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