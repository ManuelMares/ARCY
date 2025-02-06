import { useEffect, useState } from 'react';
import AccessibleButton from './AccessibleButton';
import { ButtonTypeEnum } from './ENUMS/ButtonTypeEnum';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

interface Props {
  text: string;
  fontSize: number;
  delay: number;
  colorScheme: string;
  session_time_stamp_string: string;
}

const femaleVoiceNames = [
  'Microsoft Zira Desktop - English (United States)',
  'Zira', // Ensuring we include 'Zira' explicitly
];
/*
  To use a specific voice (such as Zira-female), on windows, you need to make two changes:
  Go to settings, accessibility, narrator. change the default narrator
  Then
  Search for Control Panel, search for speech recognition, text to speech (on the left),  and change the voice selection
*/

export default function Speak(props: Props) {
  const [, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Automatically select the first female voice available
      const femaleVoice = availableVoices.find(voice =>
        femaleVoiceNames.some(name => voice.name.toLowerCase().includes(name.toLowerCase()))
      );
      setSelectedVoice(femaleVoice || availableVoices[0]);
    };

    // Set a timeout to ensure voices are fully loaded
    setTimeout(() => {
      loadVoices();
    }, 1000);

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window && selectedVoice) {
      // Replace line breaks with spaces
      const formattedText = text.replace(/\n/g, ' ');
      const utterance = new SpeechSynthesisUtterance(formattedText);
      utterance.voice = selectedVoice;
      utterance.rate = 1; // Adjust the speech rate if needed
      utterance.pitch = 1; // Adjust the pitch if needed
      utterance.volume = 1; // Adjust the volume if needed
      window.speechSynthesis.speak(utterance);
      console.log(`Using voice: ${selectedVoice.name}`);
    } else {
      console.warn('Text-to-speech not supported or no voice selected.');
    }
  };

  return (
    <div>
      <AccessibleButton h="20" buttonType={ButtonTypeEnum.READ_TTS} session_time_stamp_string={props.session_time_stamp_string}  fontSize={props.fontSize} colorScheme={props.colorScheme} w="100%" delay={props.delay} onClick={() => { speak(props.text) }}><FontAwesomeIcon size="2x" icon={faComment} /></AccessibleButton>
    </div>
  );
};
