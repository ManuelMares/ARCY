import { Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import '../index.css';
import { useEffect, useState } from "react";
import AccessibleButton from "./AccessibleButton";
import BufferSuggestions from "./BufferSuggestions";
import SentenceGuesser from "./SentenceGuesser";
import Settings from "./Settings";
import SentenceEditor from "./SentenceEditor";
import Speak from  './Speak'

export default function Keyobard(){
    // Variables
    const [isInCaps, setIsInCaps] = useState<boolean>(true);
    const [text, setText] = useState<string>("");
    const [buffer, setBuffer] = useState<string>("");
    // Texts used for AI prompts
    const [prompt, setPrompt] = useState<string>("");
    const [promptContent, setPromptContent] = useState<string>("");
    const [isReplacingBuffer, setIsReplacingBuffer] = useState<boolean>(false);
    const [hasWordGroup, setHasWordGroup] = useState<boolean>(false);
    const [wordGroup, setWordGroup] = useState<string>("");
    // Context
    const [hasContext, setHasContext] = useState<boolean>(false);
    const [context, setContext] = useState<string>("");
    // Settings
    const [displaySettings, setDisplaySettings] = useState<string>("none");
    const [clickSpeed, setClickSpeed] = useState<number>(1200);
    const [fontSize, setFontSize] = useState<number>(17);
    // Sentence editor
    const [displaySentenceEditor, setDisplaySentenceEditor] = useState<boolean>(false);

    // Guesser
    const NUMBER_GUESSED_SENTENCES = 8;
    const [isGuesserSentenceSuggestion, setIsGuesserSentenceSuggesion] = useState<boolean>(false)
    
    function changeClickSpeed(change:number){
        setClickSpeed(clickSpeed + change);
        if(clickSpeed < 500)
            setClickSpeed(500);
        if(clickSpeed > 1500)
            setClickSpeed(1500);
    }
    function changeFontSize(change:number){
        setFontSize(clickSpeed + change);
        if(clickSpeed < 5)
            setFontSize(5);
        if(clickSpeed > 20)
            setFontSize(20);
    }

    useEffect(() => {
        setIsGuesserSentenceSuggesion(false);
        // You are a helpful text autocompleter that helps by guessing what the next word in the paragraph will be. 

        // You are a helpful text completion system for a person who cannot talk or move. She uses it for communication. She is a friendly person and likes to
        // talk casually and keep it short.


        setPrompt(`
            You are a helpful text completion system for a person who cannot talk or move. She relies completely on you for communication. 
            She is a friendly person and likes to talk casually and keep it short. 
            She is a student in spanish department. She likes to talk to her friends and family.

            You are a helpful text autocompleter that helps by guessing what the next word in the paragraph will be. 
            Your job is to help her by guessing what the next word in the paragraph will be. 
            You work this way: I will give you a text, and you guess the immediate most likely word to be used. 
            You provide in total 15 guess words, never more. your answer do not include extra words, just 15 words which are guesses.
            If the text I give you is empty, try to guess the word that can start the most sentences. Something generic, like 'I', but give me still 15 options
            Sentences should be something she would use in daily life with friends, family and in school.
            sentences that have same word but in different tenses and participle form.`
        );
        if(buffer === ""){
            //empty buffer only adds to the text
            setPromptContent(`
                The context of my text is: ${context}. This means, all the words, and therefore, all your suggestions, must be related to ${context}
                text: "${displaySentenceEditor ? preSentence: text}" 
                What is the next word? 
                ${hasWordGroup ? "All the options must be "+wordGroup+". Do not return any word if they are not "+wordGroup+". Seriously, only suggest"+wordGroup+" or nothing." : ""}
                `);
            setIsReplacingBuffer(false);
        }
        else{
            //Since there is a buffer, it must be replaced by suggestion
            setPromptContent(`
                The context of my text is: ${context}. This means, all the words, and therefore, all your suggestions, must be related to ${context}
                text: "${displaySentenceEditor ? preSentence: text}" 
                What is the next word? 
                Guess the next word I am thinking of. The next word starts with the characters "${buffer})"
                ${hasWordGroup ? "All the options must be "+wordGroup+". Do not return any word if they are not "+wordGroup+". Seriously, only suggest"+wordGroup+" or nothing." : ""}
                Also, all suggestions must be in English.
            `);
            setIsReplacingBuffer(true);
        }
    }, [buffer, text, wordGroup, hasWordGroup, context, hasContext])

    function defineWordGroup(group:string){
        if(wordGroup == group){
            setHasWordGroup(false);
        }else{
            setHasWordGroup(true);
            setWordGroup(group);
        }
    }
    function addPromptContenxt(value:string){
        if(value == context){
            setHasContext(false);
        }else{
            setHasContext(true);
            setContext(value);
        }
    }
    

    function guessSentence(){
        setIsReplacingBuffer(false);
        setPrompt(`
            You are a helpful text completion system for a person who cannot talk or move. She relies completely on you for communication. 
            She is a friendly person and likes to talk casually and keep it short. 
            She is a student in spanish department. She likes to talk to her friends and family.
            
            You are a helpful sentences auto-completer. I will give you few words from a sentence, and you will try to guess what the complete sentence is.
            Your answer will include no extra words or explanations, just ${NUMBER_GUESSED_SENTENCES} sentences separated by semicolon.
            Example: If you give you "I water", four guesses for the original complete sentence are:
            "I want water;I drink water;I need water;I fell in the water".
            Do not add quote marks
            I need sentences that starts with "I", but also has "am", "want", "need", "would" or similar things. Sentences should be something she would use in daily life with friends, family and in school.
        `);
        setPromptContent(`
            these are the words you will use to guess the original complete sentence: "${text}". 
            ${context === "" ? "" : "Here is a clue for you: The context of the original sentence is: "+context+".\n"} 
            Now, please give me 4 possible options for what the original complete sentence might be considering my clues. Remember the format: ${NUMBER_GUESSED_SENTENCES} sentences separated by semicolons.
            Also, all suggestions must be in English.
        `);

        setIsGuesserSentenceSuggesion(true);
    }

    /*    Append the buffer and a given character to the text    */
    function addToBufferAndCloseIt(postfix:string){
        setText(text + buffer + postfix);
        setBuffer("")
    }

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

    /*    Adds the buffer making sure there is no space between buffer and previous word    */
    function prePrendBuffer(symbol:string){
        if(buffer === ""){
            const temp = text.replace(/\s+$/, '');
            setText(temp + symbol);
        }else{
            const newBuffer = buffer.replace(/\s+$/, '') + symbol;
            setBuffer("");
            setText(text + newBuffer);
        }
    }
    /*    Adds the buffer making sure there is no space between buffer and previous word    */
    function addLineEnd(symbol:string){
        if(buffer === ""){
            const temp = text.replace(/\s+$/, '');
            setText(temp + symbol);
        }else{
            const newBuffer = buffer.replace(/\s+$/, '') + symbol;
            setBuffer("");
            setText(text + newBuffer);
        }
        setIsInCaps(true);
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
        const words = text.split(' '); // Split the text into words
        if(wordIndex == 0 || wordIndex == words.length -2)
            return;
        const firstPart = words.slice(0, wordIndex).join(' '); // Get the first part
        const word = words[wordIndex].trim(); // Get the first part
        const secondPart = words.slice(wordIndex + 1).join(' '); // Get the second part

        setPreSentence(firstPart);
        setPostSentence(secondPart);
        setBuffer(word);

        setDisplaySentenceEditor(true);
    }

    function deleteCharacter() {
        if(buffer !== ""){
            setBuffer(buffer.slice(0, -1));
            return;
        }
        else if(text !== ""){
            setText(text.slice(0, -1));
        }
    }

    return(
        <>
            <Grid
                gridTemplateAreas={`
                        "Text Text Buttons"
                        "Menu Suggestions Suggestions"
                        "Menu Keyboard Keyboard"
                        "Menu punctuation punctuation"
                    `}
                gridTemplateRows={'3fr 3fr 3fr 1fr'} 
                gridTemplateColumns={'1fr 4fr 1fr'} 
                h="100vh" 
                w="100vw"
                bgColor="blackAlpha.700" 
            >


                {/* TEXT */}
                <GridItem area="Text" bgColor="white" p="1rem" w="100%" h="100%">
                    <Flex>
                        {
                            text.split(" ").map((word:string, index:number) => {
                                return(
                                    <AccessibleButton fontSize={fontSize} keyId={index} key={"key"+index} minW={"0.2rem"} m="0" p="0.2rem" bg="white" delay={clickSpeed} onCustomClick={editWord}>{word}</AccessibleButton>
                                )
                            })
                        }
                        <AccessibleButton fontSize={fontSize} minW={"0.5rem"} p="0" m="0" bgColor="teal" delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>{buffer}</AccessibleButton>
                    </Flex>
                </GridItem>
                
                {/* TEXT BUTTONS */}
                <GridItem area="Buttons" bgColor="white" p="1rem">
                    <Flex flexDir={"column"} w="100%" h="100%" justifyContent={"space-around"}>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{removeLastWord()}}>Delete word</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{setText(""); setBuffer("")}}>Clear</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{setDisplaySettings("flex")}}>Settings</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{guessSentence()}}>Guesser</AccessibleButton>
                        <Speak fontSize={fontSize} delay={clickSpeed} colorScheme="green" text={text} />
                    </Flex>                    
                </GridItem>




                {/* WORD GROUPS */}
                <GridItem area="Menu" >
                    <Flex w="1005" h="100%" justifyContent={"space-around"} flexDir={"column"}>
                        <Flex h="50%" p="1rem" justifyContent={"space-evenly"} alignItems={"flex-start"} gap="0.5rem" flexWrap={"wrap"}>
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Categories</Text>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Pronouns") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Pronouns")}}>I, They...</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Modal Verbs") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Modal Verbs")}}>Can, Would...</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Articles") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Articles")}}>The, An...</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adjectives") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adjectives")}}>Adjectives</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Verbs") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Verbs")}}>Verbs</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adverbs") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adverbs")}}>Adverbs</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Prepositions") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Prepositions")}}>On, Under....</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Conjunctions") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Conjunctions")}}>For, But...</AccessibleButton>
                            {/* <AccessibleButton delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>Numbers</AccessibleButton> */}
                        </Flex>


                        {/* CONTEXT */}
                        <Flex h="50%" p="1rem" justifyContent={"space-around"} gap="0.5rem" flexWrap={"wrap"}>
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Context</Text>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "House") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about stuff I do in my house, such as "I watched tv" or "I ate dinner with my parents" or "I will go home"`)}}>House</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Story Telling") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about things that happened before, such as  "I did my homework...", "I went to the concert...", "last month I visited my parent in Chihuahua..."`)}}>Story Telling</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "School") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about school relate stuff, such as "I have an exam tomorrow...", "I had an exam yesterday...", "I have to complete an essay on..."`)}}>School</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Profession") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt("Profession")}}>Profession</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Social") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I will talk with my friends about our day to day life. The sentence will vay a lot. I just want to ask basic questions to my friends, and to talk about our lives. Maybe with sentences such as "How are you?", "Would you like to go eat?", "Do you know if we have classes?". The sentence will be very different, but it will be to talk about my friends in short talks. In general, the suggestions you give me must be useful to have casual conversation with my friends. I usually talk about school, house, what I did last few weeks, or what I will do in few weeks or on vacations. Or simply of what I want to do.`)}}>Social</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Store") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt("Store")}}>Store</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Restaurant") ? "teal" :"blackAlpha"} h="3rem" w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I will order food at a restaurant, with sentences similar to "I would like to order...",  "I want an...", "May I have one..."`)}}>Restaurant</AccessibleButton>

                        </Flex>
                    </Flex>
                </GridItem>


                {/* Suggestions */}
                <GridItem area="Suggestions">
                    {
                        isGuesserSentenceSuggestion ?
                            <SentenceGuesser fontSize={fontSize} prompt={prompt} promptContent={promptContent} replaceText={setText} numberOfSentences={NUMBER_GUESSED_SENTENCES}/>
                        :
                            <BufferSuggestions fontSize={fontSize} prompt={prompt} promptContent={promptContent} replaceBuffer={replaceBuffer} isReplacingBuffer={isReplacingBuffer}/>
                    }
                </GridItem>



                {/* KEYBOARD */}
                <GridItem area="Keyboard"  h="100%" bgColor={"blackAlpha.400"} borderRadius={"md"} w="100%"  justifyContent={"center"} alignItems={"center"}  justifyItems={"center"} alignContent={"center"}>
                    <Flex  h="100%" w="70%" flexDir={"column"} flexWrap={"nowrap"} justifyContent={"center"} alignItems={"center"}  justifyItems={"center"} alignContent={"center"}>
                        
                        <Flex
                            w="100%"
                            h="100%"
                            alignItems={"center"}
                            justifyContent={"space-around"}
                            >
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "Q":"q")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "Q":"q"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "W":"w")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "W":"w"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "E":"e")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "E":"e"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "R":"r")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "R":"r"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "T":"t")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "T":"t"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "Y":"y")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "Y":"y"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "U":"u")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "U":"u"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "I":"i")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "I":"i"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "O":"o")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "O":"o"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "P":"p")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "P":"p"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{deleteCharacter()}} w="8rem" h="5rem">{"<-"}</AccessibleButton>
                        </Flex>
                        <Flex
                            w="100%"
                            h="100%"
                            alignItems={"center"}
                            justifyContent={"space-around"}
                            >
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setIsInCaps(true)}} w="5rem" h="5rem">CAP</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "A":"a")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "A":"a"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "S":"s")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "S":"s"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "D":"d")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "D":"d"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "F":"f")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "F":"f"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "G":"g")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "G":"g"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "H":"h")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "H":"h"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "J":"j")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "J":"j"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "K":"k")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "K":"k"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "L":"l")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "L":"l"}</AccessibleButton>
                        </Flex>
                        <Flex
                            w="100%"
                            h="100%"
                            alignItems={"center"}
                            justifyContent={"space-around"}
                            >
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "Z":"z")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "Z":"z"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "X":"x")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "X":"x"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "C":"c")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "C":"c"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "V":"v")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "V":"v"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "B":"b")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "B":"b"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "N":"n")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "N":"n"}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{setBuffer(buffer + (isInCaps ? "M":"m")); setIsInCaps(false)}} w="5rem" h="5rem">{isInCaps ? "M":"m"}</AccessibleButton>
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
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{addLineEnd(". ")}} w="5rem" h="5rem">.</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer(", ")}} w="5rem" h="5rem">,</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{addLineEnd("! ")}} w="5rem" h="5rem">!</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{addLineEnd("? ")}} w="5rem" h="5rem">?</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{addToBufferAndCloseIt(" ")}} w="15rem" h="5rem"></AccessibleButton> 
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer(": ")}} w="5rem" h="5rem">:</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer("; ")}} w="5rem" h="5rem">;</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer("\"")}} w="5rem" h="5rem">"</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer("'")}} w="5rem" h="5rem">'</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer("(")}} w="5rem" h="5rem">{"("}</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme="blackAlpha" delay={clickSpeed} onClick={()=>{prePrendBuffer(") ")}} w="5rem" h="5rem">{")"}</AccessibleButton>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>


                {/* DRAWER SETTINGS */}

            {
                displaySettings === "none"
                ?
                    null
                :
                    <Flex className="blurry-bg" position={"absolute"} top={"0vh"} left="0vw"  w="100vw" h="100vh" justifyContent={"center"} alignItems={"center"}>
                        <Settings clickSpeed={clickSpeed} fontSize={fontSize} changeClickSpeed={changeClickSpeed} changeFontSize={changeFontSize} setDisplaySettings={setDisplaySettings} />
                    </Flex>
            }
            {
                displaySentenceEditor
                ?
                    <Flex className="blurry-bg" position={"absolute"} top={"0vh"} left="0vw"  w="100vw" h="30vh" justifyContent={"center"} alignItems={"center"}>
                        <SentenceEditor setText={setText} setPostSentence={setPostSentence} setBuffer={setBuffer} clickSpeed={clickSpeed} fontSize={fontSize} buffer={buffer} preSentence={preSentence} postSentence={postSentence} setDisplaySentenceEditor={setDisplaySentenceEditor} />
                    </Flex>
                :
                    null
            }


        </>
    )
}