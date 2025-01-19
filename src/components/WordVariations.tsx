import { Flex } from "@chakra-ui/react";
import AccessibleButton from "./AccessibleButton";
import { ButtonTypeEnum } from "./ENUMS/ButtonTypeEnum";
import { useEffect, useState } from "react";
import { prompt_wordVariations } from "./Propmts";
import { SuggestionsAPI } from "./SuggestionsAPI";


interface IProps{
    session_time_stamp_string: string,
    fontSize: number,
    delay: number,
    context: string,
    text: string,
    replaceLastWord: (word:string) => void;
}
export default function WordVariations(props:IProps){
    const [variations, setVariations] = useState<string[]>([]);
    const [lastWord, setLastWord] = useState<string>("");
    const [preText, setPreText] = useState<string>("");

    // Sets lastWord every time 'text' is updated (buffer independent)
    useEffect(() => {
        if(props.text.length == 0)
            return;

        const words = props.text.trim().split(' ')
        setLastWord( words[words.length-1])

        if(words.length >= 1)
            return;
        setPreText(words.slice(0, words.length - 1).join(' '))
    }, [props.text])

    // Set variations
    useEffect(() => {
        if(lastWord == ""){
            setVariations([])
            return;
        }

        const context = props.context;
        const promptContent = prompt_wordVariations({context, preText, lastWord}) as string;
        if(promptContent == "")
            return;

        SuggestionsAPI("", promptContent)
        .then((response:string[])=>{
            setVariations(response)
        })
    }, [lastWord])
    
    return(
        <Flex gap={"5"}>
            {
                variations.map((variation:string, index:number)=>{
                    return(
                        <AccessibleButton 
                            buttonType={ButtonTypeEnum.EDITION} 
                            session_time_stamp_string={props.session_time_stamp_string} 
                            fontSize={props.fontSize} 
                            colorScheme="teal" 
                            w="100%" 
                            delay={props.delay} 
                            key={"key"+index} 
                            minW={"0.2rem"} 
                            m="0" 
                            p="0.2rem"
                            onClick={()=>{props.replaceLastWord(variation)}}
                            >
                            {variation}
                        </AccessibleButton>
                    )
                })
            }
            
        </Flex>
    )
}