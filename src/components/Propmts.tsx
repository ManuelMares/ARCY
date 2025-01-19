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
const wordList = words.getMostPopular(10000);

// Initialize Fuse with options
const options = {
    includeScore: true,
    threshold: 0.2, // Lower this number for stricter matching
    minMatchCharLength: 1,
    keys: ['word'],
    // useExtendedSearch: true,
};

const fuse = new Fuse(wordList.map((word:string) => ({ word })), options);

// Function to get matches
export function getMatches(input:string){
    const results: FuseResult<WordItem>[] = fuse.search(input);
    // console.log(results)
    return results.map((result:FuseResult<WordItem>)=>result.item.word);
}

function getPotenialWords(buffer:string, limit: number){
    const matches = getMatches(buffer);
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
}
interface ICluesVariations{
    context: string,
    preText: string,
    lastWord: string,
}

// Word Completions
export function prompt_wordCompletion(props:ICluesCompletion){
    // Format context
    let prompt = '';
    const word_options = getPotenialWords(props.buffer, 30);

    // Add context
    if (props.context) 
        prompt += `-> context of the guesses\nThe context is ${props.context}. This means that your answer must be related to ${props.context}.\n`;
    

    // Empty Buffer
    const preText = props.preText
    if (props.buffer === "" || word_options.length == 0) {
        prompt += `Your job is to give me 15 words that better continue the following text '${preText}'.
                    Example: if the text is 'Yesterday I'
                    Then your response must be things that complete that sentence, such as 'was', 'ran', 'saw'
                    Example 2: if the text is 'A journalist'
                    Then good options are words such as 'is', 'was', 'wants', 'needs', etc. The priority is describing what the noun is, then other things
                    Notice that they make sense because they complete a correct sentence ('yesterday I was' makes sense).
                    Rule: Match the vocabulary. If the vocabulary is relaxed, the suggestions must be relaxed. If formal, add more formal words.
                    Rule: Do not wrap the words in quote marks or similar!!!. Instead of givin back 'rooted', return the word rooted without extra characters
                    Rule: When possible, only suggest words like nouns and adjectives after having suggest at least 5 short words that help connect ideas, such as
                        a, an, am, in, by, my, at, is, was, but, also, it, I, the, their.
                    Rule: If the word to suggest is the beginning of a new sentence (after a period or empty text), always suggest I as the first option
                    Rule: If the text is empty, or ends in a period, consider using
                        1) articles, such as the
                        2) Always add the pronoun 'I' as an option
                        3) Nouns that were used previously in the text
                    Suggestion: If you see we are talking about the past, change the options to that: was, did, etc.
                    Suggestion. Match the style. If the person does not use a lof of adjectives, do not suggest them. same with other groups of words.
                    \n `;
    } 
    // With Buffer
    else 
    {
        prompt += `Now I will give you word options to rank according to which ones complete the paragraph better. Here is the paragraph: '${props.preText}'.\n\n`;
        for (let index = 0; index < word_options.length; index++) {
            const option = word_options[index];
            // prompt += `Option ${index + 1}: ${option}\nWith this option, the text sounds like: '${props.preText} ${option}'.\n\n`;
            prompt += `Option ${index + 1}: ${option}\n\n`;
        }
        prompt += `I gave you words that can potentially complete the text. Rank them according to which word completes the paragraph best. Your answer must be exactly 15 words, each selected from the options provided.\n\n`;
        prompt += `
            Rule 1: If you are confident that there is a word that completes the text better, replace one of the options for your proposal. Don't be afraid to be perfect, since you are limited to replace only five options at most.
            Example: if you get the text 'I love studying and I want to ', and the word to complete is 'de', but the options are weird options not related to studying, you can suggest better options, such as  'delve'.
            Example: 'intr' might suggest the words 'intricate'. If the word fits the text properly, add it.
            Rule 2: If there are repeated options, replace the repeated option for new options. For instance, if you get the options 'studied' several times, add variations of that word, such as 'studying', 'study',
            or even synonyms if there are no more variations (because preserve the tense is preferable), so words like 'understood', 'reviewed', 'learned' are also great options.
            Think of changing the tense, making them into verbs, adjectives, add thinks like 'ly', etc. as long as the product are real common words
            Rule 3: Do not wrap the words in any character such as quote marks ('). Example, do not answer 'is', answer is.
            Rule 4: Match the vocabulary. If the vocabulary of the text is formal, give priority to formal words.
            Rule 5: If there are less than 15 options, You provide more options that are not repeated, and tha follow the same conditions:
                    They start with the string ${props.buffer}, and that continues the paragraph ${props.preText}
            `
    }
    return prompt;
}

// Word Variations
export function prompt_wordVariations(props:ICluesVariations) {
    if(props.lastWord == "")
        return;

    // Format context
    let prompt = '';

    // Add context
    if (props.context) 
        prompt += `-> context of the guesses\nThe context is ${props.context}. This means that your answer must be related to ${props.context}.\n`;
    
    prompt += `The user wrote the word '${props.lastWord}'. 
                Your job is to provide variations of the same word that use '${props.lastWord}' as the root
                Furthermore, the words you chose must make sense when concatenated to '${props.preText}'.
                Example: if the given word is 'sleep'.
                Then, your answer must be the same root verb. Some options are 'sleeping', 'slept', 'sleeps', 'sleepy', 'sleeper', etc.
                Example 2: if the given word is 'professional'.
                Then the suggestions must use the root word 'profession'. Good outputs are words such as  'profession', 'Professionalize', etc. Include the root word ('profession' in this case) if it is not the given word itself 
                Example 3: if the word is 'is'.
                Then the suggestion can be declinations, such as 'was', 'will be', or similar words, such as 'isn't'. 
                Rule: Do not wrap the words in '. Instead of givin back 'rooted', return the word rooted without extra characters
                Rule: Start the word with capital only if it is gramatically correct (i.e., empty previous text, noun, after a period)
                Do the same for the string '${props.lastWord}' that will go concatenated to '${props.preText}. Don't forget to give 10 options and no extra information\n
                
                `;
    

    return prompt;
}