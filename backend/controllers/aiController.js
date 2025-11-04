require("dotenv").config();

// AI Barista controller - generates recipes using OpenAI
const getAIBaristaResponse = async (req, res) => {
  try {
    const { prompt, side } = req.body;
    const userId = req.user?.id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return a mock response for development/testing
      const mockRecipes = {
        coffee: {
          title: "Classic Espresso",
          ingredients: [
            "18g freshly ground coffee beans",
            "90ml hot water (195-205°F)",
            "Optional: sugar or milk"
          ],
          steps: [
            "Grind your coffee beans to a fine consistency",
            "Heat water to 195-205°F",
            "Tamp the coffee grounds evenly in the portafilter",
            "Brew for 25-30 seconds",
            "Serve immediately and enjoy!"
          ],
          tips: "Use freshly roasted beans for the best flavor. The grind size is crucial - too fine will make it bitter, too coarse will make it weak."
        },
        tea: {
          title: "Perfect Matcha Latte",
          ingredients: [
            "1 tsp matcha powder",
            "2 oz hot water (175°F)",
            "6 oz steamed milk (or plant-based alternative)",
            "Optional: honey or vanilla syrup"
          ],
          steps: [
            "Sift matcha powder into a bowl to remove clumps",
            "Add hot water (175°F, not boiling)",
            "Whisk vigorously in a 'W' or 'M' motion until frothy",
            "Heat and froth your milk",
            "Pour milk into a cup, then add the matcha mixture",
            "Gently stir and enjoy!"
          ],
          tips: "Don't use boiling water - it will make the matcha bitter. The ideal temperature is 175°F. Use a bamboo whisk (chasen) for best results."
        }
      };

      const recipe = side === 'tea' ? mockRecipes.tea : mockRecipes.coffee;
      const response = `Here's a custom ${side} recipe based on your request:\n\n**${recipe.title}**\n\n**Ingredients:**\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\n**Steps:**\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n**Pro Tips:**\n${recipe.tips}`;

      return res.json({
        message: response,
        recipe: {
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          tips: recipe.tips,
          side: side || 'coffee'
        }
      });
    }

    // Use OpenAI API if configured
    const OpenAI = require("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = side === 'tea' 
      ? "You are a friendly tea expert barista. Create detailed, step-by-step tea recipes based on user requests. Always include ingredients, clear instructions, and helpful tips. Format your response as a recipe with ingredients list, numbered steps, and tips."
      : "You are a friendly coffee expert barista. Create detailed, step-by-step coffee recipes based on user requests. Always include ingredients, clear instructions, and helpful tips. Format your response as a recipe with ingredients list, numbered steps, and tips.";

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse the response to extract recipe structure
    const recipe = {
      title: extractTitle(aiResponse) || `${side} Recipe`,
      ingredients: extractIngredients(aiResponse),
      steps: extractSteps(aiResponse),
      tips: extractTips(aiResponse),
      side: side || 'coffee',
      fullText: aiResponse
    };

    res.json({
      message: aiResponse,
      recipe: recipe
    });
  } catch (error) {
    console.error("AI Barista error:", error);
    res.status(500).json({ 
      error: "Failed to generate recipe",
      message: error.message 
    });
  }
};

// Helper functions to parse AI response
function extractTitle(text) {
  const titleMatch = text.match(/\*\*([^*]+)\*\*/);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractIngredients(text) {
  const ingredientsMatch = text.match(/\*\*Ingredients?:\*\*\s*\n([\s\S]*?)(?=\*\*|$)/i);
  if (ingredientsMatch) {
    return ingredientsMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('-'))
      .map(line => line.replace(/^-\s*/, ''));
  }
  return [];
}

function extractSteps(text) {
  const stepsMatch = text.match(/\*\*Steps?:\*\*\s*\n([\s\S]*?)(?=\*\*|$)/i);
  if (stepsMatch) {
    return stepsMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, ''));
  }
  // Fallback: look for numbered list
  const numberedSteps = text.match(/\d+\.\s+[^\n]+/g);
  return numberedSteps ? numberedSteps.map(step => step.replace(/^\d+\.\s+/, '')) : [];
}

function extractTips(text) {
  const tipsMatch = text.match(/\*\*Tips?[:\s]+\*\*\s*\n([\s\S]*?)(?=\*\*|$)/i);
  return tipsMatch ? tipsMatch[1].trim() : '';
}

module.exports = {
  getAIBaristaResponse
};

