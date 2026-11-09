import { desktop, finePointer, motionChanges, reducedMotion } from './motion-preferences';
import { MatchMediaStub } from './testing/match-media.stub';

describe('motion preferences', () => {
  let media: MatchMediaStub;

  afterEach(() => media?.restore());

  it('answers each query from matchMedia', () => {
    media = new MatchMediaStub({ reducedMotion: true, finePointer: false, desktop: true }).install();
    expect(reducedMotion()).toBeTrue();
    expect(finePointer()).toBeFalse();
    expect(desktop()).toBeTrue();

    media.set('reducedMotion', false);
    media.set('finePointer', true);
    media.set('desktop', false);
    expect(reducedMotion()).toBeFalse();
    expect(finePointer()).toBeTrue();
    expect(desktop()).toBeFalse();
  });

  it('falls back to the static state when matchMedia does not exist', () => {
    const original = window.matchMedia;
    (window as { matchMedia?: unknown }).matchMedia = undefined;
    try {
      expect(reducedMotion()).toBeTrue();
      expect(finePointer()).toBeFalse();
      expect(desktop()).toBeFalse();
    } finally {
      window.matchMedia = original;
    }
  });

  it('emits when one of the subscribed queries changes, and only those', () => {
    media = new MatchMediaStub({ desktop: true }).install();
    const emitted = jasmine.createSpy('change');
    const subscription = motionChanges('reducedMotion', 'desktop').subscribe(emitted);

    media.set('desktop', false);
    media.set('reducedMotion', true);
    media.set('finePointer', true);
    expect(emitted).toHaveBeenCalledTimes(2);

    subscription.unsubscribe();
  });

  it('removes its listeners on unsubscribe', () => {
    media = new MatchMediaStub().install();
    const subscription = motionChanges('reducedMotion', 'finePointer').subscribe();
    expect(media.listenerCount('reducedMotion')).toBe(1);
    expect(media.listenerCount('finePointer')).toBe(1);

    subscription.unsubscribe();
    expect(media.listenerCount('reducedMotion')).toBe(0);
    expect(media.listenerCount('finePointer')).toBe(0);
  });
});
