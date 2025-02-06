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

    const systemPrompt = `You are a task breakdown assistant. Your primary responsibility is to generate EXACTLY ${durationDays} tasks - no exceptions.

STRICT REQUIREMENTS:
1. You MUST output EXACTLY ${durationDays} tasks - this is a hard requirement
2. Each task should take 30 minutes to complete
3. Tasks should follow a logical progression
4. Each task needs a description and clear instructions
5. Output format must be a JSON array with ${durationDays} objects
6. Each object requires "description" and "instructions" fields only
7. No additional text or formatting allowed

IMPORTANT NOTES:
- Double-check your output contains EXACTLY ${durationDays} tasks
- If you generate more or fewer tasks, the system will reject your response
- Keep tasks simple enough to complete in 30 minutes

Example format:
[
  {
    "description": "Task description here",
    "instructions": "Step-by-step instructions here"
  }
]

Final check: Verify you have created EXACTLY ${durationDays} tasks before responding.`;

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
            content: `Create EXACTLY ${durationDays} tasks for this goal: ${goalDescription}. Remember: I need EXACTLY ${durationDays} tasks in the JSON array format - no more, no less.`
          }
        ],
        temperature: 0.2, // Very low temperature for more deterministic output
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
      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('Cleaned content:', cleanContent);
      
      const tasks = JSON.parse(cleanContent);
      
      if (!Array.isArray(tasks)) {
        throw new Error('Generated content is not an array');
      }

      console.log(`Number of tasks generated: ${tasks.length}`);
      if (tasks.length !== durationDays) {
        throw new Error(`OpenAI generated ${tasks.length} tasks instead of the required ${durationDays} tasks. Please try again.`);
      }

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