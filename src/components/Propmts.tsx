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
    wordGroup: string,
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
        prompt += ` >Task: Your job is to give me 15 words that better continue the following text '${preText}'.
                        1) Return 15 words. No more or less. Exactly 15 words
                        2) The format is the 15 words one after the other separated by a simple space, with no decorations such as quotation marks
                            Example:
                                text -> Hello, how 
                                answer -> are do can is did to could will long large far couldn't come
                    >Rule
                        IF: Text ends with a space (indicating a new word is being typed).
                        DO: Suggest contextually appropriate words based on previous word(s). For example:
                            After pronouns: suggest verbs (e.g., I -> am, He -> runs, They -> are)
                            After articles: suggest nouns (e.g., The -> dog, A -> car, An -> apple)
                    >Rule 
                        IF: the text is empty, OR is the beginning of a new sentence (ends in a period)
                        DO:
                            5 pronouns, i.e. I, he, they, she, it, we, my. Specially consider pronouns that reflect the noun used previously
                            5 articles and nouns, i.e. the, hello, today, yesterday, by
                            5 question words, i.e. how, what, why, when
                    >Rule
                        DO: ensure sentence consistency. For example
                            subject-verb agreement: (e.g. he -> runs)
                            noun-pronoun agreement: (e.g. the girl lost -> her)
                            tense consistency: (e.g. the girl lost her bag. She -> was)
                    >Rule
                        IF: The sentence begins with certain phrases.
                        DO: Predict the common continuation (e.g., "Would you" -> like, mind, be)
                    >Rule 
                        DO: Match the vocabulary style. 
                        If the vocabulary is relaxed, the suggestions must be relaxed. If formal, add more formal words.
                    >Rule 
                        IF: the text is empty, OR is the beginning of a new sentence (ends in a period)
                        DO: Start the word in capital
                    >Rule:
                    >Rule: 
                        DO: When possible, only suggest words like nouns and adjectives after having suggest at least 5 short words that help connect ideas, such as
                        a, an, am, in, by, my, at, is, was, but, also, it, I, the, their.
                    Suggestion: If you see we are talking about the past, change the options to that: was, did, etc.
                    Suggestion. Match the style. If the person does not use a lof of adjectives, do not suggest them. same with other groups of words.
                    \n `;
    } 
    // With Buffer
    else 
    {
        
        prompt += `
            >Task
                Your job is to, given a set of words, select those words that better continue the following text '${props.preText}'
                1) Return 15 words. No more or less. Exactly 15 words
                2) The format is the 15 words one after the other separated by a simple space, with no decorations such as quotation marks
                    Example:
                        text -> Hello, how 
                        answer -> are do can is did to could will long large far couldn't come
                >Most important Rule!!
                    All the words must start with ${props.buffer}. If an optional word does not start with ${props.buffer}, discard it. Even if it was your added suggestion.
                >Rule
                    IF: You are given less than 15 words
                    DO: Add suggestion words that are not repeated until there are 15 words in total
                >Rule
                    Do: Sort the words by likelihood of complete the text ${props.preText}. The first one in list must be the most likely word.
                >Rule
                    If the word that completes ${props.buffer} the most likely is not among the suggestions, replace the less likely options for the right word.
                    Be active doing this
                    Example
                    text -> Science is an 
                    starts with -> intr
                    list of words -> Introduction introspective intrusive intransigeantly intracerebrally intramolecular intracutaneaos intractability intracellular  introspect intrapersonal intradermally intrapreneurs intromissions intracerebral
                    answer -> intricate
                    The list of words is not likely to complete the text. In the other hand, intricate is a word that suits and completes the text really well.
                    `
            prompt += `Now I will give you word options to rank according to which ones complete the paragraph better. Here is the paragraph: '${props.preText}'.\n\n`;
            for (let index = 0; index < word_options.length; index++) {
                const option = word_options[index];
                // prompt += `Option ${index + 1}: ${option}\nWith this option, the text sounds like: '${props.preText} ${option}'.\n\n`;
                prompt += `Option ${index + 1}: ${option}\n\n`;
            }
    }

    if(props.wordGroup != "")
        prompt += `>MOST IMPORTANT RULE
        all the options must be ${props.wordGroup}. If an option is not ${props.wordGroup}, then omit it, and replace it for new options that are ${props.wordGroup}.
        Preferably, the ${props.wordGroup} suggested must be words that make sense when added to the current text.`
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
                >task
                    Your job is to provide exactly 10 variations of the same word that use '${props.lastWord}' as the root
                    Furthermore, the words you chose must make sense when concatenated to '${props.preText}'.
                    Example: if the given word is 'sleep'.
                    Then, your answer must be the same root verb. Some options are 'sleeping', 'slept', 'sleeps', 'sleepy', 'sleeper', etc.
                    Example 2: if the given word is 'professional'.
                    Then the suggestions must use the root word 'profession'. Good outputs are words such as  'profession', 'Professionalize', etc. Include the root word ('profession' in this case) if it is not the given word itself 
                    Example 3: if the word is 'is'.
                    Then the suggestion can be declinations, such as 'was', 'will be', or similar words, such as 'isn't'. 
                >Rule 
                    Do: Provide only 10 words. No more, no less. Exactly 10 everytime
                >Rule: 
                    Do not wrap the words in quotation marks or any other symbol
                    The output has to be 10 words in a single line separated by simple space, as follows:
                    example
                        happy happier happily happiest unhappy excited jolly joyful content merry
                >Rule: Start the word with capital only if it is grammatically correct (i.e., empty previous text, noun, after a period)
                >Rule: If the word is 'be' or 'is'
                    If the word is the verb 'be', 'is' or any of its variations (such as be, am, was, is, etc.), 
                    look at the noun that is using that verb, and suggest matches for that verb.
                    Example. 
                        text -> I
                        word to variate -> be
                    answer
                        Suggest words such as am, was, will, etc.
                    explanation. It is obvious that if the user wrote noun + to be, they want to write something like I am, I was, or I will.
                    In these cases match the noun 
                >Rule: if the word is a preposition
                    If the word is a preposition such as in, on, for, with, at, by, the suggested variation must be prepositions that fit better the text, starting by the most common ones to, of, in, for, with, at, by
                    Example
                        text -> the book is
                        word to variate -> at
                    Answer
                        Suggest prepositions such as on
                    Explanation
                        'The book is on' is a common preposition, since books can be on tables, beds, etc.
                >Rule: When you get verbs such as 'like', provide negative options
                    Example
                        word to variate -> like
                    Answer
                        Suggest words such as dislike, unlike
                Do the same for the string '${props.lastWord}' that will go concatenated to '${props.preText}. Don't forget to give 10 options and no extra information\n
                
                `;
    

    return prompt;
}