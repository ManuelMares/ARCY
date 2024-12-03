import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from "@chakra-ui/react";

const OPEN_AI_KEY = import.meta.env.VITE_REACT_OPENAI_API_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions'; 
// const apiKey = process.env.VITE_REACT_OPENAI_API_KEY; 


export default function Trainer(){
    const [text, setText] = useState<string>("");
    // const [options, setOptions] = useState<string>("");
    const [option1, setOption1] = useState<string>("");
    const [option2, setOption2] = useState<string>("");
    const [option3, setOption3] = useState<string>("");
    const [option4, setOption4] = useState<string>("");

    useEffect(()=>{
        function registerKey(e:KeyboardEvent){
            if (e.repeat) return;
            e.preventDefault();

            const key:string  = e.key;
            updateText(key);
        }

        document.addEventListener("keyup", registerKey, false);
        
        return ()=> {
            document.removeEventListener('keyup', registerKey) 
        }
    }, []);


    function updateText(letter:string){  
        setText(prevText => prevText + letter);
        console.log("texT: ", text);
        
    }

    useEffect(() => {
        sendMessage();
    }, [text])

    const sendMessage = async () => {
        if(text === ""){
            console.log("BADD!!!");
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            };

            const requestBody = {
                model: `gpt-3.5-turbo`,
                messages: [
                    { role: 'system', content: `
                            
                            You are helping me complete sentences for a casual chat with friends.
                            Your response has to be in JSON format, like this:
                                {
                                    "input": "Hell",
                                    "option1": "Hello",
                                    "option2": "Hello!",
                                    "option3": "Hello,",
                                    "option4": "Hello."
                                }

                        `},
                    { role: 'user', content: text }
                ],
            };

            const { data } = await axios.post(apiUrl, requestBody, { headers });
            const response = JSON.parse(data.choices[0].message.content);
            setOption1(response.option1);
            setOption2(response.option2);
            setOption3(response.option3);
            setOption4(response.option4);
            // setOptions(data.choices[0].message.content);
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
    };


    return(
        <>
            {text}
            <Button onClick={()=>{setText("")}}>A</Button>
            <Button onClick={()=>{updateText(option1)}}>{option1}</Button>
            <Button onClick={()=>{updateText(option2)}}>{option2}</Button>
            <Button onClick={()=>{updateText(option3)}}>{option3}</Button>
            <Button onClick={()=>{updateText(option4)}}>{option4}</Button>
            {/* <div>
                <Button  onClick={()=>{updateText('A')}}>A</Button>
                <Button  onClick={()=>{updateText('B')}}>B</Button>
                <Button  onClick={()=>{updateText('C')}}>C</Button>
                <Button  onClick={()=>{updateText('D')}}>D</Button>
                <Button  onClick={()=>{updateText('E')}}>E</Button>
                <Button  onClick={()=>{updateText('F')}}>F</Button>
                <Button  onClick={()=>{updateText('G')}}>G</Button>
                <Button  onClick={()=>{updateText('H')}}>H</Button>
                <Button  onClick={()=>{updateText('I')}}>I</Button>
                <Button  onClick={()=>{updateText('J')}}>J</Button>
                <Button  onClick={()=>{updateText('K')}}>K</Button>
                <Button  onClick={()=>{updateText('L')}}>L</Button>
                <Button  onClick={()=>{updateText('M')}}>M</Button>
                <Button  onClick={()=>{updateText('N')}}>N</Button>
                <Button  onClick={()=>{updateText('O')}}>O</Button>
                <Button  onClick={()=>{updateText('P')}}>P</Button>
                <Button  onClick={()=>{updateText('Q')}}>Q</Button>
                <Button  onClick={()=>{updateText('R')}}>R</Button>
                <Button  onClick={()=>{updateText('S')}}>S</Button>
                <Button  onClick={()=>{updateText('T')}}>T</Button>
                <Button  onClick={()=>{updateText('U')}}>U</Button>
                <Button  onClick={()=>{updateText('V')}}>V</Button>
                <Button  onClick={()=>{updateText('W')}}>W</Button>
                <Button  onClick={()=>{updateText('X')}}>X</Button>
                <Button  onClick={()=>{updateText('Y')}}>Y</Button>
                <Button  onClick={()=>{updateText('Z')}}>Z</Button>
                <Button  onClick={()=>{updateText(' ')}}>     </Button>
            </div> */}
            <br></br>
            {/* {options} */}
        </>
    )
}