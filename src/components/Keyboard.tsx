import { Flex, Grid, GridItem } from "@chakra-ui/react";
import '../index.css';
import { useEffect, useRef, useState } from "react";
import AccessibleButton from "./AccessibleButton";
import BufferSuggestions from "./BufferSuggestions";
import SentenceGuesser from "./SentenceGuesser";
import Speak from  './Speak'
import QWERTYKeyboard from "./QWERTYKeyboard";
import SecondaryMenus from "./secondaryMenus/SecondaryMenus";
import { createNewSession } from "./firebase";
import { ButtonTypeEnum } from "./ENUMS/ButtonTypeEnum";
import WordVariations from "./WordVariations";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';




// const CONTEXT_PROMPTS = {
//     "House":            "I am going to talk about stuff I do in my house, such as -I watched tv- or -I ate dinner with my parents- or -I will go home-",
//     "Story Telling":    `I am going to talk about things that happened before, such as  "I did my homework...", "I went to the concert...", "last month I visited my parent in Chihuahua..."`,
//     "School":           `I am going to talk about school relate stuff, such as "I have an exam tomorrow...", "I had an exam yesterday...", "I have to complete an essay on..."`,
//     "Profession":       `Profession`,
//     "Social":           `I will talk with my friends about our day to day life. The sentence will vay a lot. I just want to ask basic questions to my friends, and to talk about our lives. 
//                         Maybe with sentences such as "How are you?", "Would you like to go eat?", "Do you know if we have classes?". 
//                         The sentence will be very different, but it will be to talk about my friends in short talks. 
//                         In general, the suggestions you give me must be useful to have casual conversation with my friends. 
//                         I usually talk about school, house, what I did last few weeks, or what I will do in few weeks or on vacations. Or simply of what I want to do.`,
//     "Store":            `Store`,
//     "Family":            `Family`,
//     "Restaurant":       `I will order food at a restaurant, with sentences similar to "I would like to order...",  "I want an...", "May I have one..."`,
// }
export default function Keyobard(){
    // Variables
    const [text, setText] = useState<string>(`At the lies that hang like cobwebs 
Thick clinging to the corners of my soul. 
Do you hear me?
The thunder in my chest roars for release,
And yet-
listen.
A whisper curls beneath the storm.
Soft as the shadow of a falling leaf:
"What are you fighting for?"
`);
    const [buffer, setBuffer] = useState<string>("");
    const bufferRef = useRef("");

    // Texts used for AI prompts
    const [prompt] = useState<string>("");
    const [promptContent] = useState<string>("");
    const [isReplacingBuffer, setIsReplacingBuffer] = useState<boolean>(false);
    const [hasWordGroup, setHasWordGroup] = useState<boolean>(false);
    const [wordGroup] = useState<string>("");
    // Context
    const [hasContext] = useState<boolean>(false);
    const [context] = useState<string>("");
    // Settings
    const [displaySentenceEditor, setDisplaySentenceEditor] = useState<boolean>(false);
    const [displaySettings, setDisplaySettings] = useState<boolean>(false);
    const [keyboardWidth, setKeyboardWidth] = useState<number>(85);
    const [clickSpeed, setClickSpeed] = useState<number>(1200);
    const [fontSize, setFontSize] = useState<number>(19);


    //--------------------------------------------------------------------------------------
    // Start new session log in DB
    //--------------------------------------------------------------------------------------
    // Use to indicate session logs
    const [SESSION_TIME_STAMP_STRING,] = useState<string>(formatDate(new Date())) 
    // Create new session log
    useEffect(()=>{
        createNewSession(SESSION_TIME_STAMP_STRING);
    },[]);

    function formatDate(date: Date){
        // Get parts of the date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        // Determine AM or PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
        return `${year}-${month}-${day}, ${formattedTime}`;
    };






    //--------------------------------------------------------------------------------------
    //
    //--------------------------------------------------------------------------------------
    // Guesser
    const NUMBER_GUESSED_SENTENCES = 8;
    const [isGuesserSentenceSuggestion, setIsGuesserSentenceSuggesion] = useState<boolean>(false)
    
    useEffect(()=>{
        bufferRef.current = buffer
        console.log(bufferRef.current)
    },[buffer]);

    // function defineWordGroup(group:string){
    //     if(wordGroup == group){
    //         setHasWordGroup(false);
    //     }else{
    //         setHasWordGroup(true);
    //         setWordGroup(group);
    //     }
    // }
    // function addPromptContenxt(value:string){
    //     if(value == context){
    //         setHasContext(false);
    //     }else{
    //         setHasContext(true);
    //         setContext(value);
    //     }
    // }
    

    // function guessSentence(){
    //     setIsReplacingBuffer(false);
    //     setPrompt(`
    //         You are a helpful text completion system for a person who cannot talk or move. She relies completely on you for communication. 
    //         She is a friendly person and likes to talk casually and keep it short. 
    //         She is a student in spanish department. She likes to talk to her friends and family.
            
    //         You are a helpful sentences auto-completer. I will give you few words from a sentence, and you will try to guess what the complete sentence is.
    //         Your answer will include no extra words or explanations, just ${NUMBER_GUESSED_SENTENCES} sentences separated by semicolon.
    //         Example: If you give you "I water", four guesses for the original complete sentence are:
    //         "I want water;I drink water;I need water;I fell in the water".
    //         Do not add quote marks
    //         I need sentences that starts with "I", but also has "am", "want", "need", "would" or similar things. Sentences should be something she would use in daily life with friends, family and in school.
    //     `);
    //     setPromptContent(`
    //         these are the words you will use to guess the original complete sentence: "${text}". 
    //         ${context === "" ? "" : "Here is a clue for you: The context of the original sentence is: "+context+".\n"} 
    //         Now, please give me 4 possible options for what the original complete sentence might be considering my clues. Remember the format: ${NUMBER_GUESSED_SENTENCES} sentences separated by semicolons.
    //         Also, all suggestions must be in English.
    //     `);

    //     setIsGuesserSentenceSuggesion(true);
    // }


    /*    Drops buffer and adds given word to text    */
    function replaceBuffer(word:string){
        // If we are editing word, the formula is pretext + buffer + posttext
        if(displaySentenceEditor)
        {
            setText(preSentence + " " + word + " " + postSentence);
            setBuffer("")
            setHasWordGroup(false);
            setDisplaySentenceEditor(false);
        }
        else{
            // If not editing (but adding), the formula is text + buffer
            setText(text + word + " ");
            setBuffer("")
            setHasWordGroup(false);
        }

    }

    function add_word(word:string){
        if(displaySentenceEditor)
        {
            setText(preSentence + " " + word + " " + postSentence);
            setBuffer("")
            setHasWordGroup(false);
            setDisplaySentenceEditor(false);
        }
        else{
            // If not editing (but adding), the formula is text + buffer
            setText(text + word + " ");
            setHasWordGroup(false);
        }

    }


    /*  Remove last word in text */
    function removeLastWord(){
        const temp = text.replace(/\s+$/, '');  //get rid of last space
        const words = temp.split(' ');
        words.pop();
        setText(words.join(" ") + " ");
    }


    const [preSentence, setPreSentence] = useState<string>("");
    const [postSentence, setPostSentence] = useState<string>("");

    /*Edit word*/
    function editWord(button:HTMLButtonElement, wordIndex:number){
        console.log(button);
        const words = text.split(' '); // Split the text into words
        if(wordIndex == 0 || wordIndex == words.length -1)
            return;
        const firstPart = words.slice(0, wordIndex).join(' '); // Get the first part
        const word = words[wordIndex].trim(); // Get the first part
        const secondPart = words.slice(wordIndex + 1).join(' '); // Get the second part

        setPreSentence(firstPart);
        setPostSentence(secondPart);
        setBuffer(word);

        setDisplaySentenceEditor(true);
        console.log("editing")
    }
    
    function replaceLastWord(word:string){
        const words = text.trim().split(' ')
        let newText = words.slice(0, words.length - 1).join(' ');
        newText = newText + " " + word + " "
        setText(newText);
    }
    


    

    return(
        <>
            <Grid
                gridTemplateAreas={`
                        "Text Text Buttons"
                        "Menu Suggestions Suggestions"
                        "Menu Keyboard cleanPage"
                        "Menu punctuation empty"
                    `}
                gridTemplateRows={'3fr 3fr 3fr 1fr'} 
                gridTemplateColumns={'1.2fr 3fr 0.3fr'} 
                h="100vh" 
                w="100vw"
                bgColor="blackAlpha.700" 
                
            >

                {/* TEXT */}
                <GridItem area="Text" bgColor="white" p="1rem" m="0" w="100%" h="100%">
                    <Flex flexDir={"column"} justifyContent={"space-between"} h="100%">
                        <Flex wrap={"wrap"}>
                            {
                                text.split(" ").map((word:string, index:number) => {
                                    return(
                                        <AccessibleButton buttonType={ButtonTypeEnum.EDITION} session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} keyId={index} key={"key"+index} minW={"0.2rem"} m="0" p="0.2rem" bg="white" delay={clickSpeed} onCustomClick={editWord}>{word}</AccessibleButton>
                                    )
                                })
                            }
                            <AccessibleButton buttonType={ButtonTypeEnum.EDITION} delay={clickSpeed} session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize}  minW={"0.5rem"} p="0" m="0" bgColor="white" onClick={()=>{console.log("clicked!!")}}>{buffer}</AccessibleButton>
                            {/* <AccessibleButton buttonType={ButtonTypeEnum.EDITION} session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} minW={"0.5rem"} p="0" m="0" bgColor="teal" textColor={"white"} delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>{buffer}</AccessibleButton> */}
                            {/* <AccessibleButton buttonType={ButtonTypeEnum.EDITION} session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} minW={"0.5rem"} p="0" m="0" bgColor="teal" delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>{buffer}</AccessibleButton> */}
                        </Flex>
                        <WordVariations 
                            context={context} 
                            text={text} 
                            session_time_stamp_string={SESSION_TIME_STAMP_STRING} 
                            fontSize={fontSize} 
                            delay={clickSpeed}
                            replaceLastWord={replaceLastWord}
                            />
                    </Flex>
                </GridItem>
                
                {/* TEXT BUTTONS */}
                <GridItem area="Buttons" bgColor="white" m="0" p="1rem" w="100%" h="100%">
                    <Flex flexDir={"column"} w="100%" h="100%" m="0" p="4" justifyContent={"space-around"}>
                        <Speak session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} delay={clickSpeed} colorScheme="green" text={text}  />
                        <AccessibleButton buttonType={ButtonTypeEnum.EDITION}  session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} colorScheme="orange" w="100%" h="20" delay={clickSpeed} onClick={()=>{setDisplaySettings(true)}}><FontAwesomeIcon size="2x" icon={faCog} /></AccessibleButton>
                        {/* <AccessibleButton buttonType={ButtonTypeEnum.EDITION}  session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} colorScheme="blue" w="100%" delay={clickSpeed} onClick={()=>{guessSentence()}}>Guesser</AccessibleButton> */}
                    </Flex>                    
                </GridItem>

                {/* WORD GROUPS */}
                <GridItem area="Menu"  >
                    <Flex w="100%" h="100%" justifyContent={"space-around"} flexDir={"column"} overflow={"auto"} >
                        <Flex h="100%" p="1rem" justifyContent={"space-evenly"} alignItems={"flex-start"} gap="0.5rem" flexWrap={"wrap"}  overflow={"auto"} >
                            {/* <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("I")}}>be</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>he</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("it")}}>I</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("you")}}>it</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("we")}}>my</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>she</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>they</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("be")}}>we</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>you</AccessibleButton>


                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("the")}}>a</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("a")}}>an</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>any</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("an")}}>that</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("this")}}>the</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>then</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("that")}}>these</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>this</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>those</AccessibleButton>


                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("to")}}>and</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>at</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>but</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("and")}}>for</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>from</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("in")}}>in</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("not")}}>not</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("for")}}>of</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("of")}}>on</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>or</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("on")}}>to</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>with</AccessibleButton>

                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>can</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("would")}}>do</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("want")}}>go</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("need")}}>have</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>know</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("like")}}>like</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("do")}}>need</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>take</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("go")}}>think</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("have")}}>want</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>will</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>write</AccessibleButton> 
                            
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("I")}}>be</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("it")}}>I</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("you")}}>it</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("we")}}>my</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("be")}}>we</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>you</AccessibleButton> */}


                                {/* SORTED BY CATEGORY */}
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("the")}}>a</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("a")}}>an</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>any</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("an")}}>that</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("this")}}>the</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>then</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("that")}}>these</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"yellow"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>this</AccessibleButton>


                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("to")}}>and</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>at</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>but</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("and")}}>for</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("in")}}>in</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("not")}}>not</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("for")}}>of</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("of")}}>on</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("on")}}>to</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"cyan"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>with</AccessibleButton>

                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>can</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("would")}}>do</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("want")}}>go</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("need")}}>have</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>know</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("like")}}>like</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("do")}}>need</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>take</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("go")}}>think</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("have")}}>want</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>will</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={"teal"} w="7rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>write</AccessibleButton>


                            {/* ALL SORTED  */}
                            {/* <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("the")}}>a</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("a")}}>an</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("to")}}>and</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>any</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>at</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("I")}}>be</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>but</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>can</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("would")}}>do</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("and")}}>for</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("want")}}>go</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("need")}}>have</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("it")}}>I</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("in")}}>in</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("you")}}>it</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>know</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("like")}}>like</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("we")}}>my</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("do")}}>need</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("not")}}>not</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("for")}}>of</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("of")}}>on</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>take</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("an")}}>that</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("this")}}>the</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>then</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("that")}}>these</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("these")}}>this</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("go")}}>think</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("on")}}>to</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("have")}}>want</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("be")}}>we</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>will</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("with")}}>with</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("think")}}>write</AccessibleButton>
                            <AccessibleButton flexBasis={"28%"} buttonType={ButtonTypeEnum.HARDCODED_WORD} session_time_stamp_string={SESSION_TIME_STAMP_STRING} h="3.2rem" my="0" py="0px" fontSize={fontSize} colorScheme={"blackAlpha"} w="5rem" delay={clickSpeed} onClick={()=>{add_word("my")}}>you</AccessibleButton> */}

                        </Flex>
                        {/* <Flex h="50%" p="1rem" justifyContent={"space-evenly"} alignItems={"flex-start"} gap="0.5rem" flexWrap={"wrap"}  overflow={"auto"} >
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Categories</Text>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Pronouns") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Pronouns")}}>I, They...</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Modal Verbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Modal Verbs")}}>Can, Would...</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Articles") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Articles")}}>The, An...</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adjectives") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adjectives")}}>Adjectives</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Verbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Verbs")}}>Verbs</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adverbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adverbs")}}>Adverbs</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Prepositions") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Prepositions")}}>Prepositions</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Conjunctions") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Conjunctions")}}>For, But...</AccessibleButton>
                            <AccessibleButton delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>Numbers</AccessibleButton>
                        </Flex>





                        CONTEXT
                        <Flex h="50%" p="1rem" justifyContent={"space-around"} gap="0.5rem" flexWrap={"wrap"}  overflow={"auto"}>
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Context</Text>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["House"])           ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["House"])           }}>    House</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Story Telling"])   ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Story Telling"])   }}>    Story Telling</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["School"])          ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["School"])          }}>    School</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Profession"])      ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Profession"])      }}>    Profession</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Social"])          ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Social"])          }}>    Social</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Store"])           ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Store"])           }}>    Store</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Restaurant"])      ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Restaurant"])      }}>    Restaurant</AccessibleButton>
                            <AccessibleButton buttonType={ButtonTypeEnum.ADD_CONTEXT} session_time_stamp_string={SESSION_TIME_STAMP_STRING}  fontSize={fontSize} colorScheme={(hasContext && context === CONTEXT_PROMPTS["Family"])          ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{  addPromptContenxt(CONTEXT_PROMPTS["Family"])      }}>    Family</AccessibleButton>

                        </Flex> 
                        */}
                    </Flex>
                </GridItem>

                {/* Suggestions */}
                <GridItem area="Suggestions" w="100%" h="100%" >
                        {
                            isGuesserSentenceSuggestion ?
                                <SentenceGuesser session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} prompt={prompt} promptContent={promptContent} replaceText={setText} numberOfSentences={NUMBER_GUESSED_SENTENCES}/>
                                :
                                <BufferSuggestions 
                                    text={text}
                                    buffer={buffer}
                                    context={context}
                                    fontSize={fontSize} 
                                    wordGroup={wordGroup} 
                                    hasContext={hasContext}
                                    hasWordGroup={hasWordGroup}  
                                    isReplacingBuffer={isReplacingBuffer} 
                                    displaySentenceEditor= {displaySentenceEditor}
                                    session_time_stamp_string={SESSION_TIME_STAMP_STRING}  
                                    replaceBuffer={replaceBuffer} 
                                    setIsReplacingBuffer={setIsReplacingBuffer}
                                    setIsGuesserSentenceSuggesion={setIsGuesserSentenceSuggesion}
                                />
                        }
                </GridItem>

                {/* KEYBOARD */}
                <QWERTYKeyboard 
                    fontSize={fontSize} clickSpeed={clickSpeed} keyboardWidth={keyboardWidth} 
                    buffer={buffer} setBuffer={setBuffer} 
                    text={text} setText={setText}
                    session_time_stamp_string={SESSION_TIME_STAMP_STRING} 
                />
                {/* cleanPage */}
                <Flex  p="1" flexDir={"column"} alignItems={"center"} justifyContent={"space-evenly"} bgColor={"blackAlpha.400"}  >
                        <AccessibleButton buttonType={ButtonTypeEnum.EDITION}  session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} colorScheme="red" h="20%" w="100%" delay={clickSpeed} onClick={()=>{removeLastWord()}}>Delete word</AccessibleButton>
                        <AccessibleButton buttonType={ButtonTypeEnum.EDITION}  session_time_stamp_string={SESSION_TIME_STAMP_STRING} fontSize={fontSize} colorScheme="orange" h="20%" w="100%" delay={clickSpeed} onClick={()=>{setText(""); setBuffer("")}}>Clear</AccessibleButton>
                </Flex>
            </Grid>


            {/* SECONDARY MENUS */}
            <SecondaryMenus
                displaySentenceEditor={displaySentenceEditor}
                displaySettings={displaySettings}
                keyboardWidth={keyboardWidth}
                postSentence={postSentence}
                preSentence={preSentence}
                clickSpeed={clickSpeed}
                fontSize={fontSize}
                buffer={buffer}
                setDisplaySentenceEditor={setDisplaySentenceEditor}
                setDisplaySettings={setDisplaySettings}
                setKeyboardWidth={setKeyboardWidth}
                setPostSentence={setPostSentence}
                setClickSpeed={setClickSpeed}
                setFontSize={setFontSize}
                setBuffer={setBuffer}
                setText={setText}
                session_time_stamp_string={SESSION_TIME_STAMP_STRING} 
            />

        </>
    )
}