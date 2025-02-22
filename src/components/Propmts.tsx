// import Fuse from 'fuse.js';
// import {words} from 'popular-english-words';

//--------------------------------------------------------------------------------------
// Autocompleter
//--------------------------------------------------------------------------------------
// type WordItem = {
//     word: string;
// };
// type FuseResult<T> = {
//     item: T;
//     // You can add other properties that FuseResult might have, like score, matches, etc.
// };

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
    "different", // 2 clicks
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
    "by", // 2 clicks
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
    if (props.preText === "") {
        const beginning =  ["hi", "hello", "do", "you", "today", "what", "how", "yes", "no", "a"]        
        prompt = `Return the following words listed one after the other in the format word space word space word space...
        Do not add extra detail, commas, line jumps, extra spaces, or more or less than 10 words. Do not explain the output, just copy the words.
        do not wrap them in quote marks or anything else. Just repeat the 10 words I am giving you ${beginning}. Return exactly the 10 words, never less than 10.
        `
        return prompt
    }

    // Add context
    if (props.context) 
        prompt += `
    I am writing a text assistant. I will show you my prompt and your job is to produce five   meaningful examples I can add: 
        > task: You are a very helpful writing assistant. Your job is to guess what word is going to be written next.
        You will provide 10 options. five (5) of those options will come from a set of words I will provide, whereas the other five (5)
        will be suggestions of yours. The 10 words you will output will be sorted such that the most likely word to appear next is the first one.

        > Input: The input will consist of two three variables
        1) text. Use this text as a clue to guess what the next word is. i.e. 'Today I was'. The clue means that I was doing something today. You have to guess the word that comes after 'was'
        2) First characters of the word to guess. The word you are guessing starts with these characters. i.e. 'wa'. based on the text, I know that today I was doing an action that starts with the letters 'wa', such as watching or walking.
        3) The pool of words. Five of your options must come from this pool of words. i.e. ["warming", "washing", "root"]. Therefore, your 10 words output must include warming and washing since they start with 'wa'. 
        Notice that the pool is less than 5 words starting with 'wa', so you must now suggest eight (8) words on your own, such that the total of words is 10. 

        > output: the output will be 10 words sorted from the most likely to the less likely to be used. The 10 words will be given
        in the format word1 space word2 space word3 space... etc. Do not wrap the words in quote marks, do not add commas, line jumps or any space other than 
        a simple space.

        > Example:
        1) text: I am really hungry and I think I will go
        2) First characters of the word to guess: h
        3) pool of words: hike hunt hurt him her run race creep exited
        Output: home hunt harvest heat help hoard hike him her hurt
        explanation: The text indicates that the person is very hungry, and that they need to go somewhere or to do something (it is not clear since there are not enough words to deduce that) that starts with h.
        So we know the hungry person wants to either go somewhere that starts with h, or to do some activity that starts with h.
        step 1 is to collect the words in the pool that start with h, such as hike, hunt, hurt, him and her. Out of these activities/places, it is possible that the hungry person wants to
        hunt. Notice that it makes no sense for the person to say that they are very hungry and then indicate they are going to hurt, to him, or to her. They will be included only because we need five, but the only
        one that really makes sense is 'hunt', then 'hike', then 'him', then 'her, then 'hurt' that makes no sense at all. These is the ranking for the pool of words, all starting with h.
        step 2 is to suggest more words until the total is ten words. We need to consider the context and the fact that the word starts with 'h'. Words that make sense are
        'home' because the person might want to go home to eat.
        'help' because the person might want to say they are going to help somebody else to do something related to food.
        'harvest' because harvesting produces food, and the person is hungry
        'heat', because the hungry person might need to heat something before eating it.
        'hoard' because the person might need to save food.
        Notice that food related words such as ham, hamburger or hut cannot be used, because they make no sense when appended to the text. (i.e. 'I am really hungry and I think I will go hamburger' is grammatically incorrect. )
        step 3, now we have 10 words that can be appended to the text, that start with h, and that produce grammatically correct sentences
        home help harvest heat hoard hunt hike him her hurt
        step 4 is to rank these words starting by the one that produces the most likely sentence
        home hunt harvest heat help hoard hike him her hurt
        notice that home is first because to say that the person is going home to eat is an extremely common sentence, and very likely what the user want to say.
        hunt harvest heat go after because these are all words related to eat, and it makes sense since the person wants is hungry
        help hoard go next because these are activities that do not fix hunger, but that can be used in the sentence to later indicate how to deal with hunger
        hike him her hurt are not really related and make very little sense, but they were included just to complete the 10 sentences total
    
        > Example
        1) text: She decided to go for a walk in the park. When Jane find her, she was
        2) First characters of the word to guess: r
        3) pool of words: act view sun rigged run sunk great race lay roam it silver gain retreat blue ring red
        Output: 
        Explanation:
        The text indicates that the person was in a run doing an activity that starts with the character 'r'. Because the text ends in 'she was', 
        we know that the next word must be an adjective or a gerund that start with r.
        step 1 is to collect up to five adjectives and gerunds from the pool of words that start with r, and related to the context of the person going to the park and being found by Jane, rigged run race roam retreat red
        step 2 is to propose five more words so the total are 10, These words must also be gerund and adjectives. ready reading ranting relaxing riding
        the 10 words are:
        ready reading ranting relaxing riding rigged run race roam retreat red
        step 4 is to put all the words in the right number, tense and tense
        ready reading ranting relaxing riding rigged running racing roaming retreating red
        This is the most important step. Notice that all the verbs must be gerunds, so they got adjusted, as in run->running
        step 5 is to sort these 10 words starting with the most likely one to be used when added to the text.
        running racing red ready relaxing riding roaming reading ranting rigged retreating
        running and racing are first because she went to the park to have a walk, and running and racing are related activities
        red is third because she might be read from doing a walking-related activity
        ready and relaxing are after because these verbs are things to do after she was done with her activity (i.e., she wne to walk, now she was ready to go / she was relaxing)
        riding roaming are after because although they are not activities related to walking (what she went to do), they are activities to do in the park (where she is), and possibilities for sure
        reading ranting are after because these are not activities related only to walking, and they can be done outside parks, but still things she could have been doing when Jane found her in the park. 
        finally, rigged and retreating make not a lot of sense, but they are included to reach 10 options, and because it is not impossible that somebody uses these words to complete the text.
        
        
        > Example
        1) text: I am studying for my
        2) First characters of the word to guess:
        3) pool of words: eat eating
        Output: exam test final class presentation oral math english chemistry history 
        Explanation:
        The person is stating that they are studying for something, and there is no condition indicating the word must start with any letter.
        step 1, there is no related word in the pool of words 'I am studying for my eat' and 'I am studying for my eating' make no sense at all. They are excluded
        step 2, we need 10 words that can be appended to the text and make sense. We need to consider that the person could be studying for
        step 3, we rank those 10 words
        exam test final are first because they are the main things people study for
        class presentation are next because they also are frequent things people study for, but they are not as common sentences.
        oral math english chemistry history these are after because they can be used to describe the exams/classes/test/presentations/finals (such as an oral exam, English test, history class). Also most
        people struggle with these classes, so it is probably the user means to indicate they need to study for these classes

        
        > Example
        1) text: Erick and I love bicycles. My
        2) First characters of the word to guess:
        3) pool of words: bicycle friend dream goal aspiration dad mom brother school city
        Output: exam test final class presentation oral math english chemistry history 
        Explanation: since the last word is 'my', a possessive adjective, therefore, the next word must necessarily be 
        a noun, and adjective, or an adverb. 
        However, adverbs are really uncommon words, so no adverb is added.
        adjectives are more common than adverbs, so few are added.
        most speech uses nouns in this cases, so most of the suggestions will be noun.
        bicycle friend are first because we just mentioned these noun in the previous sentence of the text, and the subject of the text is the bicycle, so that must be the very first option
        dream goal aspiration are next because since the person is talking about loving bicycles, it makes sense that they will proceed to describe what their plans are in relation to bicycles.
        dad mom school brother school city are next because since we are talking about bicycles, the person might want to say that the school or the city have bicycles (or space to ride them), or that mom, brother or that have bicycles or will buy him a bicycle.
        
        
        > Example
        1) text: I am feeling really tired after the long hike, so I think I will go
        2) First characters of the word to guess: s
        3) pool of words: sleep sit supper sandwich
        Output: snack sleep sit stretch shower search seek start scoop stir
        Explanation: 
        The person is talking about being tired after a hike, and they are indicating they will go... the next word must be a preposition or a verb in its infinitive forms (without 'to')
        step 1, the options from the pool of words that are verbs or prepositions, so we have sleep sit. Notice that supper and sandwich make no grammatical sense (...so I think I will go sandwich is wrong).
        step 2, propose more words
        shower snack start stretch stir scoop seek search
        step 3 now we have 10 words
        shower snack start stretch stir scoop seek search sleep sit
        We need to rank them
        sleep sit are first because the person is indicating that they are tired, and it makes sense to do activities related to resting after that.
        snack stretch shower go next because, although they are not related to being tired, they make a lot of sense since they are other activities that people do after physical effort
        search seek start are next because they make grammatical sense when appended to the text, but they are still a little bit ambiguous and require more text after, but still good options
        scoop stir These go last because they are not really related, but still we need 10 words.
        
        > Example
        1) text: I am reading in the
        2) First characters of the word to guess:
        3) pool of words: nose pool paul gym garden patio concert chicken rat restaurant
        Output: library bed school classroom bookstore restaurant garden patio pool gym
        Explanation: 
        the text indicates that I am reading somewhere. because it ends in 'in the', the next word must be a noun, a place where 'I' am reading. We also have no first characters to guess, so the place noun word can start with any letter.
        step 1, the options from the pool must be noun places where people read.
        pool garden patio restaurant gym
        Notice that although concert is a place, it is not the kind place where people go to read, so we prefer places where people actually reads.
        step 2, propose more words. We propose places nouns where people actually go to read
        library bookstore bed school classroom 
        step 3, now we have 10 noun places where people read, we need to sort them
        library bed school classroom bookstore restaurant garden patio pool gym
        library, bed, school and classroom are the most popular places where people read, so that is why they go first.
        bookstore and restaurants go later because, although people don't go to those places specifically to read, they include activities that forces people to read (read the menu, read the book covers and summaries), so they are very possible options.
        garden, patio, pool go next because they are also nouns, that don't require people to read, but they are still places where people go to read sometimes. Because they are not as common, they are listed at the bottom.
        gym is the last option because nobody goes to the gym to read, but to workout, so it is by far the less likely option.
        



        `
        // add examples:
        /*
        1)
        */
    
    prompt += `----------------------------------------
    > data
    text: '${props.preText}'
    beginning of the word: '${props.buffer}'
    pool of words:
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
                    The options you provide will derive from the root word
                    
                    > output format
                    Your answer must be at most ten (10) words. No more. at most 10. You will return a single string that separates every word by a single space.
                    Do not wrap words in special characters like quotes or anything. Don't use new lines or extra spaces. All the suggestions must be real words. The format is: word1 space word2 space word3 space....
                    don't add additional text. 
                    example of output: 
                    am was are had will would are did do could

                    > Examples

                    - Example:
                    text: I was eating lunch with my classmate
                    last word: classmate
                    variations: classmates
                    explanation: 

                    - Example:
                    text: I woke up at 830
                    last word: 830
                    variations: 8:30 eight-thirty eighthundred-thirty eight-three-zero
                    explanation: you were given a number, so we will write it in single-word characters eight-three-zero.
                    Then, from the context, 'I woke up at', we know that the next word is actually an hour. We will suggest ways to write that hour, which are
                    8:30 eight-thirty eighthundred-thirty eight-three-zero

                    - Example:
                    text: I am 17
                    last word: 17
                    variations: seventeen
                    explanation: you were given a number, so we will write it in single-word characters eight-three-zero.
                    The context indicates this is an age, so there is no need to add any other alternatives

                    - Example:
                    text: journal
                    last word: journal
                    variations: journals journalism journalist journalists 
                    explanation: I just listed all the words that exist derived from journal

                    Example:
                    text: She went to the park to play
                    last word: play
                    variations: played playing plays
                    explanation: The root word is "play," and based on context, the alternatives suggest different forms of the verb "play."

                    Example:
                    text: He was reading his favorite book
                    last word: book
                    variations: books booklet bookmarks
                    explanation: The root word "book" can be expanded to its plural form "books" and related words like "booklet" or "bookmarks."

                    Example:
                    text: The teacher explained the rules clearly
                    last word: clearly
                    variations: clear clearer clearly clearest
                    explanation: "Clearly" is an adverb derived from the adjective "clear," so variations in different forms of "clear" are suggested.

                    Example:
                    text: He had a rough day
                    last word: day
                    variations: days daily daytime
                    explanation: The word "day" leads to plural "days" and related terms such as "daily" or "daytime."

                    Example:
                    text: I will meet her at the station
                    last word: station
                    variations: stations stationary
                    explanation: The word "station" can lead to the plural "stations" or the adjective "stationary."

                    Example:
                    text: I am
                    last word: am
                    variations: was will do did don't didn't won't can 
                    explanation: The original word is the to-be verb in the present tense. So the variations must be other to-be words in first person, but different tense.

                    Example:
                    text: She is
                    last word: is
                    variations: was will did doesn't
                    explanation: The original word is the to-be verb in the present tense. So the variations must be other to-be words in third person, but different tense.
                    notice that words like don't or do are not included because 'she do' and 'she don't' make no sense. All the suggestions must make sense when we replace the last word for a suggestion

                    Example:
                    text: We were
                    last word: were
                    variations: are will do did don't didn't won't can
                    explanation: The original word is the to-be verb in the past tense. The variations must be other to-be words, but in different tenses and persons.

                    Example:
                    text: They have
                    last word: have
                    variations: had are will do did don't didn't won't can
                    explanation: The original word is the auxiliary verb "have" in the present tense. The variations suggest the same verb in different tenses and negations.

                    Example:
                    text: I will
                    last word: will
                    variations: am was do did don't didn't won't can
                    explanation: The original word is the auxiliary/modal verb "will" in future tense. The variations are other verbs in different tenses or modal forms.
                    words like 'are' are incorrect because 'I are' is incorrect

                    Example:
                    text: You can
                    last word: can
                    variations: could will do did don't didn't won't am
                    explanation: The original word is the modal verb "can" in present tense. The variations are different modals or auxiliary verbs in different tenses.
                    
                    Example:
                    text: That is
                    last word: is
                    variations: was will does did doesn't didn't won't can
                    explanation: The original word is the to-be verb "is" in third person singular, present tense. The variations suggest other to-be verbs in different tenses or forms.
                    Notice that does and doesn't replace do and don't because the 'that' needs the word 'does'
                                        
                    Example:
                    text: I
                    last word: I
                    variations: You we us they he she
                    explanation: The original word is a noun, so the variations must be other verbs.
                        
                    Example:
                    text: I am practical
                    last word: practical
                    variations: practically practiced practically practicing 
                    explanation: The original word is 'practical' form the root 'practice'. So I am suggesting related words. However, words like 'practicioners' make no sense, because if I replace
                    the word 'practica' for practicioners, we get the sentence 'I am practicioners' wchich makese no sense. All the suggestions must be possible, and match the number and hopefully the tense whenever possible.
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
    const PossessivePronoun = ["mine", "yours", "his", "hers", "ours", "theirs"]
    const PossessiveAdjective = ["my", "your", "his", "her", "its", "our", "your", "their"]
    const IndirectObject = [ "me", "you", "him", "her", "it", "us", "them"]
    const tobe = [ "am", "are", "is", "was", "were", "be", "being", "been"]
    const can = [ "can", "cannot", "can't", "could", "couldn't"]
    const doVerb = ["do", "did", "done", "does", "doing"]
    const go = ["go", "went", "gone", "goes", "going"]
    const have = ["have", "had", "has", "having"]
    const like = ["like", "liked", "likes", "liking"]
    const need = ["need", "needed", "needs", "needing"]
    const think = ["think", "thought", "thinks", "thinking"]
    const want = ["want", "wanted", "wants", "wanting"]
    const would = ["would"]
    // const write = ["write", "wrote", "written", "writing", "writes"]


    if(props.verb == "PossessivePronoun"){
        const prompt = `
            > task
            You are helpful text auto completer. Your job is to find the best Possessive Pronoun word to continue the sentence.
            You will given a sentence and you must suggest the best fitting Possessive Pronoun word
            your answer must be a single word from the following list of words:
            Possessive Pronoun words => ${PossessivePronoun}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. Do not preappend words such as 'variations' to indicate you are going to give me the answer Just give the words without more explanations The chosen words must be a Possessive Pronoun word!
                example of output
                mine


            > Examples

            - Example 1
            text: hey, why did you eat the cake in the fridge, that was
            output: mine
            explanation: The person is complaining about you eating a cake in the fridge, and proceeds to explain that eating the cake was bad because the cake was... Since we need to add a cake and there are only two people involve, the only pronoun options
            are 'yours' and 'mine'. However, if the cake was yours, there would be no problem, but since the person is complaining about you eating it, it is obvious the cake 'was mine'.
            
            - Example 2
            text: I could not finish the homework. Would you mind showing me
            output: yours
            explanation: The person is talking to 'you' (do YOU mind), and is asking for you to show something of yours that is going to be mentioned next. Obviously the only Possessive Pronoun word that fits is 'yours'.

            - Example 3
            text: Yesterday I saw Jack, he was walking
            output: his
            explanation: We are talking about a third person male (jack), and describing what he was doing yesterday. Since we know the sentence "he was walking" has to be followed by a Possessive Pronoun word, the right option is 'his'.  

            - Example 4
            text: Carla and Joe were looking at each other. When his eyes met 
            output: hers
            explanation: The last sentence is talking about two pairs of eyes. Since we know those eyes belong to joe and carla, and we already mentioned Joe's eyes (his eyes met), 
            it is obvious that the eyes that joe met were carla. The correct Possessive Pronoun word is 'hers' 

            - Example 5
            text: The range of sounds that cats can hear is much broader than 
            output: ours
            explanation: we are saying that cats can hear a broad range of sounds, and there is a comparison going on, but we don't know what we are comparing to. Therefore, we can only guess
            who this comparison is with. The most likely comparison is humans, since we are the ones reading the text. Therefore, the Possessive Pronoun word that continues this text is 'ours'

            - Example 6
            text: Yes. I just bought it last week. It is a perfect fit, and it is also much larger than
            output: yours
            explanation: "much larger than" indicates there is a comparison. Also, we already know we have to use Possessive Pronoun words.
            On the other hand, we know that this is a response to a second person that is asking question because of the "yes". Since the only people in this conversation are
            I and whoever is asking the question, it makes more sense that we compare our new item to that second person we are talking to, because there is nobody else mentioned in the conversation.
            Therefore, the right answer is 'yours'

            - Example 7
            text: Jack and Roger are very nice. I am a friend of
            output: theirs
            explanation: We are talking about Jack and Roger, which are two people. Therefore, the Possessive Pronoun word is a third person plural -> theirs 

            ------------------------------------------------------------------------------------------------
            Now give me the Possessive Pronoun form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }
    
    if(props.verb == "PossessiveAdjective"){
        const prompt = `
            > task
            You are helpful text auto completer. Your job is to find the best object possessive adjective to continue the sentence.
            You will given a sentence and you must suggest the best fitting object possessive adjective
            your answer must be a single word from the following list of words:
            Possessive adjective => ${PossessiveAdjective}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                my

            > Examples

            - Example
            text: Yesterday we went to your house. Why don't we go to
            output: my
            explanation: "yesterday we went" means that there are two people talking, you and I. Then, if we already went to your house yesterday, the question "why don't we go to" suggest that we want to go
            to a different place this time. We are going to houses, and there are only two, yours and mine (we can only provide possessive adjectives), since we already we went to your house, the only option is that we want to go to "mine". This makes sense
            because the person want to go to the other house, which is mine.

            - Example 
            text: Yesterday I went to get
            output: my
            explanation: since I am talking in the past and in first person (I), the only possible options are 'mine' and 'my'. However, we have not mentioned any pronoun in the sentence, so 'mine' makes no sense in this context
            (Yesterday I wen to get mine -> mine what? it makes no sense.) On the other hand 'yesterday I went to get my' makes perfect sense because the user will add words after that text to explain and complete the sentence. That is not possible if you chose mine.
            In fewer words, if the whole text talks about a single person, the Possessive Adjective words must correspond to the same person (I->my mine, you -> your yours, he ->his, etc.)

            - Example
            text: 
            output: My
            explanation: There is no text at all, meaning we don't have any clue of what the right Possessive Adjective form is. We will use as a default the most common of all those words, which is 'my'.
            That is, if the text is empty, or we don't have a clue, use 'My'

            - Example
            text: I really like ducks
            output: My
            explanation: The sentence so far talks about only one person 'I', so there is no reason to introduce nouns that have not been used in the text. The Possessive Adjective word
            suggested must definitely belong to the first person, and that is 'my'

            - Example
            text: Hey, Jack I really like
            output: your
            explanation: This text is directed to a second person (hey, Jack). Therefore, the possessive adjective must be in second person (your).

            - Example
            text: The professor today was talking about Daniel. She wanted us to act like
            output: him
            explanation: The text indicates that the professors was comparing the class to Daniel, and continues saying that she wanted the class to be like... since Daniel is the person to compare, the answer must be the third person masculine (him)

            - Example
            text: Do you know what happened to Aracely? I have not seen
            output: her
            explanation: The text asks for Aracely, and continues indicating that they have not seen... Since they are looking for Aracely, it makes sense they want to say they have not seen aracely. The corresponding possessive adjective is 'her'.

            - Example
            text: 
            output: its
            explanation: Since the text is empty, we have do guess what is the most probable possessive adjective to start a sentence, which are you and its. We chose its just because it is a very common adjective to start sentences

            - Example
            text: I cannot believe
            output: its
            explanation: the text is going to indicate next what they cannot believe. There are many options that could continue 'I cannot believe you', 'I cannot believe its', I cannot believe him', etc. However, we have no clue to guess the next adjective.
            We chose 'its' just because 'its' is much more common in english than 'you', 'him', 'her', 'us', and in general any other adjective. So we chose 'its' just because we have no clue on the adjective, but it is very common still.
            
            - Example
            text: The first team did a great presentation, and now it is
            output: our
            explanation: the text is clearly talking about a comparison between teams, we know because the first part describes how the first group performs, and indicates that now it is the turn of the next group.
            The possessive adjective we use has to be also referring to a group of people, so the options are 'your', 'their', and 'our'. Since the text does not talk about 'them' or 'your', we assume the first person and use 'our'.
            
            - Example
            text: Did you do all
            output: your
            explanation: the text is talking to a second person. the corresponding possessive adjective is 'your'.
            
            - Example
            text: Norman and Arizu were complaining about somebody stealing
            output: their
            explanation: the text describes the experience of Norman and Arizu, a group of people referred to in the third person. the third person plural possessive adjective is 'their' 
            
            ------------------------------------------------------------------------------------------------
            Now give me the Possessive Adjective for this case 
            pretext: ${props.preText}
        `

        return prompt
    }
    
    if(props.verb == "IndirectObject"){
        const prompt = `
            > task
            You are helpful text auto completer. Your job is to find the best Indirect object to continue the sentence.
            You will given a sentence and you must suggest the best fitting Indirect object
            your answer must be a single word from the following list of words:
            Indirect objects => ${IndirectObject}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                me

            > Examples

            - Example :
            Text: They called
            Output: me
            Explanation: "They" is the subject, and "me" is the Indirect object. The complete sentence is "They called me."

            - Example :
            Text: After months of waiting and countless interviews, the company finally decided to offer
            Output: me
            Explanation: "Me" is the Indirect object referring to the speaker. The complete sentence is "After months of waiting and countless interviews, the company finally decided to offer me"

            - Example :
            Text: I need
            Output: you
            Explanation: "I" is the subject, and "you" is the Indirect object. The complete sentence is "I need you."

            - Example :
            Text: I do remember the meeting you had yesterday. When the meeting was over, the manager approached
            Output: you
            Explanation: "You" is the Indirect object referring to the listener. Since the story I am telling is all about 'you', the Indirect object I am going to use is also 'you'.

            - Example :
            Text: Despite their differences, they decided to invite him. However, to come was completely up to
            Output: him
            Explanation: The story is about 'they' inviting him'. Since the text first talks about what 'they' did, and then about the answer, the answer must talk about 'him'.

            - Example :
            Text: After hearing so much about Natalie, I was excited to finally meet
            Output: her. 
            Explanation: We are talking about Natalie, a female, so the corresponding word is 'her'.

            - Example :
            Text: They found
            Output: it
            Explanation: Here, we don't know what they found. We have to guess if it is a person or object. 'it' it is much more likely to be the option without context.

            - Example :
            Text: Knowing that we were new to the city, they kindly invited
            Output: us
            Explanation: there are two people interacting in this group, us (we were new...), and they (they kindly invited). Since the story indicates that they kindly invited people, and the only
            other people in the story is 'us', the answer must be 'us'. it cannot be me, him, her, it, or you, because none of those people are mentioned in the story.

            - Example :
            Text: We went to The Beatles concert, and when we finally saw
            Output: them
            Explanation: We were talking about going to see a group, and then we describe we saw them. It makes sense that when describing that event we use the pronoun 'them'.

            - Example
            text: We made a great presentation, and the professor asked
            output: us
            explanation: There are two nouns in this sentence, the 'professor' and 'we'. Since the professor is the one asking to somebody, and we need to chose the adjective that indicates who is being asked, it is obvious that it is asking to 'we'.
            The corresponding adjective is us (we->us).
            
            - Example
            text: I look at great scientists like Newton, Gauss, Einstein, Maxwell, and Euler, and I think of
            output: them
            explanation: The text is talking about a group of great scientists, and indicating next that I think of that group, but the indirect object is missing. They -> them

            ------------------------------------------------------------------------------------------------
            Now give me the Indirect object for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "tobe"){
        const prompt = `
            > task
            You are helpful text auto completer. Your job is to find the best to be verbs to continue the sentence.
            You will given a sentence and you must suggest the best fitting to be verb
            your answer must be a single word from the following list of words:
            to be verbs => ${tobe}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                was


            > Examples

            - Example 1
            text: Sincerely, I don't feel I
            output: am
            explanation: We know a couple of things, first, I am talking about myself (I don't feel I), so the only options are the to be verbs in first person. Then, we know that we are talking in the present tense (don't).
            Therefore, the answer is the singular form in present tense of the to be verb -> 'am'. The complete sentence after you provide the answer would be 'Sincerely, I don't feel I am', which makes perfect sense.

            - Example 2
            text: It is just crazy to think that Timmy and Joselyn
            output: are
            explanation: We are talking about two people (Timmy and Joselyn), since we are looking for a second person to be verb in the present tense, the only answer is 'are'.

            - Example 3
            text: it
            output: is
            explanation: it can be followed by the to be verbs was, were, and is. However, since we don't have more information, the most likely option is 'is', because it is a extremely likely word (it is) to describe things, whereas
            was and were would only be used if we knew we are talking in the past tense.

            - Example 4
            text: Angie and Ramon went to the store the other day. They left very early hoping to be back before noon, so we all could eat together. however, the store open late, and there was a very long line
            of people waiting to buy groceries as well. It took them hours to go to the store and grab everything for lunch. At the end of the day, they not only arrive late, but it
            output: was
            explanation: the story narrated is in the past tense, and the last word is 'it', necessarily the next word is 'was'

            - Example 5
            Text: If I had known they
            Output: were
            Explanation: We are using a conditional sentence (If I had known), which implies something that didn't happen in the past. "They" is third person plural, so the past tense "to be" verb is "were." The complete sentence would be "If I had known they were," which makes sense given the conditional nature of the statement.

            - Example 6
            Text: She wants to
            Output: be
            Explanation: "Wants" indicates a desire, and "to" precedes an infinitive verb. The infinitive form of "to be" is "be." The complete sentence is "She wants to be," which is grammatically correct and clear in meaning.

            - Example 7
            Text: Despite
            Output: being
            Explanation: "Despite" is a preposition that is often followed by a gerund (-ing form of a verb). "Being" is the correct gerund form of "to be." The full sentence might be "Despite being tired," which is a common structure.

            - Example 8
            Text: They have
            Output: been
            Explanation: "Have" indicates the present perfect tense, which requires the past participle form of the verb. The past participle of "to be" is "been." The complete sentence is "They have been," indicating an action or state that started in the past and continues to the present.
            ------------------------------------------------------------------------------------------------
            Now give me the to be form for this case 
            pretext: ${props.preText}
        `
        
        return prompt
    }



    if(props.verb == "can"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the can verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting can verb form
            your answer must be a single word from the following list of words:
            can verb forms => ${can}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                can

            > Examples

            - Example :
            Text: Do you think you
            Output: can
            Explanation: the answer is obvious. This is a common question

            - Example :
            Text: I am sure they both
            Output: can
            Explanation: there is no reason to guess a different answer

            - Example :
            Text: I will try, but I am not sure I
            Output: can
            Explanation: there is no reason to guess a different answer

            - Example :
            Text: I am really sorry, I want to go to the party tomorrow, but I have to work and I
            Output: can't
            Explanation: can't is only used when you are sure the text is negative. In here, the person is apologizing for not being able to do something, which obviously is can't.

            - Example :
            Text: I really tried to help her, but I
            Output: couldn't
            Explanation: The person uses negative and we know it because they are apologizing for not being able to do something. Furthermore, the text is in the past, so the only option is couldn't

            Notice that the negative forms are not as common, and should be used only when the whole sentence suggest it. If in doubt, use the positive.
            ------------------------------------------------------------------------------------------------
            Now give me the can verb form this case 
            pretext: ${props.preText}
        `

        return prompt
    }


    if(props.verb == "doVerb"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the can verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting can verb form
            your answer must be a single word from the following list of words:
            can verb forms => ${doVerb}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                can

            > Examples

            - Example :
            Text: Yes I
            Output: do
            Explanation: the answer is obvious. This is a common sentence. There is no reason at all to assume this is in past tense (did), and definitely not a negative (don't) or third person (does),
            since we are only talking about me.

            - Example :
            Text: I know she says I did break it, but I assure you I
            Output: didn't
            Explanation: In the first sentence, somebody says that I did something. The second part start with 'but', indicating a disagreement with the original statement, so obviously the result is 'didn't'

            - Example :
            Text: Hey, what are you
            Output: doing
            Explanation: This is such a common sentence that it is obvious.

            - Example :
            Text: I can assure you that yesterday I
            Output: did
            Explanation: While this text has no enough clues to determine if we mean 'did' or 'didn't', we must always prefer the positive part 'did', and use the negative only when obvious it is meant. That is because
            did is more probable to be the answer the text is looking for.
            
            - Example :
            Text: I told you I am
            Output: done
            Explanation: This sentence is in the first person (I), so we can be sure the only possible options are 'do', 'did' and 'done' (remember, we only use negatives when the sentence clearly indicate it needs the negative word).
            However, I told you I am do, and I told you I am did make no sense. Therefore, the only good answer is 'done'


            ------------------------------------------------------------------------------------------------
            Now give me the do verb for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "go"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the go verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting go verb form
            your answer must be a single word from the following list of words:
            go verb forms => ${go}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                go

            > Examples

            - Example :
            Text: Can we
            Output: go
            Explanation: 'we' indicates we need the first person form.

            - Example :
            Text: Well, we could not find her in her house, so I think she is
            Output: gone
            Explanation: the last word is 'is'. After the word 'is' the only possible options at all are 'going' and 'gone'. Both are good, however, 
            because of the context that we were expecting her to be in her house, it is more likely the answer is 'gone'

            - Example :
            Text: We were playing when everything
            Output: went
            Explanation: We are talking about the past (were playing), so the options are gone and went. We know the user will add more words to the text after we 
            add a go verb to complete the sentence. 'We were playing when everything goes' makes no sense. ' We were playing when everything went' makes much more sense.

            - Example :
            Text: I
            Output: go
            Explanation: since the text is in first person, the only options are 'went' and 'go'. If there is no reason to believe the text is in the past, we chose the present as default.
            
            - Example :
            Text: she
            Output: goes
            Explanation: since the text is in third person, the only options are 'went' and 'goes'. If there is no reason to believe the text is in the past, we chose the present as default.
            
            - Example :
            Text: I am
            Output: going
            Explanation: the only two options here are 'going' and 'gone'. There is no reason to believe the text is in the past, so we chose 'going'.
            
            - Example :
            Text: If you come around tomorrow you will find out I am
            Output: gone
            Explanation: the only two options here are 'going' and 'gone'. Since we are talking in the past, the verb has to be 'gone'.

            ------------------------------------------------------------------------------------------------
            Now give me the correct go verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "have"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the have verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting have verb form
            your answer must be a single word from the following list of words:
            have verb forms => ${have}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                have

            > Examples

            - Example :
            Text: Can we
            Output: go
            Explanation: 'we' indicates we need the first person form.

            - Example :
            Text: I don't
            Output: have
            Explanation: First person sentence in the present tense, obviously 'have'

            - Example :
            Text: If I
            Output: had
            Explanation: Given the hypothetical clause (had), the answer is obviously 'had'

            - Example :
            Text: I can finish it if I
            Output: have
            Explanation: the 'i can' indicate that we use the verb have

            - Example :
            Text: It is terrible to think that If she
            Output: had
            Explanation: Same, a hypothetical clause suggests had

            - Example :
            Text: It is terrible to think that If she had
            Output: had
            Explanation: the only option at all is had

            - Example :
            Text: not all of us
            Output: have
            Explanation: No reason to think about the past, so have

            - Example :
            Text: she
            Output: has
            Explanation: The only options are 'had'  and 'has'. There is no reason to assume this is past tense at all.
            
            
            - Example :
            Text: it is a lot of luck that we had/have
            Output: had
            Explanation: have or had, both are equally good Use any

            - Example :
            Text: I am
            Output: having
            Explanation: after 'I am', use having. This is always the case
            

            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "like"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the like verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting like verb form
            your answer must be a single word from the following list of words:
            like verb forms => ${like}
            > output
            The output is a single word with no extra symbols like quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                like

            > Examples

            - Example :
            Text: I really
            Output: like
            Explanation: present tense, first person -> like

            - Example :
            Text: I used to
            Output: like
            Explanation: although it is in the past, 'I used to liked' is incorrect. The right form is 'I used to like' 

            - Example :
            Text: does she
            Output: like
            Explanation: third person uses 'likes', however, due to the 'does', the verb must be 'like'

            - Example :
            Text: I didn't think I would have fun in the park, but I am
            Output: liking
            Explanation: I am is always followed by 'liking'

            - Example :
            Text: I think she
            Output: likes
            Explanation:  third person is likes

            - Example :
            Text: he is
            Output: like
            Explanation: is is already on the third person, here like is a descriptor

            - Example :
            Text: Do you wanna be
            Output: like
            Explanation: same as the previous example.


            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "need"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the need verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting need verb form
            your answer must be a single word from the following list of words:
            need verb forms => ${need}
            > output
            The output is a single word with no extra symbols need quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                need

            > Examples
            Example :
            Text: You really
            Output: need
            Explanation: "You" is the subject, and "need" is the base form of the verb. The complete sentence is "You really need."

            Example :
            Text: To succeed in this class, you
            Output: need 
            Explanation: "You" is the subject, and "need" is the base form of the verb, indicating a requirement.

            Example :
            Text: She suddenly realized she
            Output: needed
            Explanation: "She" is the subject, and "needed" is the past tense form of the verb. The complete sentence is "She suddenly realized she needed."

            Example :
            Text: He desperately
            Output: needs
            Explanation: "He" is the subject, and "needs" is the third person singular present tense form of the verb. The complete sentence is "He desperately needs."

            Example :
            Text: I find myself
            Output: needing
            Explanation: "I" is the subject, and "needing" is the gerund form of the verb, indicating a continuous action or state. The complete sentence is "I find myself needing."

            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    if(props.verb == "think"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the think verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting think verb form
            your answer must be a single word from the following list of words:
            think verb forms => ${think}
            > output
            The output is a single word with no extra symbols think quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                think

            > Examples
            
            Example :
            Text: I really
            Output: think
            Explanation: "I" is the subject, and "think" is the base form of the verb.

            Example :
            Text: After considering all the evidence and listening to both sides of the argument, I
            Output: think
            Explanation: "I" is the subject, and "think" is the base form of the verb, indicating the act of forming an opinion.


            Example :
            Text: She
            Output: thought
            Explanation: "She" is the subject, and "thought" is the past tense form of the verb.

            Example :
            Text: When she heard the unexpected news, she
            Output: thought
            Explanation: "She" is the subject, and "thought" is the past tense form of the verb, indicating the act of thinking in the past.

            Example :
            Text: He always
            Output: thinks
            Explanation: "He" is the subject, and "thinks" is the third person singular present tense form of the verb.

            Example :
            Text: Despite the challenges they face, he always
            Output: thinks
            Explanation: "He" is the subject, and "thinks" is the third person singular present tense form of the verb, indicating a habitual action.

            Example :
            Text: I am
            Output: thinking
            Explanation: "I" is the subject, and "thinking" is the gerund form of the verb, indicating a continuous action.

            Example :
            Text: While working on the project, I found myself
            Output: thinking
            Explanation: "I" is the subject, and "thinking" is the gerund form of the verb, indicating a continuous action.

            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }

    
    if(props.verb == "want"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the want verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting want verb form
            your answer must be a single word from the following list of words:
            want verb forms => ${want}
            > output
            The output is a single word with no extra symbols want quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                want

            > Examples
            
            Example:
            Text: I really
            Output: want
            Explanation: This sentence is in the present tense, and in first person, so the next word should be 'want'

            Example:
            Text: After considering all the options available, I
            Output: want
            Explanation: This sentence is in the present tense, and in first person, so the next word should be 'want'

            Example:
            Text: When the opportunity finally presented itself, she realized that what she
            Output: wanted
            Explanation: 
            To explain why "wanted" is the correct choice, you need to focus on the grammar of the sentence, specifically the tense and structure.
            Past Tense Consistency: The sentence begins with "When the opportunity finally presented itself," which is in the past tense. To maintain consistency in the sentence, the verb after "realized" should also be in the past tense. Therefore, "wanted" is correct because it is the past tense of "want."
            Subordinate Clause: The phrase "what she wanted" forms a noun clause that acts as the object of the verb "realized." This noun clause describes something that she realized in the past, so it should reflect a past action or state. "Wanted" matches the past tense established earlier in the sentence.

            Example:
            Text: He always
            Output: wants
            Explanation: third person. There is no reason to assume a past or future tense, so wants is correct

            Example:
            Text: I find myself
            Output: wanting
            Explanation: "I" is the subject, and "wanting" is the gerund form of the verb, indicating a continuous action.

            Example:
            Text: As the deadline for the project approached, I found myself
            Output: wanting
            Explanation: "I" is the subject, and "wanting" is the gerund form of the verb, indicating a continuous action.

            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }
    
    if(props.verb == "would"){
        const prompt = `
            > task
            You are helpful text auto completer. Your form of the would verb to continue the sentence.
            You will given a sentence and you must suggest the best fitting would verb form
            your answer must be a single word from the following list of words:
            would verb forms => ${would}
            > output
            The output is a single word with no extra symbols would quote marks or anything else. No  dots, periods, etc. just one single word.
            No extra spaces or explanations. The chosen words must be a possessive word!
                example of output
                would

            > Examples
            
            Example:
            Text: I really
            Output: would
            Explanation: it makes sense

            ------------------------------------------------------------------------------------------------
            Now give me the correct have verb form for this case 
            pretext: ${props.preText}
        `

        return prompt
    }
    

}
