const button = document.getElementById("generate");
const promptBox = document.getElementById("prompt");
const output = document.getElementById("output");

button.onclick = async () => {

const prompt = promptBox.value;

if(!prompt){
output.textContent = "Please enter a prompt.";
return;
}

output.textContent = "Generating...";

try{

const res = await fetch("/api/build",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({prompt})
});

const data = await res.json();

output.textContent = data.result;

}catch(e){

output.textContent = "Error contacting API";

}

}
