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

    const systemPrompt = `You are a helpful AI that breaks down goals into specific, actionable tasks. Your task is to create EXACTLY ${durationDays} tasks - one for each day, no more and no less. Each task must be specific, actionable, and build upon previous tasks.

    Requirements:
    1. Generate EXACTLY ${durationDays} tasks
    2. Each task must have a clear description and detailed instructions
    3. Tasks should progress logically, building upon previous tasks
    4. Tasks should be evenly distributed across the timeline
    5. Each task should be completable within a day

    Return ONLY a JSON array with exactly ${durationDays} objects, where each object has 'description' and 'instructions' fields. Do not include any additional text or formatting.

    Example format for ONE task (you must provide exactly ${durationDays} of these):
    {
      "description": "Clear task description",
      "instructions": "Detailed steps to complete the task"
    }`;

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
            content: `Goal: ${goalDescription}\nCreate exactly ${durationDays} daily tasks to achieve this goal.`
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
    console.log('Received response from OpenAI');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      const content = data.choices[0].message.content;
      console.log('Raw content from OpenAI:', content);
      
      // Clean up the content
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('Cleaned content:', cleanContent);
      
      // Parse and validate the tasks
      const parsedTasks = JSON.parse(cleanContent);
      
      if (!Array.isArray(parsedTasks)) {
        throw new Error('Generated content is not an array');
      }

      // Validate and sanitize each task
      const validatedTasks = parsedTasks.map((task, index) => {
        if (!task.description || !task.instructions) {
          throw new Error(`Task ${index} is missing required fields`);
        }
        return {
          description: String(task.description).trim(),
          instructions: String(task.instructions).trim()
        };
      });

      // Check if we have exactly the right number of tasks
      if (validatedTasks.length !== durationDays) {
        throw new Error(`Number of tasks (${validatedTasks.length}) must be exactly equal to the duration days (${durationDays})`);
      }

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