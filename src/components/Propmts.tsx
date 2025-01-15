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
    console.log(results)
    return results.map((result:FuseResult<WordItem>)=>result.item.word);
}

function getPotenialWords(buffer:string, limit: number){
    const matches = getMatches(buffer);
    const options = []
    for (let index = 0; index < matches.length; index++) {
        if(matches[index].startsWith(buffer))
            options.push(matches[index])
        if(options.length >= limit)
            return options
    }
    return options
}



interface IClues{
    context: string,
    pre_text: string,
    buffer: string,
}
export function produce_prompt(props:IClues){
    // Format context
    let prompt = '';

    if (props.context) {
        prompt += `-> context of the guesses\nThe context is ${props.context}. This means that your answer must be related to ${props.context}.\n`;
    }

    if (props.buffer === "") {
        // Initial request for optional words
        prompt += `I need you to give me back 15 optional words that the user can use to continue this text: '${props.pre_text}'.\n`;
    } else {
        // Explain the task and provide word options
        prompt += `Now I will give you word options to rank according to which ones complete the paragraph better. Here is the paragraph: '${props.pre_text}'.\n\n`;
        const word_options = getPotenialWords(props.buffer, 30);
        for (let index = 0; index < word_options.length; index++) {
            const option = word_options[index];
            prompt += `Option ${index + 1}: ${option}\nWith this option, the text sounds like: '${props.pre_text} ${option}'.\n\n`;
        }
        // Instructions for ranking the words
        prompt += `I gave you words that can potentially complete the text. Rank them according to which word completes the paragraph best. Your answer must be exactly 15 words, each selected from the options provided.\n\n`;

        // Handling no suggestions
        prompt += `If no options were provided, suggest 15 words that start with '${props.buffer}' and make sense when appended to '${props.pre_text}'. If the paragraph plus your suggestion makes no sense, choose a different word.\n`;
    }

    // Print the final prompt for debugging purposes
    // console.log(prompt);

    return prompt
}