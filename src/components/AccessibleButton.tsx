import { Button, ButtonProps } from '@chakra-ui/react';
import { useRef, useState } from 'react';

interface AccessibleButtonProps extends ButtonProps {
    onClick?: () => void;                                       // Function triggered with no parameter
    onCustomClick?: (button: HTMLButtonElement) => void;        // Function triggered with Button itself as parameter. usage: function editWord(button:HTMLButtonElement)
    delay: number;
}

export default function AccessibleButton(props: AccessibleButtonProps) {
    const ANIMATION_TIME = 300;
    const { onCustomClick, onClick, delay, ...rest } = props;

    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [clickTriggered, setClickTriggered] = useState(false);

    function mouse_click() {
        if (buttonRef.current) {
            const button = buttonRef.current;
            const originalColor = button.style.backgroundColor;
            button.style.backgroundColor = "blue";
            
            if(onCustomClick)
                onCustomClick(button);
            if(onClick)
                onClick();

            setClickTriggered(true);
            cancel_click();

            // click animation
            setTimeout(() => {
                button.style.backgroundColor = originalColor;
                setClickTriggered(false); // Reset flag after animation
            }, ANIMATION_TIME);
        }
    }

    function hover_click() {
        if (clickTriggered) return;

        hoverTimeout.current = setTimeout(() => {
            if (buttonRef.current) {
                const button = buttonRef.current;
                const originalColor = button.style.backgroundColor;
                button.style.backgroundColor = "blue";
                
                if(onCustomClick)
                    onCustomClick(button);
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
