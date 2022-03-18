import { AudioAnalyser, AudioListener } from "three";
import { LoadAudio } from "../utils/loaders";

type SRTParser = {
  (srt: string): SRT[];
};

type SRT = {
  id: number;
  start: number;
  end: number;
  text: string;
};

type ClickCallback = () => void;
export class Jukebox {
  parser: SRTParser;
  listener: AudioListener;
  srts?: SRT[];
  elapsedTime: number;
  subtitleDiv: HTMLElement;

  constructor(parser: SRTParser, listener: AudioListener) {
    this.parser = parser;
    this.listener = listener;
    this.elapsedTime = 0;
    this.subtitleDiv = document.getElementById("subtitles");
  }

  async loadSRT(): Promise<SRT[]> {
    const response = await fetch("static/music/who_am_i_with_music.srt");
    const responseText = await response.text();
    return this.parser(responseText);
  }

  async initializeAudio(clickCallback: ClickCallback) {
    const silence = new Audio("/static/music/silence.mp3");
    const music = await LoadAudio(
      this.listener,
      "/static/music/space_chillout.mp3",
      0.5,
      "music",
      false
    );
    const poem = await LoadAudio(
      this.listener,
      "/static/music/who_am_i.mp3",
      0.7,
      "poem",
      false
    );
    this.srts = await this.loadSRT();

    const musicAnalyser = new AudioAnalyser(music, 512);
    const poemAnalyser = new AudioAnalyser(poem, 512);

    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", () => {
      silence.play();

      music.play();
      poem.play();
      startButton.remove();
      clickCallback();
    });

    return {
      music,
      musicAnalyser,
      poem,
      poemAnalyser,
    };
  }

  update(delta: number) {
    this.elapsedTime += delta;
    let found = false;
    this.srts.forEach((srt) => {
      if (this.elapsedTime > srt.start && this.elapsedTime < srt.end) {
        found = true;
        this.subtitleDiv.innerHTML = srt.text;
      }
    });

    if (!found) this.subtitleDiv.innerHTML = "";

    if (this.elapsedTime > 70) {
      document.getElementById("credits").style.display = "block";
    }
  }
}
