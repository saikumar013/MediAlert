import { Audio } from 'expo-av';

let sound = null;

export const initializeSound = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const playSound = async (type) => {
  try {
    // Stop any existing sound first
    await stopSound();

    // Create and load the sound
    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../assets/sounds/alarm.mp3'),
      { shouldPlay: true, isLooping: true }
    );
    
    sound = newSound;
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const stopSound = async () => {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
}; 