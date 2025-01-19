import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import AccessibleButton from "./AccessibleButton";
import { ButtonTypeEnum } from "./ENUMS/ButtonTypeEnum";
import { SuggestionsAPI } from "./SuggestionsAPI";
import { prompt_wordCompletion } from "./Propmts";

interface Iprops{
    text: string;
    buffer: string;
    context: string;
    fontSize: number;
    wordGroup: string
    hasContext: boolean
    hasWordGroup: boolean
    isReplacingBuffer: boolean;
    displaySentenceEditor: boolean;
    session_time_stamp_string: string;
    replaceBuffer: (string:string) => void;
    setIsReplacingBuffer:(status:boolean) => void;
    setIsGuesserSentenceSuggesion: (status:boolean) => void;
}
export default function BufferSuggestions(props:Iprops){
    const BUTTON_TYPE = ButtonTypeEnum.SUGGESTION;
    const preTextRef = useRef("");
    const [line1, setLine1] = useState<string[]>([]);
    const [line2, setLine2] = useState<string[]>([]);
    const [line3, setLine3] = useState<string[]>([]);

    // updates preText
    // preText is the text - last word (used for edition)
    useEffect(() => {
        if(props.text.length == 0)
            return;

        
        // preTextRef.current = props.text;
        // return
        
        // If NOT sentence editor, use whole text
        if(!props.displaySentenceEditor)
        {
            preTextRef.current = props.text;
            
            return;
        }

        // If sentence editor, use preText
        const words = props.text.trim().split(' ')
        console.log("words", words)
        if(words.length <= 1)
            return;
        preTextRef.current = words.slice(0, words.length - 1).join(' ')
    }, [props.text])
    

    function updateSuggestions(){
        props.setIsGuesserSentenceSuggesion(false);

        const prompt = `
            You are a helpful text completion system for a person who cannot talk or move. She relies completely on you for communication. 
            She is a friendly person and likes to talk casually and keep it short. 
            She is a student in spanish department. She likes to talk to her friends and family.

            You are a helpful text autocompleter that helps by guessing what the next word in the paragraph will be. 
            Your job is to help her by guessing what the next word in the paragraph will be. 
            You work this way: I will give you a text, and you guess the immediate most likely word to be used. 
            You provide in total 15 guess words, never more. your answer do not include extra words, just 15 words which are guesses.
            Sentences should be something she would use in daily life with friends, family and in school.
            sentences that have same word but in different tenses and participle form.
        `;
        console.log("pretext", preTextRef.current)
        const buffer = props.buffer;
        const wordGroup = props.wordGroup;
        const context = props.context;
        const preText = preTextRef.current
        console.log("buffer", buffer)
        props.setIsReplacingBuffer( props.buffer != "")  // To change keys color
        const promptContent = prompt_wordCompletion({context, preText, buffer, wordGroup})
        getSuggestions(prompt, promptContent);

    }
    useEffect(() => {
        updateSuggestions();
    }, [props.buffer, props.text, props.context, props.wordGroup, props.hasWordGroup, props.hasContext])


    function getSuggestions(prompt:string, promptContent:string){
        SuggestionsAPI(prompt, promptContent)
        .then((response:string[]) => {
            if(response.length > 21){
                response = response.slice(0, 21)
            }
            
            // getting rid of empty values
            response = response.filter((item:string) => item.trim() !== "");

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
        })
    }
 

    //These function replace buffer
    return(
        <Grid 
            m="0rem"
            p="1rem"  
            h="100%" 
            w="100%"
            gridTemplateAreas={`
                    "lines lines lines lines lines lines buttons"
                    "lines lines lines lines lines lines buttons"
                    "lines lines lines lines lines lines buttons"
                `}
            gridTemplateColumns={"5fr, 1fr"}
            gridTemplateRows={"1fr 1fr 1fr"}
        >
            <GridItem area={"lines"} w="100%" h="100%">
                <Flex alignItems={"center"} justifyContent="space-around" w="100%" h="100%" flexWrap={"wrap"}>
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%">
                        {
                            line1.map((word:string, i:number)=>{
                                return(
                                    <AccessibleButton session_time_stamp_string={props.session_time_stamp_string} buttonType={BUTTON_TYPE} fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l1_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} minW="8rem" >{word}</AccessibleButton>
                                )
                            })
                        }
                    </Flex>
                    <Flex alignItems={"center"} justifyContent="space-around" w="100%" >
                        {
                            line2.map((word:string, i:number)=>{
                                if(word){
                                    return(
                                        <AccessibleButton session_time_stamp_string={props.session_time_stamp_string} buttonType={BUTTON_TYPE} fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l2_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} minW="8rem">{word}</AccessibleButton>
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
                                        <AccessibleButton session_time_stamp_string={props.session_time_stamp_string} buttonType={BUTTON_TYPE} fontSize={props.fontSize} colorScheme={props.isReplacingBuffer ? "orange" : "cyan"}  key={"l3_"+i} delay={500} onClick={()=>{props.replaceBuffer(word)}} minW="8rem">{word}</AccessibleButton>
                                    )
                                }else return null;
                            })
                        }
                    </Flex>
                </Flex>
            </GridItem>
            <GridItem area={"buttons"} w="100%" h="100%">
                <AccessibleButton session_time_stamp_string={props.session_time_stamp_string} buttonType={ButtonTypeEnum.ADD_CONTEXT} fontSize={props.fontSize} delay={500} onClick={()=>{updateSuggestions()}}>Refresh</AccessibleButton>
            </GridItem>

        </Grid>

    )
}