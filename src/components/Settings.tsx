import { Divider, Flex, Text } from "@chakra-ui/react";
import AccessibleButton from "./AccessibleButton";

interface Iprops{
    clickSpeed: number;
    fontSize: number;
    changeClickSpeed: (change:number) => void;
    changeFontSize: (change:number) => void;
    setDisplaySettings: (value:string) => void;
}
export default function Settings(props:Iprops){
    return(
        <Flex flexDir={"column"} w="80vw" h="80vh"  bgColor="white" borderRadius={"lg"} p="5rem">
            <Flex justifyContent={"space-between"} p="0" m="0" w="100%">
                <Text fontSize={props.fontSize+3} fontWeight={"bold"}>Settings</Text>
                <AccessibleButton colorScheme="red" fontSize={props.fontSize} delay={props.clickSpeed} onClick={()=>{props.setDisplaySettings("none")}}>X</AccessibleButton>
            </Flex>
            <Divider my="3rem"></Divider>
            {/* Click speed */}
            <Flex w="20rem" justifyContent={"center"} alignItems={"center"} my="2rem">
                <Text textAlign={"left"} w="10rem" fontSize={props.fontSize} fontWeight={"bold"}>Clicking Speed</Text>
                <AccessibleButton disabled={(props.clickSpeed <= 500)} fontSize={props.fontSize} colorScheme="cyan" borderRadius={"3xl"}  delay={props.clickSpeed} onClick={()=>{props.changeClickSpeed(-100)}} >-</AccessibleButton>
                <Text w="5rem" fontSize={props.fontSize}>{props.clickSpeed/1000} sec</Text>
                <AccessibleButton disabled={(props.clickSpeed >= 1500)}  fontSize={props.fontSize} colorScheme="cyan" borderRadius={"3xl"} delay={props.clickSpeed} onClick={()=>{props.changeClickSpeed(100)}} >+</AccessibleButton>
            </Flex>
            <Flex w="20rem" justifyContent={"center"} alignItems={"center"} my="2rem">
                <Text textAlign={"left"} w="10rem" fontWeight={"bold"} fontSize={props.fontSize}>Font Size</Text>
                <AccessibleButton disabled={(props.fontSize <= 5)} fontSize={props.fontSize} colorScheme="cyan" borderRadius={"3xl"}  delay={props.clickSpeed} onClick={()=>{props.changeFontSize(-0.5)}} >-</AccessibleButton>
                <Text  w="5rem" fontSize={props.fontSize}>{props.fontSize}</Text>
                <AccessibleButton disabled={(props.fontSize >=  20)} fontSize={props.fontSize} colorScheme="cyan" borderRadius={"3xl"} delay={props.clickSpeed} onClick={()=>{props.changeFontSize(+0.5)}} >+</AccessibleButton>
            </Flex>
        </Flex>
    )
}