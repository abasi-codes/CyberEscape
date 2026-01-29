import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setMasterVolume as setMasterVolumeAction,
  setSfxVolume as setSfxVolumeAction,
  setAmbientVolume as setAmbientVolumeAction,
  toggleMute as toggleMuteAction,
  setMuted as setMutedAction,
} from '@/store/slices/settingsSlice';
import { audioManager, type SFXType, type AmbientType } from '@/lib/audio/AudioManager';

export function useAudio() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const initializedRef = useRef(false);

  // Initialize audio manager and sync with settings on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    audioManager.init().then(() => {
      audioManager.setMasterVolume(settings.masterVolume);
      audioManager.setSfxVolume(settings.sfxVolume);
      audioManager.setAmbientVolume(settings.ambientVolume);
      audioManager.setMuted(settings.muted);
    });
  }, []);

  // Sync volume changes to audio manager
  useEffect(() => {
    audioManager.setMasterVolume(settings.masterVolume);
  }, [settings.masterVolume]);

  useEffect(() => {
    audioManager.setSfxVolume(settings.sfxVolume);
  }, [settings.sfxVolume]);

  useEffect(() => {
    audioManager.setAmbientVolume(settings.ambientVolume);
  }, [settings.ambientVolume]);

  useEffect(() => {
    audioManager.setMuted(settings.muted);
  }, [settings.muted]);

  const playSFX = useCallback((type: SFXType) => {
    if (!settings.reducedMotion) {
      audioManager.playSFX(type);
    }
  }, [settings.reducedMotion]);

  const playAmbient = useCallback((type: AmbientType) => {
    audioManager.playAmbient(type);
  }, []);

  const stopAmbient = useCallback(() => {
    audioManager.stopAmbient();
  }, []);

  const setMasterVolume = useCallback((value: number) => {
    dispatch(setMasterVolumeAction(value));
  }, [dispatch]);

  const setSfxVolume = useCallback((value: number) => {
    dispatch(setSfxVolumeAction(value));
  }, [dispatch]);

  const setAmbientVolume = useCallback((value: number) => {
    dispatch(setAmbientVolumeAction(value));
  }, [dispatch]);

  const toggleMute = useCallback(() => {
    dispatch(toggleMuteAction());
  }, [dispatch]);

  const setMuted = useCallback((muted: boolean) => {
    dispatch(setMutedAction(muted));
  }, [dispatch]);

  return {
    playSFX,
    playAmbient,
    stopAmbient,
    masterVolume: settings.masterVolume,
    sfxVolume: settings.sfxVolume,
    ambientVolume: settings.ambientVolume,
    muted: settings.muted,
    setMasterVolume,
    setSfxVolume,
    setAmbientVolume,
    toggleMute,
    setMuted,
    reducedMotion: settings.reducedMotion,
  };
}

// Convenience hook for components that just need to play sounds
export function useSFX() {
  const { playSFX, reducedMotion } = useAudio();
  return { playSFX, reducedMotion };
}
