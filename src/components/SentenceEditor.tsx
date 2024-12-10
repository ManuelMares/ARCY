import { Divider, Flex, Text } from "@chakra-ui/react"
import AccessibleButton from "./AccessibleButton"

interface IProps{
    buffer: string,
    preSentence: string,
    postSentence: string,
    clickSpeed: number;
    fontSize: number;
    setBuffer: (word:string) => void;
    setDisplaySentenceEditor: (value:boolean) => void;
    setPostSentence: (sentence:string) => void;
    setText: (sentence:string) => void;
}
export default function SentenceEditor(props: IProps){
    function closeSentenceEditor(){
        props.setBuffer("");
        props.setDisplaySentenceEditor(false);
    }
    function deleteEverythingToTheRight(){
        props.setText(props.preSentence + " ");
        props.setBuffer("");
        props.setDisplaySentenceEditor(false);
    }
    function clearBuffer(){
        props.setBuffer("");
    }
    return(
        <Flex flexDir={"column"} w="100%" h="100%"  bgColor="white" borderRadius={"lg"} p="1rem">
            <Flex justifyContent={"space-between"} p="0" m="0" w="100%">
                <Text fontSize={props.fontSize+3} fontWeight={"bold"}>Sentence editor</Text>
                <AccessibleButton colorScheme="orange" fontSize={props.fontSize} delay={props.clickSpeed} onClick={()=>{clearBuffer()}}>Clear Buffer</AccessibleButton>
                <AccessibleButton colorScheme="orange" fontSize={props.fontSize} delay={props.clickSpeed} onClick={()=>{deleteEverythingToTheRight()}}>Delete Right</AccessibleButton>
                <AccessibleButton colorScheme="red" fontSize={props.fontSize} delay={props.clickSpeed} onClick={()=>{closeSentenceEditor()}}>X</AccessibleButton>
            </Flex>
            <Divider my="1rem"></Divider>
            <Flex flexDir={"row"} alignItems={"center"}>
                <Text>{props.preSentence} </Text>
                <AccessibleButton fontSize={props.fontSize} delay={props.clickSpeed} colorScheme="orange" fontWeight={"bold"} mx="0.5rem">{props.buffer}</AccessibleButton>
                <Text>{props.postSentence } </Text>
            </Flex>
        </Flex>
    )
}