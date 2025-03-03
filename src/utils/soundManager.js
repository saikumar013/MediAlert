import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let sound = null;

export async function playSound(soundFile) {
  try {
    // Stop any existing sound
    await stopSound();
    
    // Default sound file
    const defaultSound = require('../../assets/sounds/alarm.mp3');
    
    // Load and play the sound
    const { sound: newSound } = await Audio.Sound.createAsync(
      soundFile || defaultSound,
      { shouldPlay: true, isLooping: true }
    );
    
    sound = newSound;
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

export async function stopSound() {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
}
