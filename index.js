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
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://divinemyst.onrender.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://divinemyst.onrender.com/cancel',
      metadata: {
        dob: formData.dob,
        name: formData.name,
        location: formData.location,
        desire: formData.desire,
        sign: formData.sign,
        gender: formData.gender,
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
 
       
       const imagePrompt = `Create a mystical, powerful, and uplifting image of a radiant, celestial ${formData.gender === 'female' ? 'goddess' : 'angelic being'} named ${formData.name}, 
 born on ${formData.dob}, under the sign of ${formData.sign}, currently in ${formData.location}. 
 ${formData.gender === 'female' ? 'She' : 'He'} is surrounded by shimmering cosmic energy, a glowing aura, and ethereal light. 
 Their essence embodies the energy of ${formData.desire.replace("-", " ")}, visualized as a luminous symbol held in their hands. 
 Styled as high-fantasy spiritual artwork, with sacred geometry, iridescent colors, and divine galactic vibes.`;
 
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