import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";  // Adjusted import for the latest package
import Stripe from "stripe";


dotenv.config();
const app = express();
const PORT = process.env.PORT;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log(process.env.NODE_ENV)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 

app.post('/create-checkout-session', async (req, res) => {
  const formData=req.body;
  console.log("THE data fromthe frontend is",formData);
  

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://divinemyst.life/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://divinemyst.life',
      metadata: {
        dob: formData.dob,
        name: formData.name,
        location: formData.location,
        desire: formData.desire,
        sign: formData.sign,
        gender: formData.gender,
      },
      automatic_payment_methods: {
      enabled: true
      },
    });

    console.log("Saved data with session ID:", session.id);

    res.json({ url: session.url });

    // res.json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/verify-payment', async (req, res) => {
  const sessionId=req.query.session_id;

  console.log("The session id",sessionId);
  

  try {
    // Retrieve the Stripe checkout session to verify the payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const metadata=session.metadata;

      console.log("MEtadata are", metadata);
      

      const formData={
        dob:metadata.dob,
        name:metadata.name,
        location: metadata.location,
        desire: metadata.desire,
        sign: metadata.sign,
        gender: metadata.gender,
      };

       // Build the OpenAI prompt
       const prompt = `Generate a spiritual, uplifting message for a ${formData.gender} born on ${formData.dob}, name is ${formData.name} living in ${formData.location}, who desires ${formData.desire}, and is a ${formData.sign} sign. Keep it mystical, powerful, and full of positive energy. Dont include [your name] at the end of the text you should replace it with ${formData.name}`;

       // Get text message from OpenAI
       const textResponse = await openai.chat.completions.create({
         model: "gpt-3.5-turbo",
         messages: [{ role: "user", content: prompt }],
         max_tokens: 300,
       });
 
       const message = textResponse.choices[0].message.content;
 
       
       const isFemale = formData.gender === 'female';

       const imagePrompt = `
       Create a breathtaking high-fantasy portrait of a divine ${isFemale ? 'goddess' : 'celestial guardian'} named ${formData.name}, 
       born on ${formData.dob}, under the zodiac sign of ${formData.sign}. 
       ${isFemale ? 'She' : 'He'} radiates ${isFemale ? 'graceful yet commanding' : 'fierce and protective'} energy, surrounded by ${isFemale ? 'golden stardust and glowing sacred geometry' : 'dark ethereal flames and celestial lightning'}.
       
       The background shimmers with ${isFemale ? 'iridescent cosmic hues' : 'stormy galactic clouds'}, 
       and ${isFemale ? 'her' : 'his'} aura is infused with divine energy. 
       In ${isFemale ? 'her' : 'his'} hands, ${isFemale ? 'she' : 'he'} holds the luminous essence of ${formData.desire.replace("-", " ")}, 
       symbolized as a radiant, floating artifact.
       
       The style should mirror ultra-detailed digital fantasy art, inspired by Egyptian goddesses or angelic warriors, 
       emphasizing ${isFemale ? 'celestial beauty and spiritual elegance' : 'divine power and celestial dominance'}.
       `;
       
 
       const imageResponse = await openai.images.generate({
         model: "dall-e-3",
         prompt: imagePrompt,
         n: 1,
         size: "1024x1024",
       });
 
       const imageUrl = imageResponse.data[0].url;
 
       console.log("data from the api is ",imageUrl);
       // Respond with everything
       return res.json({ success: true, message, imageUrl });

    } else {
      res.json({ success: false, message:'Payment not completed' });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.json({ success: false, message:'Internal Server Error' });
  }
});




// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/dist', 'index.html'));
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
