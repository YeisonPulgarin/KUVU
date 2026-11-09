import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  output,
  signal,
  viewChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PageTurnSoundService } from '../../../services/page-turn-sound.service';

/** Total length of the intro; the CSS choreography uses the same value. */
export const INTRO_DURATION_MS = 2900;
/** Moment the sheet starts to lift (end of the presentation). */
export const TURN_START_MS = 600;
/** Moment the page-turn sound starts, with the sheet already moving. */
export const SOUND_START_MS = 1200;
export const SKIP_FADE_MS = 180;
export const STRIP_COUNT = 6;

const SKIP_KEYS = new Set(['Escape', 'Enter', ' ', 'Spacebar']);

/**
 * "Turning page" intro for /acceder: a full-screen sheet with the KUVU logo
 * and a line-drawn house that curls away like a book page and reveals the
 * company selector underneath. It lasts INTRO_DURATION_MS and can be skipped
 * with a click/tap, Escape, Enter, Space or the "Saltar" button.
 */
@Component({
  selector: 'app-auth-intro',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './auth-intro.component.html',
  styleUrls: ['./auth-intro.component.scss'],
  host: {
    class: 'auth-intro is-playing',
    '[class.is-skipping]': 'isSkipping()',
    '(click)': 'onHostClick($event)',
    '(document:keydown)': 'onKeydown($event)'
  }
})
export class AuthIntroComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly sound = inject(PageTurnSoundService);
  private readonly skipButton = viewChild<ElementRef<HTMLButtonElement>>('skipButton');

  readonly completed = output<void>();
  readonly isSkipping = signal(false);
  readonly lastStrip = STRIP_COUNT - 1;

  private done = false;
  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.timers.push(
      setTimeout(() => this.sound.play(), SOUND_START_MS),
      setTimeout(() => this.finish(), INTRO_DURATION_MS)
    );
  }

  ngAfterViewInit(): void {
    this.skipButton()?.nativeElement.focus({ preventScroll: true });
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.sound.stop();
  }

  onHostClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.skip();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.done || !SKIP_KEYS.has(event.key)) return;
    event.preventDefault();
    this.skip();
  }

  skip(): void {
    if (this.done || this.isSkipping()) return;
    this.isSkipping.set(true);
    this.clearTimers();
    this.sound.stop();
    this.timers.push(setTimeout(() => this.finish(), SKIP_FADE_MS));
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    this.clearTimers();
    this.completed.emit();
  }

  private clearTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }
}
