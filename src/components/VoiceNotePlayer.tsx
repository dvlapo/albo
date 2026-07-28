import { Pause, Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

let activeAudio: HTMLAudioElement | null = null;

export function VoiceNotePlayer({ src, label = "Play story" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { const node = ref.current; const ended = () => setPlaying(false); node?.addEventListener("ended", ended); return () => node?.removeEventListener("ended", ended); }, []);
  const toggle = async () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      if (activeAudio && activeAudio !== audio) activeAudio.pause();
      activeAudio = audio; await audio.play(); setPlaying(true);
    } else { audio.pause(); setPlaying(false); }
  };
  return <><audio ref={ref} src={src} preload="metadata" /><Button variant="paper" size="sm" onClick={toggle}>{playing ? <Pause weight="fill" /> : <Play weight="fill" />} {playing ? "Pause story" : label}</Button></>;
}
