import { Flex, Grid, GridItem } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import AccessibleButton from "./AccessibleButton";

interface Iprops{
    prompt: string
    promptContent: string;
    replaceBuffer: (string:string) => void;
    isReplacingBuffer: boolean;
    fontSize: number;
}
export default function BufferSuggestions(props:Iprops){

    const OPEN_AI_KEY = import.meta.env.VITE_REACT_OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const [line1, setLine1] = useState<string[]>([]);
    const [line2, setLine2] = useState<string[]>([]);
    const [line3, setLine3] = useState<string[]>([]);

    useEffect(()=>{
        getSuggestions()
    }, [props.prompt, props.promptContent])    

    async function getSuggestions(){
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
                        content: props.prompt
                    },
                    { role: 'user', content: props.promptContent }
                ],
            };
            const { data } = await axios.post(apiUrl, requestBody, { headers });
            let response = data.choices[0].message.content;
            response = cleanString(response)
            response = response.split(" ")
            
            if(response.length > 21){
                response = response.slice(0, 21)
            }

            //divide array into three
            const n = response.length;
            const size = Math.floor(n/3);
            const remainder = n % 3;

            const size1 = size + (remainder > 0 ? 1 : 0);
            const size2 = size + (remainder > 0 ? 1 : 0);

            const array1 = response.slice(0, size1);
            while(array1.length < 5)
                array1.push(" ")
            while(array1.length > 5)
                array1.pop()
            
            const array2 = response.slice(size1, size1+size2);
            while(array2.length < 5)
                array2.push(" ")
            while(array2.length > 5)
                array2.pop()

            const array3 = response.slice(size1+size2)
            while(array3.length < 5)
                array3.push(" ")
            while(array3.length > 5)
                array3.pop()

            setLine1(array1);
            setLine2(array2);
            setLine3(array3);

            // setResponse(response)
        } 
        catch (error) {
            console.error('Error sending message:', error);
        }
    };

    
    function cleanString(str:string) {
        const regex = /[^a-zA-Z' \n]/g;
        return str.replace(regex, '');
    }



    //These function replace buffer
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
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%">
                        {
                            line1.map((word:string, i:number)=>{
                                return(
                                    <AccessibleButton fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l1_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} w="10rem" h="3rem">{word}</AccessibleButton>
                                )
                            })
                        }
                    </Flex>
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%" >
                        {
                            line2.map((word:string, i:number)=>{
                                if(word){
                                    return(
                                        <AccessibleButton fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l2_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} w="10rem" h="3rem">{word}</AccessibleButton>
                                    )
                                }else return null;
                            })
                        }
                    </Flex>
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%" >
                        {
                            line3.map((word:string, i:number)=>{
                                if(word){
                                    return(
                                        <AccessibleButton fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l3_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} w="10rem" h="3rem">{word}</AccessibleButton>
                                    )
                                }else return null;
                            })
                        }
                    </Flex>
                </Flex>
            </GridItem>
            <GridItem area={"buttons"} w="100%" h="100%">
                <AccessibleButton fontSize={props.fontSize} delay={500} onClick={()=>{getSuggestions()}}>Refresh</AccessibleButton>
            </GridItem>

        </Grid>

    )
}