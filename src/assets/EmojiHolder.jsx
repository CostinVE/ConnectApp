import React from 'react';

    export const EmojiHolder = ({ onEmojiClick }) => {
        const emojis = [
            0x1F970, // Smiling Face with Smiling Eyes and Three Hearts
      0x1F60D, // Smiling Face with Heart-Eyes
      0x1F618, // Face Blowing a Kiss
      0x1F617, // Kissing Face
      0x1F619, // Kissing Face with Smiling Eyes
      0x1F61A, // Kissing Face with Closed Eyes
      0x1F61C, // Face with Stuck-Out Tongue and Winking Eye
      0x1F61D, // Face with Stuck-Out Tongue and Closed Eyes
      0x1F61B, // Face with Stuck-Out Tongue
      0x1F92A, // Face with Cowboy Hat
      0x1F61F, // Face with Look of Triumph
      0x1F62C, // Face with Open Mouth
      0x1F601, // Grinning Face with Big Eyes
      0x1F604, // Smiling Face with Open Mouth and Smiling Eyes
      0x1F600, // Grinning Face
      0x1F603, // Smiling Face with Open Mouth
      0x1F602, // Grinning Face with Smiling Eyes
      0x1F605, // Smiling Face with Open Mouth and Cold Sweat
      0x1F606, // Smiling Face with Open Mouth and Tightly-Closed Eyes
      0x1F60A, // Smiling Face with Smiling Eyes
      0x1F607, // Smiling Face with Halo
      0x1F609, // Winking Face
      0x1F60B, // Face Savouring Delicious Food
      0x1F60E, // Smiling Face with Sunglasses
      0x1F60F, // Smirking Face
      0x1F617, // Kissing Face
      0x1F618, // Face Blowing a Kiss
      0x1F61A, // Kissing Face with Closed Eyes
      0x1F61B, // Face with Stuck-Out Tongue
      0x1F61C, // Face with Stuck-Out Tongue and Winking Eye
      0x1F61D, // Face with Stuck-Out Tongue and Closed Eyes
      0x1F61E, // Disappointed Face
      0x1F61F, // Face with Look of Triumph
      0x1F620, // Angry Face
      0x1F621, // Pouting Face
      0x1F622, // Crying Face
      0x1F923, // Rolling on the Floor Laughing
      0x1F624, // Face with Steam From Nose
      0x1F625, // Slightly Smiling Face
      0x1F970, // Smiling Face with Smiling Eyes and Three Hearts
      0x1F60D, // Smiling Face with Heart-Eyes
      0x1F970, // Smiling Face with Smiling Eyes and Three Hearts
      0x1F60D, // Smiling Face with Heart-Eyes
      0x1F970, // Smiling Face with Smiling Eyes and Three Hearts
      0x1F60D, // Smiling Face with Heart-Eyes
      0x1F610, // Neutral Face
      0x1F611, // Expressionless Face
      0x1F636, // Face Without Mouth
      0x1F644, // Face with Rolling Eyes
      0x1F60F, // Smirking Face
      0x1F623, // Persevering Face
      0x1F625, // Slightly Smiling Face
      0x1F629, // Weary Face
      0x1F62E, // Face with Open Mouth
      0x1F630, // Face with Open Mouth and Cold Sweat
      0x1F636, // Face Without Mouth
      0x1F638, // Grimacing Face
      0x1F639, // Lying Face
      0x1F63A, // Sleeping Face
      0x1F63B, // Face with Stuck-Out Tongue
      0x1F63C, // Face with Stuck-Out Tongue and Winking Eye
      0x1F63D, // Face with Stuck-Out Tongue and Tightly-Closed Eyes
      0x1F914, // Thinking Face
      0x1F915, // Face with Hand Over Mouth
      0x1F917, // Face with Rolling Eyes
      0x1F92E, // Face with Steam From Nose
      0x1F912, // Face with Thermometer
      0x1F915, // Face with Hand Over Mouth
      0x1F922, // Face with Medical Mask
      0x1F927, // Face with Head-Bandage
      0x1F912, // Face with Thermometer
      0x1F915, // Face with Hand Over Mouth
      0x1F922, // Face with Medical Mask
      0x1F927, // Face with Head-Bandage
        ];
    
        return (
            <div className="flex flex-col z-30 absolute bg-white w-1/6 h-2/6 overflow-auto rounded-lg Shadow">
                {/* Other JSX elements */}
                <div className="emoji-holder">
                    {emojis.map((emojiCode, index) => (
                        <span key={index} style={{fontSize:"24px"}} onClick={() => onEmojiClick(String.fromCodePoint(emojiCode))}>
                            {String.fromCodePoint(emojiCode)}
                        </span>
                    ))}
                </div>
                {/* Other JSX elements */}
            </div>
        );
    };

