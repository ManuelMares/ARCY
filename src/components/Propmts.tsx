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
                    Also consider this set of words know as the arcy_specials = {need, want, like, don't, do, think, have}
                    the following rules are strong suggestions of the output required. If you cannot follow it, that is okay. Just make the best prediction possible
                    > Rule: Sentence start
                        condition: pretext ('${preText}' in this case) is empty, or the last character is a period ., indicating that the next character is the beginning of a new sentence
                                    for example, the pretext can be 'Anna and I went to the park.' Here we apply this rule because the sentence ended in a period
                                    example 2 the pretext is ''. Here we apply this rule because the previous text is empty, indicating a new sentence is going to start
                        output: 
                        5 of the suggested words must be nouns that have appeared previously in the text
                        5 of the results must be question words, such as what, who, when and how
                        5 options must be pronouns such as We, they, he, she. chose the most likely ones based on previous text
                        If any of these categories do not have 5 words, use the left options to suggest other types of words, until you read 15 options
                        Additionally, make sure these features are guaranteed:
                            - All the words must start with capital
                            - The options are sorted from the most likely one to the least likely one
                    > Rule: after a noun
                        condition: When the previous word is a noun
                        output: 
                            5 of the suggestions must be different forms of the 'to be' verb
                                Within these options, make sure to guarantee that 
                                - There is number agreement. For instance
                                    "Anna and I" -> we were went will. Each of these option makes sense because we are talking about two people. We provide different conjugation for different tenses, but we are still in 'we' and plural
                                    example two: 
                                    "I" -> was am will went were. Each of these options make sense because they are used with the noun 'I' and make sense. They include different tenses.
                                - There must be tense agreement. For instance
                                    'Yesterday they' -> did went were. Each of these options make sense because 'yesterday' indicates we are talking about the past
                            5 of the suggestions must be verbs
                                Example: 'I' -> went did run eat sing. these words make sense because they are verbs.
                            5 of the suggestions must be from the arcy_specials set. these options must be there. Do not leave them out. Always include them after a noun. always!
                                - there must be number and tense agreement. For example
                                'She' -> wants needs likes doesn't does thinks has. these options make sense because it is in third person
                                'yesterday I' -> needed wanted liked didn't did thought had. these options match the first person 'I', and the past tense suggested by 'yesterday'.
                            Add conjugation of previous options
                    > Rule: after a verb
                        condition: the last word is a verb, such as in 'I run' 'Alice and I went'
                        output: limit the number of adjectives and adverbs to maximum 5 options. Prefer to suggest prepositions
                    > Rule: Prepositions
                        condition: the last word was a preposition, as in 'I throw the book into', or 'I got in'. these two sentences end in prepositions
                        output:
                        5 of the suggestions must be articles. For instance
                        'She put her cellphone in' -> the a. these two options make sense after the word 'in'
                        5 options must be nouns. Specially if there were used before For instance
                        'I went to' -> home downtown. these two options make sense because they are very popular nouns
                        'I love Ihop. yesterday I went to' -> Ihop. this makes sense because Ihope is a noun mentioned before, and that can be used after the word 'to'. 'I' does not make sense here even when it is a noun.
                    > Rule: a, an
                        condition: the sentence ends in a or and. For instance in the sentence 'They want a'.
                        output:
                            suggest nouns that were used before in the sentence. Example
                            "Ali loves chocolate, cars and drawing. Today at the candy store she got a" -> chocolate. This makes sense because you can buy chocolate in the candy store. you cannot buy cars or drawings there.
                            "Ali loves chocolate, cars and drawing. Today at the arts store she got a" -> pencil brush painting draw. these words make sense because Ali loves drawing, and pencils, brush, painting and drawings can be bought at the art store where she is. Not cars or chocolate.
                            5 options must be other nouns that make sense. Example
                            'I wanna go home. I need a' -> ride taxi bus train. Because these nouns can take the person home, where they want to go.
                            'I am very hungry. I want an' -> apple almond anchovy. these words make sense because the word 'an' suggest that the following must start with 'a', and the previous sentence 'I am very hungry' indicates we are going to talk about food. All the options are food that start with the letter 'a'.
                            add words that are commonly used after a or an
                            'I had a' -> lot few ton significant. words like 'lot' are commonly prefaced by the words 'a', so it has to be included here for sure.
                    > rule: The
                        condition: the last word is 'the'. Example 'today we went to the'. the sentence ends in 'the'
                        5 options must be adjectives if they make sense
                        5 options must be nouns
                        include nouns that have been mentioned before if they make sense. Example
                        'Anna and carlos went to the park. They saw cars and buses. They eat candy, cake and meat. Then they went home near the statue. They got hungry and wished they ate more of the' -> cake candy meat. these options make sense because although the sentence have many nouns, the last sentence indicate they want to ate more, so the only options that are valid must be foods.
                    > Rule Indirect object
                        5 words must be connectors words from the fanboys (for, and, nor, but, yet, our, so). Only the ones that make sense.
                        5 words must be adverbs
                    > Rule: comma
                        condition the sentence ends in comma. For instance 'I want food,', 'yesterday you went downtown,'. The last character in these two sentences is ,
                        4 of the options must be: and, but or, so. This condition is not options. These must be the first four options.
                        5 options must be pronouns
                        the options must include conjunction words. Include conjunctions.
                    > rule:
                    after a possessive word such as your our yours my mine, use a noun
                    'I went to the park to see our' -> friends family pets classmates dates. Notice that all these words are nouns, but since we are are going to see things are for us, date has to be plural
                    'I want my' ->  money time computer food
                    > rule: hope
                        after the word hope, include these suggestions
                        I we you they he she that this it everything everyone 
                    > rule
                        after it, make sure you suggest these two options: is was
                    > use common sentences autocompletion
                        example 1
                        'as' 
                        complete it with 'soon', since 'as soon' is a very common sentence.
                        example 2
                        'we headed'
                        complete it with 'back', since 'headed back' is a very common sentence.
                        'good'
                        complete it with 'bye', since 'good bye' is an extremely common sentence.
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
                    
                    End of rules.
                    Follow the previous rules to make the best possible suggestions. Here are some example of some suggestion tasks:
                    Example 1
                    text: we all went
                    possible suggestions
                    the -> bad. 'we all went the' makes no sense. it need the word 'to' in between
                    park -> you cannot just 'went noun', you need the word 'to' in between
                    other bad words. No nouns, such as they, we, he she, park, beach, etc.
                    to -> The very best option. 'we all went to' is a good sentence that makes sense since it introduces a noun'
                    where -> 'we all went where' also makes sense'
                    home -> This is one of the few nouns that do not need 'to' before to makes sense. 'We all went home' makes sense. 'we all went park' makes NO sense.
                    today -> This and other similar words make sense 'we all went today'
                    other good words: yesterday tomorrow fast with for, etc.

                    Example 2
                    text: I am a very smart student
                    Possible suggestions:
                    that -> great suggestion. It makes sense because we are going to describe the student
                    I -> bad suggestion. It would make sense if there was a comma in between, but "I am a very smart student I" makes no sense
                    other bad suggestions:
                    why where am is have think
                    good suggestions:
                    and  when if only like so
                    
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

                >Rule: Ensure grammatical correctness
                    DO: Identify the part of speech that is most likely to follow the last word in '${props.preText}'. Prioritize words that fit grammatically and contextually.
                >Rule: Remove words that do not logically follow the sentence
                    DO: Do not include words that disrupt meaning or create ungrammatical phrases.
                >Rule
                    If the word that completes ${props.buffer} the most likely is not among the suggestions, replace the less likely options for the right word.
                    Be active doing this
                    Example
                    text -> Science is an 
                    starts with -> intr
                    list of words -> Introduction introspective intrusive intransigeantly intracerebrally intramolecular intracutaneaos intractability intracellular  introspect intrapersonal intradermally intrapreneurs intromissions intracerebral
                    answer -> intricate
                    The list of words is not likely to complete the text. In the other hand, intricate is a word that suits and completes the text really well.
                
                    End of rules.
                    Follow the previous rules to make the best possible suggestions. Here are some example of some suggestion tasks:
                    Example 1
                    text: I sat on the bench with my friend and I shared my 
                    the words starts with: t
                    possible outputs
                    -> to. This option is wrong, since the word has to be a noun. 'my to' makes no sense
                    -> that. same, makes no sense
                    -> they. same, makes no sense
                    -> theirs. same, makes no sense
                    -> take. same, makes no sense
                    -> together, too, taking are other words that make no sense
                    -> thoughts. this is a great option. The words starts with 't', just like the clue, and 'my thought' makes sense. also, 'share my thoughts' is a common sentence.
                    -> three. Also makes sense. You can say 'I share my three'
                    -> time. Also makes sense. Share my time is a common sentence.
                    two team are words that also make sense

                    example 2
                    text: It is always hard to be the
                    the words start with: s
                    possible outputs:
                    should ->  makes no sense. 'it is always hard to be the should' makes no sense
                    she, such, some, so, since. all these words also make no sense when appended at the end of 'it is always hard to be the'
                    smartest -> makes perfect sense. '... the smartest' is a logical and gramatically correct sentence. Also, it starts with 's'
                    same -> also makes sense
                    other words that make sense are: second smallest smaller silent superior.

                    example 3
                    text: the day was
                    the words must start with: b
                    possible outputs:
                    by -> 'the day was by' makes no sense. This is a bad option
                    but -> 'the day was but' makes no sense. this is a bad options
                    other bad options: be been born bad books board body
                    bright ->  'the day was bright' is a good option. It is a common expression and makes sense. We are talking about the day, and the day can be bright
                    bad -> this ia also an adjective for the day. 'the day was bad' is a great option
                    other good options: being boring busy between both beginning
                    `
            prompt += `Now I will give you word options to rank according to which ones complete the paragraph better. Here is the paragraph: '${props.preText}'.
            
            Very important, if the word that I give you is correct, but in the wrong tense or conjugation, fix it:
            example 
            text: She
            options: love like think
            then add those three words but in the third person (loves, likes, thinks). The words are perfect, they just need to be fixed to fit the third person

            Example 2
            text: yesterday I woke up and I 
            options: eat see notice
            then change those words for ate, saw, noticed. These words are okay, they just needed to be in the right tense.

            Example 3
            text: We love to 
            options: ate plays
            then give the words: eat, play

            Example 3
            text: We love 
            options: ate plays
            then give the words: eating, playing
            these words make sense because 'we love eating' is correct, and the word 'ate' can be transformed to 'eating'. All the three words fit properly when shifted to the right tense.
            
            \n\n`;
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
                    the suggestion must always be real words. Don't make up words. If you cannot find 10 real words, suggest less, but only valid words.

                >Rule:
                    DO: Only suggest real, commonly used words that are found in reputable dictionaries like Oxford, Merriam-Webster, or Cambridge.
                    If a word is rarely used, archaic, or not recognized in major dictionaries, discard it.
                    Avoid invented, incorrectly formed, or meaningless words (e.g., 'journalisticity', 'journaingly').
                    Prioritize words that are frequently used in writing and speech.

                >Rule:
                    DO:
                    Use only valid grammatical variations of the given word.
                    Stick to recognized prefixes, suffixes, and tenses.
                    Example: Given 'journal', valid outputs: 'journals', 'journaled', 'journaling', 'journalistic'. INVALID outputs: 'journalisticity', 'journaingly'.

                >Rule:
                    IF: No valid variations exist beyond common forms, repeat safe words instead of generating wrong words.
                    
                >Rule:
                    DO: Cross-check variations against common English words.
                    Use standard inflections (e.g., 'journal' → 'journals', 'journaling', 'journaled').
                    If the suggested word sounds unnatural or obscure, replace it with a more standard alternative.
                    
                >Rule:
                    IF: A word is a technical term, jargon, or rare usage, prefer a simpler alternative.
                    Example: Instead of 'journalization', use 'recording' or 'documenting' if it fits better.
                    
                >Rule:
                    DO NOT: Suggest words that are rarely found in written English or do not appear in reputable dictionaries.
                    
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
                > Rule verb
                    If the word is a verb, suggest tenses and conjugations of this word
                    'run' ->  ran run runs
                    'do' -> did didn't does doesn't 
                > Rule adjective
                    if the word is an adjective, suggest adverbs forms
                    'happy' -> happily
                    'fast' -> fastly quickly
                    suggest superlatives
                    'fast' -> fastest
                    suggest relatives
                    'large' -> larger
                > Rule: is the word can have a valid real neggative word, add it
                    'do'-> don't didn't
                    yes -> no
                    will -> won't
                    could -> couldn't
                > rule: nouns
                    if the word is a noun, suggest related professions, verbs, plurals and adjective forms. Use only words that actually exist.
                    'journal' -> journalism  journals journalist journalize
                    journalism is a related profession, journalist is a related noun
                    'pen' -> pens pencil draw drawing artist
                    'hospital -> hospitals doctor patient doctors patients
                    'school' -> schools university colleague highschool elementary kindergarten student professor 
                > Rule: no options
                    When the options cannot have negative or tenses, provide related words
                    'hello' -> hi greetings 
                > Also add opposites
                    'new' > old
                    'pretty' > ugly
                    'right' > wrong
                    'same'    > different
                    'smart'   > dumb
                    'tight' > loose
                    'wet' > dry
                > possession words
                    if you get possession words such as my our mine me your yours hers, etc. Suggest other possession words that fit better
                    'to see my' -> our your her his their its. Because all of these words are possessive and talk about the possession of a group of friend not defined yet
                    'I was in your house and I ate my' -> your. Because I am in your house, everything in your house is yours.
                > if the word is a noun, suggest other related nouns
                    'I had a lot of fun with you' -> them
                    'I need you' -> her him them us
                > then
                    propose similar words, such as 
                    after therefore 
                Do the same for the string '${props.lastWord}' that will go concatenated to '${props.preText}. Don't forget to give 10 options and no extra information\n
                Examples
                example 1
                    pretext: the day was bright and sunny. We all
                    word to replace: go
                    Obviously the action is to go somewhere. The noun that is going is we. In other words, we need to conjugate the word 'go' for the noun 'we'.
                    Some good options are: went were arrived travelled move
                    bad options are: goes (because goes does not match we), going (because 'we all going' makes no sense. It is missing the verb 'are'), goer, goings (this is not a real word), outgo (not a real word), undergo(not a real word)
                `;
    return prompt;
}




/// Note: it is bad suggesting new words because the best word might be 'loves', and the given word is 'loves'