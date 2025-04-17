// app.post("/api/divine-insight", async (req, res) => {
//   const { dob, location, desire, sign,name,gender } = req.body;

//   console.log("The request body is:", req.body);
  

//   try {
//     const prompt = `Generate a spiritual, uplifting message for a ${gender} born on ${dob}, name is ${name} living in ${location}, who desires ${desire}, and is a ${sign} sign. Keep it mystical, powerful, and full of positive energy.`;
//     console.log("THe Prompt is:",prompt);
    
//     // Get text response
//     const textResponse = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 300,
//     });

//     const message = textResponse.choices[0].message.content;

//     console.log("Message from the api:",message);


//     // Generate image based on the same prompt
//     const imageResponse = await openai.images.generate({
//     model: "dall-e-3",
//     prompt:`Create a mystical, powerful, and uplifting image of a radiant, celestial ${gender === 'female' ? 'goddess' : 'angelic being'} named ${name}, 
// born on ${dob}, under the sign of ${sign}, currently in ${location}. 
// ${gender === 'female' ? 'She' : 'He'} is surrounded by shimmering cosmic energy, a glowing aura, and ethereal light. 
// Their essence embodies the energy of ${desire.replace("-", " ")}, visualized as a luminous symbol held in their hands. 

// The scene is styled as high-fantasy spiritual artwork, featuring sacred geometry, iridescent colors, light sparkles, soft radiant glow, 
// and a divine galactic atmosphere. Set against a starry cosmic background with subtle hints of crown chakra activation and pure mystical beauty. 
// Ultra-detailed, dreamlike, and deeply spiritual.`,
//       n: 1, 
//       size: "1024x1024",
//     });

//     const imageUrl = imageResponse.data[0].url;
//     console.log("THe image url from AI is ",imageUrl);
    

//     res.json({ message, imageUrl });
//   } catch (error) {
//     console.error("OpenAI Error:", error);
//     res.status(500).json({ error: "Failed to fetch insight." });
//   }
// });
# divinebackend
