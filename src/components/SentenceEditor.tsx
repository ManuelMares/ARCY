import { Divider, Flex, Text } from "@chakra-ui/react"
import AccessibleButton from "./AccessibleButton"

interface IProps{
    buffer: string,
    preSentence: string,
    postSentence: string,
    clickSpeed: number;
    fontSize: number;
    setDisplaySentenceEditor: (value:boolean) => void;
}
export default function SentenceEditor(props: IProps){
    return(
        <Flex flexDir={"column"} w="100%" h="100%"  bgColor="white" borderRadius={"lg"} p="1rem">
            <Flex justifyContent={"space-between"} p="0" m="0" w="100%">
                <Text fontSize={props.fontSize+3} fontWeight={"bold"}>Sentence editor</Text>
                <AccessibleButton colorScheme="red" fontSize={props.fontSize} delay={props.clickSpeed} onClick={()=>{props.setDisplaySentenceEditor(false)}}>X</AccessibleButton>
            </Flex>
            <Divider my="1rem"></Divider>
            <Flex flexDir={"row"}>
                <Text>{props.preSentence}</Text>
                <Text fontWeight={"bold"}>{props.buffer}</Text>
                <Text>{props.preSentence}</Text>
            </Flex>
        </Flex>
    )
}