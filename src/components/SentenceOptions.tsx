import { Flex, Button} from "@chakra-ui/react";


interface IProps{
sentence:string;
}
export default function SentenceOptions(props:IProps){
    return( 
        <Flex  w="xl" gap="2rem" alignItems="center" justifyContent="space-around">
            {
                props.sentence.split(" ").map( (word:string, i:number) =>{
                    return <Button key={i} colorScheme='blue'>{word}</Button>
                })
            }
        </Flex>
    )
}