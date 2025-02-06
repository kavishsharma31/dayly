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

    // Maximum retries for getting the correct number of tasks
    const maxRetries = 3;
    let attempts = 0;
    let tasks = null;

    while (attempts < maxRetries && !tasks) {
      attempts++;
      console.log(`Attempt ${attempts} to generate tasks...`);

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
              content: `You are a helpful AI that breaks down goals into specific, actionable tasks. Your task is to create EXACTLY ${durationDays} tasks - one for each day, no more and no less. Each task must have a clear description and detailed instructions. Tasks should be evenly distributed across the timeline. You must return ONLY a JSON array with exactly ${durationDays} objects, where each object has 'description' and 'instructions' fields. Do not include any additional text or markdown formatting. Example format:
              [
                {
                  "description": "Task 1 title",
                  "instructions": "Detailed steps for task 1"
                }
              ]
              Remember: The array MUST contain exactly ${durationDays} tasks, not one more or less.`
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
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI Response:', JSON.stringify(data));

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
          console.log('Generated content is not an array, retrying...');
          continue;
        }

        // Validate and sanitize each task
        const validatedTasks = parsedTasks.map((task, index) => {
          if (!task.description || !task.instructions) {
            throw new Error(`Task ${index} is missing required fields`);
          }
          return {
            description: String(task.description),
            instructions: String(task.instructions)
          };
        });

        // Check if we have exactly the right number of tasks
        if (validatedTasks.length === durationDays) {
          tasks = validatedTasks;
          console.log('Successfully generated correct number of tasks');
        } else {
          console.log(`Generated ${validatedTasks.length} tasks instead of ${durationDays}, retrying...`);
        }

      } catch (e) {
        console.error('Error parsing OpenAI response:', e);
        if (attempts === maxRetries) {
          throw new Error(`Failed to parse OpenAI response after ${maxRetries} attempts: ${e.message}`);
        }
      }
    }

    if (!tasks) {
      throw new Error(`Failed to generate exactly ${durationDays} tasks after ${maxRetries} attempts`);
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