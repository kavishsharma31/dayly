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
    const { goalDescription, durationDays } = await req.json();
    console.log('Received request:', { goalDescription, durationDays });

    if (!goalDescription || !durationDays) {
      throw new Error('Missing required fields: goalDescription or durationDays');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const systemPrompt = `You are a task breakdown assistant. Your job is to break down a goal into EXACTLY ${durationDays} daily tasks.

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${durationDays} tasks - no more, no less
2. Each task must be achievable within 30 minutes
3. Tasks must build upon previous tasks in a logical progression
4. Each task must include a clear description and step-by-step instructions
5. Return ONLY a JSON array with exactly ${durationDays} objects
6. Each object must have exactly two fields: "description" and "instructions"
7. DO NOT include any explanatory text, markdown formatting, or code blocks

Example format (remember, you must provide exactly ${durationDays} tasks):
[
  {
    "description": "Task description",
    "instructions": "Step-by-step instructions"
  }
]

Important: Count your tasks carefully and ensure you generate exactly ${durationDays} tasks.`;

    console.log('Sending request to OpenAI...');
    
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
            content: `Create exactly ${durationDays} daily tasks to achieve this goal: ${goalDescription}. Remember to return ONLY the JSON array with exactly ${durationDays} tasks.`
          }
        ],
        temperature: 0.3, // Lower temperature for more deterministic output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      // Clean and parse the response
      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      // Remove any markdown code block formatting
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('Cleaned content:', cleanContent);
      
      const tasks = JSON.parse(cleanContent);
      
      if (!Array.isArray(tasks)) {
        throw new Error('Generated content is not an array');
      }

      // Validate the number of tasks
      if (tasks.length !== durationDays) {
        console.error(`Generated ${tasks.length} tasks instead of ${durationDays}`);
        throw new Error(`Number of tasks (${tasks.length}) must be exactly equal to the duration days (${durationDays})`);
      }

      // Validate each task's structure and content
      const validatedTasks = tasks.map((task, index) => {
        if (!task.description || !task.instructions) {
          throw new Error(`Task ${index + 1} is missing required fields`);
        }
        return {
          description: String(task.description).trim(),
          instructions: String(task.instructions).trim()
        };
      });

      console.log(`Successfully generated ${validatedTasks.length} tasks`);

      return new Response(
        JSON.stringify({ tasks: validatedTasks }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );

    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      throw new Error(`Failed to parse OpenAI response: ${e.message}`);
    }

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