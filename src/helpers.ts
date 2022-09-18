export const calculateAvatarColor = (name: string): string => {
    const charCodeRed = name.charCodeAt(0);
    const charCodeGreen = name.charCodeAt(1) || charCodeRed;

    const red = Math.pow(charCodeRed, 7) % 200;
    const green = Math.pow(charCodeGreen, 7) % 200;
    const blue = (red + green) % 200;

    return `rgb(${red},${green},${blue})`;
};