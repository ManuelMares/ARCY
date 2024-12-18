import { Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import '../index.css';
import { useEffect, useState } from "react";
import AccessibleButton from "./AccessibleButton";
import BufferSuggestions from "./BufferSuggestions";
import SentenceGuesser from "./SentenceGuesser";
import Speak from  './Speak'
import QWERTYKeyboard from "./QWERTYKeyboard";
import SecondaryMenus from "./secondaryMenus/SecondaryMenus";
import Fuse from 'fuse.js';
import {words} from 'popular-english-words'


type WordItem = {
    word: string;
  };
  
  type FuseResult<T> = {
    item: T;
    // You can add other properties that FuseResult might have, like score, matches, etc.
  };
  

export default function Keyobard(){
    // Variables
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
    const [displaySentenceEditor, setDisplaySentenceEditor] = useState<boolean>(false);
    const [displaySettings, setDisplaySettings] = useState<boolean>(false);
    const [keyboardWidth, setKeyboardWidth] = useState<number>(70);
    const [clickSpeed, setClickSpeed] = useState<number>(1200);
    const [fontSize, setFontSize] = useState<number>(17);

    // Guesser
    const NUMBER_GUESSED_SENTENCES = 8;
    const [isGuesserSentenceSuggestion, setIsGuesserSentenceSuggesion] = useState<boolean>(false)
    


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
    


    //--------------------------------------------------------------------------------------
    // Autocompleter
    //--------------------------------------------------------------------------------------
    // List of words to autocomplete
    const wordList = words.getMostPopular(1000);
    
    // Initialize Fuse with options
    const options = {
      includeScore: true,
      threshold: 0.3, // Lower this number for stricter matching
      keys: ['word']
    };
    
    const fuse = new Fuse(wordList.map((word:string) => ({ word })), options);
    
    // Function to get matches
    const getMatches = (input: string): string[] => {
        const results: FuseResult<WordItem>[] = fuse.search(input);
        return results.map((result: FuseResult<WordItem>) => result.item.word);
    };
      
    
    // Example usage
    const response = getMatches("he");
    console.log(response); 

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
                <GridItem area="Text" bgColor="white" p="1rem" m="0" w="100%" h="100%">
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
                <GridItem area="Buttons" bgColor="white" m="0" p="1rem" w="100%" h="100%">
                    <Flex flexDir={"column"} w="100%" h="100%" m="0" p="0" justifyContent={"space-around"}>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{removeLastWord()}}>Delete word</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{setText(""); setBuffer("")}}>Clear</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{setDisplaySettings(true)}}>Settings</AccessibleButton>
                        <AccessibleButton fontSize={fontSize} colorScheme="orange" w="100%" delay={clickSpeed} onClick={()=>{guessSentence()}}>Guesser</AccessibleButton>
                        <Speak fontSize={fontSize} delay={clickSpeed} colorScheme="green" text={text} />
                    </Flex>                    
                </GridItem>

                {/* WORD GROUPS */}
                <GridItem area="Menu" >
                    <Flex w="100%" h="100%" justifyContent={"space-around"} flexDir={"column"} overflow={"auto"}>
                        <Flex h="50%" p="1rem" justifyContent={"space-evenly"} alignItems={"flex-start"} gap="0.5rem" flexWrap={"wrap"}  overflow={"auto"} >
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Categories</Text>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Pronouns") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Pronouns")}}>I, They...</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Modal Verbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Modal Verbs")}}>Can, Would...</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Articles") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Articles")}}>The, An...</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adjectives") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adjectives")}}>Adjectives</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Verbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Verbs")}}>Verbs</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Adverbs") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Adverbs")}}>Adverbs</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Prepositions") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Prepositions")}}>On, Under....</AccessibleButton>
                            <AccessibleButton my="0" py="0px" fontSize={fontSize} colorScheme={(hasWordGroup && wordGroup === "Conjunctions") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{defineWordGroup("Conjunctions")}}>For, But...</AccessibleButton>
                            {/* <AccessibleButton delay={clickSpeed} onClick={()=>{console.log("clicked!!")}}>Numbers</AccessibleButton> */}
                        </Flex>


                        {/* CONTEXT */}
                        <Flex h="50%" p="1rem" justifyContent={"space-around"} gap="0.5rem" flexWrap={"wrap"}  overflow={"auto"}>
                            <Text w="100%" textAlign={"left"} fontWeight={"bold"} color={"white"}>Context</Text>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "House") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about stuff I do in my house, such as "I watched tv" or "I ate dinner with my parents" or "I will go home"`)}}>House</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Story Telling") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about things that happened before, such as  "I did my homework...", "I went to the concert...", "last month I visited my parent in Chihuahua..."`)}}>Story Telling</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "School") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I am going to talk about school relate stuff, such as "I have an exam tomorrow...", "I had an exam yesterday...", "I have to complete an essay on..."`)}}>School</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Profession") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt("Profession")}}>Profession</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Social") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I will talk with my friends about our day to day life. The sentence will vay a lot. I just want to ask basic questions to my friends, and to talk about our lives. Maybe with sentences such as "How are you?", "Would you like to go eat?", "Do you know if we have classes?". The sentence will be very different, but it will be to talk about my friends in short talks. In general, the suggestions you give me must be useful to have casual conversation with my friends. I usually talk about school, house, what I did last few weeks, or what I will do in few weeks or on vacations. Or simply of what I want to do.`)}}>Social</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Store") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt("Store")}}>Store</AccessibleButton>
                            <AccessibleButton fontSize={fontSize} colorScheme={(hasContext && context === "Restaurant") ? "teal" :"blackAlpha"} w="7rem" delay={clickSpeed} onClick={()=>{addPromptContenxt(`I will order food at a restaurant, with sentences similar to "I would like to order...",  "I want an...", "May I have one..."`)}}>Restaurant</AccessibleButton>

                        </Flex>
                    </Flex>
                </GridItem>

                {/* Suggestions */}
                <GridItem area="Suggestions" w="100%">
                    {
                        isGuesserSentenceSuggestion ?
                            <SentenceGuesser fontSize={fontSize} prompt={prompt} promptContent={promptContent} replaceText={setText} numberOfSentences={NUMBER_GUESSED_SENTENCES}/>
                        :
                            <BufferSuggestions fontSize={fontSize} prompt={prompt} promptContent={promptContent} replaceBuffer={replaceBuffer} isReplacingBuffer={isReplacingBuffer}/>
                    }
                </GridItem>

                {/* KEYBOARD */}
                <QWERTYKeyboard 
                    fontSize={fontSize} clickSpeed={clickSpeed} keyboardWidth={keyboardWidth} 
                    buffer={buffer} setBuffer={setBuffer} 
                    text={text} setText={setText}
                />
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
            />

        </>
    )
}