import { Flex } from "@chakra-ui/react";
import Settings from "./Settings";
import SentenceEditor from "./SentenceEditor";

interface IProps{
    displaySentenceEditor: boolean;
    displaySettings: boolean;
    keyboardWidth: number;
    clickSpeed: number;
    fontSize: number;
    setDisplaySentenceEditor: (value:boolean)=>void;
    setDisplaySettings: (value:boolean)=>void;
    setKeyboardWidth: (value:number)=>void;
    setClickSpeed: (value:number)=>void;
    setFontSize: (value:number)=>void;

    buffer: string;
    postSentence: string;
    preSentence: string;
    setText: (value:string) => void
    setPostSentence: (value:string) => void
    setBuffer: (value:string) => void
    
    session_time_stamp_string: string;
}
export default function SecondaryMenus(props: IProps){
    
    function changeClickSpeed(change:number){
        props.setClickSpeed(props.clickSpeed + change);
        if(props.clickSpeed < 500)
            props.setClickSpeed(500);
        if(props.clickSpeed > 1500)
            props.setClickSpeed(1500);
    }

    function changeFontSize(change:number){
        props.setFontSize(props.fontSize + change);
        if(props.fontSize < 5)
            props.setFontSize(5);
        if(props.fontSize > 20)
            props.setFontSize(20);
    }

    return(
        <>
            {
                props.displaySettings
                ?
                    <Flex className="blurry-bg" position={"absolute"} top={"0vh"} left="0vw"  w="100vw" h="100vh" justifyContent={"center"} alignItems={"center"}>
                        <Settings session_time_stamp_string={props.session_time_stamp_string} keyboardWidth={props.keyboardWidth} setKeyboardWidth={props.setKeyboardWidth} clickSpeed={props.clickSpeed} fontSize={props.fontSize} changeClickSpeed={changeClickSpeed} changeFontSize={changeFontSize} setDisplaySettings={props.setDisplaySettings} />
                    </Flex>
                :
                    null
            }
            {
                props.displaySentenceEditor
                ?
                    <Flex className="blurry-bg" position={"absolute"} top={"0vh"} left="0vw"  w="100vw" h="30vh" justifyContent={"center"} alignItems={"center"}>
                        <SentenceEditor session_time_stamp_string={props.session_time_stamp_string} setText={props.setText} setPostSentence={props.setPostSentence} setBuffer={props.setBuffer} clickSpeed={props.clickSpeed} fontSize={props.fontSize} buffer={props.buffer} preSentence={props.preSentence} postSentence={props.postSentence} setDisplaySentenceEditor={props.setDisplaySentenceEditor} />
                    </Flex>
                :
                    null
            }
        </>
    )
}