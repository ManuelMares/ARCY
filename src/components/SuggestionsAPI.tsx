import axios from "axios";

const OPEN_AI_KEY = import.meta.env.VITE_REACT_OPENAI_API_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions';


export async function SuggestionsAPI(prompt:string, promptContent:string){
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            };

            const requestBody = {
                // model: `gpt-4`,
                model: `gpt-4o-mini`,
                messages: [
                    {
                        role: 'system', 
                        content: prompt
                    },
                    { role: 'user', content: promptContent }
                ],
            };
            const { data } = await axios.post(apiUrl, requestBody, { headers });
            let response = data.choices[0].message.content;
            response = cleanString(response)
            response = response.split(/\s+/).filter((word:string) => word.trim() !== "");
            return response
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
};


function cleanString(str:string) {
    const regex = /[^a-zA-Z' \n]/g;
    const temp =  str.replace(regex, '');
    return temp.replace(/\\n/g, '\n');
}