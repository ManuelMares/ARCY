import { Flex, Grid, GridItem } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import AccessibleButton from "./AccessibleButton";
import { ButtonTypeEnum } from "./ENUMS/ButtonTypeEnum";

interface Iprops{
    prompt: string
    promptContent: string;
    replaceText: (string:string) => void;
    fontSize: number;
    numberOfSentences: number
    session_time_stamp_string: string;
}
export default function SentenceGuesser(props:Iprops){
    const BUTTON_TYPE = ButtonTypeEnum.SUGGESTION;
    const OPEN_AI_KEY = import.meta.env.VITE_REACT_OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const [sentences, setSentences] = useState<string[]>([]);

    useEffect(()=>{
        getSuggestions()
    }, [props.prompt, props.promptContent])    

    async function getSuggestions(){
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            };
            console.log(props.prompt)
            console.log(props.promptContent)
            const requestBody = {
                model: `gpt-3.5-turbo`,
                messages: [
                    {
                        role: 'system', 
                        content: props.prompt
                    },
                    { role: 'user', content: props.promptContent }
                ],
            };
            const { data } = await axios.post(apiUrl, requestBody, { headers });
            let response = data.choices[0].message.content;
            response = cleanString(response)
            response = response.split(";")
            
            if(response.length > props.numberOfSentences){
                response = response.slice(0, 21)
            }
            setSentences(response)
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
    };


    function cleanString(str:string) {
        const regex = /[^a-zA-Z' \n;]/g;
        return str.replace(regex, '');
    }


    return(
        <Grid 
            p="1rem"  
            h="100%" 
            gridTemplateAreas={`
                    "lines lines lines lines lines lines buttons"
                    "lines lines lines lines lines lines buttons"
                    "lines lines lines lines lines lines buttons"
                `}
            gridTemplateColumns={"6fr, 1fr"}
            gridTemplateRows={"1fr 1fr 1fr"}
        >
            <GridItem area={"lines"} w="100%" h="100%">
                <Flex alignItems={"center"} justifyContent="space-around" w="100%" h="100%" flexWrap={"wrap"}>
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%" wrap={"wrap"} gap={"0.5rem"}>
                        {
                            sentences.map((sentence:string, i:number)=>{
                                return(
                                    <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="cyan"  key={"l1_"+i} delay={500} onClick={()=>{props.replaceText(sentence)}} w="45%" h="3rem">{sentence}</AccessibleButton>
                                )
                            })
                        }
                    </Flex>
                </Flex>
            </GridItem>
            <GridItem area={"buttons"} w="100%" h="100%">
                <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string}  fontSize={props.fontSize} delay={500} onClick={()=>{getSuggestions()}}>Refresh</AccessibleButton>
            </GridItem>
        </Grid>

    )
}