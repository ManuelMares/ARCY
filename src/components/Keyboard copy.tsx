import { Box, Button, Flex, Grid, GridItem, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from "@chakra-ui/react";
import axios from "axios";
// import SentenceOptions from "./SentenceOptions";
import { useEffect, useRef, useState } from "react";

const OPEN_AI_KEY = import.meta.env.VITE_REACT_OPENAI_API_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions'; 

export default function Keyboard(){
    const [text, setText] = useState<string>("");
    const [buffer, setBuffer] = useState<string>("");
    const [lastClicked, setLastClicked] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["","","","",""]);
    const SHORT_TIME = 300;
    const LONG_TIME = 1700;


    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


    useEffect(() => {
        start_options()
    }, [])
    
    function generate_new_options_prompt(){
        return `Provide exactly 5 words to complete this sentence. Your response should contain only these 5 words. If you provide more than 5 words, the answer will be considered invalid. Suggest new words to complete the sentence, avoiding those previously listed:

Incomplete Sentence: ${buffer}

Previous Attempts (Do not repeat these):

${options[0]}

${options[1]}

${options[2]}

${options[3]}

${options[4]}

Only provide 5 new words to complete the sentence.`
    }

    function start_options(){
        const prompt = generate_new_options_prompt();
        sendMessage(prompt+"five pronouns that will be useful to start random sentences", 0);
        sendMessage(prompt+"five personal pronouns that will be useful to start random sentences", 1);
        sendMessage(prompt+"five auxiliar verbs that will be useful to start random sentences", 2);
        sendMessage(prompt+"five auxiliar verbs that will be useful to start random sentences", 3);
        sendMessage(prompt+"five question words that will be useful to start random sentences", 4);
    }

    function reload_all_options(){
        const prompt = `
        I want to talk with my friends, and I need your help to complete my sentences.
Provide exactly 25 words to complete this sentence. Your response should contain only these 25 words. If you provide more than 25 words, the answer will be considered invalid. Suggest new words to complete the sentence, avoiding those previously listed:

Incomplete Sentence: ${buffer}

Previous Attempts (Do not repeat these):

${options[0]}

${options[1]}

${options[2]}

${options[3]}

${options[4]}

Only provide 25 new words to complete the sentence.
        `
        // console.log(prompt)
        sendMessage2222(prompt);
        // sendMessage(prompt, 1);
        // sendMessage(prompt, 2);
        // sendMessage(prompt, 3);
        // sendMessage(prompt, 4);
    }
    













    //---------------------------------------------------------------------------
    //Refresh Chatgpt Options
    //---------------------------------------------------------------------------
        async function sendMessage2222(prompt:string){
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            };

            const requestBody = {
                model: `gpt-3.5-turbo`,
                messages: [
                    {
                        role: 'system', 
                        content: prompt
                    },
                    { role: 'user', content: text }
                ],
            };
            const { data } = await axios.post(apiUrl, requestBody, { headers });
            let response = data.choices[0].message.content;
            console.log("----------",response)
            response = cleanString(response)
            response = response.split(" ")
            console.log("----------",response)
            if(response.length >= 5){
                const temp = response.slice(0,5)
                options[0] = temp.join(" ")
                setOptions([...options])
            }
            if(response.length >= 10){
                const temp = response.slice(5,10)
                options[1] = temp.join(" ")
                setOptions([...options])
            }
            if(response.length >= 15){
                const temp = response.slice(10,15)
                options[2] = temp.join(" ")
                setOptions([...options])
            }
            if(response.length >= 20){
                const temp = response.slice(15,20)
                options[3] = temp.join(" ")
                setOptions([...options])
            }
            if(response.length >= 25){
                const temp = response.slice(20,25)
                options[4] = temp.join(" ")
                setOptions([...options])
            }
            setLastClicked("");
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
    };
        async function sendMessage(prompt:string, option_index:number){
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            };

            const requestBody = {
                model: `gpt-3.5-turbo`,
                messages: [
                    {
                        role: 'system', 
                        content: prompt
                    },
                    { role: 'user', content: text }
                ],
            };
            const { data } = await axios.post(apiUrl, requestBody, { headers });
            let response = data.choices[0].message.content;
            console.log(response)
            if(countWords(response) >5)
                return;
            response = cleanString(response)
            options[option_index] = response
            setOptions([...options])
            setLastClicked("");
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
    };

    function countWords(str:string) {
        str = str.trim();
        const wordsArray = str.split(/\s+/); // Using a regular expression to match one or more spaces
        return wordsArray.length;
    }
    
    function cleanString(str:string) {
        const regex = /[^a-zA-Z' \-\n]/g;
        return str.replace(regex, '');
    }
    

    const handleMouseEnter3 = (e:React.MouseEvent<HTMLButtonElement>) => {
        const button = document.getElementById(e.currentTarget.id);
        hoverTimeout.current = setTimeout(() => {
            if(button){
                const color = button.style.backgroundColor;
                button.style.backgroundColor = "blue";
                const prompt = generate_new_options_prompt();
                sendMessage(prompt, Number(button.ariaRowIndex))
                
                //click animation
                setTimeout(()=>{
                    button.style.backgroundColor = color;
                },SHORT_TIME)
            }
        }, SHORT_TIME); // 0.5 seconds
    };














    //---------------------------------------------------------------------------
    //Text buttons
    //---------------------------------------------------------------------------
    const handleMouseEnter = (e:React.MouseEvent<HTMLButtonElement>) => {
        const button = document.getElementById(e.currentTarget.id);
        const value = button!.textContent;
        hoverTimeout.current = setTimeout(() => {
            if(button){
                if(button.id == lastClicked){
                    setBuffer(removeLastWord(buffer))
                    setLastClicked("")
                }else{
                    const color = button.style.backgroundColor;
                    button.style.backgroundColor = "gray";
                    //click animation
                    setTimeout(()=>{
                        button.style.backgroundColor = color;
                    },SHORT_TIME)
                    setLastClicked(button.id);
                    //button action
                    setBuffer(buffer + " " + value)
                }
            }
        }, SHORT_TIME);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current !== null) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    

    const handleMouseLeave3 = () => {
        if (hoverTimeout.current !== null) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    //---------------------------------------------------------------------------
    //final buttons
    //---------------------------------------------------------------------------
    const handleMouseEnter2 = (e:React.MouseEvent<HTMLButtonElement>) => {
        const button = document.getElementById(e.currentTarget.id);
        const value = button!.textContent;
        hoverTimeout.current = setTimeout(() => {
            if(button){
                const color = button.style.backgroundColor;
                button.style.backgroundColor = "gray";

                //click animation
                setTimeout(()=>{
                    button.style.backgroundColor = color;
                },SHORT_TIME)
            }
            //button action
            if(value == "Add Buffer"){
                setText(text + " " + buffer)
                setBuffer("")
                start_options();
            }
            if(value == "Delete Word From Buffer"){
                setBuffer(removeLastWord(buffer))
            }
            if(value == "Clear Buffer"){
                setBuffer("")
                start_options()
            }
            if(value == "reload_all_options"){
                reload_all_options()
            }
            setLastClicked("");
        }, LONG_TIME); // 0.5 seconds
    };

    const handleMouseLeave2 = () => {
        if (hoverTimeout.current !== null) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    function removeLastWord(str:string) {
        const words = str.trim().split(' ');
        words.pop();
        return words.join(' ');
    }
    





    return(
        <Flex p="0" margin="0" justifyContent="flex-start" direction="column" w="100vw" h="100vh">
            <Box overflowY="auto" w="full" h="25%" p="0">
                <Text fontSize={22} textAlign="justify" p="1rem" minH="100%" m="0" w="full" h="auto" bgColor="gray.200">
                    {text}
                </Text>
            </Box>
            <Box overflowY="auto" w="full" h="5%" p="1rem">
                <Text fontWeight="500" fontSize={20} textAlign="justify" m="0" p="0" w="full">
                    Buffer: {buffer}
                </Text>
            </Box>

            <Grid 
                templateAreas={`
                    "whiteSpace set0 buttons"
                    "whiteSpace set1 buttons"
                    "whiteSpace set2 buttons"
                    "whiteSpace set3 buttons"
                    "whiteSpace set4 buttons"
                    "whiteSpace set5 buttons"
                `}
                gridTemplateRows={'repeat(5, 1fr)'} 
                gridTemplateColumns={'1fr 5fr 1fr'} 

                h="70%" 
                py="3rem" 
                bgColor="blackAlpha.700" 
                gap={6}
                >

                
                {/* ======================================================= */}
                {/* controls */}
                <GridItem area="whiteSpace" >
                    <Grid templateRows="1fr 1fr" h="100%" >
                        <GridItem rowSpan={1} pl="1rem">
                            <Text fontWeight={700}>Buffer's timer</Text>
                            <NumberInput defaultValue={0.3} step={0.1} max={1} min={0}>
                                <NumberInputField bgColor="white"/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </GridItem>
                        <GridItem rowSpan={1} pl="1rem">
                            <Text fontWeight={700}>Button's timer</Text>
                            <NumberInput defaultValue={0.3} step={0.1} max={1} min={0}>
                                <NumberInputField bgColor="white"/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </GridItem>
                    </Grid>
                </GridItem>

                
                {/* ======================================================= */}
                {/* Dynamic Options */}
                {
                    options.map( (sentence:string, i:number)=>{
                        return (
                            <GridItem area={"set"+i} key={i} bgColor='blackAlpha.300' alignSelf={"center"} p="1rem" borderRadius={"md"}>
                                <Grid gridTemplateColumns="repeat(6, 1fr)">
                                    {
                                        sentence.split(" ").map( (word:string, j:number) =>
                                            word !== "" ?
                                            (
                                                <GridItem justifySelf={"flex-start"} colSpan={1}>
                                                    <Button id={"Button_"+i+"_"+j} size='lg' key={j} colorScheme='blackAlpha' bgColor={lastClicked == "Button_"+i+"_"+j ? "blue.700":"blackAlpha.500"} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter(e)} onMouseLeave={()=>handleMouseLeave()}>{word}</Button>
                                                </GridItem>
                                            )
                                            :
                                            <></>
                                        )
                                    }
                                    <GridItem justifySelf={"flex-start"} colSpan={1} colStart={6}>
                                        <Button aria-rowindex={i} id={"Refresh_"+i} size='lg' bgColor="blue.500" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter3(e)} onMouseLeave={()=>handleMouseLeave3()}>Refresh</Button>
                                    </GridItem>
                                </Grid>
                            </GridItem>
                        )
                    })
                }
                


                {/* ======================================================= */}
                {/* Punctuation Marks */}
                <GridItem area={"set5"}  bgColor='blackAlpha.300' alignSelf={"center"} p="1rem" borderRadius={"md"}>
                    <Grid gridTemplateColumns="repeat(6, 1fr)">
                        <GridItem justifySelf={"flex-start"} colSpan={1}>
                            <Button id={"Button_dot"} size='lg' colorScheme='blackAlpha' bgColor={lastClicked == "Button_dot" ? "blue.700":"blackAlpha.500"}  onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter(e)} onMouseLeave={()=>handleMouseLeave()}>.</Button>
                        </GridItem>
                        <GridItem justifySelf={"flex-start"} colSpan={1}>
                            <Button id={"Button_comma"} size='lg' colorScheme='blackAlpha' bgColor={lastClicked == "Button_comma" ? "blue.700":"blackAlpha.500"}  onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter(e)} onMouseLeave={()=>handleMouseLeave()}>,</Button>
                        </GridItem>
                        <GridItem justifySelf={"flex-start"} colSpan={1}>
                            <Button id={"Button_question"} size='lg' colorScheme='blackAlpha' bgColor={lastClicked == "Button_question" ? "blue.700":"blackAlpha.500"}  onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter(e)} onMouseLeave={()=>handleMouseLeave()}>?</Button>
                        </GridItem>
                        <GridItem justifySelf={"flex-start"} colSpan={1}>
                            <Button id={"Button_exclamation"} size='lg' colorScheme='blackAlpha' bgColor={lastClicked == "Button_exclamation" ? "blue.700":"blackAlpha.500"}  onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter(e)} onMouseLeave={()=>handleMouseLeave()}>!</Button>
                        </GridItem>
                    </Grid>
                </GridItem>



                {/* ======================================================= */}
                {/* Buffer buttons */}
                <GridItem area="buttons"  rowSpan={5}>
                    <Grid templateRows="repeat(4, 1fr)" h="100%">
                        <GridItem justifySelf={"flex-start"} alignSelf={"center"} rowSpan={1}><Button id="reload_all_options" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter2(e)} onMouseLeave={()=>handleMouseLeave2()} h="5rem" colorScheme="blue">reload_all_options</Button></GridItem>
                        <GridItem justifySelf={"flex-start"} alignSelf={"center"} rowSpan={1}><Button id="add_buffer" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter2(e)} onMouseLeave={()=>handleMouseLeave2()} h="5rem" colorScheme="green">Add Buffer</Button></GridItem>
                        <GridItem justifySelf={"flex-start"} alignSelf={"center"} rowSpan={1}><Button id="delete_word" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter2(e)} onMouseLeave={()=>handleMouseLeave2()} h="5rem" colorScheme="orange">Delete Word From Buffer</Button></GridItem>
                        <GridItem justifySelf={"flex-start"} alignSelf={"center"} rowSpan={1}><Button id="clear_buffer" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) =>handleMouseEnter2(e)} onMouseLeave={()=>handleMouseLeave2()} h="5rem" colorScheme="red">Clear Buffer</Button></GridItem>
                    </Grid>
                </GridItem>
            </Grid>

        </Flex>
    )
}