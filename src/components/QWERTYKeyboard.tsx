import { Flex, GridItem } from "@chakra-ui/react";
import AccessibleButton from "./AccessibleButton";
import { useState } from "react";
import { ButtonTypeEnum } from "./ENUMS/ButtonTypeEnum";

interface IProps{
    fontSize: number;
    clickSpeed: number;
    keyboardWidth: number;
    buffer: string;
    text: string;
    setText: (text:string) => void;
    setBuffer: (text:string) => void;
    session_time_stamp_string: string;
}
enum ENUM_SYMBOL_LEVELS { 
    NORMAL = "normal", 
    CAPITAL = "capital", 
    SHIFT = "shift",
    NUMBER = "number",
}

const KEY_SYMBOLS = [
    {"index":1,  "normal":"q", "capital":"Q", "shift":"!",  "number":"0",},
    {"index":2,  "normal":"w", "capital":"W", "shift":"@",  "number":"1",},
    {"index":3,  "normal":"e", "capital":"E", "shift":"#",  "number":"2",},
    {"index":4,  "normal":"r", "capital":"R", "shift":"$",  "number":"3",},
    {"index":5,  "normal":"t", "capital":"T", "shift":"%",  "number":"4",},
    {"index":6,  "normal":"y", "capital":"Y", "shift":"^",  "number":"5",},
    {"index":7,  "normal":"u", "capital":"U", "shift":"&",  "number":"6",},
    {"index":8,  "normal":"i", "capital":"I", "shift":"*",  "number":"7",},
    {"index":9,  "normal":"o", "capital":"O", "shift":"(",  "number":"8",},
    {"index":10, "normal":"p", "capital":"P", "shift":")",  "number":"9",},
    {"index":11, "normal":"a", "capital":"A", "shift":"_",  "number":"10",},
    {"index":12, "normal":"s", "capital":"S", "shift":"-",  "number":"20",},
    {"index":13, "normal":"d", "capital":"D", "shift":"+",  "number":"30",},
    {"index":14, "normal":"f", "capital":"F", "shift":"=",  "number":"40",},
    {"index":15, "normal":"g", "capital":"G", "shift":"~",  "number":"50",},
    {"index":16, "normal":"h", "capital":"H", "shift":"`",  "number":"60",},
    {"index":17, "normal":"j", "capital":"J", "shift":"'",  "number":"70",},
    {"index":18, "normal":"k", "capital":"K", "shift":"\"", "number":"80",},
    {"index":19, "normal":"l", "capital":"L", "shift":",",  "number":"90",},
    {"index":20, "normal":"z", "capital":"Z", "shift":"<",  "number":"100",},
    {"index":21, "normal":"x", "capital":"X", "shift":".",  "number":".5",},
    {"index":22, "normal":"c", "capital":"C", "shift":">",  "number":"1/2",},
    {"index":23, "normal":"v", "capital":"V", "shift":"?",  "number":"1/3",},
    {"index":24, "normal":"b", "capital":"B", "shift":"/",  "number":"1/4",},
    {"index":25, "normal":"n", "capital":"N", "shift":"\\", "number":"1/5",},
    {"index":26, "normal":"m", "capital":"M", "shift":"|",  "number":"1/10",},
]


export default function QWERTYKeyboard(props: IProps){
    const [symbolLevel, setSymbolLevel] = useState<ENUM_SYMBOL_LEVELS>(ENUM_SYMBOL_LEVELS.NORMAL);
    const BUTTON_TYPE = ButtonTypeEnum.QWERTY_KEYBOARD;
    
    /*    Append the buffer and a given character to the text    */
    function addToBufferAndCloseIt(postfix:string){
        props.setText(props.text + props.buffer + postfix);
        props.setBuffer("")
    }

    /*    Adds the buffer making sure there is no space between buffer and previous word    */
    function prePendBuffer(symbol:string){
        if(props.buffer === ""){
            const temp = props.text.replace(/\s+$/, '');
            props.setText(temp + symbol);
        }else{
            const newBuffer = props.buffer.replace(/\s+$/, '') + symbol;
            props.setBuffer("");
            props.setText(props.text + newBuffer);
        }
    }

    /*    Adds the buffer making sure there is no space between buffer and previous word    */
    function addLineEnd(symbol:string){
        if(props.buffer === ""){
            const temp = props.text.replace(/\s+$/, '');
            props.setText(temp + symbol);
        }else{
            const newBuffer = props.buffer.replace(/\s+$/, '') + symbol;
            props.setBuffer("");
            props.setText(props.text + newBuffer);
        }
        
    }

    /* Deletes the left most character in the string (text + buffer) */
    function deleteCharacter() {
        if(props.buffer !== ""){
            props.setBuffer(props.buffer.slice(0, -1));
            return;
        }
        else if(props.text !== ""){
            props.setText(props.text.slice(0, -1));
        }
    }

    /* Adds a character to the buffer*/
    function addToBuffer(char:string){
        props.setBuffer(props.buffer + char)
    }
    
    return(
        <>
            <GridItem area="Keyboard"  h="100%" bgColor={"blackAlpha.400"} borderRadius={"md"} w="100%"  justifyContent={"center"} alignItems={"center"}  justifyItems={"center"} alignContent={"center"}>
                <Flex  h="100%" w={props.keyboardWidth+"%"} flexDir={"column"} flexWrap={"nowrap"} justifyContent={"center"} alignItems={"center"}  justifyItems={"center"} alignContent={"center"}>
                    
                    <Flex
                        w="100%"
                        h="100%"
                        alignItems={"center"}
                        justifyContent={"space-around"}
                        >
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[0][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[0][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[1][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[1][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[2][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[2][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[3][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[3][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[4][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[4][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[5][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[5][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[6][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[6][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[7][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[7][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[8][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[8][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[9][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[9][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{deleteCharacter()}} w="8rem" h="5rem">{"<-"}</AccessibleButton>
                    </Flex>
                    <Flex
                        w="100%"
                        h="100%"
                        alignItems={"center"}
                        justifyContent={"space-around"}
                        >
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme={symbolLevel != ENUM_SYMBOL_LEVELS.CAPITAL ? "blackAlpha"  : "orange"} delay={props.clickSpeed} onClick={()=>{setSymbolLevel(symbolLevel != ENUM_SYMBOL_LEVELS.CAPITAL ? ENUM_SYMBOL_LEVELS.CAPITAL : ENUM_SYMBOL_LEVELS.NORMAL)}} w="8rem" h="5rem">CAP</AccessibleButton>
                        
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[10][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[10][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[11][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[11][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[12][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[12][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[13][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[13][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[14][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[14][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[15][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[15][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[16][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[16][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[17][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[17][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[18][symbolLevel]);}} w="5rem" h="5rem">{KEY_SYMBOLS[18][symbolLevel]}</AccessibleButton>

                    </Flex>
                    <Flex
                        w="100%"
                        h="100%"
                        alignItems={"center"}
                        justifyContent={"space-around"}
                        >
                            
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme={symbolLevel != ENUM_SYMBOL_LEVELS.SHIFT ? "blackAlpha"  : "orange"} delay={props.clickSpeed} onClick={()=>{setSymbolLevel(symbolLevel != ENUM_SYMBOL_LEVELS.SHIFT ? ENUM_SYMBOL_LEVELS.SHIFT : ENUM_SYMBOL_LEVELS.NORMAL)}} w="8rem" h="5rem">Symbolic</AccessibleButton>
                        
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[19][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[19][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[20][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[20][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[21][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[21][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[22][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[22][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[23][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[23][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[24][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[24][symbolLevel]}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBuffer(KEY_SYMBOLS[25][symbolLevel]); }} w="5rem" h="5rem">{KEY_SYMBOLS[25][symbolLevel]}</AccessibleButton>                        
                        
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme={symbolLevel != ENUM_SYMBOL_LEVELS.NUMBER ? "blackAlpha"  : "orange"} delay={props.clickSpeed} onClick={()=>{setSymbolLevel(symbolLevel != ENUM_SYMBOL_LEVELS.NUMBER ? ENUM_SYMBOL_LEVELS.NUMBER : ENUM_SYMBOL_LEVELS.NORMAL)}} w="8rem" h="5rem">number</AccessibleButton>
                    </Flex>
                </Flex>
            </GridItem>


                {/* PUNCTUATION */}
            <GridItem area="punctuation" bgColor="blackAlpha.500" h="100%"   justifyContent={"center"} alignItems={"center"}  justifyItems={"center"} alignContent={"center"} >
                <Flex  h="100%" w="70%" flexDir={"column"} justifyContent={"center"}  alignItems={"center"}>
                {/* <Flex  h="100%" flexDir={"column"} justifyContent={"space-around"}> */}
                    
                    <Flex
                        w="100%"
                        h="100%"
                        alignItems={"center"}
                        justifyContent={"space-around"}
                        >
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addLineEnd(". "); setSymbolLevel(ENUM_SYMBOL_LEVELS.CAPITAL);}} w="5rem" h="5rem">.</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer(", ")}} w="5rem" h="5rem">,</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addLineEnd("! "); setSymbolLevel(ENUM_SYMBOL_LEVELS.CAPITAL);}} w="5rem" h="5rem">!</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addLineEnd("? "); setSymbolLevel(ENUM_SYMBOL_LEVELS.CAPITAL);}} w="5rem" h="5rem">?</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{addToBufferAndCloseIt(" ")}} w="15rem" h="5rem"> [ SPACE ]</AccessibleButton> 
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer(": ")}} w="5rem" h="5rem">:</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer("; ")}} w="5rem" h="5rem">;</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer("\"")}} w="5rem" h="5rem">"</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer("'")}} w="5rem" h="5rem">'</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer("(")}} w="5rem" h="5rem">{"("}</AccessibleButton>
                        <AccessibleButton buttonType={BUTTON_TYPE} session_time_stamp_string={props.session_time_stamp_string} fontSize={props.fontSize} colorScheme="blackAlpha" delay={props.clickSpeed} onClick={()=>{prePendBuffer(") ")}} w="5rem" h="5rem">{")"}</AccessibleButton>
                    </Flex>
                </Flex>
            </GridItem>
        </>
    )
}