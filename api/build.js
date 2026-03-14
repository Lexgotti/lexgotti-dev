export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"})
}

const {prompt} = req.body;

if(!prompt){
return res.status(400).json({error:"Prompt required"})
}

try{

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[
{role:"system",content:"You generate structured project blueprints."},
{role:"user",content:prompt}
]
})
});

const data = await response.json();

const result = data.choices?.[0]?.message?.content || "No result";

res.status(200).json({result});

}catch(err){

res.status(500).json({error:"Server error"})

}

}
