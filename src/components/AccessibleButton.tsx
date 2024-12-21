import { Button, ButtonProps } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { registerActivity } from './firebase';
import { ButtonTypeEnum } from './ENUMS/ButtonTypeEnum';
import { IActivityLog } from './Interfaces/IActivityLog';
// import { IActivityLog, registerActivity } from './firebase';

interface AccessibleButtonProps extends ButtonProps {
    onClick?: () => void;                                       // Function triggered with no parameter
    onCustomClick?: (button: HTMLButtonElement, keyId:number) => void;        // Function triggered with Button itself as parameter. usage: function editWord(button:HTMLButtonElement)
    delay: number;
    keyId?: number;
    session_time_stamp_string: string;
    buttonType: ButtonTypeEnum;
}

export default function AccessibleButton(props: AccessibleButtonProps) {
    const ANIMATION_TIME = 100;
    const { onCustomClick, onClick, delay, keyId, ...rest } = props;

    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [clickTriggered, setClickTriggered] = useState(false);

    function storeActivity(){
        if(!props.session_time_stamp_string)
            return;

        const activityLog:IActivityLog = {
            "button": props.children as string,
            "session_time_stamp_string": props.session_time_stamp_string,
            "type": props.buttonType,
        }
        registerActivity(props.session_time_stamp_string, activityLog)
        .then((ans) => {
            console.log(ans);
        })
        .catch((error) => { 
            const errorMessage = "DB error. Please let me know what caused this error (what did you click. But you can keep working. Maybe also share the following message with me:\n" + error;
            alert(errorMessage); 
        });
    };


    function mouse_click() {
        if (buttonRef.current) {
            const button = buttonRef.current;
            const originalColor = button.style.backgroundColor;
            button.style.backgroundColor = "blue";
            
            if(onCustomClick && keyId)
                onCustomClick(button, keyId);
            if(onClick)
                onClick();

            setClickTriggered(true);
            cancel_click();

            // click animation
            setTimeout(() => {
                button.style.backgroundColor = originalColor;
                setClickTriggered(false); // Reset flag after animation
            }, ANIMATION_TIME);

            storeActivity();
        }
    }

    function hover_click() {
        if (clickTriggered) return;

        hoverTimeout.current = setTimeout(() => {
            if (buttonRef.current) {
                const button = buttonRef.current;
                const originalColor = button.style.backgroundColor;
                button.style.backgroundColor = "blue";
                
                if(onCustomClick && keyId)
                    onCustomClick(button, keyId);
                if(onClick)
                    onClick();

                // click animation
                setTimeout(() => {
                    button.style.backgroundColor = originalColor;
                }, ANIMATION_TIME);
            }
        }, delay);
    }

    const cancel_click = () => {
        if (hoverTimeout.current !== null) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    return (
        <Button
            ref={buttonRef}
            onMouseEnter={hover_click}
            onMouseLeave={cancel_click}
            onClick={mouse_click}
            {...rest}
        >
            {props.children}
        </Button>
    );
}
