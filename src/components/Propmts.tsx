import Fuse from 'fuse.js';
import {words} from 'popular-english-words';

//--------------------------------------------------------------------------------------
// Autocompleter
//--------------------------------------------------------------------------------------
type WordItem = {
    word: string;
};
type FuseResult<T> = {
    item: T;
    // You can add other properties that FuseResult might have, like score, matches, etc.
};

// List of words to autocomplete
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// const wordList = words.getMostPopular(10000);
const paragraph = [
    "Hi",
    "I",
    "am",
    "27",
    "years",
    "old",
    "and",
    "I",
    "am",
    "going",
    "to",
    // "describe",
    "my",
    // "daily",
    // "routine",
    "This",
    "morning",
    "I",
    "woke",
    // "up",
    "at",
    // "eight",
    // "AM",
    "as",
    // "usual",
    "I",
    // "always",
    "eat",
    "breakfast",
    "at",
    // "eight",
    "thirty",
    "so",
    "I",
    "have",
    // "already",
    "eaten",
    "Today",
    "is",
    "a",
    "little",
    // "different",
    "because",
    "I",
    "have",
    "a",
    "meeting",
    "with",
    "a",
    // "research",
    // "team",
    "We",
    "have",
    "been",
    "working",
    "on",
    "a",
    // "project",
    "to",
    "hopefully",
    "improve",
    "the",
    // "tools",
    "I",
    "use",
    "to",
    // "communicate",
    "They",
    "have",
    "told",
    "me",
    "that",
    "the",
    "hopes",
    "to",
    "have",
    "made",
    // "progress",
    // "by",
    "December",
    "of",
]

function getWordList(paragraph:string[]){
    const answer = []
    for (let index = 0; index < paragraph.length; index++) {
        const word = paragraph[index];
        answer.push(word.toLowerCase())
    }
    const set = new Set(answer);
    return [...set];
}

const wordList = getWordList(paragraph)
// Initialize Fuse with options
// const options = {
//     includeScore: true,
//     threshold: 0.2, // Lower this number for stricter matching
//     minMatchCharLength: 1,
//     keys: ['word'],
//     // useExtendedSearch: true,
// };

// const fuse = new Fuse(wordList.map((word:string) => ({ word })), options);
// const fuse = new Fuse(wordList, options);

// Function to get matches
export function getMatches(prefix:string){
    //fuse solution
    // const results: FuseResult<WordItem>[] = fuse.search(input);
    // console.log(">>>> in function Matches: ", input, results)
    // // return results.map((result:FuseResult<WordItem>)=>result.item.word);
    // return results.map((result:FuseResult<WordItem>)=>result.item);


    // naive matching
    console.log("--->>> prefix, starts with: ", prefix, paragraph)
    const matches =  wordList.filter(word => word.startsWith(prefix));
    console.log(">>>> in function Matches: ", prefix, matches)
    return matches
}

function getPotentialWords(buffer:string, limit: number){
    const matches = getMatches(buffer);
    console.log(">>>> delivered Matches: ", matches)
    const options = []
    for (let index = 0; index < matches.length; index++) {
        if(matches[index].toLowerCase().startsWith(buffer.toLowerCase()))
            options.push(matches[index])
        if(options.length >= limit)
            return options
    }
    return options
}



//--------------------------------------------------------------------------------------
// PROMPTS
//--------------------------------------------------------------------------------------
interface ICluesCompletion{
    context: string,
    preText: string,
    buffer: string,
    wordGroup: string,
}
interface ICluesVariations{
    context: string,
    preText: string,
    lastWord: string,
}

// Word Completions -> context, preText, lastWord
export function prompt_wordCompletion(props:ICluesCompletion){
    // Format context
    let prompt = '';
    const word_options = getPotentialWords(props.buffer, 30);
    const number_words = word_options.length

    // Add context
    if (props.context) 
        prompt += `
        >task: You are a very helpful writing assistant. Your job is the following:
        you will receive a 'text' the 'beginning of a new word', and a list of 'possible words'. 
        Your job is to chose the new word from the possible words based on the text.
        The result is that the beginning of the new word will be replaced by the word you chose, and this text + chosen word must make the most sense.
        Because it is not possible to know which word will be used you must suggest 15 words in total, sorted from the most likely to the least likely to be used.
        But those 15 words have to be the most likely ones to be used.
        > example
        text: 'Hello mrs Smith. I just finished cutting the grass. I was wondering if you also need help cutting the branches from the'
        beginning of the new word: 't'
        possible words: three to two too task tune tuna ton tons travel trip tornado tree trash thunder tobacco toyon toothache titi
        tamaricaceae thornless tulip texas tupelo tallow tamarac tamarind tara temu torreya tabebui trees thuya turkey terminalia Teak Toog Trichilia Turpentine  sun silver
        answer: trees tree tulip tamarind tupelo thuya tamarac tamaricaceae tallow tara taratorreya tabebui terminalia Teak Toog
        explanation: the first option in the list is the word 'trees', because the text indicates that somebody is already cutting the grass, and asks if mrs. Smith 
        wants help finishing cutting something else, other things that can be cut and are similar to grass are tree.
        The second option is 'tree', for the same reasons as the first option, and the singular is just as likely to be word the user will be using after, so that is why these two words 'tree' and 'trees' 
        are at the top. The other thirteen options are trees names, starting with the most common names because they are more likely to be talking about popular trees.
        notice that I did not chose words like three, to, too, task, ton, tons, etc., because the sentence asks '...need help cutting the branches from', and it is not possible to cut branches from 
        three, to, too, task, ton, or tons. These other words make no sense. Words like tornado also make no sense. They cannot be cut, they also have nothing to do with cutting grass.
        Cutting tree make sense when talking about cutting grass, and that is why we chose tree-related words starting from the most like ones 'tree' and 'trees'.
        Finally, notice that the words 'sun' and 'silver' were never considered an option, because the beginning of the new word is 't', and none of those words start with the letter 't', whereas
        'tree' and 'trees' do start with the letter 't'.
        Using the first option, the result would be read as
        'Hello mrs Smith. I just finished cutting the grass. I was wondering if you also need help cutting the branches from the trees'.

        > how to adapt the words
        the words you suggest have to be based on the word list, but not necessarily be identical. consider these examples that show you how to adapt the word in the word list to have the perfect output:
        - Example 1
        text: 'yesterday I was'
        beginning of the new word: 'd'
        possible words (word list): dance drive date dictate run remain ran ate eating grilling 
        most likely (only the top options in the output, but you must provide 15): dancing driving
        explanation: we got few clues to guess the right word
        1) 'I was' indicates that the next word must be a verb
        2) the words 'yesterday' and 'was' indicate that the word must agree to the past tense
        3) the beginning of the new word 'd' indicates the word starts with d
        therefore, from the list we chose the verbs that start with the letter 'd', which are the words 'dance' and 'drive'. Then, we changed them to the right tense so they made sense.
        'yesterday I was driving' and 'yesterday I was dancing' are sentences that do make sense. Notice how all the options start with the letter 'd' and that the words got converted to the right conjugation
        drive -> driving
        dance -> dancing

        - Example 2
        text: 'When I arrived home I saw my sister doing her homework in the floor. I wonder why she never'
        beginning of the new word: 'd'
        possible words (word list): dance drive date dictate run remain ran ate eating grilling do
        most likely (only the top options in the output, but you must provide 15): does dances drives dates
        explanation: we are talking about the sister ('she never'), therefore the next word must be conjugated for the third person and in feminine. Furthermore, the beginning of the sentence
        is talking about her doing homework, so the word 'does' makes more sense that the words 'dances' 'drives' and 'dates' since there is not indication on the sentence about the girl doing
        any of these actions. 'does' is definitely the best option. Notice how all the options start with the letter 'd' and that the words got converted to the right conjugation
        drive -> drives
        dance -> dances
        do -> does

        - Example 3
        text: 'This morning, I saw my neighbor'
        beginning of the new word: 'w'
        possible words (word list): walk wash watch win worry wrap write wrestle whisper whistle
        most likely (only the top options in the output, but you must provide 15): walking washing
        explanation: Based on the context, 'I saw my neighbor' indicates that the next word should be an action observed by the speaker. The word 'morning' helps us assume the activity could be something typically done in the morning. The beginning of the new word 'w' narrows down the options to verbs starting with 'w', which are 'walk' and 'wash'. Therefore, the most likely words are 'walking' and 'washing' as they fit the context and are transformed to the correct tense. walk -> walking wash -> washing
        - Example 4
        text: 'Every Sunday, we'
        beginning of the new word: 'p'
        possible words (word list): play prepare paint plant participate procrastinate perform purchase
        most likely (only the top options in the output, but you must provide 15): play prepare
        explanation: The phrase 'Every Sunday, we' suggests a habitual or routine activity that a group engages in. The beginning of the new word 'p' indicates the word starts with 'p'. From the list, 'play' and 'prepare' are the most fitting verbs that describe common Sunday activities, transformed into the right form. play -> play prepare -> prepare
        
        - Example 5
        text: 'Last night, I'
        beginning of the new word: 'c'
        possible words (word list): cook call complete create collect chase carry catch cry celebrate
        most likely (only the top options in the output, but you must provide 15): cooked called
        explanation: The phrase 'Last night, I' indicates a past event or action performed by the speaker. The beginning of the new word 'c' tells us the word starts with 'c'. From the list, 'cook' and 'call' are the actions that fit the context and are changed to the correct past tense. cook -> cooked call -> called
        
        - Example 6
        text: 'After lunch, she'
        beginning of the new word: 'r'
        possible words (word list): read relax run revise remain rearrange remember recite ride
        most likely (only the top options in the output, but you must provide 15): reads relaxes runs
        explanation: The phrase 'After lunch, she' suggests an activity done after a meal, by 'she'. The beginning of the new word 'r' indicates the word starts with 'r'. From the list, 'read', 'relax', and 'run' fit well into the context and are transformed into the third person singular form. read -> reads relax -> relaxes run -> runs
        
        
        > additional examples. Here I will show the vocabulary to save space. But you have to always consider the list of words given!! I will also not give you a list of all the words that are a good match.
        I will only give you the very best match that is ideally the first option in the list
        - Example 1
        text: It is hard to be student. There are many 
        beginning of the word: c
        best match: challenges
        explanation: the text is about how hard it is to be a student, so it is normal to want to say that the are many challenges
        final text with the best option of the output: It is hard to be student. There are many challenges

        - Example 2
        text: Hey, it is nice to meet you too! I am 36 years
        beginning of the word: 
        best match: old
        explanation: the beginning of the word is empty. so the next word can start with any letter. The person is indicating their age, it is common to say 'years old' to indicate age
        It is hard to be student. Hey, it is nice to meet you too! I am 36 years old
        
        - Example 3
        text: 'I went to the park yesterday and I'
        beginning of the new word: 
        best matches (only the top options in the output, but you must provide 15): was did had noticed
        explanation: Usually after the noun 'I' we add a 'to be' verb. The matching verb for the word 'I' is 'am'. However, since the story is in the past tense (I went.. yesterday), we need to change the word
        am -> was or am -> did. Other possible words at common verbs that are related to things you experience in the park. such as have -> had (I had fun), notice -> noticed ( I noticed a game...)
        
        Example 4
        text: 'The project needs to be finished by the end of the'
        beginning of the word: d
        best match: day
        explanation: The text is about a project deadline, so it is logical to conclude that the word 'day' would be the best fit for the context.
        final text with the best option of the output: 'The project needs to be finished by the end of the day'
        - Example 5
        text: 'I will go to the market to buy some'
        beginning of the word: f
        best match: fruits
        explanation: The sentence suggests that the person is going to the market to buy something. The word 'fruits' is a common item to purchase at a market and fits the context well.
        final text with the best option of the output: 'I will go to the market to buy some fruits'
        - Example 6
        text: 'She is always early to class because she'
        beginning of the word: v
        best match: values
        explanation: The text is about a person being early to class, which implies that she finds it important. The word 'values' fits this context well.
        final text with the best option of the output: 'She is always early to class because she values'
        - Example 7
        text: 'We enjoy going to the beach every'
        beginning of the word: s
        best match: summer
        explanation: The sentence indicates a recurring activity, and the word 'summer' fits well as it is a common time for beach trips.
        final text with the best option of the output: 'We enjoy going to the beach every summer'
        - Example 8
        text: 'After finishing my homework, I like to'
        beginning of the word: r
        best match: relax
        explanation: The text talks about what the person does after finishing their homework, and 'relax' fits well as a common activity after completing tasks.
        final text with the best option of the output: 'After finishing my homework, I like to relax'
        - Example 9
        text: ''
        beginning of the word: ''
        best matches: hi hello I do what today we you the
        explanation: Notice that there is no text at all. Nor a clue of the next word. It can be any word at all. However, that means that the text is about to start, so we must
        chose words that are likely to start a conversation. hi and hello are common ways to start talking to somebody new. I, we you are pronouns at the beginning of most sentences, and very likely
        to be use at the beginning of any sentence. do and what are very common words to start questions. today is a very common word to start a sentence. the is the most common word to start any sentence at all.
        By choosing this word it is very likely that any of them will successfully start the text of the user.
        - Example 9
        text: 'Journalists are very hard working. That is why I would like to be a'
        beginning of the word: ''
        best matches: journalist
        explanation: the text is talking about how good journalists are, and they continues saying what they want to be in the future. It is inferred they want to be journalists. 
        Example 10
        text: 'She looked up at the night sky and saw a'
        beginning of the word: s
        best matches: star
        explanation: The text describes someone looking at the night sky, which implies they might see something commonly associated with the night sky. 'Star' is a fitting word given the context, as it is a natural phenomenon often seen in the night sky.
        final text with the best option of the output: 'She looked up at the night sky and saw a star'
        Example 11
        text: 'The scientist conducted an experiment to test the hypothesis that plants grow better with'
        beginning of the word: s
        best matches: sunlight
        explanation: The text discusses a scientific experiment about plant growth. The word 'sunlight' is a logical match as it is a well-known factor that influences plant growth.
        final text with the best option of the output: 'The scientist conducted an experiment to test the hypothesis that plants grow better with sunlight'
        Example 12
        text: 'She trained for months to compete in the'
        beginning of the word: m
        best matches: marathon
        explanation: The text is about someone training for a competition. The word 'marathon' fits well because it is a common and well-known competitive event that requires extensive training.
        final text with the best option of the output: 'She trained for months to compete in the marathon'
        Example 13
        text: 'The chef added a pinch of salt to the dish to'
        beginning of the word: e
        best matches: enhance
        explanation: The text describes a chef adding salt to a dish, typically to improve its taste. The word 'enhance' fits well in this context as it means to improve or intensify the quality of the dish.
        final text with the best option of the output: 'The chef added a pinch of salt to the dish to enhance'
        Example 14
        text: 'Despite the rain, the children continued to'
        beginning of the word: p
        best matches: play
        explanation: The text mentions children and rain, implying an outdoor activity. The word 'play' is a suitable match because children often continue to play regardless of the weather.
        final text with the best option of the output: 'Despite the rain, the children continued to play'
    `
    if(number_words >= 15){
        prompt += `
        > output format
        Your answer must be exactly fifteen (15) words. No more, no less. exactly 15. You will return a single string that separates every word by a single space.
        Do not wrap words in special characters like quotes or anything. Don't use new lines or extra spaces. The format is: word1 space word2 space word3 space....
        don't add additional text. 
        example of output: 
        trees tree tulip tamarind tupelo thuya tamarac tamaricaceae tallow tara taratorreya tabebui terminalia Teak Toog`
    }else{
        prompt += `
        > output format
        Your answer must be exactly fifteen (15) words. No more, no less. exactly 15. You will return a single string that separates every word by a single space.
        Do not wrap words in special characters like quotes or anything. Don't use new lines or extra spaces. The format is: word1 space word2 space word3 space....
        don't add additional text. 
        example of output: 
        trees tree tulip tamarind tupelo thuya tamarac tamaricaceae tallow tara taratorreya tabebui terminalia Teak Toog
        You will only be given ${number_words} options, so you have to suggest ${15 - number_words} additional words with the previous conditions.
        `
    }
    
    prompt += `----------------------------------------
    > data
    text: '${props.preText}'
    beginning of the word: '${props.buffer}'
    possible words:
    `;
    for (let index = 0; index < word_options.length; index++) {
        const option = word_options[index];
        // prompt += `Option ${index + 1}: ${option}\nWith this option, the text sounds like: '${props.preText} ${option}'.\n\n`;
        prompt += `Option ${index + 1}: ${option}\n\n`;
    }

    // // Empty Buffer
    // const preText = props.preText
    // if (props.buffer === "" || word_options.length == 0) {
    //     prompt += `
    //     `;
    // } 
    // // With Buffer
    // else 
    // {
    //     prompt += `----------------------------------------
    //     > data
    //     text: '${props.preText}'
    //     beginning of the word: '${props.buffer}'
    //     possible words:
    //     `;
    //     for (let index = 0; index < word_options.length; index++) {
    //         const option = word_options[index];
    //         // prompt += `Option ${index + 1}: ${option}\nWith this option, the text sounds like: '${props.preText} ${option}'.\n\n`;
    //         prompt += `Option ${index + 1}: ${option}\n\n`;
    //     }
    // }

    
    if(number_words < 15){
        prompt += `
        Remember you need to add ${15 - number_words} new words that were not listed and that make sense, so there are a total of 15 words in the output`
    }
    return prompt;
}

// Word Variations
// context: string, preText: string, lastWord: string,
export function prompt_wordVariations(props:ICluesVariations) {
    if(props.lastWord == "")
        return;

    // Format context
    let prompt = '';

    // Add context
    // if (props.context) 
    //     prompt += `-> context of the guesses\nThe context is ${props.context}. This means that your answer must be related to ${props.context}.\n`;
    
    prompt += `The user wrote the word '${props.lastWord}'. 
                    >task: You are a very helpful writing assistant. your job is to provide alternative to the last word in the text.
                    you will be given a 'text' and a 'last word'. You will provide alternatives to the last word that fit the text better based on the context provided by the text.
                    
                    > output format
                    Your answer must be exactly ten (10) words. No more, no less. exactly 10. You will return a single string that separates every word by a single space.
                    Do not wrap words in special characters like quotes or anything. Don't use new lines or extra spaces. All the suggestions must be real words. The format is: word1 space word2 space word3 space....
                    don't add additional text. 
                    example of output: 
                    am was are had will would are did do could

                    > Examples
                    - Example 1:
                    text: I am 17
                    last word: 17
                    variations: seventeen tweeny-seven 27 16 18
                    explanation: the first suggestion is to convert the number to words. Then, we are provided alternative in case there is a mistake while tipping a digit

                    
                    - Example 2:
                    text: We are
                    last word: are
                    variations (only the top variations that are more likely to be used. But you need to provide 10 words in total): were will did had would could want 
                    explanation: the last word is the verb 'to be' for the plural on first person, so we need variations of that verb. The potential results would be read as 'we were', 'we will', 'we did', etc.
                    
                    - Example 3:
                    text: It is not easy to be a journalist. however it is a great career with great people, and that is why I want to be a journal
                    last word: journal
                    variations (only the top variations that are more likely to be used. But you need to provide 10 words in total): journalist student reporter writer
                    explanation: 'I want to be a journal' makes no sense. But the text indicates we are talking about how good it is to be a journalist, so we provide related words.
                    Furthermore, the person is talking about becoming (I want to be a..), so the word to change must necessarily be a profession, that is why journalist is the most likely word

                    
                    - Example 4:
                    text: For this assignment we will dlv
                    last word: dlv
                    variations (only the top variations that are more likely to be used. But you need to provide 10 words in total): delve
                    explanation: 'dlv' is not a real word. It is obviously a mistake. Since we are talking about assignment that implies research and study, very likely the word they are looking for is 'delve'
                    specially because the word 'delve' include the characters used in the word 'dlv'. There is a very strong reason to think that is the right word.
                    
                    - Example 5:
                    text: I have a lot of work to do today. I will do a presentation and then I have a meet
                    last word: meet
                    variations (only the top variations that are more likely to be used. But you need to provide 10 words in total): meeting reunion conference 
                    explanation: 'Then I have a meeting' makes more sense than 'then I have a meet', so that is why it is the top alternative. The other options are words related to meeting, such as a reunion.
                    
                    - Example 5:
                    text: We have be
                    last word: be
                    variations (only the top variations that are more likely to be used. But you need to provide 10 words in total): been
                    explanation: This form matches the right tense be-> been. The result would be 'we have been' which is correct.
                    --------------------------------------------------------------------------------------------------------
                    text: ${props.preText} ${props.lastWord}
                    last word: ${props.lastWord}
                    
                `;
    return prompt;
}

interface ISmartWordProps{
    preText: string,
    verb: string,
}
export function add_smart_word_prompt(props: ISmartWordProps){
    const prompt = `
    > task
    You are helpful text auto completer. I will give you a text and then a verb that follows that text. Your job
    is to change the verb to it matches correctly the previous text.
    > output
    The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
    No extra spaces or explanations
    example of output
    was
    > Examples

    - Example 1
    text: 'We'
    verb: 'am'
    output: are
    explanation: 'we am' makes no sense. 'am' is not in the right form and must be converted to match 'we'. The output 'are' turns the complete text into 'we are', which is grammatically correct. 

    - Example 2
    text: 'you'
    verb: 'am'
    output: are
    explanation: 'you am' makes no sense. 'am' is not in the right form and must be converted to match 'you'. The output 'are' turns the complete text into 'you are', which is grammatically correct. 

    - Example 3
    text: 'she'
    verb: 'run'
    output: runs
    explanation: 'she run' is grammatically incorrect. We need to change it 'she runs', so run->runs to match the third person (she).  

    - Example 4
    text: 'Anna's mom is cooking. Would you like to come to'
    verb: 'my'
    output: her
    explanation: The texts indicates that there is good at anna's house, and proceed to invite you to go eat there. Therefore, the house belongs to anna, which is the third person. 
    my -> her. The final text would be 'Would you like to come to her'

    - Example 5
    text: 'They'
    verb: 'was'
    output: were
    explanation: 'they was' is grammatically incorrect. The verb 'was' should be changed to 'were' to match the plural subject 'they'. The final text is 'they were'.

    - Example 6
    text: 'I'
    verb: 'go'
    output: go
    explanation: 'I go' is grammatically correct and no change is needed. Therefore, the verb 'go' remains unchanged. The final text is 'I go'.

    - Example 7
    text: 'He'
    output: is
    explanation: 'he is' is grammatically correct and no change is needed. Therefore, the verb 'is' remains unchanged. The final text is 'he is'.

    - Example 8
    text: 'We'
    verb: 'has'
    output: have
    explanation: 'we has' is grammatically incorrect. The verb 'has' should be changed to 'have' to match the subject 'we'. The final text is 'we have'.

    
    - Example 9
    text: 'You'
    verb: 'was'
    output: were
    explanation: 'you was' is grammatically incorrect. The verb 'was' should be changed to 'were' to match the subject 'you'. The final text is 'you were'.
    
    - Example 10
    text: 'She'
    verb: 'have'
    output: has
    explanation: 'she have' is grammatically incorrect. The verb 'have' should be changed to 'has' to match the third person singular subject 'she'. The final text is 'she has'.
    
    - Example 11
    text: 'It'
    verb: 'run'
    output: runs
    explanation: 'it run' is grammatically incorrect. The verb 'run' should be changed to 'runs' to match the subject 'it'. The final text is 'it runs'.
    
    - Example 12
    text: 'They'
    verb: 'is'
    output: are
    explanation: 'they is' is grammatically incorrect. The verb 'is' should be changed to 'are' to match the plural subject 'they'. The final text is 'they are'.
    
    - Example 13
    text: 'I'
    verb: 'has'
    output: have
    explanation: 'I has' is grammatically incorrect. The verb 'has' should be changed to 'have' to match the subject 'I'. The final text is 'I have'.

    - Example 14
    text: 'hi, I'
    verb: 'am'
    output: am
    explanation: 'hi, I am' is grammatically correct and no change is needed. Therefore, the verb 'am' remains unchanged. The final text is 'hi, I am'.
    ------------------------------------------------------------------------------------------------
    Enough examples. Now give me an output for this case 
    pretext: ${props.preText}
    verb: ${props.verb}
    `

    return prompt
}
